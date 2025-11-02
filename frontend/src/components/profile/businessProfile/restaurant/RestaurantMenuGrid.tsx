import * as React from "react";
import {
  Typography, Grid, Card, CardContent, CardMedia, Chip,
  Box, Stack, Divider, IconButton, Menu, MenuItem, Tooltip
} from "@mui/material";
import { Restaurant, LocalDining, MoreVert } from "@mui/icons-material";
import SpaIcon from "@mui/icons-material/Spa";
import type { MenuItem as MenuItemDTO, RestaurantType } from "../../../../types/Restaurant";

type Props = {
  menu: MenuItemDTO[];
  restaurantType?: RestaurantType;      // p.ej. "vegano" | "vegetariano" | ...
  isOwner?: boolean;                    // si true, muestra acciones
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
        <Typography variant="h6" fontWeight={600}>No hay ítems de menú disponibles.</Typography>
        <Typography variant="body2">Actualmente este restaurante no tiene platos cargados.</Typography>
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

        // menú contextual por-card (solo dueño)
        const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
        const open = Boolean(anchorEl);
        const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
        const handleClose = () => setAnchorEl(null);

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
              {/* Acciones del dueño (kebab) */}
              {isOwner && (
                <>
                  <Tooltip title="Acciones">
                    <IconButton
                      size="small"
                      onClick={handleOpen}
                      sx={{
                        position: "absolute",
                        right: 8,
                        top: 8,
                        bgcolor: "rgba(255,255,255,0.85)",
                        "&:hover": { bgcolor: "rgba(255,255,255,1)" },
                        zIndex: 2,
                      }}
                    >
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                    <MenuItem
                      onClick={() => {
                        handleClose();
                        onEditItem?.(idx);
                      }}
                    >
                      Editar
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleClose();
                        onDeleteItem?.(idx);
                      }}
                      sx={{ color: "error.main" }}
                    >
                      Eliminar
                    </MenuItem>
                  </Menu>
                </>
              )}

              {/* Imagen */}
              {img && (
                <CardMedia
                  component="img"
                  height="180"
                  image={img}
                  alt={item.foodName}
                  sx={{ objectFit: "cover", borderBottom: "1px solid", borderColor }}
                />
              )}

              <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                {/* Título + ícono */}
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CardIcon color={iconColor} fontSize="small" />
                  <Typography variant="h6" fontWeight={700}>{item.foodName}</Typography>
                </Stack>

                {!!item.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1 }}>
                    {item.description}
                  </Typography>
                )}

                <Divider sx={{ my: 1.5 }} />

                {/* Precio + badge veggie */}
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <LocalDining color={iconColor} fontSize="small" />
                    <Typography variant="subtitle1" fontWeight={700}>
                      ${item.price.toLocaleString("es-AR")}
                    </Typography>
                  </Stack>

                  {isVeggie && (
                    <Chip
                      label={restaurantType === "vegano" ? "Vegano" : "Vegetariano"}
                      size="small"
                      color="success"
                      variant="outlined"
                      sx={{ borderRadius: "8px", fontWeight: 500 }}
                    />
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}
