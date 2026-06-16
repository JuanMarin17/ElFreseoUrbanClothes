const BASE = import.meta.env.VITE_API_URL ?? '/api/v1';

function buildHeaders() {
  const jwt     = localStorage.getItem('jwt') ?? '';
  const storeId = localStorage.getItem('storeId') ?? '';
  let userId = '', role = 'ADMIN';
  if (jwt) {
    try {
      const decoded = JSON.parse(atob(jwt.split('.')[1]));
      userId = decoded.user_id ?? '';
      role   = decoded.role    ?? 'ADMIN';
    } catch { /* silent */ }
  }
  return {
    'Content-Type': 'application/json',
    Authorization:  `Bearer ${jwt}`,
    'X-Store-Id':   storeId,
    'X-User-Id':    userId,
    'X-User-Role':  role,
  };
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { ...buildHeaders(), ...(options.headers ?? {}) },
  });

  if (res.status === 204) return null;

  if (!res.ok) {
    let message = `HTTP_${res.status}`;
    try {
      const ct = res.headers.get('Content-Type') ?? '';
      if (ct.includes('application/json')) {
        const body = await res.json();
        message = body.message ?? body.error ?? message;
      } else {
        const text = await res.text();
        if (text) message = text.slice(0, 200);
      }
    } catch { /* silent */ }
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  const ct = res.headers.get('Content-Type') ?? '';
  if (ct.includes('application/json')) return res.json();
  // Endpoint /isOwner devuelve string plano (ej. "OWNER")
  return res.text();
}

/**
 * GET /stores/{storeId}/users
 * Lista todos los miembros de la tienda.
 * @returns {Promise<StoreUserResponseDTO[]>}
 */
export const getMembers = () => {
  const storeId = localStorage.getItem('storeId');
  return apiFetch(`/stores/${storeId}/users`);
};

/**
 * PATCH /stores/{storeId}/members/{userId}/toggle-status
 * Activa o desactiva un miembro. No aplica al OWNER.
 * @returns {Promise<StoreUserResponseDTO>}
 */
export const toggleMemberStatus = (userId) => {
  const storeId = localStorage.getItem('storeId');
  return apiFetch(`/stores/${storeId}/members/${userId}/toggle-status`, {
    method: 'PATCH',
  });
};

/**
 * POST /stores/users
 * Agrega un usuario a la tienda con rol ADMIN.
 * @param {string} userId UUID del usuario a agregar
 * @returns {Promise<StoreUserResponseDTO>}
 */
export const addMember = (userId) => {
  const storeId = localStorage.getItem('storeId');
  return apiFetch('/stores/users', {
    method: 'POST',
    body:   JSON.stringify({ userId, storeId, role: 'ADMIN' }),
  });
};

/**
 * GET /stores/{storeId}/access/{userId}
 * Verifica si el usuario tiene acceso a la tienda.
 * @returns {Promise<{ hasAccess: boolean }>}
 */
export const checkAccess = (storeId, userId) =>
  apiFetch(`/stores/${storeId}/access/${userId}`);

/**
 * GET /stores/{storeId}/isOwner/{userId}
 * Devuelve el rol del usuario en la tienda como string plano ("OWNER" | "ADMIN").
 * Lanza error si el usuario no pertenece a la tienda (500 del backend).
 * @returns {Promise<"OWNER" | "ADMIN">}
 */
export const getUserRole = (storeId, userId) =>
  apiFetch(`/stores/${storeId}/isOwner/${userId}`);

/**
 * GET /stores/users/{userId}
 * Lista las tiendas a las que pertenece el usuario.
 * userName y userEmail vienen null en este endpoint.
 * @returns {Promise<StoreUserResponseDTO[]>}
 */
export const getStoresByUser = (userId) =>
  apiFetch(`/stores/users/${userId}`);
