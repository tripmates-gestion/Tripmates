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
import { useAuth } from '../context/AuthContext';
import { updateDescription, updateUsername } from '../helpers/profileUpdates';
import { ACCOUNT_TYPES } from '../constants/Rol'


// ----- defaults hardcodeados cuando el back no los provee -----
const DEFAULT_STATS = { aportes: 0, seguidores: 0, siguiendo: 0 };
const DEFAULT_COVER_URL = 'https://png.pngtree.com/background/20250119/original/pngtree-mountain-scenery-natural-banner-images-picture-image_16218538.jpg'; // si querés una imagen placeholder poné acá la URL


// ----- tipo User que viene del back (como lo describiste) -----
type BackendUser = {
  id: string;
  username: string;
  email: string;
  role: string;
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


// Label arriba en mayúsculas, número abajo (como TripAdvisor)
const Stat = ({ label, value }: { label: string; value: number }) => (
  <Stack spacing={0.25} alignItems="center" minWidth={96}>
    <Typography
      variant="caption"
      sx={{ textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 700, color: 'text.secondary' }}
    >
      {label}
    </Typography>
    <Typography variant="h6" fontWeight={800} lineHeight={1.1}>
      {value}
    </Typography>
  </Stack>
);



function roleChipColor(role?: string): 'default' | 'warning' | 'info' {
  switch ((role ?? '').toUpperCase()) {
    case ACCOUNT_TYPES.business: return 'warning';
    case ACCOUNT_TYPES.user: return 'info';
    default: return 'default';
  }
}

export default function Profile() {
  const [tab, setTab] = React.useState(0);
  const [editOpen, setEditOpen] = React.useState(false);
  const { user, token } = useAuth(); // user: BackendUser | null

  // estado local de perfil (UI)
  const [profile, setProfile] = React.useState<UserProfile>(() => toUserProfile(user as BackendUser | null));

  // sincroniza cuando cambie el usuario autenticado
  React.useEffect(() => {
    setProfile((prev) => toUserProfile(user as BackendUser | null, prev));
  }, [user]);

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
                      color={roleChipColor((user as BackendUser).role)}
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
            <Tab label="Actividad" />
            <Tab label="Viajes" />
            <Tab label="Fotos" />
            <Tab label="Opiniones" />
          </Tabs>
          <Divider />

          <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            {tab === 0 && <EmptyState title="Actualización de actividades" />}
            {tab === 1 && <EmptyState title="Viajes" />}
            {tab === 2 && <EmptyState title="Fotos" />}
            {tab === 3 && <EmptyState title="Opiniones" />}
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
