
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import App from './App';
import { makeTheme } from './theme';
import { useMemo, useState } from 'react';
import { AuthProvider } from './context/AuthProvider';

export function Root() {
    const [mode, setMode] = useState<'light' | 'dark'>('light');
    const theme = useMemo(() => makeTheme(mode), [mode]);
  
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AuthProvider>
            <App mode={mode} setMode={setMode} />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    );
}