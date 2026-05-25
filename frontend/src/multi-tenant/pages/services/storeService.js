/**
 * storeService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Capa de servicio para el micro-servicio Store.
 * Mapea EXACTAMENTE los endpoints definidos en los controllers Java:
 *
 *   StoreController          →  POST   
 *                               GET    /:storeId
 *
 *   StoreUserController      →  POST   /:storeId/users
 *                               GET    /:storeId/users
 *                               GET    /users/:userId
 *                               GET    /:storeId/access/:userId
 *
 *   StoreSettingsController  →  GET    /:storeId/settings
 *                               POST   /:storeId/settings
 *
 * Puerto del backend: 8081  (server.port en application.yaml)
 * No hay context-path configurado → base: http://localhost:8081
 * ─────────────────────────────────────────────────────────────────────────────
 */

const BASE_URL        = "http://localhost:8080/api/v1/stores";
const SETTINGS_URL    = "http://localhost:8080/api/v1/stores/settings";

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
 * POST 
 *
 * @param {{ ownerId: string, name: string, slug: string, description?: string }} payload
 * @returns {Promise<StoreResponseDTO>}
 */
export async function createStore(payload) {
  return request(`${BASE_URL}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Obtiene una tienda por su UUID.
 * GET /:storeId
 *
 * @param {string} storeId
 * @returns {Promise<StoreResponseDTO>}
 */
export async function getStoreById(storeId) {
  return request(`${BASE_URL}/${storeId}`);
}

// ─── StoreUserController ──────────────────────────────────────────────────────

/**
 * Agrega un usuario a una tienda con rol ADMIN o STAFF.
 * POST /:storeId/users
 *
 * @param {string} storeId
 * @param {{ userId: string, role: "ADMIN" | "STAFF" }} payload
 * @returns {Promise<StoreUserResponseDTO>}
 */
export async function addUserToStore(storeId, payload) {
  return request(`${BASE_URL}/${storeId}/users`, {
    method: "POST",
    body: JSON.stringify({ ...payload, storeId }),
  });
}

/**
 * Lista todos los usuarios de una tienda.
 * GET /:storeId/users
 *
 * @param {string} storeId
 * @returns {Promise<StoreUserResponseDTO[]>}
 */
export async function getUsersByStore(storeId) {
  return request(`${BASE_URL}/${storeId}/users`);
}

/**
 * Lista todas las tiendas a las que pertenece un usuario.
 * GET /users/:userId
 *
 * @param {string} userId
 * @returns {Promise<StoreUserResponseDTO[]>}
 */
export async function getStoresByUser(userId) {
  return request(`${BASE_URL}/users/${userId}`);
}

/**
 * Verifica si un usuario tiene acceso a una tienda.
 * GET /:storeId/access/:userId
 *
 * @param {string} storeId
 * @param {string} userId
 * @returns {Promise<{ hasAccess: boolean }>}
 */
export async function validateAccess(storeId, userId) {
  return request(`${BASE_URL}/${storeId}/access/${userId}`);
}

// ─── StoreSettingsController ──────────────────────────────────────────────────

/**
 * Obtiene la configuración actual de una tienda.
 * GET /api/v1/store/settings/:storeId
 *
 * @param {string} storeId
 * @returns {Promise<StoreSettingsResponseDTO>}
 */
export async function getStoreSettings(storeId) {
  return request(`${SETTINGS_URL}/${storeId}`);
}

/**
 * Guarda / actualiza la configuración de la tienda.
 * POST /api/v1/store/settings/crearSettings
 *
 * El campo `completedStep` es OBLIGATORIO siempre.
 *
 * @param {string} storeId
 * @param {StoreSettingsRequestDTO} payload
 * @returns {Promise<StoreSettingsResponseDTO>}
 */
export async function saveStoreSettings(storeId, payload) {
  return request(`${SETTINGS_URL}/createSettings`, {
    method: "POST",
    headers: { "x-store-id": storeId },
    body: JSON.stringify({ storeId, ...payload }),
  });
}

/**
 * Guarda un paso parcial del wizard sin avanzar completedStep más de lo necesario.
 *
 * @param {string} storeId
 * @param {number} step
 * @param {Partial<StoreSettingsRequestDTO>} stepData
 */
export async function saveWizardStep(storeId, step, stepData) {
  return saveStoreSettings(storeId, { completedStep: step, ...stepData });
}
