/**
 * locationsService.js — /api/v1/locations
 * Headers requeridos: Authorization, X-Store-Id
 */

const BASE = import.meta.env.VITE_API_URL;

function buildHeaders() {
  const jwt     = localStorage.getItem("jwt");
  const storeId = localStorage.getItem("storeId");
  const h = { "Content-Type": "application/json", Accept: "application/json" };
  if (jwt && jwt !== "null")         h.Authorization  = `Bearer ${jwt}`;
  if (storeId && storeId !== "null") h["X-Store-Id"]  = storeId;
  return h;
}

async function req(method, path, body, timeoutMs = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      signal: controller.signal,
      headers: buildHeaders(),
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } finally {
    clearTimeout(timer);
  }

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

/* ── Inventario ─────────────────────────────────────────────────────────────── */

/** Lista el inventario de la tienda */
export const getInventory = (params = {}) => {
  const q = new URLSearchParams();
  if (params.page)       q.set("page",       params.page);
  if (params.limit)      q.set("limit",       params.limit);
  if (params.productId)  q.set("productId",   params.productId);
  if (params.locationId) q.set("locationId",  params.locationId);
  if (params.lowStock)   q.set("lowStock",    "true");
  return req("GET", `/inventory?${q}`);
};

/** Actualiza el stock de un ítem de inventario */
export const updateInventory = (id, payload) =>
  req("PUT", `/inventory/${id}`, payload);

/* ── Ubicaciones / Depósitos ──────────────────────────────────────────────── */

/** Lista las ubicaciones de la tienda */
export const getLocations = () =>
  req("GET", "/locations");

/** Crea una nueva ubicación
 * @param {{ name, address?, description? }} payload
 */
export const createLocation = (payload) =>
  req("POST", "/locations", payload);

/** Edita una ubicación */
export const updateLocation = (id, payload) =>
  req("PUT", `/locations/${id}`, payload);

/** Elimina una ubicación */
export const deleteLocation = (id) =>
  req("DELETE", `/locations/${id}`);
