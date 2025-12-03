// src/components/auth/LoginForm.tsx
import { Stack, TextField, IconButton, InputAdornment, Box, Button } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

type Props = {
  showPass: boolean;
  setShowPass: (v: boolean) => void;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  onForgotPassword: () => void;
};

export default function LoginForm({
  showPass,
  setShowPass,
  email,
  setEmail,
  password,
  setPassword,
  onForgotPassword,
}: Props) {
  return (
    <Stack spacing={2} sx={{ width: '100%', mt: 1 }}>
      <TextField 
        label="Correo electrónico" 
        type="email" 
        fullWidth 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        label="Contraseña"
        type={showPass ? 'text' : 'password'}
        fullWidth
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowPass(!showPass)}>
                {showPass ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <Box sx={{ textAlign: 'right' }}>
        <Button size="small" variant="text" onClick={onForgotPassword}>
          ¿Olvidaste tu contraseña?
        </Button>
      </Box>
    </Stack>
  );
}
