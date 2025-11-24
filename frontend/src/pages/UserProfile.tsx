import * as React from 'react';
import { useNavigate } from 'react-router-dom';
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

import EditProfileDialog from '../components/profile/userProfile/EditUserProfileDialog';
import { useAuth } from '../hooks/useAuth';
import { DEFAULT_STATS } from '../constants/DefaultStats';

import UserReviewsTab from '../components/profile/userProfile/UserReviewsTab';
import UserPlansTab from '../components/profile/userProfile/UserPlansTab';
import LikedPublicationsTab from '../components/profile/userProfile/LikedPublicationsTab';
import { Stat } from '../components/profile/stats';

import { updateUser } from '../services/userService';
import type {
  CommonUser,
  CurrentUser,
} from '../types/PrivateUserProfiles';
import { useConnectionsList } from '../hooks/useConnectionsList';
import { ConnectionsListDialog } from '../components/social/ConnectionsListDialog';
import { FollowButton } from '../components/social/FollowButton';

const userRoleChipColor = 'info';

const DEFAULT_COVER_URL =
  'https://png.pngtree.com/background/20250119/original/pngtree-mountain-scenery-natural-banner-images-picture-image_16218538.jpg';

export default function UserProfile() {
  const [tab, setTab] = React.useState(0);
  const [editOpen, setEditOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [activeList, setActiveList] = React.useState<'followers' | 'followings' | null>(null);

  const { user, accessToken, refreshUser } = useAuth();

  const currentUser = user as CurrentUser | null;

  const followersList = useConnectionsList('followers');
  const followingsList = useConnectionsList('followings');

  const navigate = useNavigate();

  const handleFollowingChange = React.useCallback(
    (accountId: string, nextIsFollowing: boolean) => {
      if (!nextIsFollowing) {
        followingsList.removeItem(accountId);
        void followingsList.refresh();
      }
    },
    [followingsList]
  );

  const tabs = [
    { key: 'planes', label: 'Planes' },
    { key: 'experiencias', label: 'Experiencias' },
    { key: 'liked', label: 'Liked' },
    { key: 'historial', label: 'Historial' }
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

  const stats = React.useMemo(
    () => ({
      aportes: DEFAULT_STATS.aportes,
      seguidores: followersList.items.length,
      siguiendo: followingsList.items.length,
    }),
    [followersList.items.length, followingsList.items.length]
  );

  const openFollowers = () => {
    void followersList.refresh();
    setActiveList('followers');
  };

  const openFollowings = () => {
    void followingsList.refresh();
    setActiveList('followings');
  };

  const closeDialog = React.useCallback(() => setActiveList(null), []);

  const handleConnectionClick = React.useCallback(
    (account: CommonUser) => {
      if (account.role !== 'USER') {
        console.warn('Solo los perfiles de viajeros están disponibles para navegar.');
        return;
      }

      closeDialog();
      navigate(`/userProfile/${account.id}`, {
        state: { account },
      });
    },
    [closeDialog, navigate]
  );

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
              <Stat
                label="Seguidores"
                value={stats.seguidores}
                loading={followersList.loading}
                onClick={openFollowers}
              />
              <Stat
                label="Siguiendo"
                value={stats.siguiendo}
                loading={followingsList.loading}
                onClick={openFollowings}
              />
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
            {currentTabKey === 'planes' && <UserPlansTab />}
            {currentTabKey === 'experiencias' && <UserReviewsTab />}
            {/* TODO: AGREGAR TAB DE LIKED */}
            {currentTabKey === 'liked' && currentUser?.id && accessToken && (
              <LikedPublicationsTab userId={currentUser.id} accessToken={accessToken} />
            )}
            {/* TODO: Agregar TAB de  historial*/}
            {currentTabKey === 'historial' && <EmptyState title="Historial" />}
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

      <ConnectionsListDialog
        open={activeList === 'followers'}
        onClose={closeDialog}
        type="followers"
        items={followersList.items}
        loading={followersList.loading}
        error={followersList.error}
        onRefresh={followersList.refresh}
        onItemClick={handleConnectionClick}
      />

      <ConnectionsListDialog
        open={activeList === 'followings'}
        onClose={closeDialog}
        type="followings"
        items={followingsList.items}
        loading={followingsList.loading}
        error={followingsList.error}
        onRefresh={followingsList.refresh}
        renderAction={(account) => (
          <FollowButton
            targetUserId={account.id}
            size="small"
            variant="outlined"
            color="inherit"
            autoFetch={false}
            initialIsFollowing
            onFollowChange={(next) => handleFollowingChange(account.id, next)}
            sx={{ minWidth: 140 }}
          />
        )}
        onItemClick={handleConnectionClick}
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
