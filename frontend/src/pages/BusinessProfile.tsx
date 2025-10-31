import * as React from 'react';
import {
  Box, Card, CardContent, Stack, Typography, Avatar, Chip, Divider,
  Tabs, Tab, ButtonGroup, Button, Grid, CardMedia,
  DialogTitle, DialogContent, DialogActions, Dialog, CircularProgress
} from '@mui/material';
import { Edit, Room, Phone, Email } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useBusinessProfile } from '../hooks/useBusinessProfile';
import { Alert } from "@mui/material";
import type { BusinessPublicationResponseDTO } from "../types/business";
import { enqueueSnackbar } from 'notistack';
import { deleteBusinessPublication, getBusinessPublications } from '../services/businessPublications';
import PublicationGrid from "../components/publications/PublicationGrid";
import RestaurantEditDialog from '../components/profile/businessProfile/RestaurantEditDialog';
import HotelEditDialog from '../components/profile/businessProfile/HotelEditDialog';
import { BUSINESS_TYPES } from '../constants/Rol';









// ---------- helpers UI ----------
const labelDays: Record<string, string> = {
  MONDAY: 'Lun', TUESDAY: 'Mar', WEDNESDAY: 'Mié', THURSDAY: 'Jue',
  FRIDAY: 'Vie', SATURDAY: 'Sáb', SUNDAY: 'Dom'
};

function formatHours(att?: {
  openingTime?: { hour: number; minute: number };
  closingTime?: { hour: number; minute: number };
}) {
  if (!att?.openingTime || !att?.closingTime) return '—';
  const pad = (n: number) => String(n).padStart(2, '0');
  const o = `${pad(att.openingTime.hour)}:${pad(att.openingTime.minute ?? 0)}`;
  const c = `${pad(att.closingTime.hour)}:${pad(att.closingTime.minute ?? 0)}`;
  return `${o}–${c}`;
}

const BASE_TABS = [
  { key: 'mi-presentacion', label: 'Mi Presentación' },
  { key: 'publicaciones', label: 'Publicaciones' },
  { key: 'fotos', label: 'Fotos' },
];



// en BusinessProfile.tsx (arriba del componente o en un helpers.ts)
import type { BusinessUser, BusinessCommon, RestaurantExtras } from "../context/TypesUser";

function isRestaurant(
  b: BusinessUser
): b is BusinessCommon & { businessType: "RESTAURANT" } & RestaurantExtras {
  return b.businessType === "RESTAURANT";
}















