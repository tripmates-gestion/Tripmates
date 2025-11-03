import * as React from 'react';
import {
  Box, Card, CardContent, Stack, Typography, Avatar, Chip, Divider,
  Tabs, Tab, Button, Grid, CardMedia,
  DialogTitle, DialogContent, DialogActions, Dialog, CircularProgress
} from '@mui/material';
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { Edit, Room, Phone, Email } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useBusinessProfile } from '../hooks/useBusinessProfile';
import { Alert } from "@mui/material";
import type { BusinessPublicationResponseDTO } from "../types/business";
import { enqueueSnackbar } from 'notistack';
import { deleteBusinessPublication, getBusinessPublications } from '../services/businessPublications';
import PublicationGrid from "../components/publications/PublicationGrid";
import { BUSINESS_TYPES } from '../constants/Rol';
import type { BusinessUser, BusinessCommon, RestaurantExtras } from "../context/TypesUser";
import HotelEditDialog from '../components/profile/businessPublicProfile/HotelEditDialog';
import RestaurantEditDialog from '../components/profile/businessPublicProfile/RestaurantEditDialog';









// ---------- helpers UI ----------
const labelDays: Record<string, string> = {
  MONDAY: 'Lun', TUESDAY: 'Mar', WEDNESDAY: 'Mié', THURSDAY: 'Jue',
  FRIDAY: 'Vie', SATURDAY: 'Sáb', SUNDAY: 'Dom'
};

type TimeLike =
  | string
  | { hour: number; minute?: number | null }
  | null
  | undefined;

function parseTimeLike(t: TimeLike): { h: number; m: number } | null {
  if (!t) return null;
  if (typeof t === 'string') {
    const m = t.match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return null;
    return { h: Number(m[1]), m: Number(m[2]) };
  }
  if (typeof t === 'object' && 'hour' in t) {
    return { h: Number(t.hour), m: Number(t.minute ?? 0) };
  }
  return null;
}

