// src/pages/Home.tsx
import { Box, Button, Container, Stack, Typography, Card, CardMedia, Link, Divider, IconButton } from '@mui/material';
import Grid from '@mui/material/Grid';
import type { Place } from '../components/publish/PlaceCard';
import PlaceCard from '../components/publish/PlaceCard';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import TwitterIcon from '@mui/icons-material/Twitter';


// Otro mock que es igual que el que esta en Search.tsx
const MOCK: Place[] = [
  {
    id: '4', 
    name: 'London', 
    city: 'London', 
    country: 'United Kingdom', 
    rating: 4.7,
    priceLabel: '$$$',
    photoUrl: 'https://www.londoninfoguide.com/images/oxford-street-in-london-england-uk.webp' 
  },
  {
    id: '5', 
    name: 'Helsinki', 
    city: 'Helsinki', 
    country: 'Finland', 
    rating: 4.7,
    priceLabel: '$$$',
    photoUrl: 'https://content.r9cdn.net/rimg/dimg/30/00/adff18cf-city-7232-16480d2ee82.jpg?crop=true&width=1020&height=498' 
  },
  { 
    id: '6', 
    name: 'Santorini', 
    city: 'Santorini', 
    country: 'Greece', 
    rating: 4.7,
    priceLabel: '$$$',
    photoUrl: 'https://www.greekexclusiveproperties.com/wp-content/uploads/2019/10/Santorini-Declared-No1-Island-in-the-World-.jpg' 
  },
];


export default function Home() {
    // Página principal con secciones: Hero, Destinos y Pasos
    return (
      <Box sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
        <Hero />
        <TopDestinations />
        <Steps />
        <Footer />
      </Box>
    );
  }
  
// --- Sección principal con imagen e introducción ---
export function Hero() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 6,            // espacio entre columnas
        py: { xs: 6, md: 10 },
        px: { xs: 2, md: 6 },
      }}
    >
      {/* Texto */}
      <Box sx={{ flex: 1, maxWidth: { md: '50%' } }}>
        <Typography variant="overline" color="primary" gutterBottom>
          Destinos alrededor del mundo
        </Typography>

        <Typography variant="h3" fontWeight={800} lineHeight={1.2} gutterBottom>
          Viaja, disfruta <Box component="span" sx={{ color: '#f17832' }}>—</Box> y vive una nueva y completa vida
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mt: 3 }}>
          Descubre experiencias únicas y lugares inolvidables. Deja que TripMates te inspire en tu próxima aventura.
        </Typography>

        <Stack direction="row" spacing={2} mt={4}>
          <Button variant="contained" color="primary" size="large">
            Descubre más
          </Button>
          <Button variant="outlined" color="primary" size="large">
            Explora destinos
          </Button>
        </Stack>
      </Box>

      {/* Imagen */}
      <Box sx={{ flex: 1, maxWidth: { md: '50%' } }}>
        <Card sx={{ borderRadius: 4, boxShadow: 6, overflow: 'hidden' }}>
          <CardMedia
            component="img"
            image="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop"
            alt="Viajero"
          />
        </Card>
      </Box>
    </Box>
  );
}

// --- Sección de destinos más populares ---
function TopDestinations() {
  return (
    <Box sx={{ py: { xs: 10, md: 14 }, bgcolor: 'background.default' }}>
      <Container>
        <Typography variant="overline" color="primary">Más vendidos</Typography>
        <Typography variant="h4" fontWeight={800}>Destinos más populares</Typography>
        <Typography variant="body1" color="text.secondary" mb={5}>
          Lugares turísticos más vendidos esta temporada
        </Typography>

        {/* Grilla de tarjetas con los destinos */}
        <Grid container spacing={4}>
          {MOCK.map((p) => (
                      <Grid key={p.id} xs={12} sm={6} md={4} item sx={{ mb: 3 }}>
                        <PlaceCard place={p} />
                      </Grid> 
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

// --- Sección de “3 pasos” para planificar un viaje --- Este esta de mas pero lo dejo aca para decorar
function Steps() {
  const steps = [
    { title: 'Escoge Destino', text: 'Encuentra inspiración y filtra por presupuesto, estilo y duración.' },
    { title: 'Realiza Pago', text: 'Pago seguro con varias opciones de pago.' },
    { title: 'Llega al Aeropuerto en la Fecha Seleccionada', text: 'Recibe recordatorios y documentos en tu correo electrónico.' },
  ];

  return (
    <Box sx={{ py: { xs: 10, md: 14 }, bgcolor: 'linear-gradient(to bottom, #fff, #f9fafb)' }}>
      <Container>
        <Typography variant="overline" color="primary">Fácil y Rápido</Typography>
        <Typography variant="h4" fontWeight={800}>Planifica tu próxima viaje en 3 pasos</Typography>

        {/* Tarjetas de pasos numerados */}
        <Grid container spacing={4} mt={4}>
          {steps.map((s, i) => (
            <Grid item xs={12} md={4} key={i} sx={{ mb: 3 }}>
              <Card sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
                <Typography variant="h6" fontWeight={700}>{i + 1}. {s.title}</Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>{s.text}</Typography>
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
    <Box sx={{ bgcolor: 'background.default', py: 6, mx: 'calc(50% - 50vw)', mt: 8}}>
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
              <IconButton size="small" color="inherit"><FacebookIcon /></IconButton>
              <IconButton size="small" color="inherit"><InstagramIcon /></IconButton>
              <IconButton size="small" color="inherit"><YouTubeIcon /></IconButton>
              <IconButton size="small" color="inherit"><TwitterIcon /></IconButton>
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
