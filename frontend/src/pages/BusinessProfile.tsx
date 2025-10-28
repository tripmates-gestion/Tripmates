/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import {
  Avatar,
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import Settings from '@mui/icons-material/Settings';
import Edit from '@mui/icons-material/Edit';
import EditProfileDialog, { type UserProfile } from '../components/profile/EditProfileDialog';
import { useAuth } from '../hooks/useAuth';
import { updateDescription, updateUsername } from '../helpers/profileUpdates';
import { DEFAULT_STATS } from '../constants/DefaultStats'
import { type AccountType } from '../types/user'
import { Alert } from "@mui/material";
import type { BusinessPublicationResponseDTO } from "../types/business";
import { getBusinessPublications, deleteBusinessPublication} from "../services/businessPublications";
import PublicationGrid from "../components/publications/PublicationGrid";
import { Stat } from '../components/profile/stats';


// ----- defaults hardcodeados cuando el back no los provee -----
const DEFAULT_COVER_URL = 'https://png.pngtree.com/background/20250119/original/pngtree-mountain-scenery-natural-banner-images-picture-image_16218538.jpg'; // si querés una imagen placeholder poné acá la URL
const businessRoleChipColor = 'warning';

// ----- tipo User que viene del back (como lo describiste) -----
type BackendUser = {
  id: string;
  username: string;
  email: string;
  role: AccountType;
  description: string;
  avatarURL: string | null;
};

// ----- util: mapea User (back) -> UserProfile (UI) -----
function toUserProfile(u: BackendUser | null | undefined, prev?: UserProfile): UserProfile {
  return {
    name: u?.username ?? prev?.name ?? '',
    username: u?.username ?? prev?.username ?? '',
    description: u?.description ?? prev?.description ?? '',
    avatarUrl: (u?.avatarURL && u.avatarURL.trim() !== '') 
      ? u.avatarURL 
      : (prev?.avatarUrl),
    coverUrl: prev?.coverUrl ?? DEFAULT_COVER_URL,
    stats: prev?.stats ?? DEFAULT_STATS,
  };
}


export default function BusinessProfile() {
  const [tab, setTab] = React.useState(0);
  const [editOpen, setEditOpen] = React.useState(false);

  const { user, token } = useAuth();

  // estado local de perfil (UI)
  //creo que esto debería ser un contexto 
  //por ahora se está sacando esta información de contexto global de autenticación pero se tendría que sacar del endpoint GET user/me
  const [profile, setProfile] = React.useState<UserProfile>(() => toUserProfile(user as BackendUser | null));

  React.useEffect(() => {
    setProfile((prev) => toUserProfile(user as BackendUser | null, prev));
  }, [user]);

  // tabs con "Publicaciones" (perfil de business)
  const tabs = [
      { key: 'mi presentacion', label: 'Mi Presentación' },
      {key: 'publicaciones', label: 'Publicaciones'},
      { key: 'fotos', label: 'Fotos' },
    ];

  // ayuda para saber si el tab actual es "publicaciones"
  const currentTabKey = tabs[tab]?.key;

  // REINTEGRADO: persistencia al back como antes
  const handleSaveUserData = (updated: UserProfile) => {
    if (!token) {
      console.error('No auth token available; skipping remote update');
      setProfile(updated);
      return;
    }

    Promise.all([
      updateDescription(profile.description || '', updated.description || '', token),
      updateUsername(profile.username, updated.username, token),
    ])
      .then(() => {
        setProfile(updated);
      })
      .catch((error) => {
        console.error('Error updating profile:', error);
        // si querés, mostrar un toast/alert acá
      });
  };

  return (
    <Box sx={{ bgcolor: 'background.paper', minHeight: '100vh' }}>
      {/* Banner */}
      <Box
        sx={{
          minHeight: { xs: '38vh', md: '30vh' },
          position: 'relative',
          backgroundImage: profile.coverUrl ? `url(${profile.coverUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Card */}
      <Box sx={{ position: 'relative' }}>
        <Card
          elevation={1}
          sx={{
            maxWidth: 1180, width: '100%', mx: 'auto',
            mt: { xs: -8, md: -10 }, borderRadius: 2, overflow: 'visible',
          }}
        >
          <CardContent sx={{ pb: 1.5 }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
              <Avatar
                src={profile.avatarUrl}
                alt={profile.name}
                sx={{
                  width: 96, height: 96, mt: { xs: -6, md: -8 },
                  border: (t) => `4px solid ${t.palette.background.paper}`,
                }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="h5" fontWeight={800}>{profile.username}</Typography>
                  {!!(user as BackendUser | null)?.role && (
                    <Chip
                      size="small"
                      label={(user as BackendUser).role}
                      color={businessRoleChipColor}
                      variant="outlined"
                      sx={{ ml: 0.5 }}
                    />
                  )}
                </Stack>

                {profile.description && (
                  <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                    {profile.description}
                  </Typography>
                )}
              </Box>

              <ButtonGroup variant="outlined" size="small">
                <Button startIcon={<Edit />} onClick={() => setEditOpen(true)}>Editar perfil</Button>
                <Button startIcon={<Settings />}>Configuración</Button>
              </ButtonGroup>
            </Stack>

            {/* Stats */}
            <Stack direction="row" spacing={4} alignItems="center" sx={{ mt: 2, px: { xs: 2, sm: 3, md: 4 } }}>
              <Stat label="Aportes" value={profile.stats.aportes} />
              <Stat label="Seguidores" value={profile.stats.seguidores} />
              <Stat label="Siguiendo" value={profile.stats.siguiendo} />
            </Stack>
          </CardContent>

          <Divider />
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

          <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            {currentTabKey === 'actividad'     && <EmptyState title="Actualización de actividades" />}
            {currentTabKey === 'viajes'        && <EmptyState title="Viajes" />}
            {currentTabKey === 'fotos'         && <EmptyState title="Fotos" />}
            {currentTabKey === 'opiniones'     && <EmptyState title="Opiniones" />}
            {currentTabKey === 'publicaciones' && (
              <BusinessPublicationsTab token={token} />
            )}
          </Box>
        </Card>
      </Box>

      {/* Modal de edición */}
      <EditProfileDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        user={profile}
        onSave={handleSaveUserData}
      />
    </Box>
  );
}


function EmptyState({ title }: { title: string }) {
  return (
    <Stack alignItems="center" spacing={1.5} sx={{ py: 6 }}>
      <Typography variant="h6" fontWeight={800}>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        No hay contenido por ahora.
      </Typography>
    </Stack>
  );
}

export function BusinessPublicationsTab({ token }: { token: string | null }) {
  const [items, setItems] = React.useState<BusinessPublicationResponseDTO[]>([])
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchAll = React.useCallback(async () => {
    if (!token) {
      setError("No estás autenticado.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    const controller = new AbortController();
    try {
      const res = await getBusinessPublications(token);
      console.log("[BusinessPublicationsTab] Publicaciones obtenidas:", res);
      setItems(res ?? []);
    } catch (e: any) {
      setError(e?.message || "Error al obtener publicaciones");
    } finally {
      setLoading(false);
    }
    return () => controller.abort();
  }, [token]);

  React.useEffect(() => { fetchAll() }, [])

  // ✅ Handler de eliminación
  const handleDelete = async (id: string) => {
    if (!token) return
    if (!confirm("¿Seguro que querés eliminar esta publicación?")) return

    try {
      await deleteBusinessPublication(token, id)
      setItems(prev => prev.filter(p => p.id !== id))
    } catch (e: any) {
      alert(e.message || "Error al eliminar publicación")
    }
  }

  if (loading) return <p>Cargando publicaciones...</p>
  if (error) {
    return (
      <Stack spacing={2}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={fetchAll}>Reintentar</Button>
      </Stack>
    )
  }

  return (
    <Box>
      <PublicationGrid publications={items ?? []} onDelete={handleDelete} />
    </Box>
  )
}
