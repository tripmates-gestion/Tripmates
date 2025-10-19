import React from 'react';
import type { User } from '..//helpers/userCreation';
import { AppBar, Toolbar, Box, Typography, Stack, Button, IconButton } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AuthDialog from './auth/AuthDialog';
import { useNavigate } from 'react-router-dom';
import type { AuthAction } from './auth/AuthReducer';

interface NavBarProps {
  mode: 'light' | 'dark';
  setMode: (m: 'light' | 'dark') => void;
  username: string;
  user: User | null;
  onLogout?: () => void;
  openAuth: () => void;
  authOpen: boolean;
  onCloseAuth: () => void;
  dispatch: React.Dispatch<AuthAction>;
}

export default function NavBar({ 
  mode, 
  setMode, 
  username, 
  onLogout, 
  openAuth, 
  authOpen, 
  onCloseAuth, 
  dispatch 
}: NavBarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate('/');
  };

  // Simplemente calculamos si está logueado basado en username
  const isLoggedIn = username !== '';

  return (
    <>
      <AppBar position="sticky" color="default" elevation={0}>
        <Toolbar>
          {/* Logo y título */}
          <Box
            component={RouterLink}
            to="/"
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'inherit', textDecoration: 'none' }}
            aria-label="Ir al inicio"
          >
            <Box component="img" src="logo.png" alt="TripMates" sx={{ width: 42, height: 42, borderRadius: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>TripMates</Typography>
          </Box>

          {/* Botones a la derecha */}
          <Stack direction="row" spacing={1} sx={{ ml: 'auto' }} alignItems="center">
            <Button color="inherit" component={RouterLink} to="/">Inicio</Button>
            <Button color="inherit" component={RouterLink} to="/search">Buscar</Button>

            <IconButton color="inherit" onClick={() => setMode(mode === 'light' ? 'dark' : 'light')} aria-label="toggle theme">
              {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
            </IconButton>

            {isLoggedIn ? (
              <>
                <Button color="inherit" component={RouterLink} to="/profile">{username}</Button>
                <Button color="secondary" variant="outlined" onClick={handleLogout}>Cerrar sesión</Button>
              </>
            ) : (
              <Button variant="contained" onClick={openAuth}>Ingresar</Button>
            )}
          </Stack>
        </Toolbar>
      </AppBar>

      <AuthDialog 
        open={authOpen} 
        onClose={onCloseAuth} 
        dispatch={dispatch}
      />
    </>
  );
}