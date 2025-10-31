import { useContext } from 'react';
import { BusinessProfileContext } from '../context/businessProfileContext';

// ---------------------- Hook de acceso ----------------------
export const useBusinessProfile = () => {
    const context = useContext(BusinessProfileContext);
    if (!context) {
      throw new Error('useBusinessProfile debe usarse dentro de un BusinessProfileProvider');
    }
    return context;
  };
  