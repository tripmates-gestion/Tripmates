import {
    useEffect,
    useMemo,
    useState,
    type KeyboardEvent,
    type ClipboardEvent,
} from 'react';

import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Step,
    StepLabel,
    Stepper,
    TextField,
    Typography,
    IconButton,
    InputAdornment,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';


import {
    requestPasswordReset,
    resetPassword,
    verifyResetCode,
} from '../../services/authService';
  
type PasswordResetDialogProps = {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialEmail?: string;
};    
  
type StepKey = 'EMAIL' | 'CODE' | 'PASSWORD';
  
const steps: { key: StepKey; label: string; helper: string }[] = [
{
        key: 'EMAIL',
        label: 'Ingresar correo',
        helper: 'Te enviaremos un código de verificación.',
    },
    {
        key: 'CODE',
        label: 'Verificar código',
        helper: 'Revisa tu correo e ingresa el código recibido.',
    },
    {
        key: 'PASSWORD',
        label: 'Nueva contraseña',
        helper: 'Elige una contraseña segura y confírmala.',
    },
];
  
type VerificationCodeInputProps = {
    length?: number;
    value: string;
    onChange: (value: string) => void;
};

function VerificationCodeInput({
    length = 6,
    value,
    onChange,
}: VerificationCodeInputProps) {
    const digits = Array.from({ length }, (_, i) => value[i] ?? '');
  
    const handleChange = (index: number, next: string) => {
      const onlyDigit = next.replace(/\D/g, '').slice(-1);
      const newDigits = [...digits];
      newDigits[index] = onlyDigit;
      const newValue = newDigits.join('');
      onChange(newValue);
  
      if (onlyDigit && index < length - 1) {
        const nextInput = document.getElementById(
          `verification-code-${index + 1}`,
        ) as HTMLInputElement | null;
        nextInput?.focus();
        nextInput?.select();
      }
    };
  
    const handleKeyDown = (
      index: number,
      event: KeyboardEvent<HTMLInputElement>,
    ) => {
      if (event.key === 'Backspace' && !digits[index] && index > 0) {
        const prev = document.getElementById(
          `verification-code-${index - 1}`,
        ) as HTMLInputElement | null;
        prev?.focus();
        prev?.select();
      }
    };
  
    const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
      const text = event.clipboardData
        .getData('text')
        .replace(/\D/g, '')
        .slice(0, length);
      if (text) {
        onChange(text);
      }
      event.preventDefault();
    };
  
    return (
      <Stack
        direction="row"
        spacing={1}
        justifyContent="center"
        onPaste={handlePaste}
      >
        {digits.map((digit, index) => (
          <TextField
            key={index}
            id={`verification-code-${index}`}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(index, e)}
            inputProps={{
              maxLength: 1,
              inputMode: 'numeric',
              style: {
                textAlign: 'center',
                fontSize: '1.5rem',
                width: '3rem',
              },
            }}
          />
        ))}
      </Stack>
    );
}

