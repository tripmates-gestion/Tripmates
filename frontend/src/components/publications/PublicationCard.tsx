// src/components/publications/PublicationCard.tsx
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Stack,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Avatar,
  Tooltip,
  Alert,
  Snackbar
} from "@mui/material";
import { 
  MoreVert, 
  ThumbUp,  
  ThumbUpOutlined, 
} from "@mui/icons-material";
import { useMemo, useState, type MouseEvent } from "react";
import type { BusinessPublicationResponseDTO } from "../../types/Business";
import { useAuth } from "../../hooks/useAuth";
import React from "react";
import { likePublication, unlikePublication } from "../../services/userService";
import { getLikesForPublication } from "../../services/businessPublications";
import { alpha } from "@mui/material/styles";


type Props = {
  publication: BusinessPublicationResponseDTO;
  onView: (p: BusinessPublicationResponseDTO) => void;
  onEdit?: (p: BusinessPublicationResponseDTO) => void;
  onDelete?: (id: string) => void;
  onAddToBoard?:  (e: React.MouseEvent<HTMLElement>, p: BusinessPublicationResponseDTO, token: string) => Promise<void>; 
  sx?: object;
  moveOnMouseOver?: boolean;
};

const IMG_PLACEHOLDER_URL= "https://images.unsplash.com/photo-1610513320995-1ad4bbf25e55?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2070";
const DAYS_ORDER: Array<"MONDAY"|"TUESDAY"|"WEDNESDAY"|"THURSDAY"|"FRIDAY"|"SATURDAY"|"SUNDAY"> = [
  "MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"
];

const DAY_LABEL: Record<typeof DAYS_ORDER[number], string> = {
  MONDAY: "Lun", TUESDAY: "Mar", WEDNESDAY: "Mié", THURSDAY: "Jue", FRIDAY: "Vie", SATURDAY: "Sáb", SUNDAY: "Dom"
};

function toMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

function todayKey(d: Date) {
  const n = d.getDay();
  return ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"][n] as typeof DAYS_ORDER[number];
}

function isExceptionalClosed(todayISO: string, dates: string[]) {
  return dates?.some(x => x === todayISO);
}

function isOpenNow(pub: BusinessPublicationResponseDTO, now: Date) {
  const k = todayKey(now);
  if (!pub.openingDays?.includes(k)) return false;
  const todayISO = now.toISOString().slice(0,10);
  if (isExceptionalClosed(todayISO, pub.exceptionalClosingDays || [])) return false;
  const open = toMinutes(pub.attentionSchedule.openingTime);
  const close = toMinutes(pub.attentionSchedule.closingTime);
  const minutes = now.getHours() * 60 + now.getMinutes();
  if (close > open) return minutes >= open && minutes < close;
  return minutes >= open || minutes < close;
}

function formatCreatedAt(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

function initials(name?: string) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/).slice(0,2);
  return parts.map(p => p[0]?.toUpperCase() ?? "").join("") || "U";
}

function getUserLiked(likes: Array<{id: string}>, userId?: string) {
  if (!userId) return false;
  return likes.some(l => l.id === userId);
}

