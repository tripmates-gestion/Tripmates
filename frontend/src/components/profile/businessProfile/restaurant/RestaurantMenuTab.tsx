// src/components/restaurant/RestaurantMenuTab.tsx
import { Typography, Grid, Card, CardContent } from "@mui/material";
import type { MenuItem } from "../../../../types/Restaurant";

export function RestaurantMenuTab({ menu }: { menu: MenuItem[] }) {
  if (!menu || menu.length === 0)
    return <Typography>No hay ítems de menú disponibles.</Typography>;

  return (
    <Grid container spacing={2}>
      {menu.map((item) => (
        <Grid item xs={12} sm={6} md={4} key={item.foodName}>
          <Card>
            <CardContent>
              <Typography variant="h6">{item.foodName}</Typography>
              <Typography variant="body2" color="text.secondary">
                {item.description}
              </Typography>
              <Typography variant="subtitle1" fontWeight="bold">
                ${item.price}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
