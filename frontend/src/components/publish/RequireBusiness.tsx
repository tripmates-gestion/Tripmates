import {useAuth} from "../../context/AuthContext"
import { ACCOUNT_TYPES } from "../../constants/Rol"
import { Navigate } from 'react-router-dom';
import { Alert } from '@mui/material';


// RequireBusiness.tsx
export function RequireBusiness({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();

    if (!user) return <Navigate to="/" replace />;
    
    if (user?.role !== ACCOUNT_TYPES.business) {
      return <Alert severity="warning">Función exclusiva para cuentas de negocio.</Alert>;
    }
    return <>{children}</>;
  }
  