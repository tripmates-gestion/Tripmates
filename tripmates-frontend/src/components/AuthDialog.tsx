// src/components/AuthDialog.tsx
import * as React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Tabs, Tab, Box, Stack, TextField, Button, IconButton, InputAdornment, Typography
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// Definimos qué datos recibe el componente (si está abierto y cómo cerrarlo)
type AuthDialogProps = {
  open: boolean;
  onClose: () => void;
};

// Componente popup de inicio / registro
export default function AuthDialog({ open, onClose }: AuthDialogProps) {
  // Estado para cambiar entre pestañas: login o registro
  const [tab, setTab] = React.useState<'login' | 'register'>('login');
  // Estado para mostrar u ocultar la contraseña
  const [showPass, setShowPass] = React.useState(false);

  return (
    // Ventana emergente (modal)
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      {/* Título con las pestañas */}
      <DialogTitle sx={{ pb: 1 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab value="login" label="Iniciar sesión" />
          <Tab value="register" label="Crear cuenta" />
        </Tabs>
      </DialogTitle>

      {/* Contenido del modal (cambia según la pestaña seleccionada) */}
      <DialogContent dividers>
        {tab === 'login' ? (
          // Vista de iniciar sesión
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Correo electrónico" type="email" fullWidth />
            <TextField
              label="Contraseña"
              type={showPass ? 'text' : 'password'}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPass(s => !s)}>
                      {showPass ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Box sx={{ textAlign: 'right' }}>
              <Button size="small" variant="text">¿Olvidaste tu contraseña?</Button>
            </Box>
          </Stack>
        ) : (
          // Vista de crear cuenta
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Nombre" fullWidth />
              <TextField label="Apellido" fullWidth />
            </Stack>
            <TextField label="Correo electrónico" type="email" fullWidth />
            <TextField
              label="Contraseña"
              type={showPass ? 'text' : 'password'}
              fullWidth
              helperText="Mínimo 8 caracteres"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPass(s => !s)}>
                      {showPass ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Typography variant="caption" color="text.secondary">
              Al registrarte aceptás nuestros Términos y Política de privacidad.
            </Typography>
          </Stack>
        )}
      </DialogContent>

      {/* Botones de acción (Cerrar / Enviar) */}
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="text">Cerrar</Button>
        {tab === 'login' ? (
          <Button variant="contained">Ingresar</Button>
        ) : (
          <Button variant="contained">Crear cuenta</Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
