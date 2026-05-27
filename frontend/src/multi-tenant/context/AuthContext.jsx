/**
 * AuthContext.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Centraliza el usuario autenticado y su rol.
 *
 * ROLES POSIBLES:
 *   "SUPERADMIN"  → Ve todas las tiendas del sistema + datos técnicos (ID, status)
 *   "OWNER"       → Ve sus tiendas + puede crear nuevas
 *   "ADMIN"       → Ve tiendas asignadas + gestión básica
 *   "STAFF"       → Ve tiendas asignadas, solo lectura
 *
 * 📌 INTEGRACIÓN REAL:
 *   Reemplaza el bloque "MOCK" por tu lógica de auth real:
 *   - JWT:    const decoded = jwtDecode(localStorage.getItem("token"));
 *   - OAuth:  const { user } = useAuth0();
 *   - Supabase, Firebase, etc.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createContext, useContext, useState, useCallback } from "react";

// ─── Tipos de rol (evita strings sueltos en toda la app) ──────────────────────
export const ROLES = {
  SUPERADMIN: "SUPERADMIN",
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  STAFF: "STAFF",
};

// ─── Estado inicial ────────────────────────────────────────────────────────────
const DEFAULT_AUTH = {
  userId: null,
  name: null,
  email: null,
  role: null,
  isLogged: false,
};

const AuthContext = createContext(DEFAULT_AUTH);

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  /**
   * 🚨 MOCK — reemplazar con tu auth real
   * Ejemplos:
   *   const [auth, setAuth] = useState(() => decodeJwt(localStorage.getItem("token")));
   *   const [auth, setAuth] = useState(() => supabase.auth.user());
   */
  const [auth, setAuth] = useState({
    userId: "dbd35f9e-5745-4259-bcf7-1060574fd151", // ← reemplazar con userId real
    name: "A. Freseo",
    email: "admin@freseo.com",
    role: ROLES.SUPERADMIN, // ← reemplazar: ROLES.OWNER | ROLES.ADMIN | ROLES.STAFF
    isLogged: true,
  });

  /** Simula login — reemplazar por tu función de auth real */
  const login = useCallback((userData) => {
    setAuth({ ...userData, isLogged: true });
  }, []);

  /** Simula logout */
  const logout = useCallback(() => {
    setAuth(DEFAULT_AUTH);
    localStorage.removeItem("token"); // ajusta según tu implementación
  }, []);

  // ─── Helpers de permisos (úsalos en los componentes) ──────────────────────
  const can = {
    /** Puede ver el ID interno de la tienda */
    seeStoreId: auth.role === ROLES.SUPERADMIN,
    /** Puede ver el estado técnico (isActive, borrador) */
    seeStoreStatus: auth.role === ROLES.SUPERADMIN || auth.role === ROLES.OWNER,
    /** Puede crear tiendas */
    createStore: auth.role === ROLES.SUPERADMIN || auth.role === ROLES.OWNER,
    /** Puede gestionar usuarios de una tienda */
    manageUsers:
      auth.role === ROLES.SUPERADMIN ||
      auth.role === ROLES.OWNER ||
      auth.role === ROLES.ADMIN,
    /** Solo lectura */
    readOnly: auth.role === ROLES.STAFF,
  };

  return (
    <AuthContext.Provider value={{ ...auth, can, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useAuth = () => useContext(AuthContext);
