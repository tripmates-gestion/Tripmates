import * as React from 'react';
import {
  Box, Card, CardContent, Stack, Typography, Avatar, Chip, Divider,
  Tabs, Tab, Button, Grid, CardMedia, Alert, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress
} from '@mui/material';
import { Edit, Room, Phone, Email } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useBusinessProfile } from '../hooks/useBusinessProfile';
import { BUSINESS_TYPES } from '../constants/Rol';
import type { BusinessUser, BusinessCommon, RestaurantExtras } from '../context/TypesUser';
import ImageCarousel from '../components/ui/ImageCarousel';
import { formatHours } from './utils/Utils';
import PublicationGrid from '../components/publications/PublicationGrid';
import type { BusinessPublicationResponseDTO } from '../types/business';
import { enqueueSnackbar } from 'notistack';
import { deleteBusinessPublication, getBusinessPublications } from '../services/businessPublications';
import HotelEditDialog from '../components/profile/businessPublicProfile/HotelEditDialog';
import RestaurantEditDialog from '../components/profile/businessPublicProfile/RestaurantEditDialog';
import { InfoRow } from '../components/profile/businessPublicProfile/BusinessPubProfileLayout';
import { PriceBadge, OpeningDaysRow} from "../components/profile/businessPublicProfile/Utils";
import RestaurantMenuTab from '../components/profile/businessPublicProfile/restaurant/RestaurantMenuTab';
import HotelRoomsTab from '../components/profile/businessPublicProfile/hotel/HotelRoomsTab';


const BASE_TABS = [
  { key: 'mi-presentacion', label: 'Mi Presentación' },
  { key: 'publicaciones', label: 'Publicaciones' },
  { key: 'fotos', label: 'Fotos' },
];

