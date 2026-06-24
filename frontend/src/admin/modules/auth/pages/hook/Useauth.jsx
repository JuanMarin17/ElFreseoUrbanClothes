import { useState, useEffect, createContext, useContext } from 'react';
import authService from '../../services/Authservice';

const AuthContext = createContext(null);

const DEFAULT_AVATAR = 'https://res.cloudinary.com/dz8vfcha2/image/upload/v1778672888/iconoPerfil_ixkd2j.png';

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [user, setUser]       = useState(() => authService.getCurrentUser());

  /* ── LOGIN PASO 1 ── */
  const login = async ({ email, password }) => {
    setLoading(true);
    try {
      await authService.login({ email, password });
      return { success: true, email };
    } catch (err) {
      throw err;
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
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* ── LOGIN CON GOOGLE ── */
  const loginWithGoogle = async (idToken) => {
    setLoading(true);
    try {
      const { user: userData } = await authService.loginWithGoogle({ idToken });
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      throw err;
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
        try {
          imageProfile = await authService.uploadAvatar(avatarFile);
        } catch {
          // upload fallido → avatar por defecto, el registro continúa
        }
      }

      await authService.register({ userName, email, password, phone, imageProfile });
      return { success: true, email };
    } catch (err) {
      throw err;
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
      throw err;
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
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* ── LOGOUT ── */
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  /* ── Detectar sesión cerrada / expirada automáticamente ── */
  useEffect(() => {
    if (!user) return;

    // 1. Timer exacto para cuando el JWT venza
    let expTimer;
    try {
      const jwt = localStorage.getItem('jwt');
      if (jwt && jwt !== 'null') {
        const { exp } = JSON.parse(atob(jwt.split('.')[1]));
        if (exp) {
          const ms = exp * 1000 - Date.now();
          if (ms <= 0) {
            logout();
            window.location.replace('/login');
            return;
          }
          expTimer = setTimeout(() => {
            logout();
            window.location.replace('/login');
          }, ms);
        }
      }
    } catch { /* token malformado */ }

    // 2. Chequeo cada 60 s para detectar sesión invalidada desde otro dispositivo
    const interval = setInterval(() => {
      const jwt = localStorage.getItem('jwt');
      if (!jwt || jwt === 'null') {
        logout();
        window.location.replace('/login');
        return;
      }
      try {
        const { exp } = JSON.parse(atob(jwt.split('.')[1]));
        if (exp && exp * 1000 < Date.now()) {
          logout();
          window.location.replace('/login');
        }
      } catch { /* silent */ }
    }, 60_000);

    return () => {
      clearTimeout(expTimer);
      clearInterval(interval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const value = {
    login,
    loginWithGoogle,
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