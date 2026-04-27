/**
 * authService.js
 * ─────────────────────────────────────────────────────────────
 * Capa de comunicación con la API de autenticación.
 * Incluye mock completo para email/password y Google OAuth.
 * ─────────────────────────────────────────────────────────────
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

// ── Claves de almacenamiento ──────────────────────────────────
const TOKEN_KEY   = 'freseo_access_token';
const REFRESH_KEY = 'freseo_refresh_token';
const USER_KEY    = 'freseo_user';

// ── Helpers de token ──────────────────────────────────────────

export const tokenStorage = {
  getAccess:  () => localStorage.getItem(TOKEN_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  getUser:    () => JSON.parse(localStorage.getItem(USER_KEY) ?? 'null'),

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

// ── Error tipado ──────────────────────────────────────────────

export class AuthError extends Error {
  constructor(message, status, data = {}) {
    super(message);
    this.name   = 'AuthError';
    this.status = status;
    this.data   = data;
  }
}

// ── Fetcher base ──────────────────────────────────────────────

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
  if (!res.ok) throw new AuthError(data.message ?? 'Error inesperado', res.status, data);
  return data;
}

// ── Datos mock ────────────────────────────────────────────────

const MOCK_USERS = [
  { id: 1, nombre: 'Admin Freseo',   correo: 'admin@freseo.com',  password: 'admin123', role: 'admin', avatar: null, provider: 'email' },
  { id: 2, nombre: 'Carlos Cliente', correo: 'carlos@freseo.com', password: '123456',   role: 'user',  avatar: null, provider: 'email' },
];

// Cuentas Google mock — se "seleccionan" en el popup fake
const MOCK_GOOGLE_ACCOUNTS = [
  {
    id: 'g-001',
    nombre: 'Juan Dev',
    correo: 'juandev@gmail.com',
    role: 'user',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=juandev',
    provider: 'google',
  },
  {
    id: 'g-002',
    nombre: 'María Freseo',
    correo: 'maria@gmail.com',
    role: 'user',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=maria',
    provider: 'google',
  },
];

function mockDelay(ms = 800) {
  return new Promise(r => setTimeout(r, ms));
}

function buildPayload(user) {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  return {
    accessToken:  tokenStorage.buildMockToken({ id: user.id, correo: user.correo, role: user.role, exp }),
    refreshToken: tokenStorage.buildMockToken({ id: user.id, type: 'refresh', exp: exp + 86400 }),
    user: { id: user.id, nombre: user.nombre, correo: user.correo, role: user.role, avatar: user.avatar ?? null, provider: user.provider ?? 'email' },
  };
}

/**
 * Muestra un popup modal nativo (sin dependencias externas) para
 * simular la selección de cuenta de Google.
 * Devuelve la cuenta elegida o null si cancela.
 */
