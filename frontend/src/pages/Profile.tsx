// src/pages/Profile.tsx
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

type UserStats = {
  aportes: number;
  seguidores: number;
  siguiendo: number;
};

type UserProfile = {
  name: string;
  username: string;
  avatarUrl?: string;
  coverUrl?: string;
  stats: UserStats;
};

type ProfileProps = {
  user?: UserProfile;
};

const MOCK: UserProfile = {
  name: 'Fu Anibal',
  username: '@54fua',
  avatarUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTS6qyXg2AdweutivMZTTbquH6Ed11xM4T63Q&s',
  coverUrl: 'https://i.pinimg.com/736x/1d/f7/91/1df791666da6895059adac8d246cd5f5.jpg',
  stats: { aportes: 2, seguidores: 11, siguiendo: 11 },
};

const Stat = ({ label, value }: { label: string; value: number }) => (
  <Stack spacing={0.5} alignItems="center">
    <Typography variant="h6" fontWeight={800}>{value}</Typography>
    <Typography variant="body2" color="text.secondary">{label}</Typography>
  </Stack>
);

export default function Profile({ user = MOCK }: ProfileProps) {
  const [tab, setTab] = React.useState(0);

  return (
    <Box sx={{ bgcolor: 'background.paper', minHeight: '100vh' }}>
      {/* Banner full-bleed */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: 160, md: 220 },
          bgcolor: 'grey.200',
          backgroundImage: user.coverUrl ? `url(${user.coverUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Stack direction="row" justifyContent="flex-end" sx={{ p: 2 }}>
          <Button startIcon={<PhotoCamera />} variant="contained" size="small" sx={{ borderRadius: 999 }}>
            Cargar foto de portada
          </Button>
        </Stack>
      </Box>

      {/* CONTENIDO FULL-BLEED (misma anchura que el banner) */}
      <Box sx={{ mt: -8 }}>
        <Card sx={{ overflow: 'visible', borderRadius: 0 }}>
          <CardContent sx={{ pb: 1.5 }}>
            <Stack direction="row" spacing={2} alignItems="flex-end" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
              <Avatar
                src={user.avatarUrl}
                alt={user.name}
                sx={{
                  width: 96,
                  height: 96,
                  border: (t) => `4px solid ${t.palette.background.paper}`,
                  mt: -8,
                }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight={800}>{user.name}</Typography>
                <Typography variant="body2" color="text.secondary">{user.username}</Typography>
              </Box>
              <ButtonGroup variant="outlined" size="small">
                <Button startIcon={<Edit />}>Editar perfil</Button>
                <Button startIcon={<Settings />}>Configuración</Button>
              </ButtonGroup>
            </Stack>

            <Stack direction="row" spacing={4} alignItems="center" sx={{ mt: 2, px: { xs: 2, sm: 3, md: 4 } }}>
              <Stat label="Aportes" value={user.stats.aportes} />
              <Stat label="Seguidores" value={user.stats.seguidores} />
              <Stat label="Siguiendo" value={user.stats.siguiendo} />
            </Stack>
          </CardContent>

          <Divider />

          {/* Tabs (solo 4) */}
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

          {/* Contenido de cada tab */}
          <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            {tab === 0 && <EmptyState title="Actualización de actividades" />}
            {tab === 1 && <EmptyState title="Viajes" />}
            {tab === 2 && <EmptyState title="Fotos" />}
            {tab === 3 && <EmptyState title="Opiniones" />}
          </Box>
        </Card>
      </Box>
    </Box>
  );
}

function EmptyState({ title }: { title: string }) {
  return (
    <Stack alignItems="center" spacing={1.5} sx={{ py: 6 }}>
      <Typography variant="subtitle1" fontWeight={800}>{title}</Typography>
      <Typography variant="body2" color="text.secondary">No hay contenido por ahora.</Typography>
    </Stack>
  );
}