// src/components/restaurant/RestaurantMenuGrid.tsx
import * as React from "react";
import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Box,
  Stack,
  Divider,
  IconButton,
} from "@mui/material";
import {
  Restaurant,
  LocalDining,
  Edit,
  Delete,
} from "@mui/icons-material";
import SpaIcon from "@mui/icons-material/Spa";
import type {
  MenuItem as MenuItemDTO,
  RestaurantType,
} from "../../../../types/Restaurant";

type Props = {
  menu: MenuItemDTO[];
  restaurantType?: RestaurantType; // p.ej. "vegano" | "vegetariano" | ...
  isOwner?: boolean; // si true, muestra acciones
  onEditItem?: (index: number) => void;
  onDeleteItem?: (index: number) => void;
};

export default function RestaurantMenuGrid({
  menu,
  restaurantType,
  isOwner = false,
  onEditItem,
  onDeleteItem,
}: Props) {
  if (!menu || menu.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 6, color: "text.secondary" }}>
        <Typography variant="h6" fontWeight={600}>
          No hay ítems de menú disponibles.
        </Typography>
        <Typography variant="body2">
          Actualmente este restaurante no tiene platos cargados.
        </Typography>
      </Box>
    );
  }

  const isVeggie = restaurantType === "vegano" || restaurantType === "vegetariano";
  const borderColor = isVeggie ? "success.main" : "divider";
  const iconColor: any = isVeggie ? "success" : "action"; // MUI IconColor
  const CardIcon = isVeggie ? SpaIcon : Restaurant;

  return (
    <Grid container spacing={3} sx={{ p: { xs: 1, sm: 2 } }}>
      {menu.map((item, idx) => {
        const img = item.photosURLs?.[0];

        return (
          <Grid item xs={12} sm={6} md={4} key={`${item.foodName}-${idx}`}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                borderRadius: 3,
                overflow: "hidden",
                border: "1.5px solid",
                borderColor,
                boxShadow: 3,
                position: "relative",
              }}
            >
              {/* Imagen */}
              {img && (
                <CardMedia
                  component="img"
                  height="180"
                  image={img}
                  alt={item.foodName}
                  sx={{
                    objectFit: "cover",
                    borderBottom: "1px solid",
                    borderColor,
                  }}
                />
              )}

              <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                {/* Título + ícono */}
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CardIcon color={iconColor} fontSize="small" />
                  <Typography variant="h6" fontWeight={700}>
                    {item.foodName}
                  </Typography>
                </Stack>

                {!!item.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5, mb: 1 }}
                  >
                    {item.description}
                  </Typography>
                )}

                <Divider sx={{ my: 1.5 }} />

                {/* Badge veggie (si corresponde) */}
                {isVeggie && (
                  <Chip
                    label={restaurantType === "vegano" ? "Vegano" : "Vegetariano"}
                    size="small"
                    color="success"
                    variant="outlined"
                    sx={{ borderRadius: "8px", fontWeight: 500 }}
                  />
                )}
              </CardContent>

              {/* Precio + acciones abajo (igual estilo que hoteles) */}
              <Box
                sx={{
                  px: 2.5,
                  pb: 2,
                  pt: 1,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <LocalDining color={iconColor} fontSize="small" />
                  <Typography variant="subtitle1" fontWeight={700}>
                    ${item.price.toLocaleString("es-AR")}
                  </Typography>
                </Stack>

                {isOwner && (
                  <Stack direction="row" spacing={0.5}>
                    <IconButton
                      size="small"
                      onClick={() => onEditItem?.(idx)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onDeleteItem?.(idx)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Stack>
                )}
              </Box>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}
