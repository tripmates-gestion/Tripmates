import * as React from 'react';
import {
  Box, Card, CardContent, Stack, Typography, Avatar, Chip, Divider,
  Tabs, Tab, Button, Grid, CardMedia, Alert, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress,
} from '@mui/material';
import { Edit, Room, Phone, Email } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useBusinessProfile } from '../hooks/useBusinessProfile';
import { BUSINESS_TYPES } from '../constants/Rol';
import type { BusinessCommon, BusinessUser, CommonUser } from '../types/PrivateUserProfiles';

import PublicationGrid from '../components/publications/PublicationGrid';
import type { BusinessPublicationResponseDTO } from '../types/Business';
import { enqueueSnackbar } from 'notistack';
import { deleteBusinessPublication, getBusinessPublications } from '../services/businessPublications';
import BusinessPresentationTab from '../components/profile/businessPrivateProfile/common/BusinessPresentationTab';
import BusinessBenchmarks from '../components/profile/businessPrivateProfile/common/BusinessBenchmarks';
import { NewPostDialog } from '../components/publications/NewPostDialog';

import RestaurantMenuTab from '../components/profile/businessPublicProfile/restaurant/RestaurantMenuTab';
import HotelRoomsTab from '../components/profile/businessPublicProfile/hotel/HotelRoomsTab';
import { BusinessMetricsButton } from '../components/metrics/BottonMetrics';
import { ShareProfileButton } from '../components/profile/ShareProfileButton';
import ProfileEditDialog from '../components/profile/ProfileEditDialog';
import { getUserSocialMedia, type SocialMediaLinks } from '../services/socialMedia';


const BASE_TABS = [
  { key: 'mi-presentacion', label: 'Mi Presentación' },
  { key: 'publicaciones', label: 'Publicaciones' },
  { key: 'fotos', label: 'Fotos' },
];



function makeUrl(business: BusinessCommon | null | undefined): string {
  if (!business) return '';
  const account = business;
  const type = business.businessType === BUSINESS_TYPES.restaurant ? 'restaurant' : business.businessType === BUSINESS_TYPES.hotel ? 'hotel' : 'business';
  return `http://localhost:5173/${type}/${account.id}?account=${encodeURIComponent(JSON.stringify(account))}`;
}

