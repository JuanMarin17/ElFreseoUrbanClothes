import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://46.225.21.146:8080/api";

const productApi = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

productApi.interceptors.request.use((config) => {
  const jwt     = localStorage.getItem("jwt");
  const storeId = localStorage.getItem("storeId");

  if (jwt && jwt !== "null") {
    config.headers.Authorization = `Bearer ${jwt}`;
    try {
      const decoded = JSON.parse(atob(jwt.split(".")[1]));
      if (decoded.user_id) config.headers["X-User-Id"]   = decoded.user_id;
      if (decoded.role)    config.headers["X-User-Role"] = decoded.role;
    } catch { /* token malformado, se ignora */ }
  }
  if (storeId && storeId !== "null") {
    config.headers["X-Store-Id"] = storeId;
  }
  return config;
});

productApi.interceptors.response.use(
  (response) => response.data, // Devuelve el wrapper completo { message, status, data }
  (error) => {
    const message =
      error.response?.data?.message || error.message || "Error desconocido";
    return Promise.reject(new Error(message));
  },
);

/* ─────────────────────────────────────────────────────────────
   NORMALIZADORES
   Transforman la estructura del backend al contrato
   interno que usan los componentes React.
   Si el backend cambia, solo se toca aquí.
   ───────────────────────────────────────────────────────────── */

/**
 * Normaliza el array de imágenes del backend.
 *
 * Backend:  [{ url: "https://..." }, { url: "https://..." }]
 * Interno:  [{ id, url, alt, isMain }]
 *
 * @param {{ url: string }[]} images
 * @param {string}            productName
 */
function normalizeImages(images = [], productName = "Producto") {
  if (!Array.isArray(images) || images.length === 0) return [];

  return images.map((img, index) => ({
    id: index,
    url: img.url,
    alt:
      index === 0
        ? `${productName} - imagen principal`
        : `${productName} - imagen ${index + 1}`,
    isMain: index === 0,
  }));
}

/**
 * Extrae los colores únicos del array de variantes.
 *
 * Backend:  variants[].color  → "BLANCO", "AZUL"...
 * Interno:  [{ id, name, hex }]
 *
 * El hex se asigna con un mapa base; colores no mapeados
 * reciben un gris neutro. Ampliar el mapa según el catálogo.
 *
 * @param {{ color: string }[]} variants
 */
const COLOR_HEX_MAP = {
  BLANCO: "#F8F8F8",
  NEGRO: "#111111",
  AZUL: "#1D4ED8",
  ROJO: "#DC2626",
  VERDE: "#16A34A",
  AMARILLO: "#CA8A04",
  GRIS: "#6B7280",
  BEIGE: "#D4B896",
  ROSADO: "#EC4899",
  MORADO: "#7C3AED",
  NARANJA: "#EA580C",
  CAFE: "#92400E",
};

function normalizeColors(variants = []) {
  const seen = new Set();
  return variants
    .filter((v) => {
      if (!v.color) return false;          // descarta variantes sin color
      if (seen.has(v.color)) return false;
      seen.add(v.color);
      return true;
    })
    .map((v, index) => ({
      id: index,
      name: v.color,
      hex: COLOR_HEX_MAP[v.color.toUpperCase()] ?? "#6B7280",
    }));
}

/**
 * Extrae las tallas únicas del array de variantes.
 *
 * Backend:  variants[].size  → "S", "M", "L"...
 * Interno:  [{ id, name, available }]
 *
 * Una talla está disponible si al menos una variante
 * con esa talla tiene stock > 0.
 *
 * @param {{ size: string, stock: number }[]} variants
 */
function normalizeSizes(variants = []) {
  const sizeMap = new Map();

  variants.forEach((v) => {
    if (!v.size) return;                   // descarta variantes sin talla
    if (!sizeMap.has(v.size)) {
      sizeMap.set(v.size, { available: false });
    }
    if (v.stock > 0) {
      sizeMap.get(v.size).available = true;
    }
  });

  return Array.from(sizeMap.entries()).map(([size, meta], index) => ({
    id: index,
    name: size,
    available: meta.available,
  }));
}

/**
 * Calcula el stock total visible sumando todas las variantes.
 * Se usa para el StockIndicator cuando no hay variante seleccionada.
 *
 * @param {{ stock: number }[]} variants
 */
