import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Typography,
  Button,
  Alert,
} from '@mui/material';
import type { AuthTab } from '../../types/Auth';
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
    confirmPassword: '',
    termsAccepted: false,
  });

  const [termsOpen, setTermsOpen] = React.useState(false);

  const formRef = React.useRef<HTMLFormElement>(null);

  const handleRegister = async () => {
    setError(null);
    setLoading(true);

    if (formRef.current && !formRef.current.checkValidity()) {
      formRef.current.reportValidity();
      setLoading(false);
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError('Las contraseñas deben coincidir para crear la cuenta.');
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
      const msg =
        error instanceof Error
          ? error.message
          : 'Error al crear usuario, por favor intenta de nuevo';
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
    (data: {
      name: string;
      email: string;
      password: string;
      confirmPassword: string;
      termsAccepted: boolean;
    }) => {
      setRegisterData(data);
    },
    []
  );

  const closeDialog = () => {
    onClose();
    setError(null);
  };

  const glowColor =
    accountType === 'BUSINESS'
      ? 'rgba(255, 140, 0, 0.45)'
      : 'rgba(0, 150, 255, 0.35)';

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            transition: 'box-shadow 0.4s ease-in-out',
            boxShadow: `0 0 35px 8px ${
              tab === 'REGISTER' ? glowColor : 'rgba(0,0,0,0.25)'
            }`,
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
              onOpenTerms={() => setTermsOpen(true)}
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
              onClick={handleRegister}
              disabled={
                loading ||
                !registerData.termsAccepted ||
                registerData.password !== registerData.confirmPassword
              }
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Modal de Términos y Condiciones */}
      <Dialog
        open={termsOpen}
        onClose={() => setTermsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent sx={{ py: 3 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Términos y condiciones de uso
          </Typography>

          <Typography variant="body2" color="text.secondary" paragraph>
            TripMates es un proyecto universitario y educativo pensado para
            experimentar con conceptos de diseño, usabilidad y desarrollo de
            software. No se trata de un servicio comercial real, ni de una
            plataforma de turismo en producción.
          </Typography>

          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Uso de la cuenta y datos ingresados
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Los datos que ingreses (nombre, correo electrónico, contraseña e
            información de negocio, si corresponde) se utilizan únicamente para
            simular el funcionamiento de la aplicación: inicio de sesión,
            perfiles públicos, listados y pruebas internas del sistema. No se
            realizan cobros, reservas reales ni operaciones comerciales de
            ningún tipo.
          </Typography>

          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Privacidad y almacenamiento
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            La información puede almacenarse en bases de datos asociadas al
            entorno académico del proyecto y ser utilizada por el equipo docente
            y estudiantil para fines de evaluación, depuración y mejora de la
            aplicación. No se comparte con terceros ajenos a la cursada ni se
            utiliza con fines publicitarios o comerciales.
          </Typography>

          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Contraseñas y seguridad
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Aunque se aplican buenas prácticas básicas de seguridad, te
            recomendamos no reutilizar contraseñas reales que uses en otros
            servicios.
          </Typography>

          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Limitación de responsabilidad
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            TripMates no asume responsabilidad por pérdidas, daños o
            inconvenientes derivados del uso de esta demo. El propósito del
            sistema es exclusivamente académico y experimental.
          </Typography>

          <Typography variant="body2" color="text.secondary" paragraph>
            Al crear una cuenta o iniciar sesión aceptás que estás interactuando
            con un prototipo universitario y que los datos y contenidos que
            cargues pueden ser modificados, reiniciados o eliminados sin previo
            aviso como parte del proceso de desarrollo.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setTermsOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
