/**
 * builderChatService.js
 * Asistente IA de Store Builder — guía al OWNER a través de las 6 fases de configuración.
 * Headers requeridos: Authorization: Bearer <jwt>, Content-Type: application/json.
 */

const BASE = "http://46.225.21.146:8080/api/v1/ia/builder";

const buildHeaders = () => {
  const jwt = localStorage.getItem("jwt");
  return {
    "Content-Type": "application/json",
    ...(jwt && jwt !== "null" ? { Authorization: `Bearer ${jwt}` } : {}),
  };
};

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
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
    const msg = data?.message ?? data?.error ?? data?.detail ?? `Error ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  return data?.data ?? data;
}

/**
 * POST /chat
 * Primer mensaje: sessionId = null → el backend crea la sesión y devuelve session_id.
 * Mensajes siguientes: pasar el session_id recibido en la primera respuesta.
 */
export const sendBuilderMessage = (sessionId, message) => {
  const body = { message };
  if (sessionId) body.session_id = sessionId;
  return request("POST", "/chat", body);
};

/** GET /sessions — Lista de UUIDs de sesiones, más reciente primero. */
export const getBuilderSessions = () =>
  request("GET", "/sessions");

/** GET /sessions/{session_id}/history — Historial de mensajes de una sesión. */
export const getBuilderSessionHistory = (sessionId) =>
  request("GET", `/sessions/${sessionId}/history`);
