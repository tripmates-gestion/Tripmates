import * as React from 'react';
import {
  Stack,
  TextField,
  IconButton,
  InputAdornment,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Checkbox,
  Box,
  MenuItem,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import type { AccountType } from '../../types/AccountTypes';
import { ACCOUNT_TYPES } from '../../constants/Auth';
import type { BusinessType } from '../../types/AccountTypes';

type Props = {
  accountType: AccountType;
  setAccountType: (t: AccountType) => void;
  businessType: BusinessType | null;
  setBusinessType: (t: BusinessType | null) => void;
  showPass: boolean;
  setShowPass: (v: boolean) => void;
  onDataChange: (data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    termsAccepted: boolean;
  }) => void;
  onSubmit: () => void;
  formRef: React.RefObject<HTMLFormElement | null>;
  onOpenTerms: () => void;
};

export default function RegisterForm({
  accountType,
  setAccountType,
  businessType,
  setBusinessType,
  showPass,
  setShowPass,
  onDataChange,
  onSubmit,
  formRef,
  onOpenTerms,
}: Props) {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [termsAccepted, setTermsAccepted] = React.useState(false);

  const confirmPasswordRef = React.useRef<HTMLInputElement | null>(null);

  const passwordsMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  React.useEffect(() => {
    onDataChange({ name, email, password, confirmPassword, termsAccepted });
  }, [confirmPassword, email, name, onDataChange, password, termsAccepted]);

  React.useEffect(() => {
    if (!confirmPasswordRef.current) return;

    const message =
      confirmPassword && password !== confirmPassword
        ? 'Las contraseñas no coinciden'
        : '';

    confirmPasswordRef.current.setCustomValidity(message);
  }, [confirmPassword, password]);

  return (
    <Box
      component="form"
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <Stack spacing={2} sx={{ width: '100%', mt: 1 }}>
        {/* Tipo de cuenta */}
        <FormControl component="fieldset">
          <FormLabel component="legend">Tipo de cuenta</FormLabel>
          <RadioGroup
            row
            value={accountType}
            onChange={(e) => setAccountType(e.target.value as AccountType)}
          >
            <FormControlLabel
              value="USER"
              control={<Radio color="info" />}
              label={ACCOUNT_TYPES.user.label}
            />
            <FormControlLabel
              value="BUSINESS"
              control={<Radio color="warning" />}
              label={ACCOUNT_TYPES.business.label}
            />
          </RadioGroup>
        </FormControl>

        {accountType === 'BUSINESS' && (
          <TextField
            label="Nombre de la empresa"
            fullWidth
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            helperText={
              name.trim() === '' ? 'El nombre de empresa es obligatorio' : ''
            }
          />
        )}

        {accountType === 'USER' && (
          <TextField
            label="Nombre"
            fullWidth
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            helperText={
              name.trim() === '' ? 'El nombre de usuario es obligatorio' : ''
            }
          />
        )}

        <TextField
          label="Correo electrónico"
          type="email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          helperText={
            email.trim() === '' ? 'El correo electrónico es obligatorio' : ''
          }
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

        <TextField
          label="Confirmar contraseña"
          type={showPass ? 'text' : 'password'}
          fullWidth
          required
          inputRef={confirmPasswordRef}
          value={confirmPassword}
          error={passwordsMismatch}
          helperText={
            passwordsMismatch
              ? 'Las contraseñas deben coincidir'
              : 'Repetí la contraseña para validarla'
          }
          onChange={(e) => setConfirmPassword(e.target.value)}
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
          <TextField
            select
            label="Tipo de negocio"
            value={businessType ?? ''}
            onChange={(e) => setBusinessType(e.target.value as BusinessType)}
            fullWidth
            required
          >
            <MenuItem value="RESTAURANT">Restaurante</MenuItem>
            <MenuItem value="HOTEL">Alojamiento</MenuItem>
          </TextField>
        )}

        <FormControlLabel
          control={
            <Checkbox
              required
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />
          }
          label={
            <Typography variant="caption" color="text.secondary">
              Acepto los{' '}
              <Typography
                component="button"
                variant="caption"
                sx={{
                  color: 'primary.main',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  p: 0,
                  border: 'none',
                  background: 'transparent',
                  font: 'inherit',
                }}
                onClick={(e) => {
                  e.preventDefault();
                  onOpenTerms();
                }}
              >
                Términos y condiciones
              </Typography>{' '}
              de TripMates, un proyecto universitario y educativo de
              demostración.
            </Typography>
          }
        />
      </Stack>
    </Box>
  );
}
