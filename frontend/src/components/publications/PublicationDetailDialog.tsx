// src/components/publications/PublicationDetailDialog.tsx
import {
  Dialog, DialogContent, DialogTitle, Box, Typography,
  IconButton, Stack, Chip, Avatar, Divider, Tooltip, ButtonBase
} from "@mui/material";
import { Close, ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import { useEffect, useMemo, useRef, useState } from "react";
import type { BusinessPublicationResponseDTO } from "../../types/business";
import NewReviewPlace from "../reviews/ReviewPlaceholder";
import { useAuth } from "../../hooks/useAuth";
import { COMMING_SOON_IMG } from "../../constants/DefaultImages";

type Props = {
  open: boolean;
  onClose: () => void;
  publication: BusinessPublicationResponseDTO | null;
  letReview: boolean;
};

const DAYS_ORDER: Array<"MONDAY"|"TUESDAY"|"WEDNESDAY"|"THURSDAY"|"FRIDAY"|"SATURDAY"|"SUNDAY"> =
  ["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"];

const DAY_LABEL: Record<typeof DAYS_ORDER[number], string> = {
  MONDAY: "Lun", TUESDAY: "Mar", WEDNESDAY: "Mié", THURSDAY: "Jue", FRIDAY: "Vie", SATURDAY: "Sáb", SUNDAY: "Dom"
};

function toMinutes(t: string) { const [h,m] = t.split(":").map(Number); return h*60 + (m || 0); }
function todayKey(d: Date) {
  const n = d.getDay();
  return ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"][n] as typeof DAYS_ORDER[number];
}
function isExceptionalClosed(todayISO: string, dates: string[]) { return dates?.some(x => x === todayISO); }
function isOpenNow(pub: BusinessPublicationResponseDTO, now: Date) {
  const k = todayKey(now);
  if (!pub.openingDays?.includes(k)) return false;
  const todayISO = now.toISOString().slice(0,10);
  if (isExceptionalClosed(todayISO, pub.exceptionalClosingDays || [])) return false;
  const open = toMinutes(pub.attentionSchedule.openingTime);
  const close = toMinutes(pub.attentionSchedule.closingTime);
  const minutes = now.getHours()*60 + now.getMinutes();
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

export default function PublicationDetailDialog({ open, onClose, publication, letReview }: Props) {
  // Hooks SIEMPRE al tope, sin returns condicionales antes
  const [index, setIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);
  const isDragging = useRef(false);
  const { user } = useAuth();

  // Derivados seguros aunque publication sea null
  const images = publication?.imageUrls?.length ? publication.imageUrls : [COMMING_SOON_IMG];
  const max = images.length;

  const nextIndex = (i: number) => ((i + 1) % max);
  const prevIndex = (i: number) => ((i - 1 + max) % max);
  const next = () => setIndex(i => nextIndex(i));
  const prev = () => setIndex(i => prevIndex(i));

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setIndex(i => nextIndex(i));
      if (e.key === "ArrowLeft") setIndex(i => prevIndex(i));
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // depende solo de open y max (no de publication directamente)
  }, [open, max, onClose]);

  useEffect(() => { setIndex(0); }, [publication?.id]);

  const now = useMemo(() => new Date(), []);
  const openNow = useMemo(() => publication ? isOpenNow(publication, now) : false, [publication, now]);

  const handleTouchStart = (e: React.TouchEvent) => { isDragging.current = true; touchStartX.current = e.touches[0].clientX; touchDeltaX.current = 0; };
  const handleTouchMove = (e: React.TouchEvent) => { if (!isDragging.current) return; touchDeltaX.current = e.touches[0].clientX - touchStartX.current; };
  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    const threshold = 60;
    if (touchDeltaX.current > threshold) prev();
    else if (touchDeltaX.current < -threshold) next();
    isDragging.current = false;
    touchDeltaX.current = 0;
  };

  // Ahora sí, si no hay publication, render “vacío” estable (sin cortar hooks)
  if (!publication) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box component="span" fontWeight={700}>Publicación</Box>
            <IconButton onClick={onClose}><Close /></IconButton>
          </Box>
        </DialogTitle>
        <DialogContent />
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, pr: 1 }}>
        <Box sx={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h6" fontWeight={800} noWrap>{publication.title}</Typography>
          <Chip
            label={openNow ? "Abierto ahora" : "Cerrado"}
            color={openNow ? "success" : "default"}
            size="small"
            sx={(t) => ({
              bgcolor: openNow
                ? t.palette.success.main
                : t.palette.mode === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.06)",
              color: openNow ? t.palette.success.contrastText : t.palette.text.primary,
              fontWeight: 700,
            })}
          />
        </Box>
        <IconButton onClick={onClose}><Close /></IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        <Box
          sx={{ position: "relative", width: "100%", aspectRatio: "16 / 9", overflow: "hidden", borderRadius: 2, bgcolor: "background.paper", mb: 1.5 }}
          onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
        >
        <Box
          sx={{
            position: "relative",
            width: "100%",
            aspectRatio: "16 / 9",
            overflow: "hidden",
            borderRadius: 2,
            backdropFilter: "blur(10px)",
            backgroundColor: "rgba(255,255,255,0.3)",
            mb: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"            
          }}
        >
        <Box
          sx={{
            display: "flex",
            height: "100%",
            width: `${100 * max}%`,
            transform: `translateX(calc(${-index * 100}% + ${touchDeltaX.current}px))`,
            transition: isDragging.current ? "none" : "transform 280ms ease",
          }}
        >
          {images.map((src, idx) => (
            <Box key={`${src}-${idx}`} sx={{ flex: "0 0 100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Box
                component="img"
                src={src}
                alt={publication.title}
                sx={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  width: "100%",          // opcional, junto a maxHeight/Width funciona bien
                  height: "100%",
                  objectFit: "contain",   // acá el cambio
                  display: "block",
                  userSelect: "none",
                  borderRadius: 2, 
                }}
                draggable={false}
              />
            </Box>
          ))}
        </Box>
      </Box>

      {max > 1 && (
        <>
          <IconButton onClick={prev} sx={(t) => ({
            position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)",
            bgcolor: t.palette.mode === "dark" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.9)",
            "&:hover": { bgcolor: t.palette.mode === "dark" ? "rgba(255,255,255,0.25)" : "white" },
          })}>
            <ArrowBackIos />
          </IconButton>
          <IconButton onClick={next} sx={(t) => ({
            position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
            bgcolor: t.palette.mode === "dark" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.9)",
            "&:hover": { bgcolor: t.palette.mode === "dark" ? "rgba(255,255,255,0.25)" : "white" },
          })}>
            <ArrowForwardIos />
          </IconButton>
          <Stack direction="row" spacing={1} sx={{ position: "absolute", bottom: 10, left: 0, right: 0, justifyContent: "center" }}>
            {images.map((_, i) => (
              <Box key={i} sx={(t) => ({
                width: 8, height: 8, borderRadius: 999,
                bgcolor: i === index ? "primary.main" : (t.palette.mode === "dark" ? "grey.600" : "grey.300"),
              })} />
            ))}
          </Stack>
        </>
      )}
    </Box>

    {max > 1 && (
      <Stack direction="row" spacing={1} sx={{ overflowX: "auto", pb: 1 }}>
        {images.map((src, i) => (
          <ButtonBase
            key={`${src}-thumb-${i}`} onClick={() => setIndex(i)}
            sx={{
              borderRadius: 1.5, overflow: "hidden",
              outline: i === index ? "2px solid" : "none",
              outlineColor: i === index ? "primary.main" : "transparent",
            }}
          >
            <Box component="img" src={src} alt={`${publication.title} ${i + 1}`}
                  sx={{ width: 96, height: 64, objectFit: "cover", display: "block" }} />
          </ButtonBase>
        ))}
      </Stack>
    )}

        <Stack direction="row" alignItems="center" spacing={1} mt={1}>
          <Tooltip title={`Publicado el ${formatCreatedAt(publication.createdAt)}`}>
            <Avatar src={publication.ownerAvatarUrl} alt={publication.ownerUsername} sx={{ width: 40, height: 40 }}>
              {initials(publication.ownerUsername)}
            </Avatar>
          </Tooltip>
          <Typography variant="body2" color="text.secondary">Dueño: {publication.ownerUsername}</Typography>
        </Stack>

        <Typography variant="body1" sx={{ mt: 1.5, whiteSpace: 'break-spaces' }}>
          {publication.description}
        </Typography>
        
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mt={2}>
          <Stack spacing={0.5} flex={1}>
            <Typography variant="subtitle2" fontWeight={700}>Información</Typography>
            <Typography variant="body2" color="text.secondary">📍 {publication.location}</Typography>
            <Typography variant="body2" color="text.secondary">☎ {publication.phoneNumber || publication.email}</Typography>
            <Typography variant="body2" color="text.secondary">
              🕘 {publication.attentionSchedule.openingTime}–{publication.attentionSchedule.closingTime}
            </Typography>
          </Stack>
          <Divider flexItem orientation="vertical" sx={{ display: { xs: "none", sm: "block" } }} />
          <Stack spacing={0.5} flex={1}>
            <Typography variant="subtitle2" fontWeight={700}>Días</Typography>
            <Stack direction="row" spacing={0.75} flexWrap="wrap">
              {DAYS_ORDER.map((d) => {
                const active = publication.openingDays?.includes(d);
                return (
                  <Chip key={d} label={DAY_LABEL[d]} size="small"
                        variant={active ? "filled" : "outlined"}
                        color={active ? "primary" : "default"}
                        sx={{ height: 24 }} />
                );
              })}
            </Stack>
            {!!publication.tags?.length && (
              <>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 1 }}>Tags</Typography>
                <Stack direction="row" spacing={0.75} flexWrap="wrap">
                  {publication.tags.slice(0, 10).map((t) => (
                    <Chip key={t} label={t} size="small" variant="outlined" color="warning" />
                  ))}
                </Stack>
              </>
            )}
          </Stack>
        </Stack>
        
        <Divider sx={{ my: 2 }} />
        {letReview && <NewReviewPlace publicationId={publication.id} currentUserName={user?.email} userId={user?.id} />}
        <Divider sx={{ my: 2 }} />
      </DialogContent>
    </Dialog>
  );
}
