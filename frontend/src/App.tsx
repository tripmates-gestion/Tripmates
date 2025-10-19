import { Routes, Route } from 'react-router-dom';
import { useReducer } from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import NavBar from './components/navbar/NavBar';
import Home from './pages/Home';
import Search from './pages/Search';
import Profile from './pages/Profile';
import { authReducer } from './components/auth/AuthReducer';
import type { AuthState } from './components/auth/AuthReducer';
import type { AppProps } from './types/theme';
import { PAGES_ROUTE } from './constants/Pages';
import { Toolbar } from '@mui/material';

const initialState: AuthState = {
  username: '',
  user: null, // Agregar user inicial
  authOpen: false,
  accountType: 'user',
  showPass: false,
};


export default function App({ mode, setMode }: AppProps) {
  const [sessionState, sessionDispatch] = useReducer(authReducer, initialState);

  return (
    <Box>
      <NavBar
        mode={mode}
        setMode={setMode}
        username={sessionState.username}
        user={sessionState.user}
        onLogout={() => sessionDispatch({ type: 'logout' })}
        openAuth={() => sessionDispatch({ type: 'openAuth' })}
        authOpen={sessionState.authOpen}
        onCloseAuth={() => sessionDispatch({ type: 'closeAuth' })}
        dispatch={sessionDispatch}
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
