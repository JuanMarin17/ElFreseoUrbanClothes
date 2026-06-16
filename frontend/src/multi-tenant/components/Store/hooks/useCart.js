import { useState, useCallback, useEffect } from 'react';
import * as cartService from '../../../pages/services/cartService.js';

const isLoggedIn = () => {
  const jwt = localStorage.getItem("jwt");
  return !!jwt && jwt !== "null";
};

export function useCart(storeId) {
  const [cart, setCart]               = useState(null);
  const [isOpen, setIsOpen]           = useState(false);
  const [loading, setLoading]         = useState(false);
  const [itemLoading, setItemLoading] = useState(null); // cartItemId en proceso
  const [error, setError]             = useState(null);
  const [justAdded, setJustAdded]     = useState(null); // índice para animación

  // Cargar carrito al montar si hay sesión
  useEffect(() => {
    if (!storeId || !isLoggedIn()) return;
    cartService.getCart(storeId)
      .then(setCart)
      .catch(() => {}); // silencioso — puede que no tenga sesión activa
  }, [storeId]);

  const cartCount = cart?.totalItems ?? 0;

  const openCart  = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const clearError = useCallback(() => setError(null), []);

  const refreshCart = useCallback(async () => {
    if (!storeId || !isLoggedIn()) return;
    try {
      const updated = await cartService.getCart(storeId);
      setCart(updated);
    } catch {
      // silencioso
    }
  }, [storeId]);

  const addToCart = useCallback(async (product, idx) => {
    setJustAdded(idx);
    setTimeout(() => setJustAdded(null), 1200);

    if (!storeId || !isLoggedIn()) return;

    setLoading(true);
    setError(null);
    try {
      await cartService.addItem(storeId, {
        productId: product.id,
        quantity: 1,
      });
      // Siempre refrescar el carrito completo (addItem puede devolver solo el item añadido)
      const fresh = await cartService.getCart(storeId);
      setCart(fresh);
      setIsOpen(true);
      // Notificar a useMultiCart (HeaderMarket) con el storeId concreto
      window.dispatchEvent(new CustomEvent("cart-updated", { detail: { storeId } }));
    } catch (err) {
      setError(err.message ?? "Error al agregar al carrito.");
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  const updateQuantity = useCallback(async (cartItemId, quantity) => {
    if (!storeId) return;
    setItemLoading(cartItemId);
    setError(null);
    try {
      const updated = await cartService.updateItem(storeId, cartItemId, { quantity });
      setCart(updated);
    } catch (err) {
      setError(err.message ?? "Error al actualizar la cantidad.");
    } finally {
      setItemLoading(null);
    }
  }, [storeId]);

  const removeCartItem = useCallback(async (cartItemId) => {
    if (!storeId) return;
    setItemLoading(cartItemId);
    setError(null);
    try {
      const updated = await cartService.removeItem(storeId, cartItemId);
      setCart(updated);
    } catch (err) {
      setError(err.message ?? "Error al eliminar el ítem.");
    } finally {
      setItemLoading(null);
    }
  }, [storeId]);

  const emptyCart = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);
    setError(null);
    try {
      await cartService.clearCart(storeId);
      setCart(null);
    } catch (err) {
      setError(err.message ?? "Error al vaciar el carrito.");
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  return {
    cart,
    cartCount,
    isOpen,
    loading,
    itemLoading,
    error,
    justAdded,
    openCart,
    closeCart,
    refreshCart,
    addToCart,
    updateQuantity,
    removeCartItem,
    emptyCart,
    clearError,
  };
}
