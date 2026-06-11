import { useState, useEffect, useCallback } from "react";
import {
  fetchProductById,
  fetchProductReviews,
  fetchRelatedProducts,
  addToCart,
  toggleWishlist,
} from "./productService";

/**
 * useProduct
 *
 * Hook que maneja todo el estado de la página de producto.
 *
 * Sobre variantes:
 * El backend devuelve variantes con { variantId, size, color, stock, price }.
 * Cuando el usuario selecciona color + talla, este hook busca
 * la variante exacta en rawVariants y actualiza precio/stock en tiempo real.
 *
 * @param {string} productId - UUID desde useParams()
 */
export function useProduct(productId) {
  // ── Datos del servidor ──────────────────────────────
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [related, setRelated] = useState([]);
  const [reviewPage, setReviewPage] = useState(0);
  const [hasMoreReviews, setHasMoreReviews] = useState(true);

  // ── Selecciones de UI ───────────────────────────────
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null); // { id, name, hex }
  const [selectedSize, setSelectedSize] = useState(null); // { id, name, available }
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [wishlisted, setWishlisted] = useState(false);

  // ── Variante activa (calculada de color + talla) ────
  // Es la rawVariant del backend que coincide con la selección actual.
  const [activeVariant, setActiveVariant] = useState(null);

  // ── Estados de carga ────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);

  // ── Carga inicial ───────────────────────────────────
  useEffect(() => {
    if (!productId) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      setSelectedImage(0);
      setQuantity(1);

      try {
        // El producto es crítico; reviews y related son opcionales
        const [productResult, reviewResult, relatedResult] = await Promise.allSettled([
          fetchProductById(productId),
          fetchProductReviews(productId, 0),
          fetchRelatedProducts(productId),
        ]);

        if (cancelled) return;

        // Si el producto falla, mostramos el error
        if (productResult.status === "rejected") {
          throw productResult.reason;
        }

        const productData = productResult.value;
        const reviewData  = reviewResult.status  === "fulfilled" ? reviewResult.value  : null;
        const relatedData = relatedResult.status === "fulfilled" ? relatedResult.value : [];

        setProduct(productData);
        setReviews(reviewData?.content ?? []);
        setHasMoreReviews(reviewData ? !reviewData.last : false);
        setRelated(Array.isArray(relatedData) ? relatedData : []);

        // Preselecciona primer color y primera talla disponible
        const firstColor = productData.colors?.[0] ?? null;
        const firstSize =
          productData.sizes?.find((s) => s.available) ??
          productData.sizes?.[0] ??
          null;
        setSelectedColor(firstColor);
        setSelectedSize(firstSize);

        // Calcula la variante activa inicial
        const initial = findVariant(
          productData.rawVariants,
          firstColor?.name,
          firstSize?.name,
        );
        setActiveVariant(initial);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  // ── Recalcula variante activa cuando cambia color o talla ──
  useEffect(() => {
    if (!product || !selectedColor || !selectedSize) return;
    const match = findVariant(
      product.rawVariants,
      selectedColor.name,
      selectedSize.name,
    );
    setActiveVariant(match ?? null);
  }, [selectedColor, selectedSize, product]);

  // ── Precio y stock dinámicos según variante activa ──
  // Si no hay variante activa, muestra el total del producto.
  const currentPrice = activeVariant?.price ?? product?.price ?? 0;
  const currentStock = activeVariant?.stock ?? product?.stock ?? 0;

  const currentPriceFormatted = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(currentPrice);

  // ── Handlers de selección ───────────────────────────
  const handleSelectColor = useCallback((color) => {
    setSelectedColor(color);
    setQuantity(1);
  }, []);

  const handleSelectSize = useCallback((size) => {
    if (!size.available) return;
    setSelectedSize(size);
    setQuantity(1);
  }, []);

  // ── Cantidad ────────────────────────────────────────
  const incrementQty = useCallback(() => {
    setQuantity((q) => Math.min(q + 1, currentStock));
  }, [currentStock]);

  const decrementQty = useCallback(() => {
    setQuantity((q) => Math.max(q - 1, 1));
  }, []);

  // ── Añadir al carrito ───────────────────────────────
  const handleAddToCart = useCallback(async () => {
    if (!activeVariant) return;
    setCartLoading(true);
    setCartSuccess(false);
    try {
      await addToCart({
        productId: product?.id,
        variantId: activeVariant.variantId,
        quantity,
      });
      setCartSuccess(true);
      setTimeout(() => setCartSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setCartLoading(false);
    }
  }, [activeVariant, product, quantity]);

  // ── Wishlist con optimistic update ──────────────────
  const handleToggleWishlist = useCallback(async () => {
    if (!product) return;
    const prev = wishlisted;
    setWishlisted(!prev);
    try {
      const result = await toggleWishlist({ productId: product.id });
      setWishlisted(result.wishlisted);
    } catch {
      setWishlisted(prev);
    }
  }, [product, wishlisted]);

  // ── Cargar más reseñas ──────────────────────────────
  const loadMoreReviews = useCallback(async () => {
    if (!hasMoreReviews) return;
    const nextPage = reviewPage + 1;
    try {
      const data = await fetchProductReviews(productId, nextPage);
      setReviews((prev) => [...prev, ...(data.content ?? [])]);
      setHasMoreReviews(!data.last);
      setReviewPage(nextPage);
    } catch {
      // Error silencioso en paginación incremental
    }
  }, [productId, reviewPage, hasMoreReviews]);

  return {
    // Datos
    product,
    reviews,
    related,
    hasMoreReviews,

    // Selecciones
    selectedImage,
    selectedColor,
    selectedSize,
    activeVariant,
    quantity,
    activeTab,
    wishlisted,

    // Precio y stock dinámicos
    currentPrice,
    currentStock,
    currentPriceFormatted,

    // Setters de UI
    setSelectedImage,
    setActiveTab,

    // Acciones
    handleSelectColor,
    handleSelectSize,
    incrementQty,
    decrementQty,
    handleAddToCart,
    handleToggleWishlist,
    loadMoreReviews,

    // Estados
    loading,
    error,
    cartLoading,
    cartSuccess,
  };
}

/* ─────────────────────────────────────────────────────────────
   UTILIDAD PRIVADA
   ───────────────────────────────────────────────────────────── */

/**
 * Busca en rawVariants la variante que coincide con color y talla.
 *
 * @param {{ color: string, size: string }[]} rawVariants
 * @param {string} colorName
 * @param {string} sizeName
 */
function findVariant(rawVariants = [], colorName, sizeName) {
  if (!colorName || !sizeName) return null;
  return (
    rawVariants.find((v) => v.color === colorName && v.size === sizeName) ??
    null
  );
}
