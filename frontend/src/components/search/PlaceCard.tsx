// ──────────────────────────────────────────────────────────────────────────────
// components/places/PlaceCard.tsx
// ──────────────────────────────────────────────────────────────────────────────
import * as React from "react";
import {
  Card, CardMedia, CardContent, Typography, Stack, Box, Chip,
} from "@mui/material";
import type { BusinessPlaceDTO } from "../../types/place";
import { sanitizeImages, computeOpenNow, DAYS_ORDER, DAY_LABEL } from "./utils/placeHelpers";

type Props = {
  place: BusinessPlaceDTO;
  onView: (p: BusinessPlaceDTO) => void;
};

export default function PlaceCard({ place, onView }: Props) {
  const imgs = sanitizeImages(place);
  const open = React.useMemo(() => computeOpenNow(place, new Date()), [place]);

  return (
    <Card
      onClick={() => onView(place)}
      sx={{
        cursor: "pointer",
        borderRadius: 3,
        overflow: "hidden",
        transition: "0.25s",
        "&:hover": { boxShadow: 6, transform: "translateY(-2px)" },
      }}
    >
      <Box sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          height="200"
          image={imgs[0]}
          alt={place.title}
          sx={{ objectFit: "cover" }}
        />
        <Box
          sx={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.0) 55%)" }}
        />

        <Stack direction="row" spacing={1} sx={{ position: "absolute", left: 12, bottom: 12 }}>
          {open === null ? (
            <Chip label="Horario no disponible" size="small" sx={(t) => ({
              bgcolor: t.palette.mode === "dark" ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.9)",
            })} />
          ) : (
            <Chip
              label={open ? "Abierto ahora" : "Cerrado"}
              color={open ? "success" : "default"}
              size="small"
              sx={(t) => ({
                bgcolor: open
                  ? t.palette.success.main
                  : t.palette.mode === "dark" ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.9)",
                color: open ? t.palette.success.contrastText : t.palette.text.primary,
                fontWeight: 700,
              })}
            />
          )}
        </Stack>
      </Box>

      <CardContent sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight={800} noWrap>{place.title}</Typography>
        {place.description ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", mt: 0.5 }}
          >
            {place.description}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Sin descripción
          </Typography>
        )}

        <Stack direction="row" spacing={1} alignItems="center" mt={1.25}>
          <Typography variant="caption" color="text.secondary">📍 {place.location || "Ubicación no disponible"}</Typography>
        </Stack>

        {place.openingDays?.length ? (
          <Stack direction="row" spacing={0.75} mt={1}>
            {DAYS_ORDER.map((d) => {
              const active = place.openingDays?.includes(d);
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
        ) : null}

        <Stack spacing={0.3} mt={1.25}>
          <Typography variant="caption" color="text.secondary">☎ {place.phoneNumber || place.email || "Contacto no disponible"}</Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}