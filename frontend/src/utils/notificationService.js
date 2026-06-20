/**
 * notificationService.js — /api/v1/notifications
 * Bandeja de notificaciones persistida del usuario autenticado.
 * Headers requeridos: Authorization (excepto el stream SSE, manejado en useUserNotifications).
 */

import { authFetch } from "./authFetch";

const BASE = `${import.meta.env.VITE_API_URL}/notifications`;

function buildHeaders() {
  const jwt = localStorage.getItem("jwt");
  const h = { "Content-Type": "application/json", Accept: "application/json" };
  if (jwt && jwt !== "null") h.Authorization = `Bearer ${jwt}`;
  return h;
}

async function req(method, path) {
  const res = await authFetch(`${BASE}${path}`, {
    method,
    headers: buildHeaders(),
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

/** Historial completo de notificaciones del usuario, más reciente primero. */
export const getUserNotifications = (userId) =>
  req("GET", `/user/${userId}`);

/** Marca una notificación puntual como leída. */
export const markNotificationRead = (notificationId) =>
  req("PATCH", `/${notificationId}/read`);

/** Marca todas las notificaciones del usuario como leídas. */
export const markAllNotificationsRead = (userId) =>
  req("PATCH", `/user/${userId}/read-all`);
