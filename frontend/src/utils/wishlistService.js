import { authFetch } from "./authFetch";

const KEY  = "vexio_wishlist";
const BASE = "http://46.225.21.146:8080/api/v1/wishlist";

/* ── helpers locales ───────────────────────────────────────────────────────── */
function read() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function write(items) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("wishlist-updated"));
}

function getJwt()     { return localStorage.getItem("jwt"); }
function getStoreId() { return localStorage.getItem("storeId"); }
function isAuthed()   { const j = getJwt(); return !!(j && j !== "null"); }

function apiHeaders() {
  const jwt     = getJwt();
  const storeId = getStoreId();
  const h = { Accept: "application/json", "Content-Type": "application/json" };
  if (jwt && jwt !== "null")         h.Authorization = `Bearer ${jwt}`;
  if (storeId && storeId !== "null") h["X-Store-Id"] = storeId;
  return h;
}

function formatPrice(price) {
  if (price == null) return "";
  return new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", maximumFractionDigits: 0,
  }).format(price);
}

/* ── localStorage (funcionan sin sesión) ─────────────────────────────────── */
export const getWishlist = () => read();

export const isWishlisted = (productId) =>
  read().some(p => p.id === productId);

export const addToWishlist = (product) => {
  const items = read();
  if (items.some(p => p.id === product.id)) return;
  const storeSlug = localStorage.getItem("storeSlug");
  write([...items, {
    id:             product.id,
    name:           product.name,
    priceFormatted: product.priceFormatted,
    image:          product.images?.[0]?.url ?? product.image ?? null,
    storeId:        product.storeId ?? null,
    storeSlug:      storeSlug && storeSlug !== "null" ? storeSlug : null,
  }]);
};

export const removeFromWishlist = (productId) => {
  write(read().filter(p => p.id !== productId));
};

export const toggleInWishlist = (product) => {
  if (isWishlisted(product.id)) { removeFromWishlist(product.id); return false; }
  addToWishlist(product);
  return true;
};

/* ── backend (requiere sesión activa) ────────────────────────────────────── */

/** Carga la wishlist del servidor y sobreescribe el localStorage */
export async function syncWishlistFromBackend() {
  if (!isAuthed()) return;
  try {
    const res = await authFetch(BASE, { headers: apiHeaders() });
    if (!res.ok) return;
    const json = await res.json();
    const list = Array.isArray(json) ? json
      : Array.isArray(json?.data)    ? json.data
      : Array.isArray(json?.content) ? json.content
      : [];
    const normalized = list.map(item => ({
      id:             item.productId ?? item.id,
      name:           item.name ?? item.productName ?? "Producto",
      priceFormatted: item.priceFormatted ?? formatPrice(item.price),
      image:          item.image ?? item.images?.[0]?.url ?? null,
      storeId:        item.storeId ?? null,
      storeSlug:      item.storeSlug ?? null,
    }));
    write(normalized);
  } catch { /* sin conexión — el localStorage sigue siendo la fuente */ }
}

/** Agrega al backend (con actualización optimista en localStorage) */
export async function addToWishlistApi(product) {
  addToWishlist(product);
  if (!isAuthed()) return;
  try {
    await authFetch(BASE, {
      method:  "POST",
      headers: apiHeaders(),
      body:    JSON.stringify({ productId: product.id }),
    });
  } catch { /* el ítem ya fue añadido localmente */ }
}

/** Quita del backend (con actualización optimista en localStorage) */
export async function removeFromWishlistApi(productId) {
  removeFromWishlist(productId);
  if (!isAuthed()) return;
  try {
    await authFetch(`${BASE}/${productId}`, {
      method:  "DELETE",
      headers: apiHeaders(),
    });
  } catch { /* ya fue quitado localmente */ }
}

/** Toggle wishlsit con sincronía al backend */
export async function toggleWishlistApi(product) {
  if (isWishlisted(product.id)) {
    await removeFromWishlistApi(product.id);
    return false;
  }
  await addToWishlistApi(product);
  return true;
}
