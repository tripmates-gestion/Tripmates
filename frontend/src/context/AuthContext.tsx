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
  console.log("[Auth] Mapping user data (returned by the back):", data);
  console.log(data);
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

    // TODO: DEBERÍA DE MOSTRARSE UN MENSAJE DE ERRR CUANDO 
    const login = async (email: string, password: string) => {
      console.log("[AuthProvider] LOGGING IN with:", email, password);
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
      console.log("[AuthProvider] LOGGING IN, Access token saved", data.accessToken);
      console.log("[AuthProvider] LOGGING IN, Refresh token saved", data.refreshToken);
      //no actualizo info de usuario pq lo hace el useEffect
    };

    const navigate = useNavigate();

    const logout = async () => {
      const res = await fetch('http://localhost:8080/auth/logout', {
        method: "POST",
        headers: { "Content-Type": "application/json" , "Authorization": `Bearer ${accessToken}` },
        body: JSON.stringify({ email: user?.email }),
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
        body: JSON.stringify({ email: user?.email, refreshToken }),
      });
          //si el refresh token expiró logout
      if (!res.ok) return logout();
  
      const data = await res.json();
      localStorage.setItem("token", data.accessToken);
      setAccessToken(data.accessToken);
    };

    // Detallamos qué pasa cuando hubo algún cambio en el token
    useEffect(() => {
      // Comprobamos si hay token, si es null no hay sesión iniciada y no se hace nada
      if (accessToken) {
        console.log('[Auth] Fetching user information with access token...');
        
        fetch('http://localhost:8080/users/me', {
          headers: { "Authorization": `Bearer ${accessToken}` },
        })
        .then(res => {
          console.log(`[Auth] User info response status: ${res.status} ${res.statusText}`);
          
          // Si la respuesta indica que expiró el access token -> se tiene que renovar el access token
          if (res.status === 401) {
            console.log('[Auth] Access token expired, attempting to refresh...');
            return refreshAccessToken();
          }
          
          if (!res.ok) {
            console.error('[Auth] Failed to fetch user information:', {
              status: res.status,
              statusText: res.statusText
            });
            throw new Error('Failed to fetch user information');
          }
          
          return res.json();
        })
        .then((data) => {
          if (data) {
            console.log('[Auth] User information retrieved successfully');
            const user = mapUser(data);
            setUser(user);
          }
        })
        .catch(error => {
          console.error('[Auth] Error in user authentication flow:', error);
          logout();
        });
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