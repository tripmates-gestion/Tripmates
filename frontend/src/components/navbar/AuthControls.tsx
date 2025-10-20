import { Button, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { PAGES_ROUTE } from '../../constants/Pages';
import AuthDialog from '../../components/auth/AuthDialog';
import type { User } from '../../types/user';

type Props = {
  user: User | null;
  onLogout?: () => void;
  openAuth: () => void;
  authOpen: boolean;
  onCloseAuth: () => void;
};

export function AuthControls({
  user,
  onLogout,
  openAuth,
  authOpen,
  onCloseAuth,
}: Props) {
  const isLoggedIn = !!user?.username;

  return (
    <>
      {isLoggedIn ? (
        <Stack direction="row" spacing={1}>
          <Button color="inherit" component={RouterLink} to={PAGES_ROUTE.profile}>
            {user?.username}
          </Button>
          <Button color="secondary" variant="outlined" onClick={onLogout}>
            Cerrar sesión
          </Button>
        </Stack>
      ) : (
        <Button variant="contained" onClick={openAuth}>Ingresar</Button>
      )}

      <AuthDialog open={authOpen} onClose={onCloseAuth} />
    </>
  );
}
