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
} from '@mui/material';
import Edit from '@mui/icons-material/Edit';

import ProfileEditDialog from '../components/profile/ProfileEditDialog';
import { useAuth } from '../hooks/useAuth';
import { DEFAULT_STATS } from '../constants/DefaultStats';

import UserReviewsTab from '../components/profile/userProfile/UserReviewsTab';
import UserPlansTab from '../components/profile/userProfile/UserPlansTab';
import LikedPublicationsTab from '../components/profile/userProfile/LikedPublicationsTab';
import { Stat } from '../components/profile/stats';

import type {
  CommonUser,
  CurrentUser,
} from '../types/PrivateUserProfiles';
import { useConnectionsList } from '../hooks/useConnectionsList';
import { ConnectionsListDialog } from '../components/social/ConnectionsListDialog';
import { FollowButton } from '../components/social/FollowButton';
import ProfileSocialMediaLinks from '../components/profile/ProfileSocialMediaLinks';
import { getUserSocialMedia, type SocialMediaLinks } from '../services/socialMedia';

const userRoleChipColor = 'info';

const DEFAULT_COVER_URL = 'https://image.shutterstock.com/image-vector/vector-graphic-depicting-warmcolored-mountain-260nw-2521969157.jpg';


export default function UserProfile() {
  const [tab, setTab] = React.useState(0);
  const [editOpen, setEditOpen] = React.useState(false);
  const [activeList, setActiveList] = React.useState<'followers' | 'followings' | null>(null);
  const [socialLinks, setSocialLinks] = React.useState<SocialMediaLinks | null>(null);

  const { user, accessToken, refreshUser } = useAuth();

  const currentUser = user as CurrentUser | null;

  React.useEffect(() => {
    if (!currentUser?.email) return;
    let mounted = true;
    const fetchSocial = async () => {
      try {
        const data = await getUserSocialMedia(currentUser.email, accessToken);
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
  }, [accessToken, currentUser?.email]);

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
  ];
  const currentTabKey = tabs[tab]?.key;

  const handleProfileUpdated = React.useCallback(
    (_profile: CommonUser, social: SocialMediaLinks) => {
      setSocialLinks(social);
      void refreshUser();
      setEditOpen(false);
    },
    [refreshUser]
  );

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

                {currentUser?.email && (
                  <Box sx={{ mt: 1 }}>
                    <ProfileSocialMediaLinks email={currentUser.email} links={socialLinks} />
                  </Box>
                )}
              </Box>

              <ButtonGroup variant="outlined" size="small">
                <Button
                  startIcon={<Edit />}
                  onClick={() => setEditOpen(true)}
                  disabled={!currentUser}
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
            {/* TODO: AGREGAR TAB DE LIKED => HECHO AL FINAL */}
            {currentTabKey === 'liked' && currentUser?.id && accessToken && (
              <LikedPublicationsTab userId={currentUser.id} accessToken={accessToken} />
            )}
          </Box>
        </Card>
      </Box>

      {currentUser && (
        <ProfileEditDialog
          open={editOpen}
          onClose={() => setEditOpen(false)}
          profileType="traveler"
          initialProfileData={currentUser}
          initialSocialMedia={socialLinks ?? {}}
          onProfileUpdated={handleProfileUpdated}
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
