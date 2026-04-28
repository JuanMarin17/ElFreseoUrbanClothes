import {
  useState,
  useCallback,
  createContext,
  useContext,
  useEffect,
} from "react";
import authService, { AuthError } from "../../services/Authservice";

// ── Contexto ──────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => setError(null), []);

  // 🔥 SINCRONIZAR USUARIO AL INICIAR APP
  useEffect(() => {
    const storedUser = authService.getUser();
    setUser(storedUser);
  }, []);

  // ── Login ───────────────────────────────────────────────
  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);

    try {
      const data = await authService.login(credentials);
      setUser(data.user);

      return { success: true, user: data.user };
    } catch (err) {
      const msg =
        err instanceof AuthError ? err.message : "Error al iniciar sesión.";
      setError({ message: msg });

      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Register ────────────────────────────────────────────
  const register = useCallback(async (info) => {
    setLoading(true);
    setError(null);

    try {
      const data = await authService.register(info);
      setUser(data.user);

      return { success: true, user: data.user };
    } catch (err) {
      const msg =
        err instanceof AuthError ? err.message : "Error al crear la cuenta.";
      setError({ message: msg });

      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Logout ──────────────────────────────────────────────
  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  // 🔥 ESCUCHAR LOGOUT AUTOMÁTICO (IMPORTANTE)
  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem("freseo_access_token");

      if (!token) {
        setUser(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        clearError,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}


