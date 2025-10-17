// src/main.tsx
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import App from './App';
import { makeTheme } from './theme';
import { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

function Root() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const theme = useMemo(() => makeTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <App mode={mode} setMode={setMode} />
      </BrowserRouter>
    </ThemeProvider>
  );
}

createRoot(document.getElementById('root')!).render(<Root />);
