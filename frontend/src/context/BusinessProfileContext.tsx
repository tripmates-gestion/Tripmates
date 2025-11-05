import { createContext } from "react";
import type { BusinessUser } from "./PrivateUserProfilesTypes";

export interface BusinessProfileContextType {
  business: BusinessUser | null; // solo negocios
  setBusiness: React.Dispatch<React.SetStateAction<BusinessUser | null>>;
  refreshProfile: () => Promise<void>;
  loading: boolean;
}

export const BusinessProfileContext = createContext<BusinessProfileContextType | undefined>(undefined);
