// src/components/PlaceCard.tsx
import { Card, CardContent, CardMedia, Chip, Typography, Box, Stack, Rating, Divider } from '@mui/material';


// Tipo de datos que representa un lugar (hotel, restaurante, etc.)
export type Place = {
  id: string;
  name: string;
  city: string;
  country: string;
  rating: number;
  priceLabel: string;
  photoUrl: string;
};

// Tarjeta visual que muestra la información de un lugar

export default function PlaceCard({ place }: { place: Place }) {
  return (
    <Card sx={{ overflow: 'hidden' }}>
      {/* Imagen con etiqueta de precio */}
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="160"
          image={place.photoUrl}
          alt={place.name}
          sx={{ objectFit: 'cover' }}
        />
        <Chip
          label={place.priceLabel}
          color="primary"
          sx={{
            position: 'absolute',
            right: 12,
            top: 12,
            borderRadius: 2,
            fontWeight: 700,
          }}
        />
      </Box>

      {/* Información textual */}
      <CardContent>
        <Stack spacing={0.5}>
          <Typography variant="h6" noWrap>{place.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {place.city}, {place.country}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center">
            <Rating size="small" value={place.rating} precision={0.5} readOnly />
            <Typography variant="caption" color="text.secondary">
              {place.rating.toFixed(1)}
            </Typography>
          </Stack>
        </Stack>

        <Divider sx={{ my: 1.5 }} />

        {/* Ejemplo: aca para mi iria una descripcion */}
        <Typography variant="caption" color="text.secondary">
          Lugar muy bonito {place.id}
        </Typography>
      </CardContent>
    </Card>
  );
}