// src/theme.ts
import { createTheme } from '@mui/material/styles';

/**
 * Genera un tema personalizado para Material UI en función del modo seleccionado.
 *
 * @param {'light' | 'dark'} mode - Define el modo de color global (claro u oscuro).
 * @returns {Theme} Un objeto de tema de MUI, listo para usar dentro de `<ThemeProvider>`.
 *
 * @example
 * ```tsx
 * const theme = makeTheme('dark');
 * <ThemeProvider theme={theme}>
 *   <App />
 * </ThemeProvider>
 * ```
 *
 * ### Detalles:
 * - **palette**: Define colores principales, secundarios y el modo global.
 * - **typography**: Configura fuentes y pesos de texto.
 * - **shape**: Ajusta radios de bordes globales.
 * - **components**: Aplica overrides específicos a componentes (Botones, Cards, etc.).
 */
export const makeTheme = (mode: 'light' | 'dark') =>
  createTheme({
    palette: {
      mode,
      primary: { main: mode === 'light' ? '#1976d2' : '#90caf9' },
      secondary: { main: '#9c27b0' },
    },
    typography: {
      fontFamily: ['Inter', 'Roboto', 'Arial', 'sans-serif'].join(','),
      h4: { fontWeight: 700 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: 12, paddingInline: 16 },
        },
      },
      MuiCard: {
        styleOverrides: { root: { borderRadius: 16 } },
      },
    },
  });
