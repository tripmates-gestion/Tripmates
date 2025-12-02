// src/components/business/BusinessPubProfileLayout.tsx
import * as React from "react";
import { ChevronRight, Map, AccessTime as AccessTimeIcon } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Stack,
  Tab,
  Tabs,
  Typography,
  Card,
  CardContent,
  Tooltip,
  IconButton,
  Rating,
  Popover,
} from "@mui/material";
import { DAY_LABEL, DAYS_ORDER, toMinutes } from "../../../search/utils/placeHelpers";
import BusinessPublicationsTab from "./BusinessPublicationsTab";
import ImageCarousel from "../../../ui/ImageCarousel";
import type { BusinessPubAccountDataDTO } from "../../../../types/AccountData";
import { COMMING_SOON_IMG } from "../../../../constants/DefaultImages";
import { ACHIEVEMENTS_LIST } from "../../../../constants/BusinessAchievementsData";
import { getPublicBusinessBenchmarks } from "../../../../services/benchmarks";
import { useAuth } from "../../../../hooks/useAuth";
import OpenStreetMapPicker from "../../../map/OpenStreetMapPicker";
import ProfileSocialMediaLinks from "../../ProfileSocialMediaLinks";
import { useBusinessRatingAverage } from "../../../../hooks/useBusinessRatingAverage";


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
  const { accessToken } = useAuth();
  const { ratingAverage } = useBusinessRatingAverage(business.id);
  const [tab, setTab] = React.useState(0);
  const [visibleAchievements, setVisibleAchievements] = React.useState<string[]>([]);
  const [achievementPage, setAchievementPage] = React.useState(0);
  const [isMapOpen, setIsMapOpen] = React.useState(false);
  const [scheduleAnchorEl, setScheduleAnchorEl] = React.useState<HTMLElement | null>(null);
  const PAGE_SIZE = 2;

  const handleScheduleClick = (event: React.MouseEvent<HTMLElement>) => {
    setScheduleAnchorEl(event.currentTarget);
  };

  const handleScheduleClose = () => {
    setScheduleAnchorEl(null);
  };

  const openSchedule = Boolean(scheduleAnchorEl);

  const hasLocationCoords = Boolean(
    business.location &&
    Number.isFinite(business.location.latitude) &&
    Number.isFinite(business.location.longitude) &&
    !(business.location.latitude === 0 && business.location.longitude === 0)
  );

  const locationLabel = business.location && typeof business.location === 'object'
    ? business.location.address || 'Ubicación no disponible'
    : 'Ubicación no disponible';

  React.useEffect(() => {
    const fetchVisibleBenchmarks = async () => {
      if (!accessToken) {
        console.warn("No access token available for fetching benchmarks");
        return;
      }

      const benchmarkIds = await getPublicBusinessBenchmarks(business.id, accessToken);
      setVisibleAchievements(benchmarkIds);
    };

    fetchVisibleBenchmarks();
  }, [business.id, accessToken]);

  const handleNextAchievements = () => {
    setAchievementPage(prev => {
      const nextStart = (prev + 1) * PAGE_SIZE;
      if (nextStart >= visibleAchievements.length) return 0;
      return prev + 1;
    });
  };

  const currentAchievements = visibleAchievements.slice(achievementPage * PAGE_SIZE, (achievementPage + 1) * PAGE_SIZE);

  const images =
    business.profileImageUrls?.length > 0
      ? business.profileImageUrls
      : [COMMING_SOON_IMG];
  console.log("opening days", business.openingDays ?? []);

  return (
    <>
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
            <Grid item xs>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography variant="h4" fontWeight="bold">
                  {business.name}
                </Typography>
                <Chip
                  label={business.businessType ? business.businessType : "not available yet"}
                  color="primary"
                  variant="outlined"
                />
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1} mt={0.5}>
                <Rating value={ratingAverage ?? 0} precision={0.1} readOnly size="small" />
                <Typography variant="body2" color="text.secondary">
                  {ratingAverage !== null ? `${ratingAverage.toFixed(1)} / 5` : 'Sin calificaciones'}
                </Typography>
              </Stack>
              {business.averagePrice && (
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Precio promedio:
                  </Typography>
                  <Typography variant="subtitle1" color="green">
                    {business.averagePrice}
                  </Typography>
                </Stack>
              )}

              {business.businessType === "HOTEL" && business.hotelType && (
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Tipo:
                  </Typography>
                  <Chip label={business.hotelType} size="small" color="primary" variant="outlined" />
                </Stack>
              )}
              {business.businessType === "RESTAURANT" && business.restaurantType && (
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Tipo:
                  </Typography>
                  <Chip label={business.restaurantType} size="small" color="primary" variant="outlined" />
                </Stack>
              )}
            </Grid>

            {/* Badges Carousel - Extreme Right */}
            {visibleAchievements.length > 0 && (
              <Grid item>
                <Stack alignItems="flex-end" spacing={1}>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold">
                    Logros del negocio
                  </Typography>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{
                      p: 0.5,
                      pl: 1.5,
                      pr: 0.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 8,
                      bgcolor: 'background.paper',
                      boxShadow: 1
                    }}
                  >
                    {currentAchievements.map(id => {
                      const ach = ACHIEVEMENTS_LIST.find(a => a.id === id);
                      if (!ach) return null;
                      return (
                        <Tooltip key={ach.id} title={ach.title}>
                          <Avatar sx={{ bgcolor: ach.color, width: 32, height: 32, border: '2px solid white' }}>
                            {React.cloneElement(ach.icon as React.ReactElement<any>, { sx: { fontSize: 20 } })}
                          </Avatar>
                        </Tooltip>
                      )
                    })}
                    {visibleAchievements.length > PAGE_SIZE && (
                      <IconButton size="small" onClick={handleNextAchievements} sx={{ width: 28, height: 28 }}>
                        <ChevronRight fontSize="small" />
                      </IconButton>
                    )}
                  </Stack>
                </Stack>
              </Grid>
            )}
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
                    {business.location && (
                      <>
                        <InfoRow
                          label="Ubicación"
                          value={locationLabel}
                          icon="📍"
                        />
                        {hasLocationCoords && (
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Map />}
                            onClick={() => setIsMapOpen(true)}
                            sx={{ alignSelf: 'flex-start' }}
                          >
                            Ver en mapa
                          </Button>
                        )}
                      </>
                    )}
                    {business.phoneNumber && <InfoRow label="Teléfono" value={business.phoneNumber} icon="📞" />}
                    {business.publicEmail && <InfoRow label="Correo de contacto" value={business.publicEmail} icon="✉️" />}

                    {/* Horario de atención dinámico para Restaurantes */}
                    {business.businessType === 'RESTAURANT' && business.attentionSchedule && business.openingDays && (
                      <>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Typography variant="body1" sx={{ fontSize: "1.1rem" }}>
                            🕒
                          </Typography>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Horario regular de atención
                            </Typography>
                            <Box
                              onMouseEnter={handleScheduleClick}
                              onMouseLeave={handleScheduleClose}
                              sx={{
                                cursor: 'default',
                                display: 'flex',
                                alignItems: 'center',
                                '&:hover': { textDecoration: 'underline', color: 'primary.main' }
                              }}
                            >
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {business.attentionSchedule.openingTime} - {business.attentionSchedule.closingTime}
                              </Typography>
                              <AccessTimeIcon sx={{ ml: 1, fontSize: 16, color: 'text.secondary' }} />
                            </Box>
                          </Box>
                        </Stack>
                        <Popover
                          id="mouse-over-popover"
                          sx={{
                            pointerEvents: 'none',
                          }}
                          open={openSchedule}
                          anchorEl={scheduleAnchorEl}
                          anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                          }}
                          transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                          }}
                          onClose={handleScheduleClose}
                          disableRestoreFocus
                        >
                          <Box sx={{ p: 2, minWidth: 320 }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                              Horarios regulares
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                              Válidos para la apertura corriente (no aplica a eventos - publicaciones).
                            </Typography>

                            <Stack spacing={1}>
                              {DAYS_ORDER.filter(day => business.openingDays?.includes(day)).map((day) => {
                                const openMins = toMinutes(business.attentionSchedule!.openingTime);
                                const closeMins = toMinutes(business.attentionSchedule!.closingTime);

                                const startPct = (openMins / 1440) * 100;
                                let widthPct = ((closeMins - openMins) / 1440) * 100;
                                if (widthPct < 0) widthPct = ((1440 - openMins + closeMins) / 1440) * 100;

                                return (
                                  <Stack key={day} direction="row" alignItems="center" spacing={2}>
                                    <Chip
                                      label={DAY_LABEL[day]}
                                      size="small"
                                      variant="outlined"
                                      sx={{ width: 45, height: 20, fontSize: '0.7rem', justifyContent: 'center' }}
                                    />
                                    <Tooltip title={`${business.attentionSchedule!.openingTime} - ${business.attentionSchedule!.closingTime}`}>
                                      <Box sx={{ flex: 1, height: 8, bgcolor: 'action.hover', borderRadius: 4, position: 'relative', overflow: 'hidden' }}>
                                        <Box
                                          sx={{
                                            position: 'absolute',
                                            left: `${startPct}%`,
                                            width: `${widthPct}%`,
                                            height: '100%',
                                            bgcolor: 'primary.main',
                                            borderRadius: 4
                                          }}
                                        />
                                      </Box>
                                    </Tooltip>
                                    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 80, textAlign: 'right' }}>
                                      {business.attentionSchedule!.openingTime} - {business.attentionSchedule!.closingTime}
                                    </Typography>
                                  </Stack>
                                );
                              })}
                            </Stack>
                          </Box>
                        </Popover>
                      </>
                    )}
                    <ProfileSocialMediaLinks email={business.email} />
                    {!business.location && !business.phoneNumber && !business.publicEmail && !business.attentionSchedule && (
                      <InfoRow
                        label="Comming soon"
                        value="Disculpa las molestias, esta información aun no está disponible."
                        icon="⏳"
                      />
                    )}
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
      <Dialog open={isMapOpen} onClose={() => setIsMapOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Ubicación de {business.name}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              {locationLabel}
            </Typography>
            {hasLocationCoords ? (
              <OpenStreetMapPicker
                location={business.location}
                onChange={() => { }}
                interactive={false}
                height={320}
              />
            ) : (
              <Typography variant="body2">No hay coordenadas disponibles.</Typography>
            )}
          </Stack>
        </DialogContent>
      </Dialog>
    </>
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
  value: any;
  icon?: string;
}) {
  // Safely convert value to string
  const displayValue = React.useMemo(() => {
    if (!value) return '';
    if (value && typeof value === 'object') {
      // If it's an object with an address property, use that
      if ('address' in value) return value.address;
      // If it's a React element, return it directly
      if (React.isValidElement(value)) return value;
      // Otherwise stringify the object (for debugging)
      return JSON.stringify(value);
    }
    return String(value);
  }, [value]);

  if (!displayValue) return null;

  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      {icon && (
        <Typography variant="body1" sx={{ fontSize: "1.1rem" }}>
          {icon}
        </Typography>
      )}
      <Box>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body1">
          {typeof displayValue === 'string' ? displayValue : 'Invalid value'}
        </Typography>
      </Box>
    </Stack>
  );
}