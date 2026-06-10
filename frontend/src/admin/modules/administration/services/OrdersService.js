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
 * GET /stores/{storeId}/orders/admin/all
 * Page<Order>
 */
export const getOrders = ({ status, page = 0, size = 20 } = {}) => {
  const storeId = localStorage.getItem('storeId');
  const params  = new URLSearchParams({ page, size });
  if (status) params.set('status', status);
  return apiFetch(`/stores/${storeId}/orders/admin/all?${params}`);
};

/**
 * GET /stores/{storeId}/orders/{orderId}
 */
export const getOrder = (orderId) => {
  const storeId = localStorage.getItem('storeId');
  return apiFetch(`/stores/${storeId}/orders/${orderId}`);
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
