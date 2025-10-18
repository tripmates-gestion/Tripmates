// src/components/auth/AuthDialog.tsx
import * as React from 'react';
import {
  Dialog, DialogContent, DialogActions, Tabs, Tab,
  Typography, Button
} from '@mui/material';
import type { AuthTab, AccountType } from '../../types/auth';
import { AUTH_TEXT } from '../../constants/auth';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import type { AuthAction } from './AuthReducer';

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
  dispatch: React.Dispatch<AuthAction>;
};

export default function AuthDialog({ open, onClose, dispatch }: AuthDialogProps) {
  // Estado para manejar la pestaña seleccionada (login o register)
  const [tab, setTab] = React.useState<AuthTab>('login');

  // Estado para manejar la visibilidad de la contraseña en el formulario de login
  const [showPass, setShowPass] = React.useState(false);

  // Estado para manejar el tipo de cuenta en el formulario de registro
  const [accountType, setAccountType] = React.useState<AccountType>('user');

  // Estado para almacenar los datos del formulario de registro
  const [registerData, setRegisterData] = React.useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  const handleRegister = () => {
    // Crear el nombre de usuario a partir de los datos del formulario
    const username = `${registerData.firstName} ${registerData.lastName}`;
    
    // Dispatch login con el username
    dispatch({ type: 'login', username });
    onClose();
  };

  const handleLogin = () => {
    const username = 'Usuario Logueado'; // Esto vendría del formulario
    dispatch({ type: 'login', username });
    onClose();
  };

  // Callback para recibir los datos del formulario de registro
  const handleRegisterDataChange = (data: { firstName: string; lastName: string; email: string }) => {
    setRegisterData(data);
  };

  // Textos de título y subtítulo según la pestaña seleccionada (login o register)
  const title = tab === 'login' ? AUTH_TEXT.loginTitle : AUTH_TEXT.registerTitle;
  const subtitle = tab === 'login' ? AUTH_TEXT.loginSubtitle : AUTH_TEXT.registerSubtitle;

  // Renderizado del diálogo de autenticación
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogContent sx={{ textAlign: 'center', pt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        <Typography variant="h6" fontWeight={800} sx={{ mb: 0.5 }}>{title}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>{subtitle}</Typography>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab value="login" label="Iniciar sesión" />
          <Tab value="register" label="Crear cuenta" />
        </Tabs>

        {/* Renderizado del formulario de login o registro según la pestaña seleccionada */}
        {tab === 'login' ? (
          <LoginForm showPass={showPass} setShowPass={setShowPass} />
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
          <Button variant="contained" onClick={handleLogin}>Ingresar</Button>
        ) : (
          <Button variant="contained" onClick={handleRegister}>Crear cuenta</Button>
        )}
      </DialogActions>
    </Dialog>
  );
}