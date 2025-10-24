import { Button, Stack, Avatar } from '@mui/material';
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
          <Button
            component={RouterLink}
            to={PAGES_ROUTE.profile}
            sx={{
              minWidth: 'auto',
              p: 0,              // quita padding
              lineHeight: 0,     // evita expansión vertical
            }}
          >
            <Avatar
              src={user.avatarURL}
              alt={user.username}
              sx={{
                width: 42,
                height: 42,

                borderColor: 'primary.main',
              }}
            />
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