export default function PublicationCard({ publication, onView, onEdit, onDelete, onAddToBoard, sx, moveOnMouseOver }: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const handleMenu = (e: MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const now = useMemo(() => new Date(), []);
  const openNow = useMemo(() => isOpenNow(publication, now), [publication, now]);
  const authContext = useAuth();
  const [showAuthError, setShowAuthError] = useState(false);

  const [userLiked, setUserLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [likesLoaded, setLikesLoaded] = useState(false);

  const hasMenuOptions = onEdit || onDelete || onAddToBoard;
  
  React.useEffect(() => {
    const loadLikes = async () => {
      if (!authContext.accessToken) return;
      
      try {
        const response = await getLikesForPublication(publication.id, authContext.accessToken);
        const likes = response.likes || []; 
        setUserLiked(getUserLiked(likes, authContext?.user?.id));
        setLikesCount(likes.length);
        setLikesLoaded(true);
      } catch (error) {
        console.error('Error loading likes:', error);
        setLikesLoaded(true);
      }
    };

    loadLikes();
  }, [publication.id, authContext.accessToken, authContext?.user?.id]);
  

  const handleLike = async (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    
    if (!authContext.accessToken) {
      setShowAuthError(true);
      return;
    }

    try {
      if (userLiked) {
        await unlikePublication(publication.id, authContext.accessToken);
        setUserLiked(false);
        setLikesCount((prev: number) => prev - 1);
      } else {
        await likePublication(publication.id, authContext.accessToken);
        setUserLiked(true);
        setLikesCount((prev: number) => prev + 1);
      }
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };


  // console.log("Publication card ",publication.id, " has onAddToBoard: ",onAddToBoard)
  const moveOnMouseOverLocal = moveOnMouseOver ?? true;
  return (
    <>
    <Card
      onClick={() => onView(publication)}
      sx={{
        cursor: "pointer",
        borderRadius: 3,
        overflow: "hidden",
        transition: "0.25s",
        ...(moveOnMouseOverLocal ? { "&:hover": { transform: "translateY(-2px)" } } : {}),
        ...sx
      }}
    >
      <Box sx={{ position: "relative", height: 220, overflow: "hidden" }}>
        <CardMedia
          component="img"
          height="220"
          image={publication.imageUrls?.[0] || IMG_PLACEHOLDER_URL}
          alt={publication.title}
          sx={{ objectFit: "cover" }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.0) 55%)"
          }}
        />
        <Stack
          direction="row"
          spacing={1}
          sx={{ position: "absolute", left: 12, bottom: 12 }}
        >
          <Chip
            label={openNow ? "Abierto ahora" : "Cerrado"}
            color={openNow ? "success" : "default"}
            size="small"
            sx={(theme) => ({
              bgcolor: openNow
          ? theme.palette.success.main
          : theme.palette.mode === "dark"
          ? "rgba(255,255,255,0.2)"
          : "rgba(255,255,255,0.9)",
              color: openNow
          ? theme.palette.success.contrastText
          : theme.palette.text.primary,
              fontWeight: 700,
            })}
          />

          {publication.attentionSchedule && (
            <Chip
              label={`${publication.attentionSchedule.openingTime}–${publication.attentionSchedule.closingTime}`}
              size="small"
              sx={(theme) => ({
                bgcolor:
                  theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.2)"
                    : "rgba(255,255,255,0.9)",
              })}
            />
          )}

        </Stack>

        {hasMenuOptions && (
          <IconButton 
          onClick={(e) => {
            e.stopPropagation();
            handleMenu(e);
          }}
          sx={(theme) => ({
            position: "absolute",
            top: 8,
            right: 8,
            bgcolor:
              theme.palette.mode === "dark"
          ? "rgba(255, 255, 255, 0.7)"
          : "rgba(255,255,255,0.9)",
            "&:hover": {
              bgcolor:
          theme.palette.mode === "dark" ? "rgba(244, 239, 239, 0.93)" : "white",
            },
          })}
        >
          <MoreVert />
        </IconButton>)}
        <Menu anchorEl={anchorEl} open={openMenu} onClose={handleClose} onClick={e => e.stopPropagation()}>
          {onEdit && <MenuItem onClick={() => { handleClose(); onEdit(publication); }}>Editar</MenuItem>}
          {onDelete && <MenuItem onClick={() => { handleClose(); onDelete(publication.id); }}>Eliminar</MenuItem>}
          {onAddToBoard && (
          
          <MenuItem
            onClick={(e) => {
              if (authContext.accessToken) {
                onAddToBoard(e, publication, authContext.accessToken);
              } else {
                setShowAuthError(true); 
              }
            }}
          >
            Guardar en un plan
          </MenuItem>
)}
        </Menu>
      </Box>

      <CardContent sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" fontWeight={800} noWrap>
              {publication.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", mt: 0.5 }}>
              {publication.description}
            </Typography>
          </Box>
          <Tooltip title={`Publicado el ${formatCreatedAt(publication.createdAt)}`}>
            <Avatar
              src={publication.ownerAvatarUrl}
              alt={publication.ownerUsername}
              sx={{ width: 40, height: 40, flexShrink: 0 }}
            >
              {initials(publication.ownerUsername)}
            </Avatar>
          </Tooltip>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" mt={1.25}>
          <Typography variant="caption" color="text.secondary">
          📍 {typeof publication.location === 'object' 
            ? publication.location?.address 
            : publication.location}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" mt={1}>
          <Stack direction="row" spacing={0.75}>
            {DAYS_ORDER.map(d => {
              const active = publication.openingDays?.includes(d);
              return (
                <Chip
                  key={d}
                  label={DAY_LABEL[d]}
                  size="small"
                  variant={active ? "filled" : "outlined"}
                  color={active ? "primary" : "default"}
                  sx={{ height: 22 }}
                />
              );
            })}
          </Stack>
        </Stack>

        {!!publication.tags?.length && (
          <Box sx={{ mt: 1.25, display: "flex", flexWrap: "wrap", gap: 0.75 }}>
            {publication.tags.slice(0, 5).map(t => (
              <Chip key={t} label={t} size="small" variant="outlined" color="warning" />
            ))}
          </Box>
        )}
        <Stack spacing={0.3} mt={1.25}>
          <Typography variant="caption" color="text.secondary">☎ {publication.phoneNumber || publication.email}</Typography>
          <Typography variant="caption" color="text.secondary">
            Dueño: {publication.ownerUsername}
          </Typography>
        </Stack>
        {/* Like & Dislike abajo a la derecha */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            mt: 1.5,
          }}
        >
          <Stack direction="row" spacing={1.2} alignItems="center">

            {/* LIKE */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                mt: 1.5,
              }}
            >
              <Stack direction="row" spacing={1.2} alignItems="center">
              <Box
                component="button"
                onClick={handleLike}
                sx={(theme) => ({
                  display: "flex",
                  alignItems: "center",
                  gap: 0.8,
                  px: 1.8,
                  py: 0.9,
                  borderRadius: "22px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1rem",
                  transition: "all .25s ease",
                  opacity: likesLoaded ? 1 : 0.6,

                  backgroundColor: userLiked
                    ? theme.palette.primary.main
                    : alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.3 : 0.1),

                  color: userLiked
                    ? theme.palette.primary.contrastText
                    : theme.palette.primary.main,

                  boxShadow: userLiked ? theme.shadows[4] : theme.shadows[1],

                  "&:hover": {
                    transform: "scale(1.08)",
                    boxShadow: theme.shadows[6],
                    backgroundColor: userLiked
                      ? theme.palette.primary.dark
                      : alpha(
                          theme.palette.primary.main,
                          theme.palette.mode === "dark" ? 0.4 : 0.2
                        ),
                  },

                  "&:disabled": {
                    cursor: "default",
                    boxShadow: "none",
                    opacity: 0.4,
                  },
                })}
              >
                {userLiked ? (
                  <ThumbUp fontSize="medium" />
                ) : (
                  <ThumbUpOutlined fontSize="medium" />
                )}
                <Typography variant="body1" fontWeight={700}>
                  {likesCount}
                </Typography>
              </Box>

              </Stack>
            </Box>
          </Stack>
        </Box>
      </CardContent>
    </Card>
    {/* 🆕 Snackbar de error si no hay token */}
      <Snackbar
      open={showAuthError}
      autoHideDuration={4000}
      onClose={() => setShowAuthError(false)}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert severity="error" onClose={() => setShowAuthError(false)}>
        Debes iniciar sesión para guardar publicaciones en un plan.
      </Alert>
    </Snackbar>
    </>
  );
}
