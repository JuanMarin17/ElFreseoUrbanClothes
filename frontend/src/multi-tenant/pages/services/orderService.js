import { authFetch } from "../../../utils/authFetch";

const BASE = import.meta.env.VITE_API_URL;

// El gateway inyecta x-user-id a partir del JWT — no se manda manualmente.
function buildHeaders() {
  const jwt = localStorage.getItem("jwt");
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(jwt && jwt !== "null" ? { Authorization: `Bearer ${jwt}` } : {}),
  };
}

async function request(method, path, body) {
  const res = await authFetch(`${BASE}${path}`, {
    method,
    headers: buildHeaders(),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (res.status === 204) return null;

  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    const msg = data?.message ?? data?.error ?? `Error ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  return data?.data ?? data;
}

/** POST /stores/{storeId}/orders — convierte el carrito en orden */
export const createOrder = (storeId, payload) =>
  request("POST", `/stores/${storeId}/orders`, payload);

/** POST /stores/{storeId}/orders/quick-buy — compra directa sin pasar por el carrito */
export const quickBuyOrder = (storeId, payload) =>
  request("POST", `/stores/${storeId}/orders/quick-buy`, payload);

/** POST /stores/{storeId}/orders/{orderId}/payment — procesa el pago */
export const processPayment = (storeId, orderId, body) =>
  request("POST", `/stores/${storeId}/orders/${orderId}/payment`, body);

/** GET /stores/{storeId}/orders — mis órdenes (cliente) */
export const getMyOrders = (storeId) =>
  request("GET", `/stores/${storeId}/orders`);

/** GET /stores/{storeId}/orders/{orderId} — detalle de una orden */
export const getOrder = (storeId, orderId) =>
  request("GET", `/stores/${storeId}/orders/${orderId}`);

/** GET /stores/{storeId}/orders/{orderId}/payment — pago de una orden */
export const getOrderPayment = (storeId, orderId) =>
  request("GET", `/stores/${storeId}/orders/${orderId}/payment`);

/** DELETE /stores/{storeId}/orders/{orderId} — cancelar orden */
export const cancelOrder = (storeId, orderId) =>
  request("DELETE", `/stores/${storeId}/orders/${orderId}`);
