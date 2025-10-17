// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Search from './pages/Search';

export default function App({
  mode,
  setMode,
}: {
  mode: 'light' | 'dark';
  setMode: (m: 'light' | 'dark') => void;
}) {
  return (
    <Box>
      <NavBar mode={mode} setMode={setMode} />
      <Container sx={{ py: 4 }}>
        <Routes>
          <Route path="/" element={<Home />} /> // Home
          <Route path="/search" element={<Search />} /> // Search
        </Routes>
      </Container>
    </Box>
  );
}
