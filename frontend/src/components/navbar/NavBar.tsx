import { AppBar, Toolbar, Stack, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PAGES_ROUTE } from '../../constants/Pages';
import { BrandLink } from './BrandLink';
import { MainLinks } from './MainLinks';
import { ThemeToggle } from './ThemeToggle';
import { AuthControls } from './AuthControls';
import type { AuthAction } from '../../components/auth/AuthReducer';
import type { User } from '../../types/user';

interface NavBarProps {
  mode: 'light' | 'dark';
  setMode: (m: 'light' | 'dark') => void;
  user: User | null;              
  username?: string;                
  onLogout?: () => void;
  openAuth: () => void;
  authOpen: boolean;
  onCloseAuth: () => void;
  dispatch: React.Dispatch<AuthAction>;
}

export default function NavBar({
  mode,
  setMode,
  user,
  username,
  onLogout,
  openAuth,
  authOpen,
  onCloseAuth,
  dispatch,
}: NavBarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout?.();
    navigate(PAGES_ROUTE.root);
  };

  return (
    <AppBar position="fixed" color="default" elevation={0} sx={{ top: 0 }}>
    <Toolbar disableGutters sx={{ px: { xs: 2, md: 3 } }}>
        <BrandLink to={PAGES_ROUTE.root} />

        <Box sx={{ ml: 'auto' }} />
        <Stack direction="row" spacing={1} alignItems="center">
          <MainLinks />
          <ThemeToggle mode={mode} setMode={setMode} />
          <AuthControls
            user={user}
            username={username}
            onLogout={handleLogout}
            openAuth={openAuth}
            authOpen={authOpen}
            onCloseAuth={onCloseAuth}
            dispatch={dispatch}
          />
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
