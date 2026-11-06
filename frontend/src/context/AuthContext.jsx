import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { getMeApi, loginApi } from "../api/user";
import { getTokens, setTokens, removeTokens } from "../api/token";
export const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState("");
  const version = useRef(0);
  const logout = useCallback(() => {
    version.current++;
    removeTokens();
    setAuth(null);
    setSessionError("");
  }, []);
  const restore = useCallback(async () => {
    const current = ++version.current;
    setLoading(true);
    setSessionError("");
    if (!getTokens()?.access) {
      setAuth(null);
      setLoading(false);
      return;
    }
    try {
      const me = await getMeApi();
      if (current === version.current) setAuth({ me });
    } catch (error) {
      if (current === version.current) {
        setAuth(null);
        if (error.status === 401) removeTokens();
        else
          setSessionError(
            "No se pudo verificar tu sesión. Revisa que Django esté en ejecución e intenta de nuevo.",
          );
      }
    } finally {
      if (current === version.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    restore();
    const onStorage = () => restore();
    window.addEventListener("storage", onStorage);
    return () => {
      version.current++;
      window.removeEventListener("storage", onStorage);
    };
  }, [restore]);
  const login = async (values) => {
    const tokens = await loginApi(values);
    setTokens(tokens);
    try {
      const me = await getMeApi();
      setAuth({ me });
      setSessionError("");
    } catch (error) {
      removeTokens();
      throw error;
    }
    if (import.meta.env.DEV)
      console.info(
        "[TecnoAula] JWT obtenido. Access:",
        `${tokens.access.slice(0, 32)}...`,
        "| Vigencia: 15 minutos.",
      );
  };
  return (
    <AuthContext.Provider
      value={{ auth, loading, login, logout, sessionError, restore }}
    >
      {children}
    </AuthContext.Provider>
  );
}
