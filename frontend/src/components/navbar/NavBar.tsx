import { AppBar, Toolbar, Stack, Box, Button } from '@mui/material';
import { PAGES_ROUTE } from '../../constants/Pages';
import { BrandLink } from './BrandLink';
import { MainLinks } from './MainLinks';
import { ThemeToggle } from './ThemeToggle';
import { AuthControls } from './AuthControls';
import {useAuth} from '../../context/AuthContext'
import { ACCOUNT_TYPES } from '../../constants/Rol';
import { Link, useLocation } from 'react-router-dom'
import {} from "../../constants/Pages";

interface NavBarProps {
  mode: 'light' | 'dark';
  setMode: (m: 'light' | 'dark') => void;
}

// mi intención es que ya no reciba user porque este se guarda en el contexto
export default function NavBar({ mode, setMode }: NavBarProps) {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const isBusiness = user?.role === ACCOUNT_TYPES.business
  const onBusinessPosts = pathname.startsWith('/business/posts')

  return (
    <AppBar position="fixed" color="default" elevation={0} sx={{ top: 0 }}>
      <Toolbar disableGutters sx={{ px: { xs: 2, md: 3 } }}>
        <BrandLink to={PAGES_ROUTE.root} />

        <Box sx={{ ml: 'auto' }} />

        <Stack direction="row" spacing={1} alignItems="center">
          <MainLinks />

          {isBusiness && !onBusinessPosts && (
            <Button
              variant="contained"
              component={Link}
              to={PAGES_ROUTE.businessPosts}
            >
              Tus negocios
            </Button>
          )}

          <ThemeToggle mode={mode} setMode={setMode} />
          <AuthControls />
        </Stack>
      </Toolbar>
    </AppBar>
  )
}
