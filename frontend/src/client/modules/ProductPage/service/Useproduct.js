import { useState, useEffect, useCallback } from "react";
import {
  fetchProductById,
  fetchProductReviews,
  fetchRelatedProducts,
  addToCart,
  toggleWishlist,
} from "./productService";

/**
 * Hook principal de la página de producto.
 * Centraliza toda la lógica de estado y llamadas a la API.
 *
 * @param {string|number} productId - ID del producto (ej: desde useParams())
 */
export function useProduct(productId) {
  // ── Datos del servidor ──
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [related, setRelated] = useState([]);
  const [reviewPage, setReviewPage] = useState(0);
  const [hasMoreReviews, setHasMoreReviews] = useState(true);

  // ── Estado de UI local ──
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [wishlisted, setWishlisted] = useState(false);

  // ── Estado de carga / error ──
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);

  // ── Carga inicial del producto ──
  useEffect(() => {
    if (!productId) return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const [productData, reviewData, relatedData] = await Promise.all([
          fetchProductById(productId),
          fetchProductReviews(productId, 0),
          fetchRelatedProducts(productId),
        ]);

        if (cancelled) return;

        setProduct(productData);
        setReviews(reviewData.content ?? []);
        setHasMoreReviews(!reviewData.last);
        setRelated(relatedData);

        // Preselecciona la primera variante/color disponible
        const firstColor = productData.colors?.[0] ?? null;
        const firstVariant = productData.variants?.[0] ?? null;
        setSelectedColor(firstColor);
        setSelectedVariant(firstVariant);
        setWishlisted(productData.wishlisted ?? false);
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

  // ── Cargar más reseñas ──
  const loadMoreReviews = useCallback(async () => {
    if (!hasMoreReviews) return;
    const nextPage = reviewPage + 1;
    try {
      const data = await fetchProductReviews(productId, nextPage);
      setReviews((prev) => [...prev, ...(data.content ?? [])]);
      setHasMoreReviews(!data.last);
      setReviewPage(nextPage);
    } catch {
      // Error silencioso en carga incremental
    }
  }, [productId, reviewPage, hasMoreReviews]);

  // ── Control de cantidad ──
  const incrementQty = useCallback(() => {
    setQuantity((q) => Math.min(q + 1, product?.stock ?? 99));
  }, [product?.stock]);

  const decrementQty = useCallback(() => {
    setQuantity((q) => Math.max(q - 1, 1));
  }, []);

  // ── Añadir al carrito ──
  const handleAddToCart = useCallback(async () => {
    if (!product || !selectedVariant) return;
    setCartLoading(true);
    setCartSuccess(false);
    try {
      await addToCart({
        productId: product.id,
        variantId: selectedVariant.id,
        colorId: selectedColor?.id ?? null,
        quantity,
      });
      setCartSuccess(true);
      setTimeout(() => setCartSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setCartLoading(false);
    }
  }, [product, selectedVariant, selectedColor, quantity]);

  // ── Toggle wishlist ──
  const handleToggleWishlist = useCallback(async () => {
    if (!product) return;
    const prev = wishlisted;
    setWishlisted(!prev); // Optimistic update
    try {
      const result = await toggleWishlist({ productId: product.id });
      setWishlisted(result.wishlisted);
    } catch {
      setWishlisted(prev); // Revert si falla
    }
  }, [product, wishlisted]);

  return {
    // Datos
    product,
    reviews,
    related,
    hasMoreReviews,

    // Selecciones UI
    selectedImage,
    selectedColor,
    selectedVariant,
    quantity,
    activeTab,
    wishlisted,

    // Setters de UI
    setSelectedImage,
    setSelectedColor,
    setSelectedVariant,
    setActiveTab,

    // Acciones
    incrementQty,
    decrementQty,
    handleAddToCart,
    handleToggleWishlist,
    loadMoreReviews,

    // Estados de carga
    loading,
    error,
    cartLoading,
    cartSuccess,
  };
}
