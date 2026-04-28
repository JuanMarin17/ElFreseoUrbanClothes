/**
 * Authservice.js
 * ─────────────────────────────────────────────────────────────
 * Capa de comunicación con la API de autenticación.
 * Mock completo para email/password y Google OAuth.
 *
 * NOTA: El Google Picker ahora vive en Login.jsx como componente
 * React (Portal). Este servicio solo resuelve la cuenta elegida
 * que le pasa el componente UI, sin manipular el DOM directamente.
 * ─────────────────────────────────────────────────────────────
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

/* ─── Claves de almacenamiento ───────────────────────────────── */
const TOKEN_KEY   = 'freseo_access_token';
const REFRESH_KEY = 'freseo_refresh_token';
const USER_KEY    = 'freseo_user';

/* ─── tokenStorage ───────────────────────────────────────────── */
export const tokenStorage = {
  getAccess:  () => localStorage.getItem(TOKEN_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  getUser:    () => {
    try { return JSON.parse(localStorage.getItem(USER_KEY) ?? 'null'); }
    catch { return null; }
  },

  save: ({ accessToken, refreshToken, user }) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  },

  buildMockToken: (payload) => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body   = btoa(JSON.stringify(payload));
    const sig    = btoa('mock-signature');
    return `${header}.${body}.${sig}`;
  },

  isExpired: (token) => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return true;
      const payload = JSON.parse(atob(parts[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  },
};

/* ─── AuthError ──────────────────────────────────────────────── */
export class AuthError extends Error {
  constructor(message, status = 0, data = {}) {
    super(message);
    this.name   = 'AuthError';
    this.status = status;
    this.data   = data;
  }
}

/* ─── Fetcher base (para cuando el backend esté listo) ──────── */
async function apiFetch(endpoint, options = {}) {
  const url     = `${BASE_URL}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token   = tokenStorage.getAccess();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    const refreshed = await authService.refreshToken();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${tokenStorage.getAccess()}`;
      const retry = await fetch(url, { ...options, headers });
      return handleResponse(retry);
    }
    tokenStorage.clear();
    throw new AuthError('Sesión expirada. Por favor inicia sesión de nuevo.', 401);
  }

  return handleResponse(res);
}

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new AuthError(data.message ?? 'Error inesperado', res.status, data);
  return data;
}

/* ─── Mock data ──────────────────────────────────────────────── */
const MOCK_USERS = [
  { id: 1, nombre: 'Admin Freseo',   correo: 'admin@freseo.com',  password: 'admin123', role: 'admin', avatar: null, provider: 'email' },
  { id: 2, nombre: 'Carlos Cliente', correo: 'carlos@freseo.com', password: '123456',   role: 'user',  avatar: null, provider: 'email' },
];

function mockDelay(ms = 800) {
  return new Promise(r => setTimeout(r, ms));
}

function buildPayload(user) {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  return {
    accessToken:  tokenStorage.buildMockToken({ id: user.id, correo: user.correo, role: user.role, exp }),
    refreshToken: tokenStorage.buildMockToken({ id: user.id, type: 'refresh', exp: exp + 86400 }),
    user: {
      id:       user.id,
      nombre:   user.nombre,
      correo:   user.correo,
      role:     user.role,
      avatar:   user.avatar ?? null,
      provider: user.provider ?? 'email',
    },
  };
}

/* ─── Servicio principal ─────────────────────────────────────── */
export const authService = {

  /* ── Login con email/password ──────────────────────────────── */
  async login({ correo, password }) {
    // ── MOCK ─────────────────────────────────────────────────────
    await mockDelay();
    const found = MOCK_USERS.find(u => u.correo === correo && u.password === password);
    if (!found) throw new AuthError('Correo o contraseña incorrectos.', 401);
    const payload = buildPayload(found);
    tokenStorage.save(payload);
    return payload;
    // ── REAL (descomentar cuando el backend esté listo) ──────────
    // const data = await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ correo, password }) });
    // tokenStorage.save(data);
    // return data;
  },

  /* ── Registro ──────────────────────────────────────────────── */
  async register({ nombre, correo, password }) {
    // ── MOCK ─────────────────────────────────────────────────────
    await mockDelay();
    const exists = MOCK_USERS.find(u => u.correo === correo);
    if (exists) throw new AuthError('Este correo ya está registrado.', 409);
    const newUser = { id: MOCK_USERS.length + 1, nombre, correo, password, role: 'user', avatar: null, provider: 'email' };
    MOCK_USERS.push(newUser);
    const payload = buildPayload(newUser);
    tokenStorage.save(payload);
    return payload;
    // ── REAL ─────────────────────────────────────────────────────
    // const data = await apiFetch('/auth/register', { method: 'POST', body: JSON.stringify({ nombre, correo, password }) });
    // tokenStorage.save(data);
    // return data;
  },

  /**
   * loginWithGoogle
   * ────────────────────────────────────────────────────────────
   * El Picker de cuentas ahora es un componente React en Login.jsx.
   * Este método recibe la cuenta ya elegida por el usuario (pasada
   * desde el componente) o, si se llama sin argumento, lanza el
   * flujo OAuth real en producción.
   *
   * @param {object|null} chosenAccount  Cuenta elegida por el Picker React
   */
  async loginWithGoogle(chosenAccount = null) {
    // ── MOCK ─────────────────────────────────────────────────────
    if (!chosenAccount) throw new AuthError('No se seleccionó ninguna cuenta.', 0);

    await mockDelay(600);

    // Busca si ya existe en el mock; si no, lo registra al vuelo
    let user = MOCK_USERS.find(u => u.correo === chosenAccount.correo);
    if (!user) {
      user = { ...chosenAccount, password: null };
      MOCK_USERS.push(user);
    }

    const payload = buildPayload(user);
    tokenStorage.save(payload);
    return payload;
    // ── REAL ─────────────────────────────────────────────────────
    // const { credential } = await googleSignIn(); // @react-oauth/google
    // const data = await apiFetch('/auth/google', { method: 'POST', body: JSON.stringify({ credential }) });
    // tokenStorage.save(data);
    // return data;
  },

  /* ── Logout ────────────────────────────────────────────────── */
  async logout() {
    // try { await apiFetch('/auth/logout', { method: 'POST' }); } catch {}
    tokenStorage.clear();
  },

  /* ── Refresh token (mock siempre falla sin servidor) ───────── */
  async refreshToken() {
    const refresh = tokenStorage.getRefresh();
    if (!refresh) return false;
    try {
      // const data = await apiFetch('/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken: refresh }) });
      // tokenStorage.save(data);
      // return true;
      return false; // mock
    } catch {
      return false;
    }
  },

  /* ── Helpers de estado ─────────────────────────────────────── */
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