export default function BusinessProfile() {
  const { user, accessToken } = useAuth();
  const { business, loading, refreshProfile } = useBusinessProfile();
  const [tab, setTab] = React.useState(0);
  const [editOpen, setEditOpen] = React.useState(false);
  const [socialLinks, setSocialLinks] = React.useState<SocialMediaLinks | null>(null);

  const tabs =
    business?.businessType === BUSINESS_TYPES.restaurant
      ? [...BASE_TABS, { key: 'menu', label: 'Menú' }]
      : business?.businessType === BUSINESS_TYPES.hotel
        ? [...BASE_TABS, { key: 'habitaciones', label: 'Habitaciones' }]
        : BASE_TABS;

  const currentTabKey = tabs[tab]?.key;

  React.useEffect(() => {
    if (!business?.email) return;
    let mounted = true;
    const fetchSocial = async () => {
      try {
        const data = await getUserSocialMedia(business.email, accessToken);
        if (mounted) {
          setSocialLinks(data ?? {});
        }
      } catch {
        if (mounted) {
          setSocialLinks({});
        }
      }
    };

    void fetchSocial();
    return () => {
      mounted = false;
    };
  }, [accessToken, business?.email]);

  const handleProfileUpdated = React.useCallback(
    (_profile: CommonUser | BusinessUser, social: SocialMediaLinks) => {
      setSocialLinks(social);
      void refreshProfile();
    },
    [refreshProfile]
  );

  if (loading) return <Box sx={{ p: 3 }}>Cargando perfil…</Box>;
  if (!user || user.role !== 'BUSINESS')
    return <Box sx={{ p: 3 }}>Este perfil es solo para cuentas de negocio.</Box>;
  if (!business) return <Box sx={{ p: 3 }}>No hay datos del negocio aún.</Box>;

  return (
    <Box sx={{ bgcolor: 'background.paper', minHeight: '100vh' }}>
      <Box
        sx={{
          minHeight: { xs: '38vh', md: '30vh' },
          backgroundImage:
            "url('https://image.shutterstock.com/image-vector/vector-graphic-depicting-warmcolored-mountain-260nw-2521969157.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <Box sx={{ position: 'relative' }}>
        <Card
          elevation={1}
          sx={{ maxWidth: 1180, mx: 'auto', mt: { xs: -8, md: -10 }, borderRadius: 2 }}
        >
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
                sx={{
                  width: 96,
                  height: 96,
                  mt: { xs: -6, md: -8 },
                  border: t => `4px solid ${t.palette.background.paper}`,
                }}
              />

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Typography variant="h5" fontWeight={800}>
                    {business.name || 'Mi negocio'}
                  </Typography>
                  <Chip
                    size="small"
                    variant="outlined"
                    label={
                      business.businessType === BUSINESS_TYPES.restaurant ? 'RESTAURANT' : 'HOTEL'
                    }
                    color="success"
                    sx={{ ml: 0.5 }}
                  />
                </Stack>

                <Stack direction="row" spacing={2} sx={{ mt: 1.25 }} flexWrap="wrap">
                  {!!business.location && (
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Room fontSize="small" />
                      <Typography variant="caption">{business.location.address}</Typography>
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

              <Stack direction="row" spacing={1}>
                <BusinessMetricsButton accessToken={accessToken} />
                <Button startIcon={<Edit />} variant="outlined" onClick={() => setEditOpen(true)}>
                  Editar
                </Button>
              </Stack>

              <ShareProfileButton shareUrl={makeUrl(business)} />
            </Stack>
          </CardContent>

          {/* Logros */}
          <BusinessBenchmarks />

          <Divider />

          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            allowScrollButtonsMobile
            sx={{ px: { xs: 1, sm: 2, md: 3 } }}
          >
            {tabs.map(t => (
              <Tab key={t.key} label={t.label} />
            ))}
          </Tabs>

          <Divider />

          <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            {currentTabKey === 'mi-presentacion' && (
              <BusinessPresentationTab business={business} socialMedia={socialLinks} />
            )}

            {currentTabKey === 'publicaciones' && (
              <BusinessPublicationsTab accessToken={accessToken} />
            )}

            {currentTabKey === 'fotos' && (
              <Grid container spacing={2}>
                {(business.profileImageUrls ?? []).map((url, i) => (
                  <Grid item xs={12} sm={6} md={4} key={`${url}-${i}`}>
                    <Card variant="outlined">
                      <CardMedia
                        component="img"
                        image={url}
                        height={220}
                        sx={{ objectFit: 'cover' }}
                      />
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

            {currentTabKey === 'menu' &&
              business.businessType === BUSINESS_TYPES.restaurant && (
                <RestaurantMenuTab
                  accessToken={accessToken!}
                  initialMenu={business.menu ?? []}
                  onBusinessReload={refreshProfile}
                />
              )}

            {currentTabKey === 'habitaciones' &&
              business.businessType === BUSINESS_TYPES.hotel && (
                <HotelRoomsTab
                  accessToken={accessToken!}
                  roomPacks={business.roomPacks ?? []}
                  onBusinessReload={refreshProfile}
                />
              )}
          </Box>
        </Card>
      </Box>

      <ProfileEditDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        profileType="business"
        initialProfileData={business}
        initialSocialMedia={socialLinks ?? {}}
        onProfileUpdated={handleProfileUpdated}
      />
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
  
  // Estados para edición
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [publicationToEdit, setPublicationToEdit] = React.useState<BusinessPublicationResponseDTO | null>(null);

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
  
  const handleEditRequest = (publication: BusinessPublicationResponseDTO) => {
    setPublicationToEdit(publication);
    setEditDialogOpen(true);
  };
  
  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setPublicationToEdit(null);
  };
  
  const handlePublicationUpdated = () => {
    fetchAll(); // Recargar publicaciones después de editar
    handleCloseEditDialog();
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
        <PublicationGrid 
          publications={items} 
          onEdit={handleEditRequest}
          onDelete={handleDeleteRequest} 
          letReview={false} 
        />
      )}

      {/* Diálogo de edición */}
      <NewPostDialog 
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        onCreated={handlePublicationUpdated}
        publicationToEdit={publicationToEdit}
      />

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
