// ─────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api/v1";

const TOKEN_KEY = "freseo_access_token";
const USER_KEY = "freseo_user";

// ─────────────────────────────────────────────
// STORAGE
// ─────────────────────────────────────────────
export const tokenStorage = {
  getAccess: () => localStorage.getItem(TOKEN_KEY),

  getUser: () => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) ?? "null");
    } catch {
      return null;
    }
  },

  save: ({ accessToken, user }) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

// ─────────────────────────────────────────────
// JWT HELPERS
// ─────────────────────────────────────────────
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

function getTimeToExpire(token) {
  const payload = parseJwt(token);
  if (!payload) return 0;
  return payload.exp * 1000 - Date.now();
}

// ─────────────────────────────────────────────
// ERROR
// ─────────────────────────────────────────────
export class AuthError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// ─────────────────────────────────────────────
// CONTROL REFRESH (ANTI DUPLICADOS)
// ─────────────────────────────────────────────
let isRefreshing = false;
let refreshPromise = null;

async function safeRefresh() {
  if (isRefreshing) return refreshPromise;

  isRefreshing = true;

  refreshPromise = (async () => {
    try {
      return await authService.refreshToken();
    } finally {
      isRefreshing = false;
    }
  })();

  return refreshPromise;
}

// ─────────────────────────────────────────────
// FETCH PRO
// ─────────────────────────────────────────────
async function apiFetch(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  let token = tokenStorage.getAccess();

  // 🔴 1. SIN TOKEN
  if (!token) {
    tokenStorage.clear();
    window.location.href = "/login";
    throw new AuthError("No autenticado", 401);
  }

  const timeLeft = getTimeToExpire(token);

  // 🔴 2. EXPIRADO
  if (timeLeft <= 0) {
    tokenStorage.clear();
    window.location.href = "/login";
    throw new AuthError("Token expirado", 401);
  }

  // 🟡 3. REFRESH AUTOMÁTICO (10 min)
  if (timeLeft <= 10 * 60 * 1000) {
    const refreshed = await safeRefresh();

    if (!refreshed) {
      tokenStorage.clear();
      window.location.href = "/login";
      throw new AuthError("No se pudo refrescar", 401);
    }

    token = tokenStorage.getAccess();
  }

  // 🟢 4. REQUEST NORMAL
  headers["Authorization"] = `Bearer ${token}`;

  let res = await fetch(url, { ...options, headers });

  // 🔁 5. FALLBACK 401
  if (res.status === 401) {
    const refreshed = await safeRefresh();

    if (refreshed) {
      const newToken = tokenStorage.getAccess();
      headers["Authorization"] = `Bearer ${newToken}`;

      res = await fetch(url, { ...options, headers });
    } else {
      tokenStorage.clear();
      window.location.href = "/login";
      throw new AuthError("Sesión expirada", 401);
    }
  }

  return handleResponse(res);
}

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new AuthError(data.message || "Error", res.status);
  return data;
}

// ─────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────
export const authService = {
  // 🔐 LOGIN
  async login({ email, password }) {
    const res = await fetch(`${BASE_URL}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new AuthError(data.message || "Credenciales inválidas", res.status);

    tokenStorage.save(data);
    return data;
  },

  // 📝 REGISTER
  async register({ userName, email, password, phone }) {
    const res = await fetch(`${BASE_URL}/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userName, email, password, phone }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new AuthError(data.message || "Error en registro", res.status);

    tokenStorage.save(data);
    return data;
  },

  // 🚪 LOGOUT
  async logout() {
    tokenStorage.clear();
    window.location.href = "/login";
  },

  // 🔄 REFRESH TOKEN (MISMO TOKEN SOBREESCRITO)
  async refreshToken() {
    const token = tokenStorage.getAccess();
    if (!token) return false;

    try {
      const res = await fetch(`${BASE_URL}/users/refresh`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) return false;

      const data = await res.json();

      tokenStorage.save({
        accessToken: data.accessToken,
        user: tokenStorage.getUser(),
      });

      return true;
    } catch {
      return false;
    }
  },

  getUser() {
    return tokenStorage.getUser();
  },

  apiFetch, // 👈 exportas para usarlo en otros módulos
};

export default authService;
