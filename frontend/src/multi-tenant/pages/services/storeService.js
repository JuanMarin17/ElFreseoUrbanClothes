/**
 * storeService.js
 * Capa de servicio para el micro-servicio Store.
 *
 *  POST   /api/v1/stores                          → crear tienda
 *  GET    /api/v1/stores/:storeId                 → obtener tienda
 *  GET    /api/v1/stores/users/:userId            → tiendas de un usuario
 *  POST   /api/v1/stores/:storeId/users           → agregar usuario
 *  GET    /api/v1/stores/:storeId/users           → usuarios de una tienda
 *  GET    /api/v1/stores/:storeId/access/:userId  → verificar acceso
 *  GET    /api/v1/store/settings  (x-store-id)    → obtener settings
 *  POST   /api/v1/store/settings/createSettings   → guardar settings
 */

const BASE_URL = "http://localhost:8080/api/v1/stores";
const SETTINGS_URL = "http://localhost:8080/api/v1/stores/settings";

// ─── Utilidad interna ─────────────────────────────────────────────────────────

async function request(url, options = {}) {
  const defaultHeaders = { "Content-Type": "application/json" };

  const res = await fetch(url, {
    ...options,
    headers: { ...defaultHeaders, ...options.headers },
  });

  let body;
  const contentType = res.headers.get("Content-Type") ?? "";
  if (contentType.includes("application/json")) {
    body = await res.json();
  } else {
    body = await res.text();
  }

  if (!res.ok) {
    if (res.status === 404 && res.message.includes("no tiene configuración")) {
      return null; // o {}
    }
    const message =
      typeof body === "object"
        ? (body.message ?? `Error ${res.status}`)
        : body || `Error ${res.status}`;
    const error = new Error(message);
    error.status = res.status;
    error.errors = body?.errors ?? null;
    throw error;
  }

  return body;
}

// ─── StoreController ──────────────────────────────────────────────────────────

/** POST /api/v1/stores — Crea una nueva tienda */
export async function createStore(payload) {
  return request(`${BASE_URL}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** GET /api/v1/stores/:storeId — Obtiene una tienda por UUID */
export async function getStoreById(storeId) {
  return request(`${BASE_URL}/${storeId}`);
}

/** GET localhost:8080/api/v1/stores/getBySlug/:slug — Obtiene una tienda por su slug */
export async function getStoreBySlug(slug) {
  return request(`http://localhost:8080/api/v1/stores/getBySlug/${slug}`);
}

/** GET /api/v1/stores — Todas las tiendas (solo superadmin) */
export async function getAllStores() {
  console.log("Settings: " + request(`${BASE_URL}`))
  return request(`${BASE_URL}`);
}

// ─── StoreUserController ──────────────────────────────────────────────────────

/** POST /api/v1/stores/:storeId/users — Agrega un usuario a una tienda */
export async function addUserToStore(storeId, payload) {
  return request(`${BASE_URL}/${storeId}/users`, {
    method: "POST",
    body: JSON.stringify({ ...payload, storeId }),
  });
}

/** GET /api/v1/stores/:storeId/users — Lista usuarios de una tienda */
export async function getUsersByStore(storeId) {
  return request(`${BASE_URL}/${storeId}/users`);
}

/** GET /api/v1/stores/users/:userId — Tiendas de un usuario */
export async function getStoresByUser(userId) {
  return request(`${BASE_URL}/users/${userId}`);
}

/** GET /api/v1/stores/:storeId/access/:userId — Verifica acceso */
export async function validateAccess(storeId, userId) {
  return request(`${BASE_URL}/${storeId}/access/${userId}`);
}

// ─── StoreSettingsController ──────────────────────────────────────────────────

/**
 * GET /api/v1/store/settings
 * Header: x-store-id: <storeId>
 * Obtiene la configuración de una tienda.
 */
export async function getStoreSettingsByHeader(storeId) {
  try {
    return request(`${SETTINGS_URL}/getSettings`, {
    headers: { "x-store-id": storeId },
  });
  } catch (e) {
    if (e.status == 404) {
      console.log("No tiene configuracion la tienda")
    }
  }
}

/**
 * POST /api/v1/store/settings/createSettings
 * Header: x-store-id: <storeId>
 * Guarda la configuración completa del wizard.
 */
export async function saveStoreSettings(storeId, payload) {
  return request(`${SETTINGS_URL}/createSettings`, {
    method: "POST",
    headers: { "x-store-id": storeId },
    body: JSON.stringify({ storeId, ...payload }),
  });
}

/**
 * Guarda un paso parcial del wizard.
 */
export async function saveWizardStep(storeId, step, stepData) {
  return saveStoreSettings(storeId, { completedStep: step, ...stepData });
}
