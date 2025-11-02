// src/components/business/BusinessPubProfileLayout.tsx
import * as React from "react";
import {
  Avatar,
  Box,
  Chip,
  Container,
  Divider,
  Grid,
  Stack,
  Tab,
  Tabs,
  Typography,
  Card,
  CardContent,
} from "@mui/material";
import BusinessPublicationsTab from "./BusinessPublicationsTab";
import ImageCarousel from "../../ui/ImageCarousel";
import type { BusinessPubAccountDataDTO } from "../../../types/AccountData";


export interface BusinessPubProfileLayoutProps {
  business: BusinessPubAccountDataDTO;
  specificTab: React.ReactNode;
  infoTabLabel?: string;
}

export default function BusinessPubProfileLayout({
  business,
  specificTab,
  infoTabLabel = "Más información",
}: BusinessPubProfileLayoutProps) {
  const [tab, setTab] = React.useState(0);

  const images =
    business.profileImageUrls?.length > 0
      ? business.profileImageUrls
      : ["/placeholder.jpg"];

  return (
    <Container sx={{ py: 5 }}>
      {/* ──────────────────────── Encabezado ──────────────────────── */}
      <Stack spacing={3}>
        <Grid container alignItems="center" spacing={3}>
          <Grid item>
            <Avatar
              src={business.avatarURL}
              alt={business.name}
              sx={{ width: 100, height: 100 }}
            />
          </Grid>
          <Grid item>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography variant="h4" fontWeight="bold">
                {business.name}
              </Typography>
              <Chip
                label={business.businessType}
                color="primary"
                variant="outlined"
              />
            </Stack>
            <Stack direction="row" alignItems="center" spacing={2}> 
              <Typography variant="subtitle1" color="text.secondary">
                Precio promedio:
              </Typography>
              <Typography variant="subtitle1" color="green">
                {business.averagePrice}
              </Typography>
            </Stack>
            {business.businessType === "HOSTING" && (
              <Stack direction="row" alignItems="center" spacing={2}> 
                <Typography variant="subtitle1" color="text.secondary">
                  Tipo:
                </Typography>
                <Chip label={business.hotelType} color="primary" variant="outlined" />
              </Stack>
            )}
            {business.businessType === "RESTAURANT" && (
              <Stack direction="row" alignItems="center" spacing={2}> 
                <Typography variant="subtitle1" color="text.secondary">
                  Tipo:
                </Typography>
                <Chip label={business.restaurantType} color="primary" variant="outlined" />
              </Stack>
            )}
          </Grid>
        </Grid>

        {/* ──────────────────────── Carrusel + Información ──────────────────────── */}
        <Grid container spacing={3} alignItems="stretch">
          {/* Carrusel */}
          <Grid item xs={12} md={7}>
            <ImageCarousel images={images} alt={business.name} height={380} />
          </Grid>

          {/* Información general */}
          <Grid item xs={12} md={5}>
            <Card
              sx={{
                height: "100%",
                borderRadius: 2,
                boxShadow: 2,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Información general
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {business.description}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Stack spacing={1.2}>
                  <InfoRow label="Ubicación" value={business.location} icon="📍" />
                  <InfoRow label="Teléfono" value={business.phoneNumber} icon="📞" />
                  <InfoRow label="Correo de contacto" value={business.publicEmail} icon="✉️" />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>

      {/* ──────────────────────── Tabs ──────────────────────── */}
      <Box sx={{ mt: 5 }}>
        <Tabs
          value={tab}
          onChange={(_, newValue) => setTab(newValue)}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Publicaciones" />
          <Tab label={infoTabLabel} />
        </Tabs>

        <Box sx={{ mt: 3 }}>
          {tab === 0 && <BusinessPublicationsTab id={business.id} />}
          {tab === 1 && specificTab}
        </Box>
      </Box>
    </Container>
  );
}

/* ────────────────────────────────
 * Subcomponente InfoRow
 * ──────────────────────────────── */
export function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | undefined;
  icon?: string;
}) {
  if (!value) return null;
  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Typography variant="body1" sx={{ fontSize: "1.1rem" }}>
        {icon}
      </Typography>
      <Box>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body1">{value}</Typography>
      </Box>
    </Stack>
  );
}
