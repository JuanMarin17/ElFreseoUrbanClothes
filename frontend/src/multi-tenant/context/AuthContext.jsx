import { useState, useCallback, useEffect } from "react";
import { AuthContext } from "./authContext.js";
import { ROLES } from "./authUtils.js";
import { clearAllChatSessions } from "../../utils/chatSession.js";
import { notifyServerLogout } from "../../utils/authFetch.js";

function getUserFromJwt() {
  try {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) return null;
    const decoded = JSON.parse(atob(jwt.split(".")[1]));
    return {
      userId:   decoded.user_id ?? null,
      name:     decoded.sub     ?? null,
      email:    decoded.email   ?? null,
      role:     decoded.role    ?? ROLES.STAFF,
      isLogged: true,
    };
  } catch {
    return null;
  }
}

const EMPTY = { userId: null, name: null, email: null, role: null, isLogged: false };

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => getUserFromJwt() ?? EMPTY);

  useEffect(() => {
    const sync = () => setAuth(getUserFromJwt() ?? EMPTY);
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const login = useCallback((userData) => {
    setAuth({ ...userData, isLogged: true });
  }, []);

  const logout = useCallback(() => {
    notifyServerLogout();
    setAuth(EMPTY);
    localStorage.removeItem("jwt");
    clearAllChatSessions();
  }, []);

  const can = {
    seeStoreId:     auth.role === ROLES.SUPERADMIN,
    seeStoreStatus: auth.role === ROLES.SUPERADMIN || auth.role === ROLES.OWNER,
    createStore:    auth.role === ROLES.SUPERADMIN || auth.role === ROLES.OWNER,
    manageUsers:    auth.role === ROLES.SUPERADMIN || auth.role === ROLES.OWNER || auth.role === ROLES.ADMIN,
    readOnly:       auth.role === ROLES.STAFF,
  };

  return (
    <AuthContext.Provider value={{ ...auth, can, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

