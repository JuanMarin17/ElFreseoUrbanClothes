/**
 * customersService.js — /api/v1/stores/:storeId/customers
 * Headers requeridos: Authorization, X-Store-Id
 */

const API_BASE = import.meta.env.VITE_API_URL;

function buildHeaders() {
  const jwt     = localStorage.getItem("jwt");
  const storeId = localStorage.getItem("storeId");
  const h = { "Content-Type": "application/json", Accept: "application/json" };
  if (jwt && jwt !== "null")         h.Authorization  = `Bearer ${jwt}`;
  if (storeId && storeId !== "null") h["X-Store-Id"]  = storeId;
  return h;
}

function getStoreId() {
  return localStorage.getItem("storeId");
}

async function req(method, path, body, timeoutMs = 10000) {
  const storeId = getStoreId();
  const url     = `${API_BASE}/stores/${storeId}${path}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let res;
  try {
    res = await fetch(url, {
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

/**
 * Lista los clientes de la tienda
 * @param {{ page?, limit?, search?, sortBy?, order? }} params
 */
export const getCustomers = (params = {}) => {
  const q = new URLSearchParams();
  if (params.page)   q.set("page",   params.page);
  if (params.limit)  q.set("limit",  params.limit);
  if (params.search) q.set("search", params.search);
  if (params.sortBy) q.set("sortBy", params.sortBy);
  if (params.order)  q.set("order",  params.order);
  return req("GET", `/customers?${q}`);
};

/** Detalle de un cliente */
export const getCustomerById = (customerId) =>
  req("GET", `/customers/${customerId}`);
