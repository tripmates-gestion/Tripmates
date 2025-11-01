// src/components/hotel/HotelRoomsTab.tsx
import { Box, Typography, Grid, Card, CardContent, Chip } from "@mui/material";
import type { RoomPackDTO } from "../../../../types/Hotel";

export function HotelRoomsTab({ roomPacks }: { roomPacks: RoomPackDTO[] }) {
  if (!roomPacks || roomPacks.length === 0)
    return <Typography>No hay habitaciones disponibles.</Typography>;

  return (
    <Grid container spacing={2}>
      {roomPacks.map((pack, idx) => (
        <Grid item xs={12} sm={6} md={4} key={idx}>
          <Card>
            <CardContent>
              <Typography variant="h6">
                {pack.description}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Check-in: {pack.checkInDate}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Check-out: {pack.checkOutDate}
              </Typography>
              <Typography variant="body2">
                Huéspedes: {pack.numberOfGuests}
              </Typography>
              <Typography variant="subtitle1" fontWeight="bold">
                ${pack.price}
              </Typography>
              <Box sx={{ mt: 1 }}>
                {pack.services.map((s, i) => (
                  <Chip key={i} label={s} size="small" sx={{ mr: 0.5 }} />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