function isRestaurant(
  b: BusinessUser
): b is BusinessCommon & { businessType: 'RESTAURANT' } & RestaurantExtras {
  return b.businessType === 'RESTAURANT';
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

export default function BusinessProfile() {
  const { user, accessToken } = useAuth();
  const { business, loading, refreshProfile } = useBusinessProfile();
  const [tab, setTab] = React.useState(0);
  const [editOpen, setEditOpen] = React.useState(false);

  const tabs =
    business?.businessType === BUSINESS_TYPES.restaurant
      ? [...BASE_TABS, { key: 'menu', label: 'Menú' }]
      : business?.businessType === BUSINESS_TYPES.hotel
      ? [...BASE_TABS, { key: 'habitaciones', label: 'Habitaciones' }]
      : BASE_TABS;

  const currentTabKey = tabs[tab]?.key;

  if (loading) return <Box sx={{ p: 3 }}>Cargando perfil…</Box>;
  if (!user || user.role !== 'BUSINESS') return <Box sx={{ p: 3 }}>Este perfil es solo para cuentas de negocio.</Box>;
  if (!business) return <Box sx={{ p: 3 }}>No hay datos del negocio aún.</Box>;

  return (
    <Box sx={{ bgcolor: 'background.paper', minHeight: '100vh' }}>
      <Box
        sx={{
          minHeight: { xs: '38vh', md: '30vh' },
          backgroundImage:
            "url('https://png.pngtree.com/background/20250119/original/pngtree-mountain-scenery-natural-banner-images-picture-image_16218538.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <Box sx={{ position: 'relative' }}>
        <Card elevation={1} sx={{ maxWidth: 1180, mx: 'auto', mt: { xs: -8, md: -10 }, borderRadius: 2 }}>
          <CardContent sx={{ pb: 1.5 }}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              alignItems={{ xs: 'flex-start', md: 'center' }}
              sx={{ px: { xs: 2, sm: 3, md: 4 } }}
            >
              <Avatar
                src={business.avatarURL}
                alt={business.name}
                sx={{ width: 96, height: 96, mt: { xs: -6, md: -8 }, border: t => `4px solid ${t.palette.background.paper}` }}
              />

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Typography variant="h5" fontWeight={800}>{business.name || 'Mi negocio'}</Typography>
                  <Chip
                    size="small"
                    variant="outlined"
                    label={business.businessType === BUSINESS_TYPES.restaurant ? 'RESTAURANT' : 'HOTEL'}
                    color="success"
                    sx={{ ml: 0.5 }}
                  />

                  {/* {business.businessType === BUSINESS_TYPES.restaurant && (
                    <PriceBadge value={business.averagePrice ?? undefined} />
                  )}

                  {business.businessType === BUSINESS_TYPES.hotel && business.hotelType && (
                    <Chip size="small" label={business.hotelType} sx={{ ml: 0.5 }} />
                  )} */}

                </Stack>

                <Stack direction="row" spacing={2} sx={{ mt: 1.25 }} flexWrap="wrap">
                  {!!business.location && (
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Room fontSize="small" />
                      <Typography variant="caption">{business.location}</Typography>
                    </Stack>
                  )}
                  {!!business.phoneNumber && (
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Phone fontSize="small" />
                      <Typography variant="caption">{business.phoneNumber}</Typography>
                    </Stack>
                  )}
                  {!!business.publicEmail && (
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Email fontSize="small" />
                      <Typography variant="caption">{business.publicEmail}</Typography>
                    </Stack>
                  )}
                </Stack>
              </Box>

              <Button startIcon={<Edit />} variant="outlined" onClick={() => setEditOpen(true)}>
                Editar
              </Button>
            </Stack>
          </CardContent>

          <Divider />

          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" allowScrollButtonsMobile sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
            {tabs.map(t => (
              <Tab key={t.key} label={t.label} />
            ))}
          </Tabs>

          <Divider />

          <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            {currentTabKey === 'mi-presentacion' && (
              <Stack spacing={3}>
                <Box>
                {(!business.profileImageUrls || business.profileImageUrls.length === 0) ? (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Aún no subiste fotos a tu perfil.
                  </Typography>
                ) : (
                  <ImageCarousel
                    images={business.profileImageUrls ?? []}
                    aspectRatio={16 / 9} // puede ser también 4/3 u otro
                    height={300}
                    fit="contain"
                  />
                )}

                </Box>

                <Grid container spacing={3} alignItems="flex-start">
                  <Grid item xs={12} md={7}>
                    {!!business.description && (
                      <Section title="Descripción">
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                          {business.description}
                        </Typography>
                      </Section>
                    )}

                    {/* --- Información de atención según tipo de negocio --- */}
                    {isRestaurant(business) ? (
                      <>
                        {/* --- Días de atención --- */}
                        <Section title="Atención">
                          <OpeningDaysRow openingDays={business.openingDays} />
                        </Section>

                        {/* --- Detalles del restaurante --- */}
                        <Section title="Detalles del restaurante">
                          <Stack direction="row" spacing={1.5} flexWrap="wrap" alignItems="center">
                            {business.attentionSchedule && (
                              <Chip
                                size="small"
                                variant="outlined"
                                label={formatHours(business.attentionSchedule)}
                              />
                            )}
                            {!!business.restaurantType && (
                              <Chip
                                size="small"
                                variant="outlined"
                                label={business.restaurantType}
                              />
                            )}
                            {!!business.averagePrice && <PriceBadge value={business.averagePrice} />}
                          </Stack>
                        </Section>
                      </>
                    ) : business.businessType === BUSINESS_TYPES.hotel ? (
                      <>
                        {/* --- Detalles del hotel --- */}
                        <Section title="Detalles del hotel">
                          <Stack direction="row" spacing={1.5} flexWrap="wrap" alignItems="center">
                            {!!business.hotelType && (
                              <Chip
                                size="small"
                                variant="outlined"
                                color="primary"
                                label={business.hotelType}
                                sx={{
                                  fontWeight: 600,
                                  textTransform: "capitalize",
                                }}
                              />
                            )}
                            {!!business.averagePrice && <PriceBadge value={business.averagePrice} />}
                          </Stack>
                        </Section>
                      </>
                    ) : null}


                  </Grid>

                  <Grid item xs={12} md={5}>
                    <Section title="Contacto">
                      <InfoRow label="Ubicación" value={business.location} icon="📍" />
                      <InfoRow label="Teléfono" value={business.phoneNumber} icon="📞" />
                      <InfoRow label="Correo de contacto" value={business.publicEmail} icon="✉️" />
                    </Section>
                  </Grid>
                </Grid>
              </Stack>
            )}

            {currentTabKey === 'publicaciones' && <BusinessPublicationsTab accessToken={accessToken} />}

            {currentTabKey === 'fotos' && (
              <Grid container spacing={2}>
                {(business.profileImageUrls ?? []).map((url, i) => (
                  <Grid item xs={12} sm={6} md={4} key={`${url}-${i}`}>
                    <Card variant="outlined">
                      <CardMedia component="img" image={url} height={220} sx={{ objectFit: 'cover' }} />
                    </Card>
                  </Grid>
                ))}
                {(!business.profileImageUrls || business.profileImageUrls.length === 0) && (
                  <Typography variant="body2" color="text.secondary">
                    Aún no subiste fotos a tu perfil.
                  </Typography>
                )}
              </Grid>
            )}

            {currentTabKey === 'menu' && business.businessType === BUSINESS_TYPES.restaurant && (
              <RestaurantMenuTab
                accessToken={accessToken!}
                initialMenu={business.menu ?? []}
                onBusinessReload={refreshProfile} // opcional si tenés forma de refrescar el profile externo
              />
            )}

            {currentTabKey === "habitaciones" && business.businessType === BUSINESS_TYPES.hotel && (
                <HotelRoomsTab
                  accessToken={accessToken!}
                  roomPacks={business.roomPacks ?? []}
                  onBusinessReload={refreshProfile}
                />
              )}

          </Box>
        </Card>
      </Box>

      <RestaurantEditDialog open={editOpen && business.businessType === BUSINESS_TYPES.restaurant} onClose={() => setEditOpen(false)} />
      <HotelEditDialog open={editOpen && business.businessType === BUSINESS_TYPES.hotel} onClose={() => setEditOpen(false)} />
    </Box>
  );
}







export function BusinessPublicationsTab({ accessToken }: { accessToken: string | null }) {
  const [items, setItems] = React.useState<BusinessPublicationResponseDTO[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [toDeleteId, setToDeleteId] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const fetchAll = React.useCallback(async () => {
    if (!accessToken) {
      setError('No estás autenticado.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await getBusinessPublications(accessToken);
      setItems(res ?? []);
    } catch (e: any) {
      setError(e?.message || 'Error al obtener publicaciones');
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  React.useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleDeleteRequest = (id: string) => {
    setToDeleteId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!accessToken || !toDeleteId) return;
    setDeleting(true);
    try {
      await deleteBusinessPublication(accessToken, toDeleteId);
      setItems(prev => prev.filter(p => p.id !== toDeleteId));
      enqueueSnackbar('¡Publicación eliminada!', { variant: 'success' });
      setConfirmOpen(false);
      setToDeleteId(null);
    } catch {
      enqueueSnackbar('Error al eliminar publicación', { variant: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false);
    setToDeleteId(null);
  };

  const toDeletePub = toDeleteId ? items.find(p => p.id === toDeleteId) : undefined;

  if (loading) return <Typography>Cargando publicaciones...</Typography>;

  if (error)
    return (
      <Stack spacing={2}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={fetchAll}>Reintentar</Button>
      </Stack>
    );

    return (
      <Box>
        {items.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center", mt: 4 }}
          >
            Aún no publicaste nada. Tus publicaciones aparecerán aquí.
          </Typography>
        ) : (
          <PublicationGrid publications={items} onDelete={handleDeleteRequest} letReview={false} />
        )}
    
        <Dialog
          open={confirmOpen}
          onClose={deleting ? undefined : handleCancelDelete}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Eliminar publicación</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary">
              {toDeletePub ? (
                <>
                  ¿Seguro que querés eliminar <strong>{toDeletePub.title}</strong>?
                  Esta acción no se puede deshacer.
                </>
              ) : (
                "¿Seguro que querés eliminar esta publicación? Esta acción no se puede deshacer."
              )}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelDelete} disabled={deleting}>
              Cancelar
            </Button>
            <Button
              color="error"
              variant="contained"
              onClick={handleConfirmDelete}
              disabled={deleting}
              startIcon={deleting ? <CircularProgress size={18} /> : undefined}
            >
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );    
}