export default function BusinessProfile() {
  const { user, accessToken, updateUser } = useAuth();
  const { business, loading, refreshProfile } = useBusinessProfile();

  const [tab, setTab] = React.useState(0);
  const [editOpen, setEditOpen] = React.useState(false);

  // ✅ Derivar tabs SIN useMemo (barato y evita hooks post-guard)
  const tabs =
    business?.businessType === BUSINESS_TYPES.restaurant
      ? [...BASE_TABS, { key: 'menu', label: 'Menú' }]
      : business?.businessType === BUSINESS_TYPES.hotel
      ? [...BASE_TABS, { key: 'habitaciones', label: 'Habitaciones' }]
      : BASE_TABS;

  const currentTabKey = tabs[tab]?.key;

  // ✅ Early returns DESPUÉS de haber llamado todos los hooks anteriores
  if (loading) return <Box sx={{ p: 3 }}>Cargando perfil…</Box>;
  if (!user || user.role !== 'BUSINESS') return <Box sx={{ p: 3 }}>Este perfil es solo para cuentas de negocio.</Box>;
  if (!business) return <Box sx={{ p: 3 }}>No hay datos del negocio aún.</Box>;

  return (
    <Box sx={{ bgcolor: 'background.paper', minHeight: '100vh' }}>
      {/* ✅ Comentario JSX correcto */}
      {/* Banner: usamos primera imagen si existe */}
      <Box
        sx={{
          minHeight: { xs: '38vh', md: '30vh' },
          position: 'relative',
          backgroundImage: `url('https://png.pngtree.com/background/20250119/original/pngtree-mountain-scenery-natural-banner-images-picture-image_16218538.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Card */}
      <Box sx={{ position: 'relative' }}>
        <Card elevation={1} sx={{ maxWidth: 1180, mx: 'auto', mt: { xs: -8, md: -10 }, borderRadius: 2 }}>
          <CardContent sx={{ pb: 1.5 }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
              <Avatar
                src={business.avatarURL}
                alt={business.name}
                sx={{
                  width: 96, height: 96, mt: { xs: -6, md: -8 },
                  border: (t) => `4px solid ${t.palette.background.paper}`,
                }}
              />

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Typography variant="h5" fontWeight={800}>{business.name || 'Mi negocio'}</Typography>
                  <Chip size="small" label="BUSINESS" variant="outlined" sx={{ ml: 0.5 }} />
                  <Chip
                    size="small"
                    label={business.businessType === BUSINESS_TYPES.restaurant ? 'Restaurante' : 'Hotel'}
                    sx={{ ml: 0.5 }}
                  />
                  {business.businessType === BUSINESS_TYPES.restaurant && business.averagePrice && (
                    <Chip size="small" label={`Precio: ${business.averagePrice}`} sx={{ ml: 0.5 }} />
                  )}
                  {business.businessType === BUSINESS_TYPES.restaurant && business.restaurantType && (
                    <Chip size="small" label={business.restaurantType} sx={{ ml: 0.5 }} />
                  )}
                  {business.businessType === BUSINESS_TYPES.hotel && business.hotelType && (
                    <Chip size="small" label={business.hotelType} sx={{ ml: 0.5 }} />
                  )}
                </Stack>

                {business.description && (
                  <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                    {business.description}
                  </Typography>
                )}

                {/* Datos rápidos de contacto */}
                <Stack direction="row" spacing={2} sx={{ mt: 1.25 }} flexWrap="wrap">
                  {business.location && (
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Room fontSize="small" />
                      <Typography variant="caption">{business.location}</Typography>
                    </Stack>
                  )}
                  {business.phoneNumber && (
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Phone fontSize="small" />
                      <Typography variant="caption">{business.phoneNumber}</Typography>
                    </Stack>
                  )}
                  {business.publicEmail && (
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Email fontSize="small" />
                      <Typography variant="caption">{business.publicEmail}</Typography>
                    </Stack>
                  )}
                </Stack>
              </Box>

              <ButtonGroup variant="outlined" size="large">
                <Button startIcon={<Edit />} onClick={() => setEditOpen(true)}>
                  ¡Completá los datos de tu negocio!
                </Button>
              </ButtonGroup>
            </Stack>
          </CardContent>

          <Divider />

          {/* Tabs */}
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            allowScrollButtonsMobile
            sx={{ px: { xs: 1, sm: 2, md: 3 } }}
          >
            {tabs.map((t) => <Tab key={t.key} label={t.label} />)}
          </Tabs>

          <Divider />

          {/* Contenido por tab */}
          <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            {currentTabKey === 'mi-presentacion' && (
              <Stack spacing={3}>
                {/* Días y horario (solo RESTAURANT) */}
                {isRestaurant(business) && (
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" fontWeight={700}>Atención</Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {(business.openingDays ?? []).map((d) => (
                        <Chip
                          key={d}
                          size="small"
                          label={labelDays[d as keyof typeof labelDays] ?? d}
                        />
                      ))}
                      <Chip
                        size="small"
                        label={formatHours(business.attentionSchedule)}
                        variant="outlined"
                      />
                    </Stack>
                  </Stack>
                )}

                {/* Descripción extendida (aplica a ambos tipos) */}
                {business.description && (
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" fontWeight={700}>Descripción</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {business.description}
                    </Typography>
                  </Stack>
                )}
              </Stack>
            )}

            {currentTabKey === 'publicaciones' && (
              <BusinessPublicationsTab accessToken={accessToken} />
            )}

            {currentTabKey === 'fotos' && (
              <Grid container spacing={2}>
                {(business.profileImageUrls ?? []).map((url, i) => (
                  <Grid item xs={12} sm={6} md={4} key={`${url}-${i}`}>
                    <Card variant="outlined">
                      <CardMedia component="img" image={url} height={200} />
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
              <RestaurantMenuEditor menu={business.menu ?? []} />
            )}

            {currentTabKey === 'habitaciones' && business.businessType === BUSINESS_TYPES.hotel && (
              <HotelRoomsEditor roomPacks={business.roomPacks ?? []} />
            )}
          </Box>
        </Card>
      </Box>

      {/* Diálogos de edición por tipo */}
      <RestaurantEditDialog
        open={editOpen && business.businessType === BUSINESS_TYPES.restaurant}
        onClose={() => setEditOpen(false)}
      />
      <HotelEditDialog
        open={editOpen && business.businessType === BUSINESS_TYPES.hotel}
        onClose={() => setEditOpen(false)}
      />
    </Box>
  );
}





/** Placeholders simples para las tabs específicas (podés reemplazarlos después) */
function RestaurantMenuEditor({ menu }: { menu: Array<any> }) {
  return (
    <Stack spacing={1}>
      <Typography variant="h6">Menú</Typography>
      {menu.length === 0 ? (
        <Typography variant="body2" color="text.secondary">Aún no cargaste platos.</Typography>
      ) : (
        menu.map((m, i) => (
          <Stack key={i} direction="row" spacing={2} alignItems="center">
            <Typography variant="body2" sx={{ minWidth: 220 }}>{m.foodName}</Typography>
            <Chip label={`$ ${m.price}`} />
          </Stack>
        ))
      )}
    </Stack>
  );
}

function HotelRoomsEditor({ roomPacks }: { roomPacks: Array<any> }) {
  return (
    <Stack spacing={1}>
      <Typography variant="h6">Habitaciones</Typography>
      {roomPacks.length === 0 ? (
        <Typography variant="body2" color="text.secondary">Aún no cargaste habitaciones/paquetes.</Typography>
      ) : (
        roomPacks.map((r, i) => (
          <Stack key={i} spacing={0.5}>
            <Typography variant="body2" fontWeight={700}>{r.description ?? 'Pack'}</Typography>
            <Typography variant="caption" color="text.secondary">
              {r.checkInDate} → {r.checkOutDate} · {r.numberOfGuests} huéspedes · $ {r.price}
            </Typography>
          </Stack>
        ))
      )}
    </Stack>
  );
}



export function BusinessPublicationsTab({ accessToken }: { accessToken: string | null }) {
  const [items, setItems] = React.useState<BusinessPublicationResponseDTO[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // --- Confirmación de borrado (UI estado) ---
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [toDeleteId, setToDeleteId] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const fetchAll = React.useCallback(async () => {
    if (!accessToken) {
      setError("No estás autenticado.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await getBusinessPublications(accessToken);
      setItems(res ?? []);
    } catch (e: any) {
      setError(e?.message || "Error al obtener publicaciones");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  React.useEffect(() => { fetchAll(); }, [fetchAll]);

  // Click en "Eliminar" desde la card -> abre diálogo
  const handleDeleteRequest = (id: string) => {
    setToDeleteId(id);
    setConfirmOpen(true);
  };

  // Confirmar eliminación en el diálogo
  const handleConfirmDelete = async () => {
    if (!accessToken || !toDeleteId) return;
    setDeleting(true);
    try {
      await deleteBusinessPublication(accessToken, toDeleteId);
      setItems(prev => prev.filter(p => p.id !== toDeleteId));

      enqueueSnackbar('¡Publicación eliminada', { variant: 'success' });
      setConfirmOpen(false);
      setToDeleteId(null);

    } catch (e: any) {
      enqueueSnackbar('Error al eliminar publicación', { variant: 'success' });
    } finally {
      setDeleting(false);
    }
  };

  // Cancelar diálogo
  const handleCancelDelete = () => {
    setConfirmOpen(false);
    setToDeleteId(null);
  };

  // Datos de la publicación a borrar (para mostrar título en el diálogo)
  const toDeletePub = toDeleteId ? items.find(p => p.id === toDeleteId) : undefined;

  if (loading) return <p>Cargando publicaciones...</p>;

  if (error) {
    return (
      <Stack spacing={2}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={fetchAll}>Reintentar</Button>
      </Stack>
    );
  }

  return (
    <Box>
      <PublicationGrid
        publications={items}
        onDelete={handleDeleteRequest}  // << ahora abre diálogo "pro"
      />

      {/* Diálogo de confirmación */}
      <Dialog open={confirmOpen} onClose={deleting ? undefined : handleCancelDelete} maxWidth="xs" fullWidth>
        <DialogTitle>Eliminar publicación</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {toDeletePub
              ? <>¿Seguro que querés eliminar <strong>{toDeletePub.title}</strong>? Esta acción no se puede deshacer.</>
              : "¿Seguro que querés eliminar esta publicación? Esta acción no se puede deshacer."
            }
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} disabled={deleting}>Cancelar</Button>
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
