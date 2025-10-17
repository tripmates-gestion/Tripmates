// src/components/auth/RegisterForm.tsx
import {
  Stack, TextField, IconButton, InputAdornment, FormControl, FormLabel,
  RadioGroup, FormControlLabel, Radio, Typography, Checkbox
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import type { AccountType } from '../../types/auth';
import { ACCOUNT_TYPES, AUTH_TEXT } from '../../constants/auth';

type Props = {
  accountType: AccountType;
  setAccountType: (t: AccountType) => void;
  showPass: boolean;
  setShowPass: (v: boolean) => void;
};

export default function RegisterForm({
  accountType, setAccountType, showPass, setShowPass,
}: Props) {
  return (
    <Stack spacing={2} sx={{ width: '100%', mt: 1 }}>
      {/* Tipo de cuenta */}
      <FormControl component="fieldset">
        <FormLabel component="legend">Tipo de cuenta</FormLabel>
        <RadioGroup
          row
          value={accountType}
          onChange={(e) => setAccountType(e.target.value as AccountType)}
        >
          <FormControlLabel value="user" control={<Radio />} label={ACCOUNT_TYPES.user.label} />
          <FormControlLabel value="business" control={<Radio />} label={ACCOUNT_TYPES.business.label} />
        </RadioGroup>
      </FormControl>

      {/* Comunes */}
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
              <IconButton onClick={() => setShowPass(!showPass)}>
                {showPass ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {/* Solo empresa */}
      {accountType === 'business' && (
        <>
          <TextField label="Nombre de la empresa" fullWidth />
          <TextField label="CUIT / NIF" fullWidth />
          <TextField label="Dirección comercial" fullWidth />
        </>
      )}

      <FormControlLabel control={<Checkbox defaultChecked />} label={
        <Typography variant="caption" color="text.secondary">{AUTH_TEXT.newsletterLabel}</Typography>
      } />

      <Typography variant="caption" color="text.secondary">
        Al registrarte aceptás nuestros Términos y Política de privacidad.
      </Typography>
    </Stack>
  );
}
