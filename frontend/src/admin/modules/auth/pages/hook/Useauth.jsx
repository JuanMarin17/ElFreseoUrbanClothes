/**
 * useAuth.jsx   ← extensión .jsx para que Vite/OXC procese JSX
 * ─────────────────────────────────────────────────────────────
 * Hook de autenticación con soporte para:
 *   - Login / Register con email + password (mock)
 *   - Login con Google (mock)
 *   - Logout
 * ─────────────────────────────────────────────────────────────
 */

import { useState, useCallback, createContext, useContext } from 'react';
import authService, { AuthError } from '../../services/Authservice';

// ── Contexto ──────────────────────────────────────────────────

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(() => authService.getUser());
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null); // { message: string }

  const clearError = useCallback(() => setError(null), []);

  // ── Login con correo + password ───────────────────────────
  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.login(credentials);
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (err) {
      const msg = err instanceof AuthError ? err.message : 'Error al iniciar sesión.';
      setError({ message: msg });
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Registro ──────────────────────────────────────────────
  const register = useCallback(async (info) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.register(info);
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (err) {
      const msg = err instanceof AuthError ? err.message : 'Error al crear la cuenta.';
      setError({ message: msg });
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Login con Google (mock) ───────────────────────────────
  const loginWithGoogle = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.loginWithGoogle();
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (err) {
      const msg = err instanceof AuthError ? err.message : 'Error al iniciar sesión con Google.';
      setError({ message: msg });
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Logout ────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, clearError, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}

export default useAuth;