// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import { useReducer } from 'react';
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

  return (
    <Box>
      <NavBar
        mode="light"
        setMode={() => {}}
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
  );
}