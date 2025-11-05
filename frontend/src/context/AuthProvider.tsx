import { useEffect, useState, type ReactNode, useCallback } from "react";
import { AuthContext } from './AuthContext';
import { type CurrentUser } from "./PrivateUserProfilesTypes";
import { loginApi, logoutApi, refreshAccessTokenApi } from "../services/authService";
import { getCurrentUser } from "../services/userService";
import { mapUser } from "../services/mappers/userMapper";



interface AuthProviderProps {
    children: ReactNode;

}

export function AuthProvider({ children }: AuthProviderProps) {
  // Estados globales del AuthContext.
  // Lazy init: lee tokens de localStorage una sola vez al montar.
  const [accessToken, setAccessToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [refreshToken, setRefreshToken] = useState<string | null>(() => localStorage.getItem("refreshToken"));
  const [user, setUser] = useState<CurrentUser | null>(null);

  // Inicia sesión: pide tokens al backend y los guarda en storage + estado.
  // No carga al usuario acá, lo hace el useEffect cuando detecta el nuevo token.
  const loginHandler = async (email: string, password: string) => {
    console.log("[AuthProvider] LOGGING IN with:", email, password);
    const data = await loginApi(email, password);
    localStorage.setItem("token", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);

    console.log("[AuthProvider] Login successful, tokens stored.", data.accessToken, '\n' ,data.refreshToken);
  };

  // Cierra sesión: limpia storage y estados, y luego intenta notificar al backend.
  // useCallback evita recrear la función si no cambian sus dependencias.
  const logoutHandler = useCallback(async () => {

    // 1) Limpia local (estado + localStorage)
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);

    // 2) Si aún tengo tokens en memoria, aviso al backend (best-effort).
    if (accessToken && refreshToken) {
      try {
        await logoutApi(accessToken, refreshToken, user?.email);
      } catch (error) {
        console.log("[AUTHPROVIDER] Error al deslogear:", error);
      }
    }
  }, [accessToken, refreshToken, user?.email]);

  // Refresca el access token usando el refresh token.
  // Si falla, hace logout para limpiar sesión inválida.
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

  // Actualiza campos simples del usuario en memoria (sin pegarle al backend).
  // Usa setState funcional + nullish coalescing para “conservar si no vino valor nuevo”.
  const updateUser = (newUserName: string|null, newDescription: string|null, newAvatarURL: string|null) => {
    setUser((prev) => ({
      ...prev!, // copia todo lo anterior (asumimos que prev no es null)
      username: newUserName ?? prev?.username ?? '',
      description: newDescription ?? prev?.description ?? '',
      avatarURL: newAvatarURL ?? prev?.avatarURL ?? '',
    }));
  };

  // Efecto que reacciona a cambios en accessToken:
  // - Si hay token, trae el usuario (GET /users/me).
  // - Si el token es inválido, intenta refrescarlo.
  useEffect(() => {
    if (!accessToken) return; // sin token no hay nada que hacer

    console.log("[ACTUALIZACIÓN EN ACCESS TOKEN]");
    getCurrentUser(accessToken)   // puede tirar error si el token es inválido
      .then((data) => {
        let res = mapUser(data)
        console.log("[AuthProvider] Usuario obtenido:", res);
        return res;     // mapea JSON crudo a tu tipo CurrentUser
      })
      .then((data) => {
        let res = setUser(data);
        console.log("[AuthProvider] Usuario seteado en estado:", user);
        return res;

      })              // guarda el usuario en estado
      .catch(async (err) => {     // si falla, intenta refresh
        console.log(`[Auth] ${err} Intentando refrescar token ...`);
        await refreshAccessTokenHandler();
      });

  }, [accessToken, refreshAccessTokenHandler]);

  // Expone el contexto a toda la app: tokens, usuario y handlers.
  return (
    <AuthContext.Provider value={{
      accessToken,
      refreshToken,
      user,
      login: loginHandler,
      logout: logoutHandler,
      refreshAccessToken: refreshAccessTokenHandler,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}
