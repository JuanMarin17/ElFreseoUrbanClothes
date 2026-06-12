const KEY = "vexio_wishlist";

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function write(items) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("wishlist-updated"));
}

export const getWishlist = () => read();

export const isWishlisted = (productId) => read().some((p) => p.id === productId);

export const addToWishlist = (product) => {
  const items = read();
  if (items.some((p) => p.id === product.id)) return;
  const rawSlug = localStorage.getItem("storeSlug");
  const storeSlug = rawSlug && rawSlug !== "null" && rawSlug !== "undefined" ? rawSlug : null;
  write([
    ...items,
    {
      id:             product.id,
      name:           product.name,
      priceFormatted: product.priceFormatted,
      image:          product.images?.[0]?.url ?? product.image ?? null,
      storeId:        product.storeId ?? null,
      storeSlug,
    },
  ]);
};

export const removeFromWishlist = (productId) => {
  write(read().filter((p) => p.id !== productId));
};

export const toggleInWishlist = (product) => {
  if (isWishlisted(product.id)) {
    removeFromWishlist(product.id);
    return false;
  }
  addToWishlist(product);
  return true;
};
