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
  Backdrop,
  CircularProgress,
} from '@mui/material';
import Settings from '@mui/icons-material/Settings';
import Edit from '@mui/icons-material/Edit';

import EditProfileDialog from '../components/profile/userProfile.tsx/EditUserProfileDialog';
import { useAuth } from '../hooks/useAuth';
import { DEFAULT_STATS } from '../constants/DefaultStats';

import UserReviewsTab from '../components/profile/userProfile.tsx/UserReviewsTab';
import UserPlansTab from '../components/profile/userProfile.tsx/UserPlansTab';
import { Stat } from '../components/profile/stats';

import { updateUser } from '../services/userService';
import type {
  CommonUser,
  CurrentUser,
} from '../types/PrivateUserProfiles';

const userRoleChipColor = 'info';

const DEFAULT_COVER_URL =
  'https://png.pngtree.com/background/20250119/original/pngtree-mountain-scenery-natural-banner-images-picture-image_16218538.jpg';

export default function UserProfile() {
  const [tab, setTab] = React.useState(0);
  const [editOpen, setEditOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const { user, accessToken, refreshUser } = useAuth();

  const currentUser = user as CurrentUser | null;

  const tabs = [
    { key: 'actividad', label: 'Actividad' },
    { key: 'planes', label: 'Planes' },
    { key: 'fotos', label: 'Fotos' },
    { key: 'opiniones', label: 'Opiniones' },
  ];
  const currentTabKey = tabs[tab]?.key;

  // PATCH con CommonUser + avatar File
  const handleSaveUserData = async (
    changes: Partial<CommonUser>,
    avatarFile: File | null
  ) => {
    if (!accessToken) {
      console.error('No auth token available; skipping remote update');
      return;
    }

    try {
      setSaving(true);
      await updateUser(changes, avatarFile, accessToken);
      await refreshUser();
      console.log('Profile updated successfully');
      setEditOpen(false); // cerramos el modal DESPUÉS de guardar
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const stats = DEFAULT_STATS;

  return (
    <Box sx={{ bgcolor: 'background.paper', minHeight: '100vh' }}>
      {/* Overlay de carga, igual que en negocio */}
      <Backdrop open={saving} sx={{ color: '#fff', zIndex: (t) => t.zIndex.drawer + 1 }}>
        <CircularProgress />
      </Backdrop>

      {/* Banner */}
      <Box
        sx={{
          minHeight: { xs: '38vh', md: '30vh' },
          position: 'relative',
          backgroundImage: `url(${DEFAULT_COVER_URL})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Card */}
      <Box sx={{ position: 'relative' }}>
        <Card
          elevation={1}
          sx={{
            maxWidth: 1180,
            width: '100%',
            mx: 'auto',
            mt: { xs: -8, md: -10 },
            borderRadius: 2,
            overflow: 'visible',
          }}
        >
          <CardContent sx={{ pb: 1.5 }}>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ px: { xs: 2, sm: 3, md: 4 } }}
            >
              <Avatar
                src={currentUser?.avatarURL}
                alt={currentUser?.name ?? ''}
                sx={{
                  width: 96,
                  height: 96,
                  mt: { xs: -6, md: -8 },
                  border: (t) => `4px solid ${t.palette.background.paper}`,
                }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="h5" fontWeight={800}>
                    {currentUser?.name ?? 'Usuario'}
                  </Typography>

                  {!!currentUser?.role && (
                    <Chip
                      size="small"
                      label={currentUser.role}
                      color={userRoleChipColor}
                      variant="outlined"
                      sx={{ ml: 0.5 }}
                    />
                  )}
                </Stack>

                {currentUser?.description && (
                  <Typography
                    variant="body2"
                    sx={{ mt: 1, whiteSpace: 'pre-wrap' }}
                  >
                    {currentUser.description}
                  </Typography>
                )}
              </Box>

              <ButtonGroup variant="outlined" size="small">
                <Button
                  startIcon={<Edit />}
                  onClick={() => setEditOpen(true)}
                  disabled={!currentUser || saving}
                >
                  Editar perfil
                </Button>
                <Button startIcon={<Settings />} disabled={saving}>
                  Configuración
                </Button>
              </ButtonGroup>
            </Stack>

            {/* Stats */}
            <Stack
              direction="row"
              spacing={4}
              alignItems="center"
              sx={{ mt: 2, px: { xs: 2, sm: 3, md: 4 } }}
            >
              <Stat label="Aportes" value={stats.aportes} />
              <Stat label="Seguidores" value={stats.seguidores} />
              <Stat label="Siguiendo" value={stats.siguiendo} />
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
            {tabs.map((t) => (
              <Tab key={t.key} label={t.label} />
            ))}
          </Tabs>
          <Divider />

          <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            {currentTabKey === 'actividad' && (
              <EmptyState title="Actualización de actividades" />
            )}
            {currentTabKey === 'planes' && <UserPlansTab />}
            {currentTabKey === 'fotos' && <EmptyState title="Fotos" />}
            {currentTabKey === 'opiniones' && <UserReviewsTab />}
          </Box>
        </Card>
      </Box>

      {currentUser && (
        <EditProfileDialog
          open={editOpen}
          onClose={() => !saving && setEditOpen(false)}
          user={currentUser}
          onSave={handleSaveUserData}
          saving={saving}
        />
      )}
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
