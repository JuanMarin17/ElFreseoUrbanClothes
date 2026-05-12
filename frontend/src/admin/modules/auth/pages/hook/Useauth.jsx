import { useState, createContext, useContext } from 'react';
import authService from '../../services/Authservice';

const AuthContext = createContext(null);

/* ─── Provider ─── */
export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [user, setUser]       = useState(() => authService.getCurrentUser());

  const extractError = (err) => err?.message || 'Ocurrió un error inesperado';

  /* ── LOGIN PASO 1 ── */
  const login = async ({ email, password }) => {
    setLoading(true);
    try {
      await authService.login({ email, password });
      return { success: true, email };
    } catch (err) {
      throw new Error(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  /* ── LOGIN PASO 2 ── */
  const verifyLoginOTP = async ({ email, code }) => {
    setLoading(true);
    try {
      const { user: userData } = await authService.loginSecondStep({ email, code });
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      throw new Error(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  /* ── REGISTER PASO 1 ── */
  const register = async ({ userName, email, password, phone }) => {
    setLoading(true);
    try {
      await authService.register({
        userName,
        email,
        phone: phone || '0000000000',
        password,
      });
      return { success: true, email };
    } catch (err) {
      throw new Error(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  /* ── REGISTER PASO 2 ── */
  const verifyRegisterOTP = async ({ email, code }) => {
    setLoading(true);
    try {
      const { user: userData } = await authService.registerSecondStep({ email, code });
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      throw new Error(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  /* ── REENVIAR CÓDIGO ── */
  const resendCode = async (email) => {
    setLoading(true);
    try {
      const data = await authService.resendCode({ email });
      return { success: true, message: data.message };
    } catch (err) {
      throw new Error(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  /* ── LOGOUT ── */
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    login,
    verifyLoginOTP,
    register,
    verifyRegisterOTP,
    resendCode,
    logout,
    loading,
    user,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/* ─── Hooks para consumir el contexto ─── */
export function useAuth() {
  return useContext(AuthContext);
}

export function useAuthContext() {
  return useContext(AuthContext);
}