import * as React from 'react';
import {
  Stack, TextField, IconButton, InputAdornment, FormControl, FormLabel,
  RadioGroup, FormControlLabel, Radio, Typography, Checkbox, Box
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import type { AccountType } from '../../types/auth';
import { ACCOUNT_TYPES, AUTH_TEXT } from '../../constants/Auth';

type Props = {
  accountType: AccountType;
  setAccountType: (t: AccountType) => void;
  showPass: boolean;
  setShowPass: (v: boolean) => void;
  onDataChange: (data: { name: string; email: string; password: string; accountType: AccountType }) => void;
  onSubmit: (e: React.FormEvent) => void; // Nueva prop para manejar submit
  formRef: React.RefObject<HTMLFormElement>; // Ref del formulario
};

export default function RegisterForm({
  accountType, setAccountType, showPass, setShowPass, onDataChange, onSubmit, formRef
}: Props) {

  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  React.useEffect(() => {
    onDataChange({ name, email, password, accountType });
  }, [name, email, password, accountType, onDataChange]);

  return (
    <Box component="form" ref={formRef} onSubmit={onSubmit}>
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

        {accountType === 'BUSINESS' && (
          <TextField 
            label="Nombre de la empresa" 
            fullWidth 
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            helperText={name.trim() === '' ? 'El nombre de empresa es obligatorio' : ''}
          />
        )}

        {accountType === 'USER' && (
          <TextField 
            label="Nombre" 
            fullWidth 
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            helperText={name.trim() === '' ? 'El nombre de usuario es obligatorio' : ''}
          />
        )}

        <TextField 
          label="Correo electrónico" 
          type="email" 
          fullWidth 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          helperText={email.trim() === '' ? 'El correo electrónico es obligatorio' : ''}
        />

        <TextField
          label="Contraseña"
          type={showPass ? 'text' : 'password'}
          fullWidth
          required
          inputProps={{ minLength: 8 }}
          value={password}
          helperText="Mínimo 8 caracteres"
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

        {/* Solo empresa */}
        {accountType === 'BUSINESS' && (
          <>
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
    </Box>
  );
}