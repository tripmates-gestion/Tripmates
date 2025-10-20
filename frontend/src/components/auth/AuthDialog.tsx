// src/components/auth/AuthDialog.tsx
import * as React from 'react';
import {
  Dialog, DialogContent, DialogActions, Tabs, Tab,
  Typography, Button, Alert
} from '@mui/material';
import type { AuthTab, AccountType } from '../../types/auth';
import { AUTH_TEXT } from '../../constants/Auth';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { createUser } from '../../helpers/userCreation';
import { useAuth } from '../../context/AuthContext';

// Componente de diálogo de autenticación
// Recibe una prop "open" para controlar si el diálogo está abierto o cerrado
// Recibe una prop "onClose" para manejar el cierre del diálogo
// Maneja dos pestañas: "login" y "register"
// Muestra un formulario de login o registro según la pestaña seleccionada
// Se encarga de manejar el estado de las pestañas y las propiedades de los formularios
// Muestra un botón para cerrar el diálogo y un botón para enviar el formulario según la pestaña seleccionada
type AuthDialogProps = { 
  open: boolean; 
  onClose: () => void;
};

export default function AuthDialog({ open, onClose }: AuthDialogProps) {
  const { login } = useAuth();
  // Estado para manejar la pestaña seleccionada (login o register)
  const [tab, setTab] = React.useState<AuthTab>('login');

  // Estado para manejar la visibilidad de la contraseña en el formulario de login
  const [showPass, setShowPass] = React.useState(false);
  
  // Estados para el formulario de login
  const [loginEmail, setLoginEmail] = React.useState('');
  const [loginPassword, setLoginPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  // Estado para manejar el tipo de cuenta en el formulario de registro
  const [accountType, setAccountType] = React.useState<AccountType>('user');

  // Estado para almacenar los datos del formulario de registro
  const [registerData, setRegisterData] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const handleRegister = async () => {
    setError(null);
    setLoading(true);
    
    try {
      console.log('Formulario completado automáticamente:', registerData);
      const newUser = await createUser(
        registerData.email, 
        registerData.password,
        accountType,
        registerData.firstName,
        registerData.lastName
      );
      console.log('Usuario creado:', newUser);
      
      // Después de crear la cuenta, hacer login automáticamente
      await login(registerData.email, registerData.password);
      onClose();
    } catch (error) {
      console.error('Error al crear usuario:', error);
      setError('Error al crear la cuenta. Por favor intenta de nuevo.');
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
      // Limpiar formulario
      setLoginEmail('');
      setLoginPassword('');
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setError('Credenciales inválidas. Por favor verifica tu correo y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  // Callback para recibir los datos del formulario de registro
  const handleRegisterDataChange = React.useCallback(
    (data: { firstName: string; lastName: string; email: string; password: string }) => {
      setRegisterData(data);
    },
    []
  );

  // Textos de título y subtítulo según la pestaña seleccionada (login o register)
  const title = tab === 'login' ? AUTH_TEXT.loginTitle : AUTH_TEXT.registerTitle;
  const subtitle = tab === 'login' ? AUTH_TEXT.loginSubtitle : AUTH_TEXT.registerSubtitle;

  // Renderizado del diálogo de autenticación
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogContent sx={{ textAlign: 'center', pt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        <Typography variant="h6" fontWeight={800} sx={{ mb: 0.5 }}>{title}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>{subtitle}</Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
            {error}
          </Alert>
        )}

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab value="login" label="Iniciar sesión" />
          <Tab value="register" label="Crear cuenta" />
        </Tabs>

        {/* Renderizado del formulario de login o registro según la pestaña seleccionada */}
        {tab === 'login' ? (
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
            showPass={showPass}
            setShowPass={setShowPass}
            onDataChange={handleRegisterDataChange}
          />
        )}
      </DialogContent>

      {/* Panel de acciones del diálogo */}
      <DialogActions sx={{ px: 3, py: 2 }}>
        {/* Botón para cerrar el diálogo */}
        <Button onClick={onClose} variant="text">Cerrar</Button>

        {/* Botón para enviar el formulario según la pestaña seleccionada */}
        {tab === 'login' ? (
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
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}