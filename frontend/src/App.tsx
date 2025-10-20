import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import NavBar from './components/navbar/NavBar';
import Home from './pages/Home';
import Search from './pages/Search';
import Profile from './pages/Profile';
import type { AppProps } from './types/theme';
import { PAGES_ROUTE } from './constants/Pages';
import { Toolbar } from '@mui/material';
import { useAuth } from './context/AuthContext';

export default function App({ mode, setMode }: AppProps) {
  // todo: revisar que realmente se esté guardadndo correctaemente el logout
  const { user, logout } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <Box>
      <NavBar
        mode={mode}
        setMode={setMode}
        user={user}
        onLogout={logout}
        openAuth={() => setAuthOpen(true)}
        authOpen={authOpen}
        onCloseAuth={() => setAuthOpen(false)}
      />
      <Toolbar disableGutters sx={{ px: { xs: 2, md: 2 } }} />

      {/* No quiero q tenga bordes limitad */}
      <Routes>
        <Route path={PAGES_ROUTE.profile} element={<Profile />} />
      </Routes>

      <Container disableGutters sx={{ py: 4, px: { xs: 2, md: 2 } }}>
        <Routes>
          <Route path={PAGES_ROUTE.root} element={<Home />} />
          <Route path={PAGES_ROUTE.search} element={<Search />} />
        </Routes>
        </Container>
    </Box>
  );
}
