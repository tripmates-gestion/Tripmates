import React, { createContext } from 'react';
import type { CompleteBusinessProfile } from '../types/business';



// ---------------------- Tipos ----------------------
interface BusinessProfileContextType {
  completeProfile: CompleteBusinessProfile | null;
  setCompleteProfile: React.Dispatch<React.SetStateAction<CompleteBusinessProfile | null>>;
  refreshProfile: () => Promise<void>;
  loading: boolean;
}

export const BusinessProfileContext = createContext<BusinessProfileContextType | undefined>(undefined);
