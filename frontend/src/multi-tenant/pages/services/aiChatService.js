/**
 * aiChatService.js
 * Asistente de compras IA — accedido a través del API Gateway.
 * El gateway inyecta X-User-Id y X-Store-Id desde el JWT; no los enviamos manualmente.
 */

const BASE = `${import.meta.env.VITE_API_URL ?? "http://46.225.21.146:8080/api/v1"}/ia/user`;

const buildHeaders = (storeId) => {
  const jwt = localStorage.getItem("jwt");
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(jwt && jwt !== "null" ? { Authorization: `Bearer ${jwt}` } : {}),
    ...(storeId ? { "X-Store-Id": storeId } : {}),
  };
};

async function request(method, path, body, storeId) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: buildHeaders(storeId),
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

/**
 * Enviar mensaje al asistente.
 * @param {string|null} sessionId
 * @param {string}      message
 * @param {string|null} imageBase64
 * @param {string|null} imageMimeType
 * @param {string|null} storeId
 */
export const sendMessage = (
  sessionId,
  message,
  imageBase64 = null,
  imageMimeType = null,
  storeId = null,
) => {
  const body = { message };
  if (sessionId) body.session_id = sessionId;
  if (imageBase64) {
    body.image_base64 = imageBase64;
    body.image_mime_type = imageMimeType ?? "image/jpeg";
  }
  return request("POST", "/chat", body, storeId);
};

/** Listar sesiones del usuario. */
export const getSessions = (storeId) =>
  request("GET", "/sessions", undefined, storeId);

/** Obtener historial de una sesión. */
export const getSessionHistory = (sessionId, storeId) =>
  request("GET", `/sessions/${sessionId}/history`, undefined, storeId);

/** Obtener alertas de stock pendientes. */
export const getStockNotifications = (storeId) =>
  request("GET", "/stock-notifications", undefined, storeId);

/** Cancelar una alerta de stock. */
export const cancelStockNotification = (notificationId, storeId) =>
  request(
    "DELETE",
    `/stock-notifications/${notificationId}`,
    undefined,
    storeId,
  );
