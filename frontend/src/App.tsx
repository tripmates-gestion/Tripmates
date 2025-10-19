import { Routes, Route } from 'react-router-dom';
import { useReducer } from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Search from './pages/Search';
import Profile from './pages/Profile';
import { authReducer } from './components/auth/AuthReducer';
import type { AuthState } from './components/auth/AuthReducer';
import type { AppProps } from './types/theme';
import { PAGES_ROUTE } from './constants/Pages';

const initialState: AuthState = {
  username: '',
  user: null, // Agregar user inicial
  authOpen: false,
  accountType: 'user',
  showPass: false,
};

export default function App({ mode, setMode }: AppProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  console.log('Usuario actual en App:', state.user);

  return (
    <Box>
      <NavBar
        mode={mode}
        setMode={setMode}
        username={state.username}
        user={state.user}
        onLogout={() => dispatch({ type: 'logout' })}
        openAuth={() => dispatch({ type: 'openAuth' })}
        authOpen={state.authOpen}
        onCloseAuth={() => dispatch({ type: 'closeAuth' })}
        dispatch={dispatch}
      />
      <Container sx={{ py: 4 }}>
        <Routes>
          <Route path={PAGES_ROUTE.root} element={<Home />} />
          <Route path={PAGES_ROUTE.search} element={<Search />} />
          <Route path={PAGES_ROUTE.profile} element={<Profile />} />
        </Routes>
      </Container>
    </Box>
  );
}