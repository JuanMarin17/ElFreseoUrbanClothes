/**
 * returnsService.js — /api/v1/returns
 * Headers requeridos: Authorization, X-Store-Id (donde aplique)
 */

import { authFetch } from "./authFetch";

const BASE = `${import.meta.env.VITE_API_URL}/returns`;

function buildHeaders() {
  const jwt     = localStorage.getItem("jwt");
  const storeId = localStorage.getItem("storeId");
  const h = { "Content-Type": "application/json", Accept: "application/json" };
  if (jwt && jwt !== "null")         h.Authorization  = `Bearer ${jwt}`;
  if (storeId && storeId !== "null") h["X-Store-Id"]  = storeId;
  return h;
}

async function req(method, path, body) {
  const res = await authFetch(`${BASE}${path}`, {
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
    const err     = new Error(data?.message ?? data?.error ?? `HTTP ${res.status}`);
    err.status    = res.status;
    throw err;
  }

  return data?.data ?? data;
}

/* ── Usuario: sus propias devoluciones ─────────────────────────────────────── */

/** Lista de devoluciones del usuario autenticado */
export const getMyReturns = (page = 1, limit = 20) =>
  req("GET", `?page=${page}&limit=${limit}`);

/** Crea una solicitud de devolución
 * @param {{ orderId, reason, description, imageUrl? }} payload
 */
export const createReturn = (payload) =>
  req("POST", "", payload);

/** Detalle de una devolución */
export const getReturnById = (id) =>
  req("GET", `/${id}`);

/* ── Admin: todas las devoluciones ────────────────────────────────────────── */

/** Lista todas las devoluciones (requiere rol admin) */
export const getAllReturns = (page = 1, limit = 20, status) => {
  const q = new URLSearchParams({ page, limit });
  if (status) q.set("status", status);
  return req("GET", `?${q}`);
};

/** Aprueba o rechaza una devolución
 * @param {string} id
 * @param {"APPROVED" | "REJECTED"} status
 * @param {string} [note]
 */
export const updateReturnStatus = (id, status, note) =>
  req("PUT", `/${id}/status`, { status, note });
