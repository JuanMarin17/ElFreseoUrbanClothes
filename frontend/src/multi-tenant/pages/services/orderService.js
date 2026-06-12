<<<<<<< HEAD
/**
 * orderService.js
 * Gestión de órdenes del cliente en la tienda.
 *
 * Cuando el API real esté listo, elimina `simulateOrder` y el bloque
 * try/catch de fallback en CheckoutPage.jsx.
 */

const BASE = import.meta.env.VITE_API_URL ?? "http://46.225.21.146:8080/api/v1";

const buildHeaders = () => {
  const jwt = localStorage.getItem("jwt");
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(jwt && jwt !== "null" ? { Authorization: `Bearer ${jwt}` } : {}),
  };
};
=======
const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1';

function buildHeaders() {
  const jwt = localStorage.getItem('jwt') ?? '';
  let userId = '';
  if (jwt) {
    try {
      const p = JSON.parse(atob(jwt.split('.')[1]));
      userId = p.user_id ?? p.userId ?? p.sub ?? '';
    } catch { /* token malformado */ }
  }
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
    ...(userId ? { 'x-user-id': userId } : {}),
  };
}
>>>>>>> d722bcdf12418f9ef4a313bbf32b00bb59171a8d

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: buildHeaders(),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (res.status === 204) return null;

  let data;
  try { data = await res.json(); } catch { data = {}; }

  if (!res.ok) {
<<<<<<< HEAD
    const err = new Error(data?.message ?? data?.error ?? `Error ${res.status}`);
=======
    const msg = data?.message ?? data?.error ?? `Error ${res.status}`;
    const err = new Error(msg);
>>>>>>> d722bcdf12418f9ef4a313bbf32b00bb59171a8d
    err.status = res.status;
    throw err;
  }

  return data?.data ?? data;
}

<<<<<<< HEAD
/** Crear una nueva orden a partir del carrito activo. */
export const createOrder = (storeId, payload) =>
  request("POST", `/stores/${storeId}/orders`, payload);

/** Obtener una orden por ID. */
export const getOrder = (storeId, orderId) =>
  request("GET", `/stores/${storeId}/orders/${orderId}`);

/** Órdenes del usuario autenticado en esta tienda. */
export const getMyOrders = (storeId) =>
  request("GET", `/stores/${storeId}/orders/my`);

/**
 * Simulación de orden — usar mientras el endpoint real no esté disponible.
 * ELIMINAR cuando el API de pagos esté integrado.
 */
export const simulateOrder = (payload) => {
  const id =
    "ORD-" +
    Date.now().toString(36).toUpperCase() +
    "-" +
    Math.random().toString(36).slice(2, 6).toUpperCase();

  return Promise.resolve({
    orderId: id,
    status: "PENDING",
    createdAt: new Date().toISOString(),
    ...payload,
    _simulated: true,
  });
};
=======
/** POST /stores/{storeId}/orders — convierte el carrito en orden */
export const createOrder = (storeId, body) =>
  request('POST', `/stores/${storeId}/orders`, body);

/** POST /stores/{storeId}/orders/{orderId}/payment — procesa el pago */
export const processPayment = (storeId, orderId, body) =>
  request('POST', `/stores/${storeId}/orders/${orderId}/payment`, body);

/** GET /stores/{storeId}/orders — mis órdenes (cliente) */
export const getMyOrders = (storeId) =>
  request('GET', `/stores/${storeId}/orders`);

/** GET /stores/{storeId}/orders/{orderId} — detalle de una orden */
export const getOrder = (storeId, orderId) =>
  request('GET', `/stores/${storeId}/orders/${orderId}`);

/** GET /stores/{storeId}/orders/{orderId}/payment — pago de una orden */
export const getOrderPayment = (storeId, orderId) =>
  request('GET', `/stores/${storeId}/orders/${orderId}/payment`);

/** DELETE /stores/{storeId}/orders/{orderId} — cancelar orden */
export const cancelOrder = (storeId, orderId) =>
  request('DELETE', `/stores/${storeId}/orders/${orderId}`);
>>>>>>> d722bcdf12418f9ef4a313bbf32b00bb59171a8d
