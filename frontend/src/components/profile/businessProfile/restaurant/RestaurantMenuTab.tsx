// src/components/restaurant/RestaurantMenuTab.tsx
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
} from "@mui/material";
import {Restaurant, LocalDining } from "@mui/icons-material";
import type { MenuItem, RestaurantType } from "../../../../types/Restaurant";
import SpaIcon from "@mui/icons-material/Spa";       // alternativa tipo hoja
// import GrassIcon from "@mui/icons-material/Grass";   // alternativa moderna
// import YardIcon from "@mui/icons-material/Yard";     // otra hoja simpática


interface Props {
  menu: MenuItem[];
  restaurantType?: RestaurantType;
}

export function RestaurantMenuTab({ menu, restaurantType }: Props) {
  if (!menu || menu.length === 0)
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

  // Color temático y estilo según el tipo de restaurante
  const isVeggie =
    restaurantType === "vegano" || restaurantType === "vegetariano";
  const borderColor = isVeggie ? "success.main" : "divider";
  const iconColor = isVeggie ? "success" : "action";
  const CardIcon = isVeggie ? SpaIcon : Restaurant;

  return (
    <Grid container spacing={3} sx={{ p: { xs: 1, sm: 2 } }}>
      {menu.map((item) => (
        <Grid item xs={12} sm={6} md={4} key={item.foodName}>
          <Card
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              borderRadius: 3,
              overflow: "hidden",
              border: `1.5px solid`,
              borderColor,
              boxShadow: 3,
            }}
          >
            {/* Imagen del plato */}
            {item.photosURLs?.length > 0 && (
              <CardMedia
                component="img"
                height="180"
                image={item.photosURLs[0]}
                alt={item.foodName}
                sx={{
                  objectFit: "cover",
                  borderBottom: "1px solid",
                  borderColor,
                }}
              />
            )}

            <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
              {/* Nombre + ícono */}
              <Stack direction="row" alignItems="center" spacing={1}>
                <CardIcon color={iconColor} fontSize="small" />
                <Typography variant="h6" fontWeight={700}>
                  {item.foodName}
                </Typography>
              </Stack>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5, mb: 1 }}
              >
                {item.description}
              </Typography>

              <Divider sx={{ my: 1.5 }} />

              {/* Precio */}
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
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
                    sx={{
                      borderRadius: "8px",
                      fontWeight: 500,
                    }}
                  />
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
