/**
 * authFetch.js
 * Shared fetch wrapper with global 401 interceptor.
 * Any 401 from any API call triggers an immediate forced logout and redirect to /login.
 */

const BASE_URL = import.meta.env.VITE_API_URL;

function decodeSessionId(jwt) {
  try {
    return JSON.parse(atob(jwt.split(".")[1])).session_id ?? null;
  } catch {
    return null;
  }
}

/**
 * Best-effort: avisa al backend que esta sesión terminó (deactivateSession),
 * para que no siga apareciendo como activa en /auth/sessions tras volver a iniciar sesión.
 * Debe llamarse ANTES de borrar el jwt de localStorage.
 */
export function notifyServerLogout() {
  const jwt = localStorage.getItem("jwt");
  if (!jwt || jwt === "null") return;
  const sessionId = decodeSessionId(jwt);
  if (!sessionId) return;
  fetch(`${BASE_URL}/auth/sessions/${sessionId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${jwt}` },
    keepalive: true,
  }).catch(() => {});
}

export function forceLogout() {
  localStorage.removeItem("jwt");
  localStorage.removeItem("userRole");
  localStorage.removeItem("storeId");
  // Hard redirect so all React state is cleared
  window.location.replace("/login");
}

/**
 * Drop-in replacement for the fetch().then(check401) pattern used in all service files.
 * Returns the fetch Response; throws nothing on 401 (instead calls forceLogout).
 */
const hadSession = () => {
  const jwt = localStorage.getItem("jwt");
  return !!jwt && jwt !== "null";
};

export async function authFetch(url, options = {}) {
  const res = await fetch(url, options);
  if (res.status === 401 && hadSession()) {
    forceLogout();
    return new Promise(() => {});
  }
  return res;
}
