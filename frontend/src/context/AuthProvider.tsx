import { PAGES_ROUTE } from "../constants/Pages";
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, type ReactNode, useCallback } from "react";
import { AuthContext } from './AuthContext';
import { type CommonUsersInformation } from "../types/user";
import { login, logout, refreshAccessToken } from "../services/authService";
import { getCurrentUser } from "../services/userService";
import { mapUser } from "../services/mappers/userMapper";

interface AuthProviderProps {
    children: ReactNode;
  }
  //OJO: Chequear que el login solo devuelve los tokens
  export function AuthProvider({ children }: AuthProviderProps) {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      const [accessToken, setAccessToken] = useState<string | null>(() => localStorage.getItem("token"));
      const [refreshToken, setRefreshToken] = useState<string | null>(() => localStorage.getItem("refreshToken"));
      const [user, setUser] = useState<CommonUsersInformation | null>(null);
  
      const loginHandler = async (email: string, password: string) => {
        console.log("[AuthProvider] LOGGING IN with:", email, password);
        const data = await login(email, password);
        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        setAccessToken(data.accessToken);
        setRefreshToken(data.refreshToken);
        //no actualizo info de usuario pq lo hace el useEffect
        console.log("[AuthProvider] LOGGING IN, Access token saved", data.accessToken);
        console.log("[AuthProvider] LOGGING IN, Refresh token saved", data.refreshToken);
      };
      const navigate = useNavigate();

      const logoutHandler = useCallback(async () => {

        console.log("Deslogeando");
        if (accessToken && refreshToken) {
          try{
            await logout(accessToken, refreshToken, user?.email ?? 'NO HAY EMAIL');
          } catch {
            console.log("[AUTHPROVIDER] Error al deslogear (porque el token expiró");
          }
        }
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        setAccessToken(null);
        setRefreshToken(null);
        setUser(null);
        navigate(PAGES_ROUTE.root);
      }, [accessToken, refreshToken, user?.email, navigate]);
    
      const refreshAccessTokenHandler = useCallback(async () => {
        if (!accessToken || !refreshToken) return;
        try {
            const data = await refreshAccessToken(accessToken, refreshToken, user?.email);
            localStorage.setItem('token', data.accessToken);
            setAccessToken(data.accessToken);
        } catch {
          console.log("[AUTHPROVIDER] Error al refrescar token estamos haciendo logout en el catch");
            logoutHandler();
        }
      }, [accessToken, refreshToken, user?.email, logoutHandler]);

      useEffect(() => {
        //siempre que haya un token seteado se está saliendo
        if (!accessToken) return;

        console.log("[ACTUALIZACIÓN EN ACCESS TOKEN]")
        getCurrentUser(accessToken)//tira excepción si el token es inválido
          .then(mapUser)
          .then(setUser)
          .catch(async (err) => {
            console.log(`[Auth] ${err} Intentando refrescar token ...`);
            await refreshAccessTokenHandler();
          });
      }, [accessToken]);
  
      return (
        <AuthContext.Provider value={{ token: accessToken, refreshToken, user, login: loginHandler, logout: logoutHandler, refreshAccessToken: refreshAccessTokenHandler }}>
          {children}
        </AuthContext.Provider>
      );
    }

