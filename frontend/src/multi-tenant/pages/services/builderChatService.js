/**
 * builderChatService.js
 * Asistente IA de Store Builder — guía al OWNER a través de las 6 fases de configuración.
 * Headers requeridos: Authorization: Bearer <jwt>, Content-Type: application/json.
 */

const BASE = `${import.meta.env.VITE_API_URL}/ia/builder`;

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
 *
 * `context` informa en qué paso del wizard está el usuario (path/step/stepIndex/
 * totalSteps/completedStep). El backend aún no tiene contrato confirmado para
 * este campo — se manda por si ya lo soporta o se agrega soporte más adelante;
 * si lo ignora, no rompe nada (campo extra en el body).
 */
export const sendBuilderMessage = (sessionId, message, context) => {
  const body = { message };
  if (sessionId) body.session_id = sessionId;
  if (context) body.context = context;
  return request("POST", "/chat", body);
};

/** GET /sessions — Lista de UUIDs de sesiones, más reciente primero. */
export const getBuilderSessions = () =>
  request("GET", "/sessions");

/** GET /sessions/{session_id}/history — Historial de mensajes de una sesión. */
export const getBuilderSessionHistory = (sessionId) =>
  request("GET", `/sessions/${sessionId}/history`);

/** DELETE /sessions/{session_id} — Borrar una sesión específica. */
export const deleteBuilderSession = (sessionId) =>
  request("DELETE", `/sessions/${sessionId}`);

/** DELETE /sessions — Borrar todo el historial del builder. */
export const deleteAllBuilderSessions = () =>
  request("DELETE", "/sessions");