function totalStock(variants = []) {
  return variants.reduce((sum, v) => sum + (v.stock ?? 0), 0);
}

/**
 * Normaliza el producto completo del backend al contrato interno.
 *
 * Entrada (backend):
 * {
 *   message, status, timestamp,
 *   data: { productId, name, description, brandName, status,
 *           variants: [{ variantId, sku, price, stock, minStock, size, color }],
 *           images:   [{ url }],
 *           categories: [string] }
 * }
 *
 * Salida (interno):
 * {
 *   id, name, description, brand, status, createdAt,
 *   images:    [{ id, url, alt, isMain }],
 *   colors:    [{ id, name, hex }],
 *   sizes:     [{ id, name, available }],
 *   variants:  [...original del backend],
 *   categories:[string],
 *   stock:     number,
 *   price:     number,
 *   priceFormatted: string,
 * }
 *
 * @param {{ message, status, data }} response
 */
function normalizeProduct(response) {
  const d = response?.data ?? response;

  if (!d || (!d.productId && !d.id)) {
    throw new Error("El producto no fue encontrado o la respuesta es inválida.");
  }

  const price = d.variants?.[0]?.price ?? 0;

  return {
    // Identidad
    id: d.productId,
    name: d.name,
    description: d.description,
    brand: d.brandName,
    status: d.status,
    createdAt: d.createdAt,

    // Imágenes normalizadas para ProductGallery
    images: normalizeImages(d.images, d.name),

    // Colores y tallas extraídos de variantes
    colors: normalizeColors(d.variants),
    sizes: normalizeSizes(d.variants),

    // Variantes originales (para calcular stock/precio al seleccionar)
    rawVariants: d.variants ?? [],

    // Categorías
    categories: d.categories ?? [],

    // Stock y precio calculados
    stock: totalStock(d.variants),
    price,
    priceFormatted: new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(price),
  };
}

/* ─────────────────────────────────────────────────────────────
   ENDPOINTS
   ───────────────────────────────────────────────────────────── */

/**
 * Obtiene el detalle completo de un producto.
 * GET /api/products/:id
 *
 * @param {string} productId  UUID del producto
 */
export const fetchProductById = async (productId) => {
  const response = await productApi.get(`/products/${productId}`);
  return normalizeProduct(response);
};

/**
 * Reseñas: el endpoint no está implementado en el backend todavía.
 * Retorna estructura vacía para no bloquear la carga de la página.
 */
export const fetchProductReviews = (_productId, _page = 0, _size = 10) =>
  Promise.resolve({ content: [], last: true, totalElements: 0 });

/**
 * Productos relacionados: el backend no tiene un endpoint /related.
 * Obtiene todos los productos de la tienda y filtra los primeros `limit`
 * que no sean el producto actual.
 */
export const fetchRelatedProducts = async (productId, limit = 4) => {
  const storeId = localStorage.getItem("storeId");
  if (!storeId || storeId === "null") return [];

  try {
    const wrapper = await productApi.get("/products/all");
    const list = Array.isArray(wrapper?.data) ? wrapper.data
               : Array.isArray(wrapper)        ? wrapper
               : [];

    const fmt = new Intl.NumberFormat("es-CO", {
      style: "currency", currency: "COP", maximumFractionDigits: 0,
    });

    return list
      .filter((p) => (p.productId ?? p.id) !== productId && p.status === "ACTIVE")
      .slice(0, limit)
      .map((p) => ({
        id:             p.productId ?? p.id,
        name:           p.name,
        categoryName:   p.categories?.[0] ?? "",
        priceFormatted: fmt.format(p.variants?.[0]?.price ?? 0),
        rating:         null,
        reviewCount:    0,
        thumbnailUrl:   p.images?.[0]?.url ?? null,
      }));
  } catch {
    return [];
  }
};

/**
 * Agrega un ítem al carrito.
 * Endpoint pendiente de implementación en el backend.
 * Por ahora resuelve con éxito para no bloquear la UX.
 */
export const addToCart = (_payload) =>
  Promise.resolve({ success: true });

/**
 * Alterna el estado de wishlist.
 * Endpoint pendiente de implementación en el backend.
 */
export const toggleWishlist = (_payload) =>
  Promise.resolve({ wishlisted: true });
