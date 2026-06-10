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

  if (!res.ok) {
    let message = `HTTP_${res.status}`;
    try { message = (await res.json()).message || message; } catch { /* silent */ }
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

/**
 * GET /stores/{storeId}/users
 * Array<StoreUserResponseDTO>
 */
export const getMembers = () => {
  const storeId = localStorage.getItem('storeId');
  return apiFetch(`/stores/${storeId}/users`);
};

/**
 * PATCH /stores/{storeId}/members/{userId}/toggle-status
 * Returns updated StoreUserResponseDTO
 */
export const toggleMemberStatus = (userId) => {
  const storeId = localStorage.getItem('storeId');
  return apiFetch(`/stores/${storeId}/members/${userId}/toggle-status`, {
    method: 'PATCH',
  });
};

/**
 * POST /stores/users
 * Body: { userId, storeId, role: "ADMIN" }
 */
export const addMember = (userId) => {
  const storeId = localStorage.getItem('storeId');
  return apiFetch('/stores/users', {
    method: 'POST',
    body:   JSON.stringify({ userId, storeId, role: 'ADMIN' }),
  });
};
