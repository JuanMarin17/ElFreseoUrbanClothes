import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../../services/Authservice';

/* ─────────────────────────────────────────────
   AuthContext — contexto global de autenticación
   
   Proveedor:
     AuthProvider envuelve la app y expone:
       - user: datos del usuario logueado
       - loading: estado de carga
       - isAuthenticated: boolean
       - login, logout, etc. (delegados de useAuth)
───────────────────────────────────────────────── */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Cargar usuario inicial desde localStorage
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        setLoading(false);
    }, []);

    const login = async ({ correo, password }) => {
        setLoading(true);
        try {
            await authService.login({ email: correo, password });
            return { success: true, email: correo };
        } catch (err) {
            const msg = err.response?.data?.message || 'Correo o contraseña incorrectos';
            throw new Error(msg);
        } finally {
            setLoading(false);
        }
    };

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

    const register = async ({ nombre, correo, password, phone }) => {
        setLoading(true);
        try {
            await authService.register({
                userName: nombre,
                email: correo,
                phone: phone || '0000000000',
                password,
            });
            return { success: true, email: correo };
        } catch (err) {
            const msg = err.response?.data?.message || 'Error al registrar el usuario';
            throw new Error(msg);
        } finally {
            setLoading(false);
        }
    };

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

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        verifyLoginOTP,
        register,
        verifyRegisterOTP,
        resendCode,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

/* ─────────────────────────────────────────────
   Hook para usar el contexto en cualquier componente
───────────────────────────────────────────────── */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
}