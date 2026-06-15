/**
 * loyaltyService.js — /api/v1/loyalty
 * Headers requeridos: Authorization, X-Store-Id
 */

const BASE = "http://46.225.21.146:8080/api/v1/loyalty";

function buildHeaders() {
  const jwt     = localStorage.getItem("jwt");
  const storeId = localStorage.getItem("storeId");
  const h = { "Content-Type": "application/json", Accept: "application/json" };
  if (jwt && jwt !== "null")         h.Authorization  = `Bearer ${jwt}`;
  if (storeId && storeId !== "null") h["X-Store-Id"]  = storeId;
  return h;
}

async function req(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: buildHeaders(),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (res.status === 204) return null;

  const ct   = res.headers.get("Content-Type") ?? "";
  const data = ct.includes("application/json")
    ? await res.json().catch(() => ({}))
    : {};

  if (!res.ok) {
    const err  = new Error(data?.message ?? data?.error ?? `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }

  return data?.data ?? data;
}

/** Puntos actuales del usuario — { points, tier, nextTierPoints } */
export const getPoints = () =>
  req("GET", "/points");

/** Historial de movimientos — [{ id, type, points, description, createdAt }] */
export const getLoyaltyHistory = (page = 1, limit = 20) =>
  req("GET", `/history?page=${page}&limit=${limit}`);

/** Canjear puntos en checkout
 * @param {{ points, orderId }} payload
 */
export const redeemPoints = (payload) =>
  req("POST", "/redeem", payload);

/** Configuración del programa (admin) */
export const getLoyaltyConfig = () =>
  req("GET", "/config");

/** Actualizar configuración (admin) */
export const updateLoyaltyConfig = (payload) =>
  req("PUT", "/config", payload);
