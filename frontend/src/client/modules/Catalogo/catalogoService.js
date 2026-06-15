/**
 * catalogoService.js
 * Obtiene productos de TODAS las tiendas.
 * Estrategia: primero sin X-Store-Id, luego con storeId de localStorage si falla.
 */

const API_BASE =
  import.meta.env.VITE_API_URL ??
  import.meta.env.VITE_API_BASE_URL ??
  "http://46.225.21.146:8080/api/v1";

const COLOR_HEX_MAP = {
  BLANCO: "#F8F8F8", NEGRO: "#111111", AZUL: "#1D4ED8", ROJO: "#DC2626",
  VERDE: "#16A34A", AMARILLO: "#CA8A04", GRIS: "#6B7280", BEIGE: "#D4B896",
  ROSADO: "#EC4899", MORADO: "#7C3AED", NARANJA: "#EA580C", CAFE: "#92400E",
};

function buildHeaders(withStoreId = false) {
  const jwt     = localStorage.getItem("jwt");
  const storeId = localStorage.getItem("storeId");
  const h = { "Content-Type": "application/json", Accept: "application/json" };
  if (jwt && jwt !== "null") {
    h.Authorization = `Bearer ${jwt}`;
    try {
      const decoded = JSON.parse(atob(jwt.split(".")[1]));
      if (decoded.user_id) h["X-User-Id"]   = decoded.user_id;
      if (decoded.role)    h["X-User-Role"]  = decoded.role;
    } catch { /* silent */ }
  }
  if (withStoreId && storeId && storeId !== "null" && storeId !== "undefined") {
    h["X-Store-Id"] = storeId;
  }
  return h;
}

function extractStoreName(p) {
  // Rutas directas del producto
  return (
    p.storeName           ??
    p.store_name          ??
    p.storeSlug           ??
    p.store_slug          ??
    // Objetos anidados comunes
    p.store?.name         ??
    p.store?.storeName    ??
    p.store?.slug         ??
    p.storeInfo?.name     ??
    p.storeInfo?.storeName??
    p.storeDetails?.name  ??
    p.storeDetails?.storeName ??
    p.owner?.storeName    ??
    null
  );
}

function normalizeProduct(p, storeNameMap = {}) {
  const variants = Array.isArray(p.variants) ? p.variants : [];
  const prices = variants.map(v => v.price).filter(n => typeof n === 'number' && !isNaN(n));
  const price = prices.length > 0 ? Math.min(...prices) : 0;

  const colors = [];
  const colorSeen = new Set();
  variants.forEach(v => {
    if (v.color && !colorSeen.has(v.color)) {
      colorSeen.add(v.color);
      colors.push({ name: v.color, hex: COLOR_HEX_MAP[v.color.toUpperCase()] ?? "#6B7280" });
    }
  });

  const sizes = [];
  const sizeSeen = new Set();
  variants.forEach(v => {
    if (v.size && !sizeSeen.has(v.size)) {
      sizeSeen.add(v.size);
      sizes.push(v.size);
    }
  });

  const stock   = variants.reduce((s, v) => s + (v.stock ?? 0), 0);
  const storeId = p.storeId ?? null;

  // Prioridad: campo directo → mapa de tiendas → null
  const storeName = extractStoreName(p) ?? storeNameMap[storeId] ?? null;

  if (import.meta.env.DEV && !storeName && storeId) {
    console.warn("[catalogoService] Sin storeName para storeId:", storeId, "— campos del producto:", Object.keys(p));
  }

  return {
    id:             p.productId ?? p.id,
    name:           p.name ?? "Producto",
    description:    p.description ?? "",
    brand:          p.brandName ?? p.brand ?? "",
    storeId,
    storeName,
    status:         p.status,
    categories:     Array.isArray(p.categories) ? p.categories : [],
    price,
    priceFormatted: new Intl.NumberFormat("es-CO", {
      style: "currency", currency: "COP", maximumFractionDigits: 0,
    }).format(price),
    image:          p.images?.[0]?.url ?? null,
    images:         Array.isArray(p.images) ? p.images : [],
    colors,
    sizes,
    stock,
    rawVariants:    variants,
    tags:           Array.isArray(p.tags) ? p.tags : [],
    rating:         parseFloat(p.rating ?? p.averageRating ?? p.avgRating ?? p.score) || null,
    reviewCount:    p.reviewCount ?? p.reviewsCount ?? p.totalReviews ?? p.numReviews ?? 0,
  };
}

