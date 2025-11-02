import { useContext } from 'react';
import { BusinessProfileContext } from '../context/BusinessProfileContext';

// ---------------------- Hook de acceso a perfil de usuario ----------------------
export const useBusinessProfile = () => {
    const context = useContext(BusinessProfileContext);
    if (!context) {
      throw new Error('useBusinessProfile debe usarse dentro de un BusinessProfileProvider');
    }
    return context;
  };
  