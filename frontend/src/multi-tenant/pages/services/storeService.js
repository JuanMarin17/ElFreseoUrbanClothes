/**
 * storeService.js
 * Integración completa con el Store microservice.
 * Todas las rutas requieren Authorization: Bearer <jwt>
 * Los endpoints de settings además requieren X-Store-Id: <uuid>
 */

const API_ROOT = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api/v1";
const BASE_URL     = `${API_ROOT}/stores`;
const SETTINGS_URL = `${API_ROOT}/stores/settings`;

// ─── Helpers de headers ───────────────────────────────────────────────────────

const authHeader = () => {
  const jwt = localStorage.getItem("jwt");
  return jwt ? { Authorization: `Bearer ${jwt}` } : {};
};

const storeHeader = (storeId) => ({
  ...authHeader(),
  "X-Store-Id": storeId,
});

// ─── Utilidad de fetch ────────────────────────────────────────────────────────

async function request(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),        // JWT en todas las peticiones
      ...options.headers,     // headers extra (ej. X-Store-Id) pueden sobreescribir
    },
  });

  let body;
  const ct = res.headers.get("Content-Type") ?? "";
  body = ct.includes("application/json") ? await res.json() : await res.text();

  if (!res.ok) {
    if (res.status === 404) return null;
    const message =
      typeof body === "object"
        ? (body.message ?? `Error ${res.status}`)
        : body || `Error ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.errors = body?.errors ?? null;
    throw err;
  }

  // Desenvuelve el wrapper { message, status, data, timestamp } si existe
  return body?.data ?? body;
}

// ════════════════════════════════════════════════════════════════════════════
// 1. TIENDA — /api/v1/stores
// ════════════════════════════════════════════════════════════════════════════

/**
 * POST /stores
 * Body: { ownerId, name, slug, description? }
 * Respuesta: StoreResponseDTO
 */
export async function createStore(payload) {
  return request(`${BASE_URL}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * GET /stores/getByStoreId/:storeId
 */
export async function getStoreById(storeId) {
  return request(`${BASE_URL}/getByStoreId/${storeId}`);
}

/**
 * GET /stores/getBySlug/:slug  (vista pública — no requiere JWT)
 */
export async function getStoreBySlug(slug) {
  return request(`${BASE_URL}/getBySlug/${slug}`);
}

/**
 * GET /stores  — Lista todas las tiendas (SUPERADMIN)
 */
export async function getAllStores() {
  return request(`${BASE_URL}`);
}

// ════════════════════════════════════════════════════════════════════════════
// 2. USUARIOS DE LA TIENDA — /api/v1/stores
// ════════════════════════════════════════════════════════════════════════════

/**
 * POST /stores/users
 * Body: { userId, storeId, role: "OWNER"|"ADMIN"|"STAFF" }
 * Respuesta 201: { userId, storeId, role }
 */
export async function addUserToStore(userId, storeId, role = "OWNER") {
  return request(`${BASE_URL}/users`, {
    method: "POST",
    body: JSON.stringify({ userId, storeId, role }),
  });
}

/**
 * GET /stores/:storeId/users
 */
export async function getUsersByStore(storeId) {
  return request(`${BASE_URL}/${storeId}/users`);
}

/**
 * GET /stores/users/:userId — Tiendas del usuario
 * Respuesta: [ { userId, storeId, role } ]
 */
export async function getStoresByUser(userId) {
  return request(`${BASE_URL}/users/${userId}`);
}

/**
 * GET /stores/:storeId/access/:userId
 * Respuesta: { hasAccess: boolean }
 */
export async function validateAccess(storeId, userId) {
  return request(`${BASE_URL}/${storeId}/access/${userId}`);
}

// ════════════════════════════════════════════════════════════════════════════
// 3. SETTINGS DEL WIZARD — /api/v1/stores/settings
// (Todos requieren X-Store-Id)
// ════════════════════════════════════════════════════════════════════════════

/**
 * GET /stores/settings/getSettings
 * Devuelve null si la tienda aún no tiene settings.
 */
export async function getStoreSettingsByHeader(storeId) {
  try {
    return await request(`${SETTINGS_URL}/getSettings`, {
      headers: storeHeader(storeId),
    });
  } catch (e) {
    if (e.status === 404) return null;
    throw e;
  }
}

/**
 * POST /stores/settings/createSettings
 * Semántica PATCH: solo actualiza los campos que vienen en el body.
 * El campo `completedStep` es obligatorio.
 */
export async function saveStoreSettings(storeId, payload) {
  return request(`${SETTINGS_URL}/createSettings`, {
    method: "POST",
    headers: storeHeader(storeId),
    body: JSON.stringify({ storeId, ...payload }),
  });
}

/**
 * Guarda un paso parcial del wizard.
 * @param {string} storeId
 * @param {number} step       — número del paso completado
 * @param {object} stepData   — datos del paso
 */
export async function saveWizardStep(storeId, step, stepData) {
  return saveStoreSettings(storeId, { completedStep: step, ...stepData });
}

/**
 * POST /stores/settings/logo
 * Sube el logo y lo guarda en la BD automáticamente.
 * @returns StoreSettingsResponseDTO con logoUrl actualizado
 */
export async function uploadStoreLogo(storeId, file) {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${SETTINGS_URL}/logo`, {
    method: "POST",
    headers: storeHeader(storeId), // Authorization + X-Store-Id (sin Content-Type, lo pone el browser)
    body: formData,
  });

  let body;
  const ct = res.headers.get("Content-Type") ?? "";
  body = ct.includes("application/json") ? await res.json() : await res.text();

  if (!res.ok) {
    const message = typeof body === "object" ? (body.message ?? `Error ${res.status}`) : body;
    throw new Error(message || "Error al subir el logo");
  }

  return body?.data ?? body;
}
