import { useState, createContext, useContext } from 'react';
import authService from '../../services/Authservice';

const AuthContext = createContext(null);

const DEFAULT_AVATAR = 'https://res.cloudinary.com/dz8vfcha2/image/upload/v1778672888/iconoPerfil_ixkd2j.png';

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [user, setUser]       = useState(() => authService.getCurrentUser());

  const extractError = (err) =>
    err?.response?.data?.message || err?.message || 'Ocurrió un error inesperado';

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
  const register = async ({ userName, email, password, phone, avatarFile }) => {
    setLoading(true);
    try {
      let imageProfile = import.meta.env.VITE_DEFAULT_AVATAR || DEFAULT_AVATAR;

      if (avatarFile) {
        imageProfile = await authService.uploadAvatar(avatarFile);
      }

      await authService.register({ userName, email, password, phone, imageProfile });
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
      return { success: true, message: data?.message };
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

export function useAuth() {
  return useContext(AuthContext);
}

export function useAuthContext() {
  return useContext(AuthContext);
}