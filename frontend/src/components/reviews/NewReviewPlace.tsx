import * as React from "react";
import {
  Box, Stack, Typography, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Rating, Snackbar, Alert,
  Chip, Grid, IconButton, List, ListItem, ListItemButton, ListItemText, InputAdornment
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import type { Review } from "../../types/Review";
import { saveReview, getReviews } from "../../services/reviewService";
import { useAuth } from "../../hooks/useAuth";
import { mapReviewListDTOToReviews } from "../../services/mappers/reviewsMapper";
import { ACCOUNT_TYPES } from "../../constants/Rol";
import { ReviewGrid } from "./ReviewGrid";
import { getUserFollowers } from "../../services/userService";
import ImageUploader from "../ui/ImageUploader";
import CircularProgress from "@mui/material/CircularProgress";


// Función para renderizar texto con mentions
export function renderTextWithMentions(
  text: string,
  onMentionClick?: (mention: { name: string }) => void
) {
  const mentionRegex =
    /@([A-ZÁÉÍÓÚÑÜ][A-Za-zÁÉÍÓÚáéíóúÑñÜü0-9\-]*(?:\s+[A-ZÁÉÍÓÚÑÜ][A-Za-zÁÉÍÓÚáéíóúÑñÜü0-9\-]*)*)/g;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = mentionRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const mentionName = match[1];   // sin el @
    const fullMention = match[0];   // con el @

    parts.push(
      <Box
        component="span"
        key={match.index}
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          onMentionClick?.({ name: mentionName });
        }}
        sx={{
          color: '#2196F3',
          fontWeight: 700,
          cursor: 'pointer',
          '&:hover': { textDecoration: 'underline' },
        }}
      >
        {fullMention}
      </Box>
    );

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}


type Props = {
  currentUserName?: string;
  publicationId?: string;
  publicationTitle?: string;
  userId?: string;
  onCreate?: (r: Review) => void;
};

