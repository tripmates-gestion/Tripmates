import { createContext } from "react";
import type { CommonUsersInformation } from "../types/CommonUserInfo";
interface AuthContextType {
  token: string | null;
  refreshToken: string | null;
  user: CommonUsersInformation | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
  updateUser: (newUserName: string|null, newDescription: string|null, newAvatarURL: string|null) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
