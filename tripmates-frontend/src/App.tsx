import { Routes, Route } from 'react-router-dom';
import { useReducer, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Search from './pages/Search';
import { authReducer } from './components/auth/AuthReducer';

import type { AuthState } from './components/auth/AuthReducer';

const initialState: AuthState = {
  username: '',
  authOpen: false,
  accountType: 'user',
  showPass: false,
};

export default function App() {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  // Crear tema dinámico basado en el modo
  const theme = createTheme({
    palette: {
      mode: mode,
    },
    shape: {
      borderRadius: 8, // aplica a todos los botones, cards, etc.
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box>
        <NavBar
          mode={mode}
          setMode={setMode}
          username={state.username}
          onLogout={() => dispatch({ type: 'logout' })}
          openAuth={() => dispatch({ type: 'openAuth' })}
          authOpen={state.authOpen}
          onCloseAuth={() => dispatch({ type: 'closeAuth' })}
          dispatch={dispatch}
        />
        <Container sx={{ py: 4 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
          </Routes>
        </Container>
      </Box>
    </ThemeProvider>
  );
}