export default function NewReviewPlace({
  currentUserName = "Vos",
  publicationId,
  publicationTitle,
  onCreate,
}: Props) {
  const { user, accessToken } = useAuth();

  const [items, setItems] = React.useState<Review[]>([]);
  const [open, setOpen] = React.useState(false);

  const [title, setTitle] = React.useState("");
  const [text, setText] = React.useState("");
  const [rating, setRating] = React.useState<number | null>(null);
  const [images, setImages] = React.useState<string[]>([]);
  const [touched, setTouched] = React.useState(false);

  // Estados para autocompletado de menciones
  const [showMentions, setShowMentions] = React.useState(false);
  const [mentionSearch, setMentionSearch] = React.useState("");
  const [cursorPosition, setCursorPosition] = React.useState(0);
  const textFieldRef = React.useRef<HTMLTextAreaElement>(null);

  const [suggestedUsers, setSuggestedUsers] = React.useState<{ name: string; email: string }[]>([]);
  const [isPublishing, setIsPublishing] = React.useState(false);


  React.useEffect(() => {
    if (user) {
      getUserFollowers(user.id, accessToken)
        .then((followers) => setSuggestedUsers(followers.map((f) => ({name: f.name, email: f.email}))))
        .catch(() => setSuggestedUsers([]));
    } else {
      setSuggestedUsers([]);
    }
  }, [user, accessToken]);

  const [snack, setSnack] = React.useState<{
    open: boolean;
    msg: string;
    sev: "success" | "error";
  }>({
    open: false,
    msg: "",
    sev: "success",
  });

  const hasTitleError = touched && title.trim().length === 0;
  const hasTextError = touched && text.trim().length === 0;

  const addImage = (b64: string) => {
    setImages((xs) => {
      if (xs.length >= 6) return xs;
      return [...xs, b64];
    });
  };

  const replaceImageAt = (index: number, b64: string) => {
    setImages((xs) => xs.map((img, i) => (i === index ? b64 : img)));
  };

  const removeImageAt = (i: number) => {
    setImages((xs) => xs.filter((_, idx) => idx !== i));
  };

  // Manejo de texto + detección de @
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    const cursorPos = e.target.selectionStart ?? newText.length;

    setText(newText);
    setCursorPosition(cursorPos);

    const textBeforeCursor = newText.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex === -1) {
      setShowMentions(false);
      setMentionSearch("");
      return;
    }

    const charBefore = lastAtIndex > 0 ? textBeforeCursor[lastAtIndex - 1] : " ";
    const isStartOfWord = charBefore === " " || charBefore === "\n";

    if (!isStartOfWord) {
      setShowMentions(false);
      setMentionSearch("");
      return;
    }

    const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);

    if (/\s/.test(textAfterAt)) {
      setShowMentions(false);
      setMentionSearch("");
      return;
    }

    if (textAfterAt.length === 0) {
      setShowMentions(true);
      setMentionSearch("");
      return;
    }

    setMentionSearch(textAfterAt);
    setShowMentions(true);
  };

  const insertMention = (username: string) => {
    const textBeforeCursor = text.substring(0, cursorPosition);
    const textAfterCursor = text.substring(cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const newText =
        text.substring(0, lastAtIndex) + "@" + username + " " + textAfterCursor;

      setText(newText);
      setShowMentions(false);
      setMentionSearch("");

      setTimeout(() => {
        if (textFieldRef.current) {
          const newCursorPos = lastAtIndex + username.length + 2;
          textFieldRef.current.focus();
          textFieldRef.current.setSelectionRange(newCursorPos, newCursorPos);
          setCursorPosition(newCursorPos);
        }
      }, 0);
    }
  };

  const filteredUsers = suggestedUsers
    .filter((u) => u.name.toLowerCase().startsWith(mentionSearch.toLowerCase()))
    .slice(0, 3);

  const handleOpen = () => {
    setTouched(false);
    setTitle("");
    setText("");
    setRating(null);
    setImages([]);
    setShowMentions(false);
    setMentionSearch("");
    setCursorPosition(0);
    setOpen(true);
  };

  React.useEffect(() => {
    const loadReviews = async () => {
      if (!publicationId || !accessToken) {
        return;
      }

      try {
        const reviewsDTO = await getReviews(publicationId, accessToken);
        const reviews = mapReviewListDTOToReviews(reviewsDTO);
        setItems(reviews || []);
      } catch (error) {
        console.error("Error loading reviews:", error);
        setItems([]);
        setSnack({
          open: true,
          msg: "Error al cargar las reseñas",
          sev: "error",
        });
      }
    };

    loadReviews();
  }, [publicationId, accessToken]);

  const handleCreate = async () => {
    if (!publicationId || !accessToken) {
      return;
    }
  
    setTouched(true);
    if (title.trim().length === 0 || text.trim().length === 0) {
      setSnack({ open: true, msg: "Completá todos los campos obligatorios.", sev: "error" });
      return;
    }
    setIsPublishing(true);
  
    const r: Review = {
      id: crypto.randomUUID(),
      avatarUrl: user?.avatarURL || "",
      authorId: user?.id || "unknown",
      authorName: currentUserName,
      author: currentUserName,
      title: title.trim(),
      rating: rating ?? undefined,
      text: text.trim(),
      images,
      createdAt: new Date().toISOString(),
      publicationId,
      publicationTitle,
    };
  
    try {
      await saveReview(r, accessToken, images);
      setItems(prev => [r, ...prev]);
      onCreate?.(r);
      setOpen(false);
      setSnack({ open: true, msg: "¡Reseña publicada!", sev: "success" });
    } catch (error) {
      setSnack({ open: true, msg: "Error al guardar la reseña. Intentá nuevamente.", sev: "error" });
    } finally {
      setIsPublishing(false);
    }
  };


  return (
    <Box sx={{ mt: 3 }}>
      {(items.length === 0 && user?.role === ACCOUNT_TYPES.user) ? (
        <Box sx={{ py: 2, textAlign: "center" }}>
          <Typography variant="subtitle1" fontWeight={700}>
            ¿Haz estado en este lugar y probado este item?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Compartí tu experiencia con tus TripMates!
          </Typography>
          <Button variant="contained" sx={{ mt: 2 }} onClick={handleOpen}>
            Escribir reseña
          </Button>
        </Box>
      ) : (
        <Stack spacing={2}>
          {user?.role === ACCOUNT_TYPES.user && (
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h6" fontWeight={800}>
                Reseñas
              </Typography>
              <Button variant="contained" onClick={handleOpen}>
                Escribir reseña
              </Button>
            </Stack>
          )}

          <ReviewGrid items={items} />
        </Stack>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Nueva reseña</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {publicationTitle && (
              <Chip
                label={`Sobre: ${publicationTitle}`}
                size="small"
                variant="outlined"
                sx={{ alignSelf: "flex-start" }}
              />
            )}

            <TextField
              label="Título de la reseña"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setTouched(true)}
              error={hasTitleError}
              helperText={hasTitleError ? "El título es obligatorio" : ""}
              fullWidth
            />

            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Calificación (opcional)
              </Typography>
              <Rating
                value={rating}
                onChange={(_, val) => setRating(val)}
                precision={0.5}
              />
            </Stack>

            <TextField
              inputRef={textFieldRef}
              label="Tu experiencia (usa @nombre para mencionar a alguien)"
              value={text}
              onChange={handleTextChange}
              error={hasTextError}
              helperText={
                hasTextError
                  ? "El texto es obligatorio. Tip: Escribe @nombre para mencionar a alguien"
                  : "Tip: Escribe @nombre para mencionar a alguien"
              }
              multiline
              minRows={4}
              fullWidth
            />

            {/* Diálogo de sugerencias de menciones */}
            <Dialog
              open={showMentions}
              onClose={() => {
                setShowMentions(false);
                setMentionSearch("");
              }}
              maxWidth="xs"
              fullWidth
            >
              <DialogTitle>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography variant="h6">Mencionar a alguien</Typography>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setShowMentions(false);
                      setMentionSearch("");
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Stack>
              </DialogTitle>
              <DialogContent>
                <TextField
                  fullWidth
                  placeholder="Buscar usuario..."
                  value={mentionSearch}
                  onChange={(e) => setMentionSearch(e.target.value)}
                  autoFocus
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />

                {filteredUsers.length > 0 ? (
                  <List sx={{ maxHeight: 300, overflow: "auto" }}>
                    {filteredUsers.map((user) => (
                      <ListItem key={user.name} disablePadding>
                        <ListItemButton
                          onClick={() => insertMention(user.email)}
                          sx={{
                            borderRadius: 1,
                            "&:hover": {
                              bgcolor: "#E3F2FD",
                            },
                          }}
                        >
                          <ListItemText
                            primary={`@${user.name}`}
                            primaryTypographyProps={{
                              sx: {
                                color: "#2196F3",
                                fontWeight: 600,
                                fontSize: "1.1rem",
                              },
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                    sx={{ py: 3 }}
                  >
                    No se encontraron usuarios
                  </Typography>
                )}
              </DialogContent>
            </Dialog>

            {/* Imágenes usando ImageUploader genérico */}
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                Imágenes (opcional, hasta 6)
              </Typography>
              <Grid container spacing={1}>
                {images.map((img, i) => (
                  <Grid key={i} item xs={6} sm={4}>
                    <Box sx={{ position: "relative" }}>
                      <ImageUploader
                        label={`Imagen ${i + 1}`}
                        imageUrl={img}
                        onChange={(b64) => replaceImageAt(i, b64)}
                        variant="rectangular"
                      />
                      <IconButton
                        size="small"
                        onClick={() => removeImageAt(i)}
                        sx={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          bgcolor: "rgba(0,0,0,0.55)",
                          color: "#fff",
                          "&:hover": { bgcolor: "rgba(0,0,0,0.75)" },
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}

                {images.length < 6 && (
                  <Grid item xs={6} sm={4}>
                    <ImageUploader
                      label="Agregar imagen"
                      onChange={addImage}
                      variant="rectangular"
                    />
                  </Grid>
                )}
              </Grid>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={isPublishing}
            sx={{
              bgcolor: isPublishing ? "grey.600" : "primary.main",
              "&:hover": {
                bgcolor: isPublishing ? "grey.700" : "primary.dark",
              },
            }}
          >
            {isPublishing ? <><CircularProgress size={18} sx={{ mr: 1 }} /> Publicando...</> : "Publicar"}

          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={2500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.sev} variant="filled">
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
