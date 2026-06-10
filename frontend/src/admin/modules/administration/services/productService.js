/**
 * productService.js
 * Integración con el microservicio de productos.
 */

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api/v1";

// ─── Headers ─────────────────────────────────────────────────────────────────
const buildHeaders = (extra = {}) => {
  const h = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const jwt     = localStorage.getItem("jwt");
  const storeId = localStorage.getItem("storeId");

  if (jwt && jwt !== "null") {
    h["Authorization"] = `Bearer ${jwt}`;
    try {
      const decoded = JSON.parse(atob(jwt.split(".")[1]));
      if (decoded.user_id) h["X-User-Id"] = decoded.user_id;
    } catch { /* silent */ }
  }
  if (storeId && storeId !== "null") h["X-Store-Id"] = storeId;

  return { ...h, ...extra };
};

// ─── Fetch base ───────────────────────────────────────────────────────────────
async function request(method, path, { body, params, extraHeaders } = {}) {
  let url = `${BASE}${path}`;
  if (params) {
    const qs = new URLSearchParams(params).toString();
    if (qs) url += `?${qs}`;
  }

  const options = { method, headers: buildHeaders(extraHeaders) };
  if (body !== undefined) options.body = JSON.stringify(body);

  const res = await fetch(url, options);

  if (res.status === 204) return [];

  let data;
  try { data = await res.json(); } catch { data = {}; }

  if (!res.ok) {
    const msg = data?.message ?? data?.error ?? `Error ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.errors = data?.errors ?? null;
    throw err;
  }

  return data?.data ?? data;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCTOS
// ═══════════════════════════════════════════════════════════════════════════════

export const getProducts          = (page = 0, size = 10) =>
  request("GET", "/products", { params: { page, size } });

export const getActiveProducts    = (page = 0, size = 10) =>
  request("GET", "/products/active", { params: { page, size } });

export const getAllProducts = (storeId) => {
  const id = storeId ?? localStorage.getItem("storeId");
  if (!id || id === "null") throw new Error("Se requiere el storeId para obtener productos.");
  return request("GET", "/products/all", { extraHeaders: { "X-Store-Id": id } });
};

export const getAllActiveProducts  = (storeId) => {
  const id = storeId ?? localStorage.getItem("storeId");
  return request("GET", "/products/all/active", {
    ...(id && id !== "null" ? { extraHeaders: { "X-Store-Id": id } } : {}),
  });
};
export const getNewProducts       = () => request("GET", "/products/new");
export const getNewActiveProducts = () => request("GET", "/products/new/active");
export const getProductById       = (id) => request("GET", `/products/${id}`);

export const getPublicActiveProducts = (storeId) => {
  const id = storeId ?? localStorage.getItem("storeId");
  if (!id || id === "null") throw new Error("Se requiere el storeId.");
  return request("GET", "/products/active", {
    extraHeaders: { "X-Store-Id": id },
  });
};

export const createProduct     = (data) =>
  request("POST", "/products", { body: buildProductPayload(data) });

export const updateProduct     = (id, data) =>
  request("PUT", `/products/${id}`, { body: buildProductPayload(data) });

export const inactivateProduct = (id) =>
  request("PUT", `/products/inactive/${id}`);

export const activateProduct   = (id) =>
  request("PUT", `/products/active/${id}`);

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORÍAS
// ═══════════════════════════════════════════════════════════════════════════════

export const getActiveCategories  = () =>
  request("GET", "/categories/active");

export const getAllCategories      = () =>
  request("GET", "/categories/getAllCategories");

export const createCategory       = (name) =>
  request("POST", "/categories/createCategory", { body: { name } });

export const updateCategory       = (id, name) =>
  request("PUT", `/categories/${id}`, { body: { name } });

export const activateCategory     = (id) => request("PUT",    `/categories/active/${id}`);
export const deactivateCategory   = (id) => request("DELETE", `/categories/${id}`);

// ═══════════════════════════════════════════════════════════════════════════════
// MARCAS
// ═══════════════════════════════════════════════════════════════════════════════

export const getActiveBrands  = () =>
  request("GET", "/brands/active");

export const getAllBrands      = () =>
  request("GET", "/brands/getAllBrands");

export const createBrand      = (name) =>
  request("POST", "/brands/createBrand", { body: { name } });

export const updateBrand      = (id, name) =>
  request("PUT", `/brands/${id}`, { body: { name } });

export const activateBrand    = (id) => request("PUT", `/brands/active/${id}`);
export const inactivateBrand  = (id) => request("PUT", `/brands/inactive/${id}`);

// ═══════════════════════════════════════════════════════════════════════════════
// VARIANTES — stock
// ═══════════════════════════════════════════════════════════════════════════════

export const increaseStock  = (variantId, amount) =>
  request("PATCH", `/variants/${variantId}/stock/increase`, { body: { amount } });

export const decreaseStock  = (variantId, amount) =>
  request("PATCH", `/variants/${variantId}/stock/decrease`, { body: { amount } });

export const updateMinStock = (variantId, minStock) =>
  request("PATCH", `/variants/${variantId}/min-stock`, { body: { minStock } });

// ═══════════════════════════════════════════════════════════════════════════════
// ALERTAS DE STOCK — SSE (no requiere JWT)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Uso:
 *   const close = subscribeStockAlerts((alert) => console.log(alert));
 *   // Para desconectar: close();
 */
export const subscribeStockAlerts = (onAlert, onError) => {
  const source = new EventSource(`${BASE}/alerts/stock/stream`);

  source.onmessage = (e) => {
    try { onAlert(JSON.parse(e.data)); } catch { /* ignorar */ }
  };

  if (onError) source.onerror = onError;

  return () => source.close();
};

// ─── Builder interno ──────────────────────────────────────────────────────────
function buildProductPayload(data) {
  return {
    name:        data.name,
    description: data.description ?? "",
    brandId:     data.brandId     || null,
    categoryIds: data.categoryIds ?? [],
    images:      data.images      ?? [],
    variants:    data.variants    ?? [],
  };
}

// ─── Aliases de compatibilidad ────────────────────────────────────────────────
export const syncApiContext = () => {};
export const authHeaders    = () => ({});
export const extractData    = (r) => r?.data ?? r;
