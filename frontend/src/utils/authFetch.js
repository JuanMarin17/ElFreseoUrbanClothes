/**
 * authFetch.js
 * Shared fetch wrapper with global 401 interceptor.
 * Any 401 from any API call triggers an immediate forced logout and redirect to /login.
 */

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
