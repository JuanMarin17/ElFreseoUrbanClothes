/**
 * authService.js
 * ─────────────────────────────────────────────────────────────
 * Capa de comunicación con la API de autenticación.
 * Cuando el backend esté listo, solo cambia BASE_URL y los
 * endpoints — el resto del código no necesita cambios.
 * ─────────────────────────────────────────────────────────────
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

// ── Claves de almacenamiento ──────────────────────────────────
const TOKEN_KEY   = 'freseo_access_token';
const REFRESH_KEY = 'freseo_refresh_token';
const USER_KEY    = 'freseo_user';

// ── Helpers de token ─────────────────────────────────────────

export const tokenStorage = {
  getAccess:      ()      => localStorage.getItem(TOKEN_KEY),
  getRefresh:     ()      => localStorage.getItem(REFRESH_KEY),
  getUser:        ()      => JSON.parse(localStorage.getItem(USER_KEY) ?? 'null'),

  save: ({ accessToken, refreshToken, user }) => {
    localStorage.setItem(TOKEN_KEY,   accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
    if (user)         localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  },

  isExpired: (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  },
};

// ── Fetcher base con manejo de errores ───────────────────────

async function apiFetch(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = tokenStorage.getAccess();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });

  // Si el token expiró, intentamos refrescarlo una vez
  if (res.status === 401) {
    const refreshed = await authService.refreshToken();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${tokenStorage.getAccess()}`;
      const retryRes = await fetch(url, { ...options, headers });
      return handleResponse(retryRes);
    }
    tokenStorage.clear();
    throw new AuthError('Sesión expirada. Por favor inicia sesión de nuevo.', 401);
  }

  return handleResponse(res);
}

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new AuthError(data.message ?? 'Error inesperado', res.status, data);
  }
  return data;
}

// ── Error tipado ─────────────────────────────────────────────

export class AuthError extends Error {
  constructor(message, status, data = {}) {
    super(message);
    this.name   = 'AuthError';
    this.status = status;
    this.data   = data;
  }
}

// ── Datos quemados (MOCK) ─────────────────────────────────────
// ⚠️  Elimina este bloque y descomenta el bloque REAL cuando
//     el backend esté disponible.

const MOCK_USERS = [
  { id: 1, nombre: 'Admin Freseo',   correo: 'admin@freseo.com',  password: 'admin123', role: 'admin' },
  { id: 2, nombre: 'Carlos Cliente', correo: 'carlos@freseo.com', password: '123456',   role: 'user'  },
];

async function mockDelay(ms = 900) {
  return new Promise(r => setTimeout(r, ms));
}

// ── Servicio principal ────────────────────────────────────────

export const authService = {

  /**
   * LOGIN
   * ─────
   * MOCK activo → elimina el bloque mock y descomenta el real.
   */
  async login({ correo, password }) {
    // ── MOCK ──────────────────────────────────────────────────
    await mockDelay();
    const found = MOCK_USERS.find(u => u.correo === correo && u.password === password);
    if (!found) throw new AuthError('Correo o contraseña incorrectos.', 401);
    const mockPayload = {
      accessToken:  `mock.access.${btoa(JSON.stringify({ id: found.id, exp: Date.now() / 1000 + 3600 }))}`,
      refreshToken: `mock.refresh.${found.id}`,
      user: { id: found.id, nombre: found.nombre, correo: found.correo, role: found.role },
    };
    tokenStorage.save(mockPayload);
    return mockPayload;
    // ── FIN MOCK ──────────────────────────────────────────────

    // ── REAL (descomentar cuando el backend esté listo) ───────
    // const data = await apiFetch('/auth/login', {
    //   method: 'POST',
    //   body: JSON.stringify({ correo, password }),
    // });
    // tokenStorage.save(data);
    // return data;
    // ── FIN REAL ──────────────────────────────────────────────
  },

  /**
   * REGISTRO
   */
  async register({ nombre, correo, password }) {
    // ── MOCK ──────────────────────────────────────────────────
    await mockDelay();
    const exists = MOCK_USERS.find(u => u.correo === correo);
    if (exists) throw new AuthError('Este correo ya está registrado.', 409);
    const newUser = { id: MOCK_USERS.length + 1, nombre, correo, password, role: 'user' };
    MOCK_USERS.push(newUser);
    const mockPayload = {
      accessToken:  `mock.access.${btoa(JSON.stringify({ id: newUser.id, exp: Date.now() / 1000 + 3600 }))}`,
      refreshToken: `mock.refresh.${newUser.id}`,
      user: { id: newUser.id, nombre: newUser.nombre, correo: newUser.correo, role: newUser.role },
    };
    tokenStorage.save(mockPayload);
    return mockPayload;
    // ── FIN MOCK ──────────────────────────────────────────────

    // ── REAL ──────────────────────────────────────────────────
    // const data = await apiFetch('/auth/register', {
    //   method: 'POST',
    //   body: JSON.stringify({ nombre, correo, password }),
    // });
    // tokenStorage.save(data);
    // return data;
    // ── FIN REAL ──────────────────────────────────────────────
  },

  /**
   * LOGOUT
   */
  async logout() {
    // ── REAL (opcional — invalida el refresh token en servidor) ─
    // try {
    //   await apiFetch('/auth/logout', { method: 'POST' });
    // } catch { /* silencioso */ }
    tokenStorage.clear();
  },

  /**
   * REFRESH TOKEN
   */
  async refreshToken() {
    const refresh = tokenStorage.getRefresh();
    if (!refresh) return false;
    try {
      // ── REAL ────────────────────────────────────────────────
      // const data = await fetch(`${BASE_URL}/auth/refresh`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ refreshToken: refresh }),
      // }).then(r => r.json());
      // tokenStorage.save(data);
      // return true;
      // ── MOCK (siempre falla — no hay servidor real) ──────────
      return false;
    } catch {
      return false;
    }
  },

  /**
   * ¿Hay sesión activa?
   */
  isAuthenticated() {
    const token = tokenStorage.getAccess();
    if (!token) return false;
    return !tokenStorage.isExpired(token);
  },

  getUser() {
    return tokenStorage.getUser();
  },
};

export default authService;