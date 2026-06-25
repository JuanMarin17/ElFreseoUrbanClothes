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

async function apiFetch(path, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(new Error("El servidor no respondió a tiempo. Intenta de nuevo.")),
    timeoutMs,
  );
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...options,
      signal: controller.signal,
      headers: { ...buildHeaders(), ...(options.headers ?? {}) },
    });
  } finally {
    clearTimeout(timer);
  }

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
 * GET /stores/{storeId}/orders/admin/all
 * Normaliza la respuesta del backend sin importar si viene como:
 *   { content, totalElements }  |  { data: { content, totalElements } }  |  { data: [] }  |  []
 */
export const getOrders = async ({ status, page = 0, size = 20 } = {}) => {
  const storeId = localStorage.getItem('storeId');
  const params  = new URLSearchParams({ page, size });
  if (status) params.set('status', status);
  const raw = await apiFetch(`/stores/${storeId}/orders/admin/all?${params}`);

  // Desenvuelve { data: ... } si el backend lo envuelve así
  const payload = raw?.data ?? raw;

  if (Array.isArray(payload)) {
    return { content: payload, totalElements: payload.length, totalPages: 1 };
  }
  return {
    content:       payload?.content       ?? [],
    totalElements: payload?.totalElements ?? 0,
    totalPages:    payload?.totalPages    ?? 0,
  };
};

/**
 * GET /stores/{storeId}/orders/{orderId}
 */
export const getOrder = async (orderId) => {
  const storeId = localStorage.getItem('storeId');
  const raw = await apiFetch(`/stores/${storeId}/orders/${orderId}`);
  return raw?.data ?? raw;
};

/**
 * PATCH /stores/{storeId}/orders/{orderId}/status
 * Body: { status }
 */
export const updateOrderStatus = (orderId, status) => {
  const storeId = localStorage.getItem('storeId');
  return apiFetch(`/stores/${storeId}/orders/${orderId}/status`, {
    method: 'PATCH',
    body:   JSON.stringify({ status }),
  });
};
