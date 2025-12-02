import Grid from '@mui/material/Grid';

import PlaceCard from '../components/search/ResultPlaceCard';

import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import TwitterIcon from '@mui/icons-material/Twitter';
import { Link as RouterLink } from 'react-router-dom';
import { PAGES_ROUTE } from '../constants/Pages';
import { useAuth } from '../hooks/useAuth';
import BusinessRecommendationFeed from '../components/publicationsFeed/BusinessPublicationRecomendationFeed';
import HeroImageSlider from '../components/ui/HeroImageSlider';
import type { BusinessPubAccountDataDTO } from '../types/AccountData';
import { Alert, Box, Button, Card, CircularProgress, Container, Divider, IconButton, Link, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { getTopTrendingBusinesses } from '../services/topBusiness';



export default function Home() {
  const context = useAuth();
  const isAuthenticated = context === undefined || context.accessToken === null ? false : true;
  const isTraveler = isAuthenticated && context.user?.role === 'USER' ? true : false;


  // Página principal con secciones: Hero, Destinos y Pasos
  return (
    <Box sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
      <Hero isTraveler={isTraveler} />
      <TopDestinations />
      <Steps />
      <Footer />
    </Box>
  );
}

// --- Sección principal con imagen e introducción ---
export function Hero({ isTraveler }: { isTraveler: boolean }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        pt: { xs: 2, md: 0 },
        px: { xs: 0, md: 3 },
        position: 'relative',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          maxWidth: { md: '100%' }
        }}
      >
        {/* Texto */}
        <Box sx={{ flex: 1, maxWidth: { md: '100%' } }}>
          <Typography variant="overline" color="primary" gutterBottom>
            Destinos alrededor del mundo
          </Typography>

          <Typography variant="h4" fontWeight={800} lineHeight={1.2} gutterBottom>
            Viaja, disfruta <Box component="span" sx={{ color: '#f17832' }}>—</Box> y conecta con otros viajeros
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5 }}>
            TripMates es una plataforma social de viajes: elegí un destino, armá un plan con tus amigos y
            seguí a otros viajeros.
          </Typography>

          <Stack direction="row" spacing={2} mt={2}>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              component={RouterLink}
              to={PAGES_ROUTE.search}
            >
              Explorar destinos
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="large"
              component={RouterLink}
              to={PAGES_ROUTE.searchTravelers}
            >
              Encontrar otros viajeros
            </Button>
          </Stack>
        </Box>

        {/* Slider automático de imágenes */}
        <Box
          sx={{
            flex: 1,
            maxWidth: { md: '100%' },
            mt: { xs: 3, md: 0 },
          }}
        >
          <HeroImageSlider
            images={[
              'https://images.unsplash.com/photo-1501785888041-af3ef285b470?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGFpc2FqZSUyMGRlJTIwdmlhamV8ZW58MHx8MHx8fDA%3D',
              'https://www.shutterstock.com/image-photo/couple-watches-northern-lights-woman-600nw-1216890739.jpg',
              'https://media.istockphoto.com/id/1850391734/es/foto/grupo-de-amigos-de-mediana-edad-posando-para-la-c%C3%A1mara-celebrando-felizmente-sus-fiestas.jpg?s=612x612&w=0&k=20&c=o2EPe2Stmq7RPOzKwue3ZAMWIqv1bgvwF6qfzcMNf7g=',
              'https://www.shutterstock.com/image-photo/three-diverse-young-women-taking-600nw-2608661485.jpg',
            ]}
            alt="Viajes con amigos"
            interval={2500}
            aspectRatio={4 / 3}
            rounded={4}
            fit="cover"
          />
        </Box>
      </Box>

      {isTraveler && <BusinessRecommendationFeed />}
    </Box>
  );
}


