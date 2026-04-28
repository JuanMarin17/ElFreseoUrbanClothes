/**
 * Useauth.jsx
 * ─────────────────────────────────────────────────────────────
 * Hook de autenticación. Provee:
 *   - login / register / loginWithGoogle / logout
 *   - user, loading, error, clearError
 *
 * IMPORTAR AuthProvider en main.jsx o App.jsx:
 *
 *   import { AuthProvider } from './components/auth/hook/Useauth';
 *
 *   <AuthProvider>
 *     <App />        ← envuelve toda tu aplicación
 *   </AuthProvider>
 *
 * CAMBIO RESPECTO A LA VERSIÓN ANTERIOR:
 *   loginWithGoogle ahora acepta un parámetro `chosenAccount`
 *   que es la cuenta seleccionada en el Picker React de Login.jsx.
 *   Esto elimina la dependencia del DOM vanilla en authService.
 * ─────────────────────────────────────────────────────────────
 */

import { useState, useCallback, createContext, useContext } from 'react';
import authService, { AuthError } from '../../services/Authservice'; // ← ajusta si cambia la ruta

/* ─── Contexto ───────────────────────────────────────────────── */
const AuthContext = createContext(null);

/* ─── AuthProvider ───────────────────────────────────────────── */
export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(() => authService.getUser());
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null); // { message: string } | null

  const clearError = useCallback(() => setError(null), []);

  /* ── Login con email + password ──────────────────────────── */
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

  /* ── Registro ────────────────────────────────────────────── */
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

  /**
   * loginWithGoogle
   * ──────────────────────────────────────────────────────────
   * Recibe la cuenta elegida en el Picker React (Login.jsx).
   * El Picker se encarga de mostrar las opciones; este hook
   * solo procesa la cuenta elegida con authService.
   *
   * @param {object} chosenAccount  { id, nombre, correo, role, avatar, provider }
   */
  const loginWithGoogle = useCallback(async (chosenAccount) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.loginWithGoogle(chosenAccount);
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

  /* ── Logout ──────────────────────────────────────────────── */
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

/* ─── useAuth ────────────────────────────────────────────────── */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}

export default useAuth;