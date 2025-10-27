import { createContext } from "react";
import type { CommonUsersInformation } from "../types/user";
interface AuthContextType {
  token: string | null;
  refreshToken: string | null;
  user: CommonUsersInformation | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