// --- Sección de destinos más populares ---
function TopDestinations() {
  const [topBusinesses, setTopBusinesses] = useState<BusinessPubAccountDataDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTopTrendingBusinesses(3)
      .then((data) => {
        setTopBusinesses(data);
        setError(null);
      })
      .catch((err: Error) => setError(err.message || 'No se pudieron cargar los lugares.'))
      .finally(() => setIsLoading(false));

    console.log('TopDestinations mounted, fetching top businesses...');
    console.log(topBusinesses);
  }, []);

  useEffect(() => {
    console.log("[TopDestinations] estado topBusinesses cambió:", topBusinesses);
  }, [topBusinesses]);

  return (
    <Box sx={{ py: { xs: 10, md: 14 }, bgcolor: 'background.default' }}>
      <Container>
        <Typography variant="overline" color="primary">Populares en la comunidad</Typography>
        <Typography variant="h4" fontWeight={800}>Destinos que generaron más interés</Typography>
        <Typography variant="body1" color="text.secondary" mb={5}>
          Lugares mas gustados.
        </Typography>

        {isLoading ? (
          <Stack alignItems="center" spacing={2} py={4}>
            <CircularProgress size={32} />
            <Typography variant="body2" color="text.secondary">Cargando lugares destacados...</Typography>
          </Stack>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : topBusinesses.length ? (
          <Grid container spacing={4}>
            {topBusinesses.map((business) => (
              <Grid key={business.id} xs={12} sm={6} md={4} item sx={{ mb: 3 }}>
                <PlaceCard businessAccountData={business} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No hay lugares destacados para mostrar en este momento.
          </Typography>
        )}
      </Container>
    </Box>
  );
}





// --- Sección de “3 pasos” para planificar un viaje ---
function Steps() {
  const steps = [
    {
      title: 'Elegí el destino',
      text: 'Buscá destinos según tu presupuesto, fechas y el tipo de viaje que querés hacer.',
    },
    {
      title: 'Creá un plan con tu grupo',
      text: 'Invitá amigos, sumá actividades, alojamientos y lugares que quieran visitar.',
    },
    {
      title: 'Coordinen todo en un solo lugar',
      text: 'Comentá, votá opciones y dejá registrado el itinerario para que todos estén alineados.',
    },
  ];

  return (
    <Box sx={{ py: { xs: 10, md: 14 }, bgcolor: 'linear-gradient(to bottom, #fff, #f9fafb)' }}>
      <Container>
        <Typography variant="overline" color="primary">Planificación social</Typography>
        <Typography variant="h4" fontWeight={800}>
          Organizá tu próxima escapada con tus TripMates
        </Typography>

        <Grid container spacing={4} mt={4}>
          {steps.map((s, i) => (
            <Grid item xs={12} md={4} key={i} sx={{ mb: 3 }}>
              <Card sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
                <Typography variant="h6" fontWeight={700}>
                  {i + 1}. {s.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  {s.text}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

// --- Sección de pie de página ---
function Footer() {
  return (
    <Box sx={{ bgcolor: 'background.default', py: 6, mx: 'calc(50% - 50vw)', mt: 8 }}>
      <Container>
        <Divider sx={{ my: 4 }} />
        <Grid container spacing={4}>
          {/* Separador entre secciones */}
          <Grid item xs={12}>
            <Box sx={{ height: 1, bgcolor: 'divider' }} />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Acerca de TripMates
            </Typography>
            <Stack spacing={0.5}>
              <Link href="#" underline="hover" color="inherit">Quiénes somos</Link>
              <Link href="#" underline="hover" color="inherit">Prensa</Link>
              <Link href="#" underline="hover" color="inherit">Políticas</Link>
              <Link href="#" underline="hover" color="inherit">Contáctanos</Link>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Explorar
            </Typography>
            <Stack spacing={0.5}>
              <Link href="#" underline="hover" color="inherit">Escribir una opinión</Link>
              <Link href="#" underline="hover" color="inherit">Unirse</Link>
              <Link href="#" underline="hover" color="inherit">Centro de ayuda</Link>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Negocios
            </Typography>
            <Stack spacing={0.5}>
              <Link href="#" underline="hover" color="inherit">Anunciá con nosotros</Link>
              <Link href="#" underline="hover" color="inherit">Acceso para propietarios</Link>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Seguinos
            </Typography>
            <Stack direction="row" spacing={2} mt={1}>
              <IconButton
                size="small"
                color="inherit"
                component="a"
                href="https://www.facebook.com/tu_pagina"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FacebookIcon />
              </IconButton>

              <IconButton
                size="small"
                color="inherit"
                component="a"
                href="https://www.instagram.com/trip.mates0/?hl=es-la"
                target="_blank"
                rel="noopener noreferrer"
              >
                <InstagramIcon />
              </IconButton>

              <IconButton
                size="small"
                color="inherit"
                component="a"
                href="https://www.youtube.com/@tu_canal"
                target="_blank"
                rel="noopener noreferrer"
              >
                <YouTubeIcon />
              </IconButton>

              <IconButton
                size="small"
                color="inherit"
                component="a"
                href="https://x.com/tu_usuario"
                target="_blank"
                rel="noopener noreferrer"
              >
                <TwitterIcon />
              </IconButton>
            </Stack>
          </Grid>

        </Grid>

        <Divider sx={{ my: 4 }} />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} TripMates. Todos los derechos reservados.
          </Typography>

          <Stack direction="row" spacing={2}>
            <Link href="#" underline="hover" color="text.secondary" variant="body2">
              Condiciones de uso
            </Link>
            <Link href="#" underline="hover" color="text.secondary" variant="body2">
              Privacidad
            </Link>
            <Link href="#" underline="hover" color="text.secondary" variant="body2">
              Accesibilidad
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