function showGoogleAccountPicker() {
  return new Promise((resolve) => {
    // Overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position:fixed;inset:0;z-index:9999;
      background:rgba(0,0,0,0.72);backdrop-filter:blur(6px);
      display:flex;align-items:center;justify-content:center;
      animation:fadeInOverlay .2s ease both;
    `;

    // Inyectar keyframes si no existen
    if (!document.getElementById('_gp_kf')) {
      const s = document.createElement('style');
      s.id = '_gp_kf';
      s.textContent = `
        @keyframes fadeInOverlay{from{opacity:0}to{opacity:1}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
      `;
      document.head.appendChild(s);
    }

    // Card
    const card = document.createElement('div');
    card.style.cssText = `
      background:#1e2a3a;border:1px solid rgba(255,255,255,.08);
      border-radius:20px;padding:28px 24px 20px;width:340px;max-width:92vw;
      box-shadow:0 32px 80px rgba(0,0,0,.7);
      animation:slideUp .28s cubic-bezier(.22,1,.36,1) both;
      font-family:'Outfit',sans-serif;
    `;

    // Header
    const header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:20px;';
    header.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      <span style="font-size:15px;font-weight:600;color:#e8f0fe;">Elige una cuenta de Google</span>
    `;

    card.appendChild(header);

    // Accounts
    MOCK_GOOGLE_ACCOUNTS.forEach((acc) => {
      const btn = document.createElement('button');
      btn.style.cssText = `
        width:100%;display:flex;align-items:center;gap:12px;
        background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);
        border-radius:12px;padding:10px 12px;cursor:pointer;
        margin-bottom:8px;transition:background .15s,border-color .15s;
      `;
      btn.onmouseenter = () => { btn.style.background = 'rgba(0,230,180,.08)'; btn.style.borderColor = 'rgba(0,230,180,.3)'; };
      btn.onmouseleave = () => { btn.style.background = 'rgba(255,255,255,.04)'; btn.style.borderColor = 'rgba(255,255,255,.07)'; };
      btn.innerHTML = `
        <img src="${acc.avatar}" alt="" width="36" height="36"
          style="border-radius:50%;background:#2a3a4a;flex-shrink:0;"
          onerror="this.style.display='none'">
        <div style="text-align:left;">
          <div style="font-size:14px;font-weight:600;color:#e8f0fe;">${acc.nombre}</div>
          <div style="font-size:12px;color:rgba(232,240,254,.45);">${acc.correo}</div>
        </div>
      `;
      btn.onclick = () => { document.body.removeChild(overlay); resolve(acc); };
      card.appendChild(btn);
    });

    // Cancel
    const cancel = document.createElement('button');
    cancel.textContent = 'Cancelar';
    cancel.style.cssText = `
      width:100%;margin-top:4px;background:none;border:none;
      color:rgba(232,240,254,.38);font-family:'Outfit',sans-serif;
      font-size:13px;cursor:pointer;padding:8px;border-radius:8px;
      transition:color .15s;
    `;
    cancel.onmouseenter = () => { cancel.style.color = 'rgba(232,240,254,.7)'; };
    cancel.onmouseleave = () => { cancel.style.color = 'rgba(232,240,254,.38)'; };
    cancel.onclick = () => { document.body.removeChild(overlay); resolve(null); };
    card.appendChild(cancel);

    overlay.appendChild(card);
    overlay.onclick = (e) => { if (e.target === overlay) { document.body.removeChild(overlay); resolve(null); } };
    document.body.appendChild(overlay);
  });
}

// ── Servicio principal ────────────────────────────────────────

export const authService = {

  async login({ correo, password }) {
    // ── MOCK ─────────────────────────────────────────────────
    await mockDelay();
    const found = MOCK_USERS.find(u => u.correo === correo && u.password === password);
    if (!found) throw new AuthError('Correo o contraseña incorrectos.', 401);
    const payload = buildPayload(found);
    tokenStorage.save(payload);
    return payload;
    // ── REAL (descomentar cuando el backend esté listo) ───────
    // const data = await apiFetch('/auth/login', { method:'POST', body: JSON.stringify({correo,password}) });
    // tokenStorage.save(data); return data;
  },

  async register({ nombre, correo, password }) {
    // ── MOCK ─────────────────────────────────────────────────
    await mockDelay();
    const exists = MOCK_USERS.find(u => u.correo === correo);
    if (exists) throw new AuthError('Este correo ya está registrado.', 409);
    const newUser = { id: MOCK_USERS.length + 1, nombre, correo, password, role: 'user', provider: 'email' };
    MOCK_USERS.push(newUser);
    const payload = buildPayload(newUser);
    tokenStorage.save(payload);
    return payload;
    // ── REAL ──────────────────────────────────────────────────
    // const data = await apiFetch('/auth/register', { method:'POST', body: JSON.stringify({nombre,correo,password}) });
    // tokenStorage.save(data); return data;
  },

  async loginWithGoogle() {
    // ── MOCK ─────────────────────────────────────────────────
    // Muestra el selector de cuenta falso
    const chosen = await showGoogleAccountPicker();
    if (!chosen) throw new AuthError('Inicio de sesión cancelado.', 0);

    await mockDelay(600);

    // Busca si ya existe; si no, lo registra al vuelo
    let user = MOCK_USERS.find(u => u.correo === chosen.correo);
    if (!user) {
      user = { ...chosen, password: null };
      MOCK_USERS.push(user);
    }

    const payload = buildPayload(user);
    tokenStorage.save(payload);
    return payload;
    // ── REAL ──────────────────────────────────────────────────
    // Aquí harías el redirect a Google OAuth o usarías @react-oauth/google
    // const { credential } = await googleSignIn();
    // const data = await apiFetch('/auth/google', { method:'POST', body: JSON.stringify({credential}) });
    // tokenStorage.save(data); return data;
  },

  async logout() {
    // try { await apiFetch('/auth/logout', { method: 'POST' }); } catch {}
    tokenStorage.clear();
  },

  async refreshToken() {
    const refresh = tokenStorage.getRefresh();
    if (!refresh) return false;
    try {
      return false; // Mock siempre falla (sin servidor)
    } catch {
      return false;
    }
  },

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