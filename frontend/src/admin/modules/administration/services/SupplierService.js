// ══════════════════════════════════════════════════════════════════════════════
// SupplierService.js — /api/v1/suppliers
// Requiere: Authorization + X-Store-Id en TODAS las peticiones.
// Deactivate requiere además X-User-Role: ADMIN
// ══════════════════════════════════════════════════════════════════════════════

const BASE_URL = import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_URL;

function readHeaders() {
  const jwt = localStorage.getItem("jwt");
  const storeId = localStorage.getItem("storeId");
  const h = {};

  if (jwt) {
    h["Authorization"] = `Bearer ${jwt}`;
    try {
      const payload = JSON.parse(atob(jwt.split(".")[1]));
      if (payload.user_id) h["X-User-Id"] = payload.user_id;
    } catch {
      /* JWT malformado — se omite X-User-Id */
    }
  }

  if (storeId && storeId !== "null" && storeId !== "undefined") {
    h["X-Store-Id"] = storeId;
  } else {
    throw new Error(
      "No se encontró la tienda activa. Recarga la página e intenta de nuevo.",
    );
  }

  return h;
}

function writeHeaders() {
  return {
    ...readHeaders(),
    "Content-Type": "application/json",
  };
}

function adminHeaders() {
  return {
    ...readHeaders(),
    "Content-Type": "application/json",
    "X-User-Role": "ADMIN",
  };
}

// fetch con timeout: si el backend no responde en timeoutMs, aborta en vez de
// dejar el botón colgado en estado de carga para siempre.
function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(new Error("El servidor no respondió a tiempo. Intenta de nuevo.")),
    timeoutMs,
  );
  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timer),
  );
}

async function unwrap(res) {
  const text = await res.text();

  if (res.status === 204 || !text) return null;

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return null;
  }

  if (!res.ok) {
    // Formato estándar del backend: { message, status, errors }
    const msg = parsed?.message || parsed?.error || `Error ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.errors = parsed?.errors ?? null;
    throw err;
  }

  return parsed?.data ?? parsed;
}

// ── Lectura ───────────────────────────────────────────────────────────────────

/** GET /suppliers/getSuppliersByStore — lista proveedores activos de la tienda */
export async function getSuppliersByStore() {
  const res = await fetchWithTimeout(`${BASE_URL}/suppliers/getSuppliersByStore`, {
    headers: readHeaders(),
  });
  const data = await unwrap(res);
  return Array.isArray(data) ? data : (data?.content ?? data?.items ?? []);
}

/** GET /suppliers/{supplierId} */
export async function getSupplierById(supplierId) {
  const res = await fetchWithTimeout(`${BASE_URL}/suppliers/${supplierId}`, {
    headers: readHeaders(),
  });
  return unwrap(res);
}

// ── Escritura ─────────────────────────────────────────────────────────────────

/**
 * POST /suppliers/createSupplier
 * Body: { name, contactName?, phone?, email? }
 * 409 → nombre duplicado globalmente
 */
export async function createSupplier(body) {
  const res = await fetchWithTimeout(`${BASE_URL}/suppliers/createSupplier`, {
    method: "POST",
    headers: writeHeaders(),
    body: JSON.stringify(body),
  });
  return unwrap(res);
}

/**
 * PUT /suppliers/{supplierId}
 * Body: { name?, contactName?, phone?, email? }
 */
export async function updateSupplier(supplierId, body) {
  const res = await fetchWithTimeout(`${BASE_URL}/suppliers/${supplierId}`, {
    method: "PUT",
    headers: writeHeaders(),
    body: JSON.stringify(body),
  });
  return unwrap(res);
}

// ── Eliminación ───────────────────────────────────────────────────────────────

/**
 * DELETE /suppliers/{supplierId}/unlink
 * Solo rompe el vínculo tienda-proveedor. No borra el proveedor globalmente.
 */
export async function unlinkSupplier(supplierId) {
  const res = await fetchWithTimeout(`${BASE_URL}/suppliers/${supplierId}/unlink`, {
    method: "DELETE",
    headers: readHeaders(),
  });
  return unwrap(res);
}

/**
 * DELETE /suppliers/{supplierId}
 * Soft-delete global. Requiere X-User-Role: ADMIN.
 */
export async function deactivateSupplier(supplierId) {
  const res = await fetchWithTimeout(`${BASE_URL}/suppliers/${supplierId}`, {
    method: "DELETE",
    headers: adminHeaders(),
  });
  return unwrap(res);
}
