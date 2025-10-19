import * as React from 'react';
import {
  Avatar,
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  Divider,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import Settings from '@mui/icons-material/Settings';
import Edit from '@mui/icons-material/Edit';
import EditProfileDialog, { type UserProfile } from '../components/profile/EditProfileDialog';

type ProfileProps = { user?: UserProfile };

const MOCK: UserProfile = {
  name: 'Fu Anibal',
  username: '@54fua',
  avatarUrl:
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTS6qyXg2AdweutivMZTTbquH6Ed11xM4T63Q&s',
  coverUrl:
    'https://png.pngtree.com/background/20250119/original/pngtree-mountain-scenery-natural-banner-images-picture-image_16218538.jpg',
  stats: { aportes: 2, seguidores: 11, siguiendo: 11 },
};

// Label arriba en mayúsculas, número abajo (como TripAdvisor)
const Stat = ({ label, value }: { label: string; value: number }) => (
  <Stack spacing={0.25} alignItems="center" minWidth={96}>
    <Typography
      variant="caption"
      sx={{
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        fontWeight: 700,
        color: 'text.secondary',
      }}
    >
      {label}
    </Typography>
    <Typography variant="h6" fontWeight={800} lineHeight={1.1}>
      {value}
    </Typography>
  </Stack>
);

export default function Profile({ user = MOCK }: ProfileProps) {
  const [tab, setTab] = React.useState(0);
  const [editOpen, setEditOpen] = React.useState(false);
  const [profile, setProfile] = React.useState(user);

  const handleSave = (updated: UserProfile) => setProfile(updated);

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
      >
        <Stack direction="row" justifyContent="flex-end" sx={{ p: 2 }}>
          <Button
            startIcon={<PhotoCamera />}
            variant="contained"
            size="small"
            sx={{ borderRadius: 999 }}
            onClick={() => setEditOpen(true)}
          >
            Cargar foto de portada
          </Button>
        </Stack>
      </Box>

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
            <Stack direction="row" spacing={2} alignItems="center" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
              <Avatar
                src={profile.avatarUrl}
                alt={profile.name}
                sx={{
                  width: 96,
                  height: 96,
                  mt: { xs: -6, md: -8 },
                  border: (t) => `4px solid ${t.palette.background.paper}`,
                }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h5" fontWeight={800}>{profile.name}</Typography>
                <Typography variant="body1" color="text.secondary">{profile.username}</Typography>
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
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" allowScrollButtonsMobile sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
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

      {/* 🔧 Modal de edición */}
      <EditProfileDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        user={profile}
        onSave={handleSave}
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
