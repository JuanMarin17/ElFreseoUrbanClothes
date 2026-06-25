// ══════════════════════════════════════════════════════════════════════════════
// CategoryService.js — /api/v1/categories
// Requiere: Authorization, X-Store-Id (GET); + X-User-Role (escritura)
// ══════════════════════════════════════════════════════════════════════════════

const BASE_URL = import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_URL;

const readHeaders = () => {
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
};

const writeHeaders = () => ({
  ...readHeaders(),
  "Content-Type": "application/json",
  "X-User-Role": localStorage.getItem("userRole") ?? "OWNER",
});

// fetch con timeout: si el backend no responde en timeoutMs, aborta en vez de
// dejar el botón colgado en estado de carga para siempre.
const fetchWithTimeout = (url, options = {}, timeoutMs = 10000) => {
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(new Error("El servidor no respondió a tiempo. Intenta de nuevo.")),
    timeoutMs,
  );
  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timer),
  );
};

// Desenvuelve { message, status, data, timestamp } → data
const unwrap = async (res) => {
  const text = await res.text();
  if (res.status === 204 || !text) return [];
  if (!res.ok) throw new Error(text || `Error ${res.status}`);
  try {
    const parsed = JSON.parse(text);
    return parsed?.data ?? parsed;
  } catch {
    throw new Error("Respuesta no válida del servidor");
  }
};

// ── Lectura ───────────────────────────────────────────────────────────────────

/** GET /categories/active */
export const getCategories = async () => {
  const res = await fetchWithTimeout(`${BASE_URL}/categories/active`, {
    headers: readHeaders(),
  });
  return unwrap(res);
};

/** GET /categories/getAllCategories */
export const getAllCategories = async () => {
  const res = await fetchWithTimeout(`${BASE_URL}/categories/getAllCategories`, {
    headers: readHeaders(),
  });
  return unwrap(res);
};

// ── Escritura ─────────────────────────────────────────────────────────────────

/** POST /categories/createCategory  Body: { name } */
export const createCategory = async (name) => {
  const res = await fetchWithTimeout(`${BASE_URL}/categories/createCategory`, {
    method: "POST",
    headers: writeHeaders(),
    body: JSON.stringify({ name }),
  });
  return unwrap(res);
};

/**
 * PUT /categories/:id
 * payload: { name, attribute1Label?, attribute1Options?, attribute2Label?, attribute2Options?, attribute2IsColor? }
 * Acepta también un string por compatibilidad: updateCategory(id, "Nuevo nombre")
 */
export const updateCategory = async (id, payload) => {
  const body = typeof payload === "string" ? { name: payload } : payload;
  const res = await fetchWithTimeout(`${BASE_URL}/categories/${id}`, {
    method: "PUT",
    headers: writeHeaders(),
    body: JSON.stringify(body),
  });
  return unwrap(res);
};

/** PUT /categories/active/:id */
export const activateCategory = async (id) => {
  const res = await fetchWithTimeout(`${BASE_URL}/categories/active/${id}`, {
    method: "PUT",
    headers: writeHeaders(),
  });
  return unwrap(res);
};

/** DELETE /categories/:id  (soft delete) */
export const deleteCategory = async (id) => {
  const res = await fetchWithTimeout(`${BASE_URL}/categories/${id}`, {
    method: "DELETE",
    headers: writeHeaders(),
  });
  return unwrap(res);
};
