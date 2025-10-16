// src/components/NavBar.tsx
import * as React from 'react';
import {
  AppBar, Toolbar, Typography, Stack, Button, IconButton, Box
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { Link as RouterLink } from 'react-router-dom';
import AuthDialog from './AuthDialog';

// Barra de navegación superior (Navbar)
export default function NavBar({
  mode,        // modo actual (light/dark)
  setMode,     // función para cambiar el modo
}: {
  mode: 'light' | 'dark';
  setMode: (m: 'light' | 'dark') => void;
}) {
  // Estado para abrir o cerrar el popup de inicio de sesión
  const [authOpen, setAuthOpen] = React.useState(false);

  return (
    <>
      {/* AppBar es la barra superior fija */}
      <AppBar position="sticky" color="default" elevation={0}>
        <Toolbar>
          {/* Título / Logo */}
          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              color: 'inherit',
              textDecoration: 'none',
            }}
            aria-label="Ir al inicio"
          >
            <Box
              component="img"
              src={`logo.png`} // src/assets/logo.png
              alt="TripMates"
              sx={{ width: 42, height: 42, borderRadius: 1 }}
            />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              TripMates
            </Typography>
          </Box>

          {/* Botones alineados a la derecha */}
          <Stack direction="row" spacing={1} sx={{ ml: 'auto' }} alignItems="center">
            <Button color="inherit" component={RouterLink} to="/">Inicio</Button>
            <Button color="inherit" component={RouterLink} to="/search">Buscar</Button>

            {/* Botón para cambiar entre modo claro/oscuro */}
            <IconButton
              color="inherit"
              onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
              aria-label="toggle theme"
            >
              {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
            </IconButton>

            {/* Botón para abrir el modal de login */}
            <Button variant="contained" onClick={() => setAuthOpen(true)}>
              Ingresar
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Componente del popup de inicio de sesión / registro */}
      <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}