/**
 * useAuth.js
 * ─────────────────────────────────────────────────────────────
 * Hook centralizado de autenticación.
 * Úsalo en cualquier componente:
 *
 *   const { user, login, register, logout, loading, error } = useAuth();
 * ─────────────────────────────────────────────────────────────
 */

import { useState, useCallback } from 'react';
import { authService, AuthError } from '../../services/Authservice';

export function useAuth() {
  const [user, setUser] = useState(() => authService.getUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);  // { message, status }

  const clearError = useCallback(() => setError(null), []);

  // ── LOGIN ──────────────────────────────────────────────────
  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const { user: loggedUser } = await authService.login(credentials);
      setUser(loggedUser);
      return { success: true, user: loggedUser };
    } catch (err) {
      const msg = err instanceof AuthError ? err.message : 'Error al iniciar sesión.';
      setError({ message: msg, status: err.status ?? 0 });
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  // ── REGISTRO ───────────────────────────────────────────────
  const register = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const { user: newUser } = await authService.register(data);
      setUser(newUser);
      return { success: true, user: newUser };
    } catch (err) {
      const msg = err instanceof AuthError ? err.message : 'Error al registrarse.';
      setError({ message: msg, status: err.status ?? 0 });
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  // ── LOGOUT ─────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setError(null);
  }, []);

  return {
    user,
    isAuthenticated: !!user && authService.isAuthenticated(),
    loading,
    error,
    clearError,
    login,
    register,
    logout,
  };
}
