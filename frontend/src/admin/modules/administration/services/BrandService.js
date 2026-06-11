// ══════════════════════════════════════════════════════════════════════════════
// BrandService.js — /api/v1/brands
// Requiere: Authorization, X-Store-Id (GET); + X-User-Role (escritura)
// ══════════════════════════════════════════════════════════════════════════════

const BASE_URL = "http://46.225.21.146:8080/api/v1";


const readHeaders = () => {
  const jwt = localStorage.getItem("jwt");
  const storeId = localStorage.getItem("storeId");
  const h = {};
  if (jwt) h["Authorization"] = `Bearer ${jwt}`;
  if (storeId) h["X-Store-Id"] = storeId;
  return h;
};

const writeHeaders = () => ({
  ...readHeaders(),
  "Content-Type": "application/json",
  "X-User-Role": localStorage.getItem("userRole") ?? "OWNER",
});

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

/** GET /brands/active */
export const getBrands = async () => {
  const res = await fetch(`${BASE_URL}/brands/active`, {
    headers: readHeaders(),
  });
  return unwrap(res);
};

/** GET /brands/getAllBrands */
export const getAllBrands = async () => {
  const res = await fetch(`${BASE_URL}/brands/getAllBrands`, {
    headers: readHeaders(),
  });
  return unwrap(res);
};

// ── Escritura ─────────────────────────────────────────────────────────────────

/** POST /brands/createBrand  Body: { name } */
export const createBrand = async (name) => {
  const res = await fetch(`${BASE_URL}/brands/createBrand`, {
    method: "POST",
    headers: writeHeaders(),
    body: JSON.stringify({ name }),
  });
  return unwrap(res);
};

/** PUT /brands/:id  Body: { name } */
export const updateBrand = async (id, name) => {
  const res = await fetch(`${BASE_URL}/brands/${id}`, {
    method: "PUT",
    headers: writeHeaders(),
    body: JSON.stringify({ name }),
  });
  return unwrap(res);
};

/** PUT /brands/active/:id */
export const activateBrand = async (id) => {
  const res = await fetch(`${BASE_URL}/brands/active/${id}`, {
    method: "PUT",
    headers: readHeaders(),
  });
  return unwrap(res);
};

/** PUT /brands/inactive/:id */
export const inactivateBrand = async (id) => {
  const res = await fetch(`${BASE_URL}/brands/inactive/${id}`, {
    method: "PUT",
    headers: readHeaders(),
  });
  return unwrap(res);
};
