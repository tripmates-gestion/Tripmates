import { AppBar, Toolbar, Stack, Box } from '@mui/material';
import { PAGES_ROUTE } from '../../constants/Pages';
import { BrandLink } from './BrandLink';
import { MainLinks } from './MainLinks';
import { ThemeToggle } from './ThemeToggle';
import { AuthControls } from './AuthControls';
import {useAuth} from '../../hooks/useAuth'
import { ACCOUNT_TYPES } from '../../constants/Rol';

import PublishButtonWithDialog from "../publications/Publication"

interface NavBarProps {
  mode: 'light' | 'dark';
  setMode: (m: 'light' | 'dark') => void;
}

// mi intención es que ya no reciba user porque este se guarda en el contexto
export default function NavBar({ mode, setMode }: NavBarProps) {
  const { user } = useAuth()
  const isLoggedIn = !!user
  const isBusiness = user?.role === ACCOUNT_TYPES.business
  
  return (
    <>
      <AppBar position="fixed" color="default" elevation={0} sx={{ top: 0 }}>
        <Toolbar disableGutters sx={{ px: { xs: 2, md: 3 } }}>
          <BrandLink to={PAGES_ROUTE.root} />
          <Box sx={{ ml: "auto" }} />

          <Stack direction="row" spacing={1} alignItems="center">
            <MainLinks isLoggedIn={isLoggedIn}/>

            <PublishButtonWithDialog visible={isBusiness}/>

            <ThemeToggle mode={mode} setMode={setMode} />
           
            <AuthControls />
          
          </Stack>
        </Toolbar>
      </AppBar>
    </>
  )
}
