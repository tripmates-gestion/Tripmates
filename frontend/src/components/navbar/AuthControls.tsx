import { Button, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { PAGES_ROUTE } from '../../constants/Pages';
import AuthDialog from '../../components/auth/AuthDialog';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';



export function AuthControls() {
  const [showAuthForm, setShowAuthForm] = useState(false);
  const { user, logout } = useAuth();

  return (
    <>
      {user !== null ? (
        <Stack direction="row" spacing={1}>
          <Button color="inherit" component={RouterLink} to={PAGES_ROUTE.profile}>
            {user.username}
          </Button>
          <Button color="secondary" variant="outlined" onClick={logout}>
            Cerrar sesión
          </Button>
        </Stack>
      ) : (

        <Stack direction="row" spacing={1}>
          <Button variant="contained" onClick={() => setShowAuthForm(true)}>Ingresar</Button>
          <AuthDialog open={showAuthForm} onClose={() => setShowAuthForm(false)} />
        </Stack>
      )}
    </>
  );
}
