// src/components/hotel/HotelRoomsTab.tsx
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Divider,
  Stack,
} from "@mui/material";
import {
  CalendarToday,
  People,
  AttachMoney,
} from "@mui/icons-material";
import type { RoomPackDTO } from "../../../../types/Hotel";

export function HotelRoomsTab({ roomPacks }: { roomPacks: RoomPackDTO[] }) {
  if (!roomPacks || roomPacks.length === 0)
    return (
      <Box sx={{ textAlign: "center", py: 6, color: "text.secondary" }}>
        <Typography variant="h6" fontWeight={600}>
          No hay habitaciones disponibles.
        </Typography>
        <Typography variant="body2">
          Actualmente no se encontraron opciones de alojamiento para las fechas seleccionadas.
        </Typography>
      </Box>
    );

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <Grid container spacing={3} sx={{ p: { xs: 1, sm: 2 } }}>
      {roomPacks.map((pack, idx) => (
        <Grid item xs={12} sm={6} md={4} key={idx}>
          <Card
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              borderRadius: 3,
              overflow: "hidden",
              boxShadow: 3
            }}
          >
            {/* Imagen principal */}
            {pack.photosURLs?.length > 0 && (
              <CardMedia
                component="img"
                height="180"
                image={pack.photosURLs[0]}
                alt={pack.description}
                sx={{ objectFit: "cover" }}
              />
            )}

            <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
              {/* Descripción */}
              <Typography variant="h6" fontWeight={700} gutterBottom>
                {pack.description}
              </Typography>

              {/* Fechas y huéspedes */}
              <Stack spacing={0.6} mb={1.5}>
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <CalendarToday fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(pack.checkInDate)} — {formatDate(pack.checkOutDate)}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <People fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {pack.numberOfGuests} huésped{pack.numberOfGuests > 1 ? "es" : ""}
                  </Typography>
                </Stack>
              </Stack>

              <Divider sx={{ my: 1.5 }} />

              {/* Servicios */}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                {pack.services.slice(0, 6).map((s, i) => (
                  <Chip
                    key={i}
                    label={s}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontWeight: 500,
                      borderRadius: "8px",
                    }}
                  />
                ))}
              </Box>
            </CardContent>

            {/* Precio */}
            <Box
              sx={{
                px: 2.5,
                pb: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <AttachMoney color="success" fontSize="medium" />
                <Typography variant="h6" fontWeight={700}>
                  {pack.price.toLocaleString("es-AR")}
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                por noche
              </Typography>
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
