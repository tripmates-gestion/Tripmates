// src/components/PlaceCard.tsx
import {
  Card,
  CardContent,
  CardMedia,
  Chip,
  Typography,
  Box,
  Stack,
  Rating,
  Divider,
} from '@mui/material';
import RoomRoundedIcon from '@mui/icons-material/RoomRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CallRoundedIcon from '@mui/icons-material/CallRounded';

import type { BusinessPost } from '../../types/business';

export type Place = {
  id: string;
  name: string;
  city: string;
  country: string;
  rating: number;
  priceLabel: string;
  photoUrl: string;
};

type Props =
  | {
      place: Place;
      post?: never;
      /** opcional: si querés forzar un rating distinto al del place */
      ratingOverride?: number;
      actions?: React.ReactNode;
    }
  | {
      place?: never;
      /** permitimos rating opcional sin tocar tu tipo en /types */
      post: BusinessPost & { rating?: number };
      actions?: React.ReactNode;
    };

export default function PlaceCard(props: Props) {
  const isPlace = 'place' in props && props.place;
  const isPost = 'post' in props && props.post;

  // --- Campos compartidos mapeados ---
  const title = isPlace ? props.place!.name : props.post!.title;
  const subtitle = isPlace
    ? `${props.place!.city}, ${props.place!.country}`
    : props.post!.location;

  const chipLabel = isPlace ? props.place!.priceLabel : props.post!.type;
  const image = isPlace ? props.place!.photoUrl : (props.post!.photos[0] ?? '');

  // rating:
  const rating = isPlace
    ? (props.ratingOverride ?? props.place!.rating)
    : props.post!.rating; // opcional en publicaciones

  // descripción:
  const description = isPlace
    ? `Lugar muy bonito ${props.place!.id}`
    : props.post!.description;

  // detalles de criterios (modo post)
  const hours = isPost ? props.post!.hours : undefined;
  const contact = isPost ? props.post!.contact : undefined;
  const location = isPost ? props.post!.location : undefined;
  const createdAt = isPost ? props.post!.createdAt : undefined;

  return (
    <Card sx={{ overflow: 'hidden' }}>
      {/* Imagen + etiqueta principal */}
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="160"
          image={image}
          alt={title}
          sx={{ objectFit: 'cover' }}
        />
        <Chip
          label={chipLabel}
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

      <CardContent>
        <Stack spacing={0.75}>
          {/* Título + rating opcional */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" noWrap>
              {title}
            </Typography>

            {typeof rating === 'number' && (
              <Stack direction="row" spacing={1} alignItems="center">
                <Rating size="small" value={rating} precision={0.5} readOnly />
                <Typography variant="caption" color="text.secondary">
                  {rating.toFixed(1)}
                </Typography>
              </Stack>
            )}
          </Stack>

          {/* Subtítulo: city,country o ubicación del post */}
          <Typography variant="body2" color="text.secondary" noWrap>
            {subtitle}
          </Typography>

          <Divider sx={{ my: 1 }} />

          {/* Descripción */}
          <Typography variant="body2" color="text.primary">
            {description}
          </Typography>

          {/* Bloque de detalles (solo post, siguiendo criterios) */}
          {isPost && (
            <Stack spacing={0.75} sx={{ mt: 1 }}>
              {hours && (
                <Row icon={<AccessTimeRoundedIcon fontSize="small" />} label="Horario" value={hours} />
              )}
              {contact && (
                <Row icon={<CallRoundedIcon fontSize="small" />} label="Contacto" value={contact} />
              )}
              {location && (
                <Row icon={<RoomRoundedIcon fontSize="small" />} label="Ubicación" value={location} />
              )}

              {/* Fecha de creación (si querés mostrarla) */}
              {createdAt && (
                <Typography variant="caption" color="text.secondary">
                  Publicado: {new Date(createdAt).toLocaleString()}
                </Typography>
              )}
            </Stack>
          )}

          {/* Acciones opcionales (editar/eliminar, etc.) */}
          {props.actions && <Box sx={{ mt: 1 }}>{props.actions}</Box>}
        </Stack>
      </CardContent>
    </Card>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Box sx={{ display: 'grid', placeItems: 'center' }}>{icon}</Box>
      <Typography variant="body2" fontWeight={700} minWidth={86}>
        {label}:
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
        {value}
      </Typography>
    </Stack>
  );
}
