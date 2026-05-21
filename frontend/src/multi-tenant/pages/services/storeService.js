/**
 * storeService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Capa de servicio para el micro-servicio Store.
 * Mapea EXACTAMENTE los endpoints definidos en los controllers Java:
 *
 *   StoreController          →  POST   /api/stores
 *                               GET    /api/stores/:storeId
 *
 *   StoreUserController      →  POST   /api/stores/:storeId/users
 *                               GET    /api/stores/:storeId/users
 *                               GET    /api/stores/users/:userId
 *                               GET    /api/stores/:storeId/access/:userId
 *
 *   StoreSettingsController  →  GET    /api/stores/:storeId/settings
 *                               POST   /api/stores/:storeId/settings
 *
 * Puerto del backend: 8081  (server.port en application.yaml)
 * No hay context-path configurado → base: http://localhost:8081
 * ─────────────────────────────────────────────────────────────────────────────
 */

const BASE_URL = import.meta.env.VITE_STORE_API_URL ?? "http://localhost:8080";

// ─── Utilidad interna ──────────────────────────────────────────────────────────

/**
 * Wrapper sobre fetch con manejo centralizado de errores.
 * Lanza un Error con el mensaje que devuelve el backend (campo "message")
 * o con el status HTTP si la respuesta no es JSON.
 *
 * @param {string} url
 * @param {RequestInit} [options]
 * @returns {Promise<any>}
 */
async function request(url, options = {}) {
  const defaultHeaders = { "Content-Type": "application/json" };

  const res = await fetch(url, {
    ...options,
    headers: { ...defaultHeaders, ...options.headers },
  });

  // Intentamos parsear el cuerpo siempre (puede ser error o éxito)
  let body;
  const contentType = res.headers.get("Content-Type") ?? "";
  if (contentType.includes("application/json")) {
    body = await res.json();
  } else {
    body = await res.text();
  }

  if (!res.ok) {
    // El GlobalExceptionHandler del backend siempre devuelve { message, status, ... }
    const message =
      typeof body === "object"
        ? (body.message ?? `Error ${res.status}`)
        : body || `Error ${res.status}`;
    const error = new Error(message);
    error.status = res.status;
    error.errors = body?.errors ?? null; // errores de validación field-level
    throw error;
  }

  return body;
}

// ─── StoreController ──────────────────────────────────────────────────────────

/**
 * Crea una nueva tienda.
 * POST /api/stores
 *
 * @param {{ ownerId: string, name: string, slug: string, description?: string }} payload
 * @returns {Promise<StoreResponseDTO>}
 */
export async function createStore(payload) {
  return request(`${BASE_URL}/api/stores`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Obtiene una tienda por su UUID.
 * GET /api/stores/:storeId
 *
 * @param {string} storeId
 * @returns {Promise<StoreResponseDTO>}
 */
export async function getStoreById(storeId) {
  return request(`${BASE_URL}/api/stores/${storeId}`);
}

// ─── StoreUserController ──────────────────────────────────────────────────────

/**
 * Agrega un usuario a una tienda con rol ADMIN o STAFF.
 * POST /api/stores/:storeId/users
 *
 * @param {string} storeId
 * @param {{ userId: string, role: "ADMIN" | "STAFF" }} payload
 * @returns {Promise<StoreUserResponseDTO>}
 */
export async function addUserToStore(storeId, payload) {
  return request(`${BASE_URL}/api/stores/${storeId}/users`, {
    method: "POST",
    body: JSON.stringify({ ...payload, storeId }),
  });
}

/**
 * Lista todos los usuarios de una tienda.
 * GET /api/stores/:storeId/users
 *
 * @param {string} storeId
 * @returns {Promise<StoreUserResponseDTO[]>}
 */
export async function getUsersByStore(storeId) {
  return request(`${BASE_URL}/api/stores/${storeId}/users`);
}

/**
 * Lista todas las tiendas a las que pertenece un usuario.
 * GET /api/stores/users/:userId
 *
 * @param {string} userId
 * @returns {Promise<StoreUserResponseDTO[]>}
 */
export async function getStoresByUser(userId) {
  return request(`${BASE_URL}/api/stores/users/${userId}`);
}

/**
 * Verifica si un usuario tiene acceso a una tienda.
 * GET /api/stores/:storeId/access/:userId
 *
 * @param {string} storeId
 * @param {string} userId
 * @returns {Promise<{ hasAccess: boolean }>}
 */
export async function validateAccess(storeId, userId) {
  return request(`${BASE_URL}/api/stores/${storeId}/access/${userId}`);
}

// ─── StoreSettingsController ──────────────────────────────────────────────────

/**
 * Obtiene la configuración actual de una tienda.
 * GET /api/stores/:storeId/settings
 *
 * @param {string} storeId
 * @returns {Promise<StoreSettingsResponseDTO>}
 */
export async function getStoreSettings(storeId) {
  return request(`${BASE_URL}/api/stores/${storeId}/settings`);
}

/**
 * Guarda / actualiza la configuración de la tienda.
 * POST /api/stores/:storeId/settings
 *
 * Semántica PATCH: solo los campos que se envíen serán actualizados.
 * El campo `completedStep` es OBLIGATORIO siempre.
 *
 * @param {string} storeId
 * @param {StoreSettingsRequestDTO} payload
 * @returns {Promise<StoreSettingsResponseDTO>}
 */
export async function saveStoreSettings(storeId, payload) {
  return request(`${BASE_URL}/api/stores/${storeId}/settings`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Guarda un paso parcial del wizard sin avanzar completedStep más de lo necesario.
 * Envuelve saveStoreSettings para simplificar las llamadas desde cada step.
 *
 * @param {string} storeId
 * @param {number} step              – número del paso completado
 * @param {Partial<StoreSettingsRequestDTO>} stepData  – datos del paso
 */
export async function saveWizardStep(storeId, step, stepData) {
  return saveStoreSettings(storeId, { completedStep: step, ...stepData });
}