export function formatHours(att?: {
  openingTime?: TimeLike;
  closingTime?: TimeLike;
}) {
  const o = parseTimeLike(att?.openingTime);
  const c = parseTimeLike(att?.closingTime);
  if (!o || !c) return '—';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(o.h)}:${pad(o.m)}–${pad(c.h)}:${pad(c.m)}`;
}

const BASE_TABS = [
  { key: 'mi-presentacion', label: 'Mi Presentación' },
  { key: 'publicaciones', label: 'Publicaciones' },
  { key: 'fotos', label: 'Fotos' },
];




function isRestaurant(
  b: BusinessUser
): b is BusinessCommon & { businessType: "RESTAURANT" } & RestaurantExtras {
  return b.businessType === "RESTAURANT";
}















/* ===================== componentes chicos ===================== */

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

function InfoRow({ icon, text }: { icon: React.ReactNode; text?: string | null }) {
  if (!text) return null;
  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ py: 0.5 }}>
      {icon}
      <Typography variant="body2">{text}</Typography>
    </Stack>
  );
}

/** Carrusel simple sin dependencias externas */
/** Carrusel simple sin dependencias externas (fix incluido) */
function ImageCarousel({
  images,
  height = 300,
  rounded = 2,
}: { images: string[]; height?: number; rounded?: number }) {
  const [i, setI] = React.useState(0);
  const count = images.length;

  // // autoplay
  // React.useEffect(() => {
  //   if (count < 2) return;
  //   const id = setInterval(() => setI((v) => (v + 1) % count), 3000);
  //   return () => clearInterval(id);
  // }, [count]);

  // reset index si cambia la cantidad de imágenes
  React.useEffect(() => {
    setI(0);
  }, [count]);

  if (count === 0) return null;

  const next = () => setI((v) => (v + 1) % count);
  const prev = () => setI((v) => (v - 1 + count) % count);

  return (
    <Box sx={{ position: 'relative', width: '100%', borderRadius: rounded, overflow: 'hidden', boxShadow: 1 }}>
      <Box
        sx={{
          display: 'flex',
          width: `${count * 100}%`,
          height,
          transform: `translateX(-${(i * 100) / count}%)`, // FIX
          transition: 'transform 400ms ease',
        }}
      >
        {images.map((src, idx) => (
          <Box
            key={idx}
            sx={{
              flex: `0 0 ${100 / count}%`, // cada slide ocupa su proporción
              height,
            }}
          >
            <Box
              component="img"
              src={src}
              alt={`foto-${idx + 1}`}
              onError={(e: any) => (e.currentTarget.style.visibility = 'hidden')}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </Box>
        ))}
      </Box>

      {/* Controles */}
      {count > 1 && (
        <>
          <Button
            onClick={prev}
            aria-label="Anterior"
            startIcon={<ChevronLeft />}
            sx={{
              minWidth: 0,
              position: 'absolute',
              top: '50%',
              left: 8,
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(0,0,0,0.4)',
              color: 'common.white',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' },
            }}
          />
          <Button
            onClick={next}
            aria-label="Siguiente"
            startIcon={<ChevronRight />}
            sx={{
              minWidth: 0,
              position: 'absolute',
              top: '50%',
              right: 8,
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(0,0,0,0.4)',
              color: 'common.white',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' },
            }}
          />
          {/* Puntos */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              left: 0,
              right: 0,
              display: 'flex',
              gap: 1,
              justifyContent: 'center',
            }}
          >
            {images.map((_, idx) => (
              <Box
                key={idx}
                onClick={() => setI(idx)}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: idx === i ? 'primary.main' : 'rgba(255,255,255,0.75)',
                  border: (t) => `1px solid ${t.palette.common.white}`,
                  cursor: 'pointer',
                }}
              />
            ))}
          </Box>
        </>
      )}
    </Box>
  );
}





/* ===================== principal ===================== */

export default function BusinessProfile() {
  const { user , accessToken} = useAuth();
  const { business, loading } = useBusinessProfile();

  const [tab, setTab] = React.useState(0);
  const [editOpen, setEditOpen] = React.useState(false);

  // Tabs dinámicas
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
      {/* Portada */}
      <Box
        sx={{
          minHeight: { xs: '38vh', md: '30vh' },
          position: 'relative',
          backgroundImage: `url('https://png.pngtree.com/background/20250119/original/pngtree-mountain-scenery-natural-banner-images-picture-image_16218538.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Card principal */}
      <Box sx={{ position: 'relative' }}>
        <Card elevation={1} sx={{ maxWidth: 1180, mx: 'auto', mt: { xs: -8, md: -10 }, borderRadius: 2 }}>
          {/* ===== Header minimalista ===== */}
          <CardContent sx={{ pb: 1.5 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }} sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
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
                  <Chip
                    size="small"
                    variant="outlined"
                    label={business.businessType === BUSINESS_TYPES.restaurant ? 'Restaurante' : 'Hotel'}
                    color='success'
                    sx={{ ml: 0.5 }}
                  />
                  {/* Chip adicional relevante */}
                  {business.businessType === BUSINESS_TYPES.restaurant && business.averagePrice && (
                    <Chip size="small" label={`Precio: ${business.averagePrice}`} sx={{ ml: 0.5 }} />
                  )}
                  {business.businessType === BUSINESS_TYPES.hotel && business.hotelType && (
                    <Chip size="small" label={business.hotelType} sx={{ ml: 0.5 }} />
                  )}
                </Stack>

                {/* Contacto compacto */}
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

              <Button startIcon={<Edit />} variant="outlined" onClick={() => setEditOpen(true)}>
                Editar
              </Button>
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
            {/* ===== MI PRESENTACIÓN ===== */}
            {currentTabKey === 'mi-presentacion' && (
              <Stack spacing={3}>
                {/* Carrusel arriba */}
                <Box>
                  <ImageCarousel images={business.profileImageUrls ?? []} height={300} rounded={2} />
                  {(!business.profileImageUrls || business.profileImageUrls.length === 0) && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Aún no subiste fotos a tu perfil.
                    </Typography>
                  )}
                </Box>

                <Grid container spacing={3} alignItems="flex-start">
                  {/* Columna izquierda: Descripción + Atención */}
                  <Grid item xs={12} md={7}>
                    {business.description && (
                      <Section title="Descripción">
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                          {business.description}
                        </Typography>
                      </Section>
                    )}

                    {isRestaurant(business) && (
                      <Section title="Atención">
                        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}>
                          {(business.openingDays ?? []).map((d) => (
                            <Chip
                              key={d}
                              size="small"
                              label={labelDays[d as keyof typeof labelDays] ?? d}
                              sx={{ mb: 1 }}
                            />
                          ))}
                          {business.attentionSchedule && (
                            <Chip size="small" variant="outlined" label={formatHours(business.attentionSchedule)} sx={{ mb: 1 }} />
                          )}
                        </Stack>

                        {/* Etiquetas estilo TripAdvisor */}
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {business.restaurantType && (
                            <Chip size="small" variant="outlined" label={business.restaurantType} />
                          )}
                          {business.averagePrice && (
                            <Chip size="small" variant="outlined" label={`Precio: ${business.averagePrice}`} />
                          )}
                        </Stack>
                      </Section>
                    )}
                  </Grid>

                  {/* Columna derecha: Contacto */}
                  <Grid item xs={12} md={5}>
                    <Section title="Contacto">
                      <InfoRow icon={<Room fontSize="small" />} text={business.location} />
                      <InfoRow icon={<Phone fontSize="small" />} text={business.phoneNumber} />
                      <InfoRow icon={<Email fontSize="small" />} text={business.publicEmail} />
                    </Section>
                  </Grid>
                </Grid>
              </Stack>
            )}

            {/* ===== PUBLICACIONES (placeholder: reemplazá por tu componente si lo tenés) ===== */}
            {currentTabKey === 'publicaciones' && (
         
              <BusinessPublicationsTab accessToken={accessToken} />
            )}

            {/* ===== FOTOS (grid secundario, además del carrusel en Mi Presentación) ===== */}
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

            {/* ===== MENÚ / HABITACIONES ===== */}
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

/* ===================== placeholders de tabs específicas ===================== */

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










{/** Tab de publicaciones de negocio, con lógica de carga y borrado */}
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
        letReview={false}
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