/** Obtiene mapa storeId → storeName desde la API de tiendas */
async function fetchStoreNameMap(headers) {
  const endpoints = ["/stores", "/stores/all", "/stores/active"];
  for (const ep of endpoints) {
    try {
      const res  = await fetch(`${API_BASE}${ep}`, { headers });
      if (!res.ok) continue;
      const json = await res.json();
      const list = Array.isArray(json?.data) ? json.data
                 : Array.isArray(json)        ? json
                 : Array.isArray(json?.content) ? json.content
                 : null;
      if (!list) continue;
      const map = {};
      list.forEach(s => {
        const id   = s.storeId ?? s.id;
        const name = s.name ?? s.storeName ?? s.slug ?? s.storeSlug;
        if (id && name) map[id] = name;
      });
      if (Object.keys(map).length > 0) return map;
    } catch { /* siguiente */ }
  }
  return {};
}

function isActive(p) {
  if (!p.status) return true; // sin status → incluir
  const s = p.status.toUpperCase();
  return s === "ACTIVE" || s === "PUBLISHED" || s === "AVAILABLE";
}

function extractList(json) {
  if (Array.isArray(json?.data))    return json.data;
  if (Array.isArray(json))          return json;
  if (Array.isArray(json?.content)) return json.content;
  if (Array.isArray(json?.items))   return json.items;
  return null;
}

async function tryEndpoints(headers) {
  const endpoints = [
    "/products/all/active",
    "/products/all",
    "/products/active",
    "/products",
  ];
  for (const ep of endpoints) {
    try {
      const res = await fetch(`${API_BASE}${ep}`, { headers });
      if (!res.ok) continue;
      const json = await res.json();
      const list = extractList(json);
      if (list && list.length > 0) return list;
    } catch { /* intentar siguiente */ }
  }
  return null;
}

/**
 * Catálogo público — intenta sin token primero.
 * Si el backend responde 401 (aún no habilitado como público), reintenta
 * con JWT si el usuario tiene sesión activa.
 * 200 → array en json.data | 204 → sin productos → []
 */
export async function fetchCatalogProducts() {
  const publicHeaders = { Accept: "application/json" };

  let res = await fetch(`${API_BASE}/products/all/active`, { headers: publicHeaders });

  if (res.status === 401) {
    const jwt = localStorage.getItem("jwt");
    if (jwt && jwt !== "null") {
      const authHeaders = { Accept: "application/json", Authorization: `Bearer ${jwt}` };
      res = await fetch(`${API_BASE}/products/all/active`, { headers: authHeaders });
    }
  }

  if (res.status === 204) return [];
  if (!res.ok) throw new Error(`Error al cargar productos (${res.status})`);

  const json = await res.json();
  const raw = Array.isArray(json?.data) ? json.data : [];

  if (raw.length === 0) return [];

  const storeNameMap = await fetchStoreNameMap(publicHeaders);
  return raw.filter(isActive).map(p => normalizeProduct(p, storeNameMap));
}

// ── Tastes ────────────────────────────────────────────────────────────────────

export function getUserTastes() {
  try {
    const val = localStorage.getItem("vexio_tastes_completed");
    if (!val || val === "skipped") return null;
    const parsed = JSON.parse(val);
    return typeof parsed === "object" && parsed !== null ? parsed : null;
  } catch { return null; }
}

const COLOR_TASTE_MAP = {
  "neutros (negro, blanco, gris)": ["negro", "blanco", "gris"],
  "colores vivos":                  ["rojo", "naranja", "amarillo", "rosado", "morado"],
  "azules":                         ["azul"],
  "verdes":                         ["verde"],
};

const PRICE_RANGE_MAP = {
  "menos de $50.000":    [0, 50000],
  "$50.000 - $100.000":  [50000, 100000],
  "$100.000 - $150.000": [100000, 150000],
  "más de $150.000":     [150000, Infinity],
};

export function scoreProductForTastes(product, tastes) {
  if (!tastes) return 0;
  let score = 0;

  const cats = (tastes.categorias ?? []).map(c => c.toLowerCase());
  if (cats.length) {
    const pCats = product.categories.map(c => c.toLowerCase());
    if (pCats.some(pc => cats.some(tc => pc.includes(tc) || tc.includes(pc)))) score += 3;
  }

  const colorPrefs = (tastes.colores ?? []).map(c => c.toLowerCase());
  if (colorPrefs.length && !colorPrefs.includes("sin preferencia")) {
    const wanted = colorPrefs.flatMap(cp => COLOR_TASTE_MAP[cp] ?? []);
    const pColors = product.colors.map(c => c.name.toLowerCase());
    if (pColors.some(pc => wanted.some(w => pc.includes(w)))) score += 2;
  }

  const budgets = (tastes.presupuesto ?? []).map(b => b.toLowerCase());
  if (budgets.length) {
    const range = PRICE_RANGE_MAP[budgets[0]];
    if (range && product.price >= range[0] && product.price <= range[1]) score += 1;
  }

  return score;
}
