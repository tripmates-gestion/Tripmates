// root.tsx
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import App from './App';
import { makeTheme } from './theme';
import { useMemo, useState } from 'react';
import { AuthProvider } from './context/AuthProvider';
import { BusinessProfileProvider } from './context/BusinessProfileProvider';

export function Root() {
    const [mode, setMode] = useState<'light' | 'dark'>('dark');
    const theme = useMemo(() => makeTheme(mode), [mode]);
  
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AuthProvider>
            <BusinessProfileProvider>
              <App mode={mode} setMode={setMode} />
            </BusinessProfileProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    );
}