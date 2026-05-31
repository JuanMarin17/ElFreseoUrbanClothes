// ══════════════════════════════════════════════════════════════════════════════
// CategoryService.js — /api/v1/categories
// Requiere: Authorization, X-Store-Id (GET); + X-User-Role (escritura)
// ══════════════════════════════════════════════════════════════════════════════

const BASE_URL = "http://localhost:8080/api/v1";

const readHeaders = () => {
  const jwt     = localStorage.getItem("jwt");
  const storeId = localStorage.getItem("storeId");
  const h = {};
  if (jwt)     h["Authorization"] = `Bearer ${jwt}`;
  if (storeId) h["X-Store-Id"]    = storeId;
  return h;
};

const writeHeaders = () => ({
  ...readHeaders(),
  "Content-Type": "application/json",
  "X-User-Role":  localStorage.getItem("userRole") ?? "OWNER",
});

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
  const res = await fetch(`${BASE_URL}/categories/active`, { headers: readHeaders() });
  return unwrap(res);
};

/** GET /categories/getAllCategories */
export const getAllCategories = async () => {
  const res = await fetch(`${BASE_URL}/categories/getAllCategories`, { headers: readHeaders() });
  return unwrap(res);
};

// ── Escritura ─────────────────────────────────────────────────────────────────

/** POST /categories/createCategory  Body: { name } */
export const createCategory = async (name) => {
  const res = await fetch(`${BASE_URL}/categories/createCategory`, {
    method: "POST",
    headers: writeHeaders(),
    body: JSON.stringify({ name }),
  });
  return unwrap(res);
};

/** PUT /categories/:id  Body: { name } */
export const updateCategory = async (id, name) => {
  const res = await fetch(`${BASE_URL}/categories/${id}`, {
    method: "PUT",
    headers: writeHeaders(),
    body: JSON.stringify({ name }),
  });
  return unwrap(res);
};

/** PUT /categories/active/:id */
export const activateCategory = async (id) => {
  const res = await fetch(`${BASE_URL}/categories/active/${id}`, {
    method: "PUT",
    headers: readHeaders(),
  });
  return unwrap(res);
};

/** DELETE /categories/:id  (soft delete) */
export const deleteCategory = async (id) => {
  const res = await fetch(`${BASE_URL}/categories/${id}`, {
    method: "DELETE",
    headers: readHeaders(),
  });
  return unwrap(res);
};