export default function PasswordResetDialog({
    open,
    onClose,
    onSuccess,
    initialEmail,
}: PasswordResetDialogProps) {
    const [step, setStep] = useState<StepKey>('EMAIL');
    const [email, setEmail] = useState(initialEmail ?? '');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
  
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
    const activeStepIndex = useMemo(
      () => steps.findIndex((item) => item.key === step),
      [step],
    );
  
    const resetState = () => {
      setStep('EMAIL');
      setEmail(initialEmail ?? '');
      setCode('');
      setNewPassword('');
      setConfirmPassword('');
      setError(null);
      setLoading(false);
      setShowPassword(false);
      setShowConfirmPassword(false);
    };
  
    useEffect(() => {
      if (open) {
        resetState();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, initialEmail]);
  
    const handleRequestCode = async () => {
      setError(null);
      setLoading(true);
      try {
        await requestPasswordReset(email);
        setStep('CODE');
      } catch (requestError) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : 'No pudimos enviar el código, intenta nuevamente.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };
  
    const handleVerifyCode = async () => {
      setError(null);
      setLoading(true);
      try {
        await verifyResetCode(email, code);
        setStep('PASSWORD');
      } catch (verifyError) {
        const message =
          verifyError instanceof Error
            ? verifyError.message
            : 'El código ingresado no es válido. Verifícalo e intenta de nuevo.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };
  
    const handleResetPassword = async () => {
      setError(null);
  
      if (newPassword !== confirmPassword) {
        setError('Las contraseñas deben coincidir.');
        return;
      }
  
      setLoading(true);
      try {
        await resetPassword(email, newPassword, code);
        onSuccess();
        resetState();
      } catch (resetError) {
        const message =
          resetError instanceof Error
            ? resetError.message
            : 'No pudimos actualizar tu contraseña. Intenta más tarde.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };
  
    const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault();
      if (step === 'EMAIL') {
        await handleRequestCode();
        return;
      }
      if (step === 'CODE') {
        await handleVerifyCode();
        return;
      }
      await handleResetPassword();
    };
  
    const primaryButtonLabel =
      step === 'EMAIL'
        ? 'Enviar código'
        : step === 'CODE'
        ? 'Verificar'
        : 'Actualizar contraseña';
  
    const isPrimaryDisabled =
      loading ||
      (step === 'EMAIL' && !email) ||
      (step === 'CODE' && (!email || !code)) ||
      (step === 'PASSWORD' &&
        (!newPassword || !confirmPassword || newPassword !== confirmPassword));
  
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>Recuperar contraseña</DialogTitle>
        <DialogContent>
          <Box
            component="img"
            src={"6-pinguinos.png"}
            alt="Ilustración de pingüinos exploradores"
            sx={{ width: '100%', mb: 2 }}
          />
  
          <Stepper activeStep={activeStepIndex} alternativeLabel sx={{ mb: 3 }}>
            {steps.map((item) => (
              <Step key={item.key}>
                <StepLabel>{item.label}</StepLabel>
              </Step>
            ))}
          </Stepper>
  
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {steps[activeStepIndex]?.helper}
          </Typography>
  
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
  
          <Box component="form" onSubmit={handleSubmit} noValidate>
            {step === 'EMAIL' && (
              <Stack spacing={2}>
                <TextField
                  label="Correo electrónico"
                  type="email"
                  required
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Stack>
            )}
  
            {step === 'CODE' && (
              <Stack spacing={2}>
                <TextField
                  label="Correo electrónico"
                  value={email}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
  
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Código de verificación *
                  </Typography>
                  <VerificationCodeInput value={code} onChange={setCode} />
                </Box>
              </Stack>
            )}
  
            {step === 'PASSWORD' && (
              <Stack spacing={2}>
                <TextField
                  label="Correo electrónico"
                  value={email}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Nueva contraseña"
                  type={showPassword ? 'text' : 'password'}
                  required
                  fullWidth
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() =>
                            setShowPassword((prev) => !prev)
                          }
                          edge="end"
                        >
                          {showPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Confirmar contraseña"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  fullWidth
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={!!confirmPassword && newPassword !== confirmPassword}
                  helperText={
                    confirmPassword && newPassword !== confirmPassword
                      ? 'Las contraseñas no coinciden'
                      : 'Debes confirmarla antes de continuar'
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() =>
                            setShowConfirmPassword((prev) => !prev)
                          }
                          edge="end"
                        >
                          {showConfirmPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>
            )}
  
            <DialogActions sx={{ mt: 3, px: 0 }}>
              <Button onClick={onClose} disabled={loading} variant="text">
                Cancelar
              </Button>
  
              {step !== 'EMAIL' && (
                <Button
                  onClick={() => setStep(step === 'CODE' ? 'EMAIL' : 'CODE')}
                  disabled={loading}
                  variant="outlined"
                >
                  Volver
                </Button>
              )}
  
              <Button
                type="submit"
                variant="contained"
                disabled={isPrimaryDisabled}
              >
                {loading ? 'Procesando...' : primaryButtonLabel}
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }
  