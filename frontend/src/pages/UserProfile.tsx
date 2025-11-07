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
import EditProfileDialog, { type UserProfile } from '../components/profile/businessPrivateProfile/common/EditProfileDialog';
import { useAuth } from '../hooks/useAuth';
import { DEFAULT_STATS } from '../constants/DefaultStats'
import { type AccountType } from '../types/AccountTypes'
import UserReviewsTab from '../components/profile/userProfile.tsx/UserReviewsTab';

import { Stat } from '../components/profile/stats';
import UserPlansTab from '../components/profile/userProfile.tsx/UserPlansTab';

import { updateUser } from '../services/userService';
import type { CommonUser } from '../context/PrivateUserProfilesTypes';


const userRoleChipColor = 'info';


// ----- tipo User que viene del back -----
type BackendUser = {
  id: string;
  name: string;
  email: string;
  role: AccountType;
  description: string;
  avatarURL: string | null;
};

// ----- util: mapea User (back) -> UserProfile (UI) -----
function toUserProfile(u: BackendUser | null | undefined, prev?: UserProfile): UserProfile {
  return {
    name: u?.name ?? prev?.name ?? '',
    username: u?.name ?? prev?.username ?? '',
    description: u?.description ?? prev?.description ?? '',
    avatarUrl: (u?.avatarURL && u.avatarURL.trim() !== '') 
      ? u.avatarURL 
      : (prev?.avatarUrl),
    coverUrl: prev?.coverUrl ?? '',
    stats: prev?.stats ?? DEFAULT_STATS,
  };
}

export default function UserProfile() {
  const [tab, setTab] = React.useState(0);
  const [editOpen, setEditOpen] = React.useState(false);
  const { user, accessToken } = useAuth();

  // estado local de perfil (UI)
  //creo que esto debería ser un contexto 
  //por ahora se está sacando esta información de contexto global de autenticación pero se tendría que sacar del endpoint GET user/me

  const [profile, setProfile] = React.useState<UserProfile>(() => toUserProfile(user as BackendUser | null));
  React.useEffect(() => {
    setProfile((prev) => toUserProfile(user as BackendUser | null, prev));
  }, [user]);

  // tabs dinámicos: agregamos "Publicaciones" sólo si es business
  const tabs = [
      { key: 'actividad', label: 'Actividad' },
      { key: 'planes', label: 'Planes' },
      { key: 'fotos', label: 'Fotos' },
      { key: 'opiniones', label: 'Opiniones' },
    ];

  // ayuda para saber si el tab actual es "publicaciones"
  const currentTabKey = tabs[tab]?.key;

  // REINTEGRADO: persistencia al back usando updateUser
  const handleSaveUserData = (updated: UserProfile) => {
    if (!accessToken) {
      console.error('No auth token available; skipping remote update');
      setProfile(updated);
      return;
    }

    const dataToUpdate: Partial<CommonUser> = {
      name: updated.username,
      description: updated.description,
    };

    updateUser(dataToUpdate, accessToken)
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
                      color={userRoleChipColor}
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
            {currentTabKey === 'planes'        && 
              <UserPlansTab/>
            }
            {currentTabKey === 'fotos'         && <EmptyState title="Fotos" />}
            {currentTabKey === 'opiniones'     && <UserReviewsTab />}
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

