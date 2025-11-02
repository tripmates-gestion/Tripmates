import { createContext } from "react";
import type { CurrentUser } from "./TypesUser";



interface AuthContextType {
  accessToken: string | null;
  refreshToken: string | null;
  user: CurrentUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
  updateUser: (newUserName: string|null, newDescription: string|null, newAvatarURL: string|null) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
