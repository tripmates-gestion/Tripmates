// ──────────────────────────────────────────────────────────────────────────────
// components/places/PlaceDetailDialog.tsx
// ──────────────────────────────────────────────────────────────────────────────
import * as React from "react";
import {
  Dialog, DialogTitle, DialogContent, Box, Typography, IconButton, Stack, Chip, Divider, ButtonBase
} from "@mui/material";
import { Close, ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import type { BusinessPlaceDTO } from "../../types/place";
import { sanitizeImages, computeOpenNow, DAYS_ORDER, DAY_LABEL } from "./utils/placeHelpers";
import ReviewPlaceholder from "../reviews/ReviewPlaceholder"; // opcional, ya lo tenés

type Props = {
  open: boolean;
  onClose: () => void;
  place: BusinessPlaceDTO | null;
};

export function PlaceDetailDialog({ open, onClose, place }: Props) {
  const [index, setIndex] = React.useState(0);
  const touchStartX = React.useRef(0);
  const touchDeltaX = React.useRef(0);
  const isDragging = React.useRef(false);

  const imgs = sanitizeImages(place || { title: "", description: null, email: null, phoneNumber: null, location: null, imageUrls: null, image: null, openingDays: null, attentionSchedule: null, exceptionalClosingDays: null });
  const max = imgs.length;
  const openNow = React.useMemo(() => (place ? computeOpenNow(place, new Date()) : null), [place]);

  const next = () => setIndex((i) => (i + 1) % max);
  const prev = () => setIndex((i) => (i - 1 + max) % max);

  React.useEffect(() => { setIndex(0); }, [place?.id]);

  const handleTouchStart = (e: React.TouchEvent) => { isDragging.current = true; touchStartX.current = e.touches[0].clientX; touchDeltaX.current = 0; };
  const handleTouchMove = (e: React.TouchEvent) => { if (!isDragging.current) return; touchDeltaX.current = e.touches[0].clientX - touchStartX.current; };
  const handleTouchEnd = () => { if (!isDragging.current) return; const th = 60; if (touchDeltaX.current > th) prev(); else if (touchDeltaX.current < -th) next(); isDragging.current = false; touchDeltaX.current = 0; };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, pr: 1 }}>
        <Box sx={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h6" fontWeight={800} noWrap>{place?.title}</Typography>
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
        {/* Carrusel */}
        <Box
          sx={{ position: "relative", width: "100%", aspectRatio: "16 / 9", overflow: "hidden", borderRadius: 2, bgcolor: "black", mb: 1.5, display: "flex", alignItems: "center", justifyContent: "center" }}
          onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
        >
          <Box
            sx={{ display: "flex", height: "100%", width: `${100 * max}%`, transform: `translateX(calc(${-index * 100}% + ${touchDeltaX.current}px))`, transition: isDragging.current ? "none" : "transform 280ms ease" }}
          >
            {imgs.map((src, idx) => (
              <Box key={`${src}-${idx}`} sx={{ flex: "0 0 100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Box component="img" src={src} alt={place?.title || "Negocio"} sx={{ maxWidth: "100%", maxHeight: "100%", width: "100%", height: "100%", objectFit: "contain", display: "block", userSelect: "none" }} draggable={false} />
              </Box>
            ))}
          </Box>

          {max > 1 && (
            <>
              <IconButton onClick={prev} sx={(t) => ({ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", bgcolor: t.palette.mode === "dark" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.9)", "&:hover": { bgcolor: t.palette.mode === "dark" ? "rgba(255,255,255,0.25)" : "white" } })}>
                <ArrowBackIos />
              </IconButton>
              <IconButton onClick={next} sx={(t) => ({ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", bgcolor: t.palette.mode === "dark" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.9)", "&:hover": { bgcolor: t.palette.mode === "dark" ? "rgba(255,255,255,0.25)" : "white" } })}>
                <ArrowForwardIos />
              </IconButton>
              <Stack direction="row" spacing={1} sx={{ position: "absolute", bottom: 10, left: 0, right: 0, justifyContent: "center" }}>
                {imgs.map((_, i) => (
                  <Box key={i} sx={(t) => ({ width: 8, height: 8, borderRadius: 999, bgcolor: i === index ? "primary.main" : (t.palette.mode === "dark" ? "grey.600" : "grey.300") })} />
                ))}
              </Stack>
            </>
          )}
        </Box>

        {/* Info */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Stack spacing={0.5} flex={1}>
            <Typography variant="subtitle2" fontWeight={700}>Información</Typography>
            <Typography variant="body2" color="text.secondary">📍 {place?.location || "Ubicación no disponible"}</Typography>
            <Typography variant="body2" color="text.secondary">☎ {place?.phoneNumber || place?.email || "Contacto no disponible"}</Typography>
            {place?.attentionSchedule && (
              <Typography variant="body2" color="text.secondary">🕘 {place.attentionSchedule.openingTime}–{place.attentionSchedule.closingTime}</Typography>
            )}
          </Stack>
          <Divider flexItem orientation="vertical" sx={{ display: { xs: "none", sm: "block" } }} />
          <Stack spacing={0.5} flex={1}>
            {place?.openingDays?.length ? (
              <>
                <Typography variant="subtitle2" fontWeight={700}>Días</Typography>
                <Stack direction="row" spacing={0.75} flexWrap="wrap">
                  {DAYS_ORDER.map((d) => (
                    <Chip key={d} label={DAY_LABEL[d]} size="small" variant={place.openingDays?.includes(d) ? "filled" : "outlined"} color={place.openingDays?.includes(d) ? "primary" : "default"} sx={{ height: 24 }} />
                  ))}
                </Stack>
              </>
            ) : null}
          </Stack>
        </Stack>

        <Typography variant="body1" sx={{ mt: 1.5, whiteSpace: "break-spaces" }}>
          {place?.description || "Sin descripción"}
        </Typography>

        <Divider sx={{ my: 2 }} />
        {/* <ReviewPlaceholder/> */}
        <ReviewPlaceholder/>

      </DialogContent>
    </Dialog>
  );
}
