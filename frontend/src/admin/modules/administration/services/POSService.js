const BASE = import.meta.env.VITE_API_URL ?? 'http://46.225.21.146:8080/api/v1';

function buildHeaders() {
  const jwt     = localStorage.getItem('jwt') ?? '';
  const storeId = localStorage.getItem('storeId') ?? '';
  let userId = '', role = 'ADMIN';
  if (jwt) {
    try {
      const d = JSON.parse(atob(jwt.split('.')[1]));
      userId = d.user_id ?? '';
      role   = d.role    ?? 'ADMIN';
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
  if (res.status === 204) return null;
  let data;
  try { data = await res.json(); } catch { data = {}; }
  if (!res.ok) {
    const err = new Error(data?.message ?? `HTTP_${res.status}`);
    err.status = res.status;
    err.data   = data;
    throw err;
  }
  return data?.data ?? data;
}

const sid = () => localStorage.getItem('storeId') ?? '';

/** POST /stores/{storeId}/pos/sales — registrar venta */
export const registerSale = (body) =>
  apiFetch(`/stores/${sid()}/pos/sales`, { method: 'POST', body: JSON.stringify(body) });

/** GET /stores/{storeId}/pos/sales — listar ventas */
export const getSales = () =>
  apiFetch(`/stores/${sid()}/pos/sales`);

/** GET /stores/{storeId}/pos/sales/{saleId} — detalle */
export const getSale = (saleId) =>
  apiFetch(`/stores/${sid()}/pos/sales/${saleId}`);

/** PATCH /stores/{storeId}/pos/sales/{saleId}/cancel */
export const cancelSale = (saleId) =>
  apiFetch(`/stores/${sid()}/pos/sales/${saleId}/cancel`, { method: 'PATCH' });

/** GET /stores/{storeId}/pos/sales/daily */
export const getDailySummary = () =>
  apiFetch(`/stores/${sid()}/pos/sales/daily`);

/** GET /stores/{storeId}/pos/sales/by-date?from=&to= */
export const getSalesByDate = (from, to) =>
  apiFetch(`/stores/${sid()}/pos/sales/by-date?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);

/** GET /stores/{storeId}/pos/sales/customer/{customerId} */
export const getSalesByCustomer = (customerId) =>
  apiFetch(`/stores/${sid()}/pos/sales/customer/${customerId}`);
