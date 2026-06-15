import { authFetch } from "../../../utils/authFetch";

const BASE = import.meta.env.VITE_API_URL ?? "http://46.225.21.146:8080/api/v1";

function buildHeaders() {
  const jwt = localStorage.getItem("jwt") ?? "";
  let userId = "";
  if (jwt) {
    try {
      const p = JSON.parse(atob(jwt.split(".")[1]));
      userId = p.user_id ?? p.userId ?? p.sub ?? "";
    } catch {
      /* token malformado */
    }
  }
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
    ...(userId ? { "x-user-id": userId } : {}),
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

/**
 * Simulación de orden — usar mientras el endpoint real no esté disponible.
 * ELIMINAR cuando el API de pagos esté integrado.
 */
export const simulateOrder = (payload) => {
  const numeric = String(Date.now()).slice(-8);
  const id = `PED-${numeric}`;

  return Promise.resolve({
    orderId:     id,
    orderNumber: id,
    status:      "PENDING",
    createdAt:   new Date().toISOString(),
    ...payload,
    _simulated: true,
  });
};
