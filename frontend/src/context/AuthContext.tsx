import { createContext, useState, useEffect, useContext, type ReactNode } from "react";
import type { User } from "../types/user";
import { PAGES_ROUTE } from "../constants/Pages";
import { useNavigate } from 'react-router-dom';


interface AuthContextType {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
}

function mapUser(data: any): User {
  return {
      id: data.id,
      username: data.name,
      email: data.email,
      role: data.role,
      description: data.description,
      avatarURL: data.avatarURL,
  };
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}
//OJO: Chequear que el login solo devuelve los tokens
export function AuthProvider({ children }: AuthProviderProps) {

    const [accessToken, setAccessToken] = useState<string | null>(() => localStorage.getItem("token"));
    const [refreshToken, setRefreshToken] = useState<string | null>(() => localStorage.getItem("refreshToken"));
    const [user, setUser] = useState<User | null>(null);

    // TODO: manejar el url correct
    const login = async (email: string, password: string) => {
      //esto podría fallar
      const res = await fetch('http://localhost:8080/auth/login', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await res.json();
  
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
  
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      //no actualizo info de usuario pq lo hace el useEffect
    };

    const navigate = useNavigate();

    const logout = async () => {
      const res = await fetch('http://localhost:8080/auth/logout', {
        method: "POST",
        headers: { "Content-Type": "application/json" , "Authorization": `Bearer ${accessToken}` },
        body: JSON.stringify({ refreshToken }),
      });
  
      await res.json();

      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
      navigate(PAGES_ROUTE.root);
    };
  
    // Renovar token si expira
    // cuando se usaría esto, cuando se dio cuenta que se trató de usar el access token y este expiró
    // se hace el fetch, se guarda el access token en localstorage y en caché
    const refreshAccessToken = async () => {
      const res = await fetch('http://localhost:8080/auth/refresh', {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accessToken}` },
        body: JSON.stringify({ refreshToken }),
      });
          //si el refresh token expiró logout
      if (!res.ok) return logout();
  
      const data = await res.json();
      localStorage.setItem("token", data.accessToken);
      setAccessToken(data.accessToken);
    };

    //Detallamos qué pasa cuando hubo algún cambio en el token
    useEffect(() => {
    //comprueba si hay token, si es null no hay sesión inciiada y no se hace nada
      if (accessToken) {
        fetch('http://localhost:8080/users/me', {
          headers: { "Authorization": `Bearer ${accessToken}` },
        })
        .then(res => {
            // si la respuesta indica que expiró el access token-> se tiene que renovar el access token
          if (res.status === 401) return refreshAccessToken(); // si expiró, renovar
          return res.json();
        })
        // caso en que se renovó exitosamente el access token -> se vuelve a 
        .then((data)=>setUser(mapUser(data)))
        .catch(() => logout());
      }
    }, [accessToken]);
  
    return (
      <AuthContext.Provider value={{ token: accessToken, refreshToken, user, login, logout, refreshAccessToken }}>
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