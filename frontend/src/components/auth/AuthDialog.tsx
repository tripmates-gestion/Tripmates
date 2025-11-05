import * as React from 'react';
import {
  Dialog, DialogContent, DialogActions, Tabs, Tab,
  Typography, Button, Alert
} from '@mui/material';
import type { AuthTab } from '../../types/auth';
import type { AccountType } from '../../types/AccountTypes';
import { AUTH_TEXT } from '../../constants/Auth';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { registerUserApi } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';
import type { BusinessType } from '../../types/AccountTypes';

type AuthDialogProps = { 
  open: boolean; 
  onClose: () => void;
  onRegisterSuccess: () => void;
};

export default function AuthDialog({ open, onClose, onRegisterSuccess }: AuthDialogProps) {
  // const theme = useTheme();
  const { login } = useAuth();

  const [tab, setTab] = React.useState<AuthTab>('LOGIN');
  const [showPass, setShowPass] = React.useState(false);
  const [loginEmail, setLoginEmail] = React.useState('');
  const [loginPassword, setLoginPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const [accountType, setAccountType] = React.useState<AccountType>('USER');
  const [businessType, setBusinessType] = React.useState<BusinessType | null>(null); 
  const [registerData, setRegisterData] = React.useState({
    name: '',
    email: '',
    password: '',
  });

  const formRef = React.useRef<HTMLFormElement>(null);

  const handleRegister = async () => {
    setError(null);
    setLoading(true);
    
    if (formRef.current && !formRef.current.checkValidity()) {
      formRef.current.reportValidity();
      setLoading(false);
      return;
    }

    try {
      await registerUserApi(
        registerData.name,
        registerData.email, 
        registerData.password,
        accountType,
        accountType === 'BUSINESS' ? businessType : null
      );      

      await login(registerData.email, registerData.password);
      onRegisterSuccess();
      onClose();

    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al crear usuario, por favor intenta de nuevo';
      console.error(error);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    
    try {
      await login(loginEmail, loginPassword);
      onClose();
      setLoginEmail('');
      setLoginPassword('');
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setError('Credenciales inválidas. Por favor verifica tu correo y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterDataChange = React.useCallback(
    (data: { name: string; email: string; password: string }) => {
      setRegisterData(data);
    },
    []
  );

  const closeDialog = () => {
    onClose();
    setError(null);
  };

  // Colores de iluminación según el tipo de cuenta
  const glowColor =
    accountType === 'BUSINESS'
      ? 'rgba(255, 140, 0, 0.45)' // naranja suave
      : 'rgba(0, 150, 255, 0.35)'; // celeste suave

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          transition: 'box-shadow 0.4s ease-in-out',
          boxShadow: `0 0 35px 8px ${tab === 'REGISTER' ? glowColor : 'rgba(0,0,0,0.25)'}`,
        },
      }}
    >
      <DialogContent
        sx={{
          textAlign: 'center',
          pt: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" fontWeight={800} sx={{ mb: 0.5 }}>
          {tab === 'LOGIN' ? AUTH_TEXT.loginTitle : AUTH_TEXT.registerTitle}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {tab === 'LOGIN' ? AUTH_TEXT.loginSubtitle : AUTH_TEXT.registerSubtitle}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
            {error}
          </Alert>
        )}

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab value="LOGIN" label="Iniciar sesión" />
          <Tab value="REGISTER" label="Crear cuenta" />
        </Tabs>

        {tab === 'LOGIN' ? (
          <LoginForm
            showPass={showPass}
            setShowPass={setShowPass}
            email={loginEmail}
            setEmail={setLoginEmail}
            password={loginPassword}
            setPassword={setLoginPassword}
          />
        ) : (
          <RegisterForm
            accountType={accountType}
            setAccountType={setAccountType}
            businessType={businessType}
            setBusinessType={setBusinessType}
            showPass={showPass}
            setShowPass={setShowPass}
            onDataChange={handleRegisterDataChange}
            onSubmit={handleRegister}
            formRef={formRef}
          />
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={closeDialog} variant="text">
          Cerrar
        </Button>

        {tab === 'LOGIN' ? (
          <Button
            variant="contained"
            onClick={handleLogin}
            disabled={loading || !loginEmail || !loginPassword}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </Button>
        ) : (
          <Button
            variant="contained"
            type="submit"
            onClick={() => handleRegister()}
            disabled={loading}
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
