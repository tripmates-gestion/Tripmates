import * as React from 'react';
import { Button, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { PAGES_ROUTE } from '../../constants/Pages';
import AuthDialog from '../../components/auth/AuthDialog';
import type { AuthAction } from '../../components/auth/AuthReducer';
import type { User } from '../../types/user';

type Props = {
  user: User | null;
  username?: string;                  // opcional si aún lo pasás por separado
  onLogout?: () => void;
  openAuth: () => void;
  authOpen: boolean;
  onCloseAuth: () => void;
  dispatch: React.Dispatch<AuthAction>;
};

export function AuthControls({
  user,
  username,
  onLogout,
  openAuth,
  authOpen,
  onCloseAuth,
  dispatch,
}: Props) {
  const isLoggedIn = !!(user?.username || username);

  return (
    <>
      {isLoggedIn ? (
        <Stack direction="row" spacing={1}>
          <Button color="inherit" component={RouterLink} to={PAGES_ROUTE.profile}>
            {user?.username ?? username}
          </Button>
          <Button color="secondary" variant="outlined" onClick={onLogout}>
            Cerrar sesión
          </Button>
        </Stack>
      ) : (
        <Button variant="contained" onClick={openAuth}>Ingresar</Button>
      )}

      <AuthDialog open={authOpen} onClose={onCloseAuth} dispatch={dispatch} />
    </>
  );
}
