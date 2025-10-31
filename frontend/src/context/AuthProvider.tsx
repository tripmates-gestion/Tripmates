import { useEffect, useState, type ReactNode, useCallback } from "react";
import { AuthContext } from './AuthContext';
import { type CommonUsersInformation } from "../types/CommonUserInfo";
import { loginApi, logoutApi, refreshAccessTokenApi } from "../services/authService";
import { getCurrentUser } from "../services/userService";
import { mapUser } from "../services/mappers/userMapper";

interface AuthProviderProps {
    children: ReactNode;
  }
export function AuthProvider({ children }: AuthProviderProps) {
  const [accessToken, setAccessToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [refreshToken, setRefreshToken] = useState<string | null>(() => localStorage.getItem("refreshToken"));
  const [user, setUser] = useState<CommonUsersInformation | null>(null);

  const loginHandler = async (email: string, password: string) => {
    console.log("[AuthProvider] LOGGING IN with:", email, password);
    const data = await loginApi(email, password);
    console.log("[AuthProvider] LOGGING IN, Access token antes", localStorage.getItem("token"));
    console.log("[AuthProvider] LOGGING IN, Refresh token antes", localStorage.getItem("refreshToken"));
    localStorage.setItem("token", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    //no actualizo info de usuario pq lo hace el useEffect
    console.log("[AuthProvider] LOGGING IN, Access token despues", data.accessToken);
    console.log("[AuthProvider] LOGGING IN, Refresh token despues", data.refreshToken);
  };

  const logoutHandler = useCallback(async () => {
    console.log("[AuthProvider] Deslogeando");
    // Clear tokens from state and storage first
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    // Make the API call last, but don't wait for it
    if (accessToken && refreshToken) {
      try {
        await logoutApi(accessToken, refreshToken, user?.email);
      } catch (error) {
        console.log("[AUTHPROVIDER] Error al deslogear:", error);
      }
    }
  }, [accessToken, refreshToken, user?.email]);

  const refreshAccessTokenHandler = useCallback(async () => {
    if (!accessToken || !refreshToken) return;
    try {
      const data = await refreshAccessTokenApi(accessToken, refreshToken, user?.email);
      localStorage.setItem('token', data.accessToken);
      setAccessToken(data.accessToken);
    } catch {
      console.log("[AUTHPROVIDER] Error al refrescar token estamos haciendo logout en el catch");
      logoutHandler();
    }
  }, [accessToken, refreshToken, user?.email, logoutHandler]);

  const updateUser = (newUserName: string|null, newDescription: string|null, newAvatarURL: string|null  ) => {
    setUser((prev) => ({
      ...prev!,
      username: newUserName ?? prev?.username ?? '',
      description: newDescription ?? prev?.description ?? '',
      avatarURL: newAvatarURL ?? prev?.avatarURL ?? '',
    }));
  };
  

  useEffect(() => {
    //siempre que no haya un token seteado se está saliendo
    if (!accessToken) return;

    console.log("[ACTUALIZACIÓN EN ACCESS TOKEN]")
    getCurrentUser(accessToken)//tira excepción si el token es inválido
      .then(mapUser)
      .then(setUser)
      .catch(async (err) => {
        console.log(`[Auth] ${err} Intentando refrescar token ...`);
        await refreshAccessTokenHandler();
      });
  }, [accessToken, refreshAccessTokenHandler]);

  return (
    <AuthContext.Provider value={{ token: accessToken, refreshToken, user, login: loginHandler, logout: logoutHandler, refreshAccessToken: refreshAccessTokenHandler, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

