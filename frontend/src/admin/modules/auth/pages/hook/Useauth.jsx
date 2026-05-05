import { useState } from 'react';
import authService from '../../services/Authservice';

/* ─────────────────────────────────────────────
   useAuth — hook que conecta Login.jsx con el backend

   Expone:
     login(email, password)       → llama paso 1 del login
     verifyLoginOTP(email, code)  → llama paso 2 del login
     register(...)                → llama paso 1 del registro
     verifyRegisterOTP(...)       → llama paso 2 del registro
     resendCode(email)            → reenvía el código OTP
     loading                      → true mientras espera respuesta
     user                         → datos del usuario logueado (del JWT)
     logout()                     → cierra sesión
───────────────────────────────────────────────── */
export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(() => authService.getCurrentUser());

  /* ── LOGIN PASO 1
     Devuelve: { success: true, email } */
  const login = async ({ email, password }) => {
    setLoading(true);
    try {
      await authService.login({ email: email, password });
      return { success: true, email: email };
    } catch (err) {
      const msg = err.response?.data?.message || 'Correo o contraseña incorrectos';
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ── LOGIN PASO 2
     Devuelve: { success: true, user } */
  const verifyLoginOTP = async ({ email, code }) => {
    setLoading(true);
    try {
      const { user: userData } = await authService.loginSecondStep({ email, code });
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      const msg = err.response?.data?.message || 'Código inválido o expirado';
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ── REGISTER PASO 1
     Devuelve: { success: true, email } */
  const register = async ({ userName, email, password, phone }) => {
    setLoading(true);
    try {
      await authService.register({
        userName: userName,
        email: email,
        phone: phone || '0000000000',
        password,
      });
      return { success: true, email: email };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al registrar el usuario';
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ── REGISTER PASO 2
     Devuelve: { success: true, user } */
  const verifyRegisterOTP = async ({ email, code }) => {
    setLoading(true);
    try {
      const { user: userData } = await authService.registerSecondStep({ email, code });
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      const msg = err.response?.data?.message || 'Código inválido o expirado';
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ── REENVIAR CÓDIGO */
  const resendCode = async (email) => {
    setLoading(true);
    try {
      const data = await authService.resendCode({ email });
      return { success: true, message: data.message };
    } catch (err) {
      throw new Error('No se pudo reenviar el código');
    } finally {
      setLoading(false);
    }
  };

  /* ── LOGOUT */
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return {
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
}