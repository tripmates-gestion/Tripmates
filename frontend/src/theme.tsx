// src/theme.ts
import { createTheme, alpha } from "@mui/material/styles";

export const makeTheme = (mode: "light" | "dark") => {
  const primaryMain = mode === "light" ? "#1976d2" : "#90caf9";

  return createTheme({
    palette: {
      mode,
      primary: {
        main: primaryMain,
        // texto oscuro en dark, blanco en light
        contrastText: mode === "dark" ? "#111" : "#fff",
      },
      secondary: { main: "#FF6B35" },
      background: {
        default: mode === "light" ? "#fafafa" : "#121212",
        paper: mode === "light" ? "#fafafa" : "#121212",
      },
      text: {
        primary: mode === "light" ? "#222" : "#f5f5f5",
        secondary: mode === "light" ? "#555" : "#aaa",
      },
      success: { main: mode === "light" ? "#2E7D32" : "#81C784" },
      divider: alpha(mode === "light" ? "#000" : "#fff", 0.08),
    },
    typography: {
      fontFamily: ["Inter", "Roboto", "Arial", "sans-serif"].join(","),
      h6: { fontWeight: 700, letterSpacing: "-0.3px" },
      button: { textTransform: "none", fontWeight: 600 },
    },
    shape: { borderRadius: 14 },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: 12, paddingInline: 16, fontWeight: 600 },
          // si querés asegurarlo explícitamente:
          containedPrimary: {
            color: mode === "dark" ? "#111" : "#fff",
          },
        },
      },
    },
  });
};
