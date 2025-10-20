import { createContext, useState, useEffect, useContext, type ReactNode } from "react";
import type { User } from "../types/user";

interface AuthContextType {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {

    const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
    const [refreshToken, setRefreshToken] = useState<string | null>(() => localStorage.getItem("refreshToken"));
    const [user, setUser] = useState<User | null>(null);

    // por lo pronto puedo ir mokeandolo
    const login = async (email: string, password: string) => {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await res.json();
  
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
  
      setToken(data.accessToken);
      setRefreshToken(data.refreshToken);
    };
  
    const logout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      setToken(null);
      setRefreshToken(null);
      setUser(null);
    };
  
    // Renovar token si expira
    // cuando se usaría esto, cuando se dio cuenta que se trató de usar el access token y este expiró
    // se hace el fetch, se guarda el access token en localstorage y en caché
    const refreshAccessToken = async () => {
      const res = await fetch("/api/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
          //si el refresh token expiró logout
      if (!res.ok) return logout();
  
      const data = await res.json();
      localStorage.setItem("token", data.accessToken);
      setToken(data.accessToken);
    };

    //Detallamos qué pasa cuando hubo algún cambio en el token
    useEffect(() => {
    //comprueba si hay token, si es null no hay sesión inciiada y no se hace nada
      if (token) {
          // se vuelve a pedir la info del usuario autenticado
        fetch("/api/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(res => {
              // si la respuesta indica que expiró el access token-> se tiene que renovar el access token
            if (res.status === 401) return refreshAccessToken(); // si expiró, renovar
            return res.json();
          })
          // caso en que se renovó exitosamente el access token -> se vuelve a 
          .then(setUser)//implícitamente se está enviándo como argumento lo que retornó el anterior then
          .catch(() => logout());
      }
    }, [token]);
  
    return (
      <AuthContext.Provider value={{ token, refreshToken, user, login, logout, refreshAccessToken }}>
        {children}
      </AuthContext.Provider>
    );
  }

// Hook personalizado para usar el contexto de autenticación
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;
}