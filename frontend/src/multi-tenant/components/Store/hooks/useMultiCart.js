import { useState, useCallback, useEffect, useMemo } from 'react';
import * as cartService from '../../../pages/services/cartService.js';

const STORE_IDS_KEY = 'vexio_cart_store_ids';

const isLoggedIn = () => {
  const jwt = localStorage.getItem("jwt");
  return !!jwt && jwt !== "null";
};

const loadStoreIds = () => {
  try {
    const raw = localStorage.getItem(STORE_IDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const persistStoreIds = (ids) => {
  try { localStorage.setItem(STORE_IDS_KEY, JSON.stringify(ids)); } catch {}
};

export function useMultiCart() {
  const [storeIds, setStoreIds] = useState(loadStoreIds);
  const [carts, setCarts]       = useState({});
  const [isOpen, setIsOpen]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [itemLoading, setItemLoading] = useState(null);
  const [error, setError]       = useState(null);

  const fetchCarts = useCallback(async (ids) => {
    if (!isLoggedIn() || !ids.length) return;
    const results = await Promise.allSettled(ids.map(id => cartService.getCart(id)));
    setCarts(prev => {
      const next = { ...prev };
      ids.forEach((id, i) => {
        const r = results[i];
        if (r.status === 'fulfilled' && r.value?.items?.length) {
          next[id] = r.value;
        } else {
          delete next[id];
        }
      });
      return next;
    });
  }, []);

  // Carga inicial
  useEffect(() => {
    const ids = loadStoreIds();
    if (ids.length) fetchCarts(ids);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openCart   = useCallback(() => setIsOpen(true), []);
  const closeCart  = useCallback(() => setIsOpen(false), []);
  const clearError = useCallback(() => setError(null), []);

  // Llamado cuando se despacha "cart-updated" desde cualquier página
  const refreshCart = useCallback(async () => {
    const s = localStorage.getItem("storeId");
    let ids = loadStoreIds();
    if (s && s !== "null" && s !== "undefined" && !ids.includes(s)) {
      ids = [...ids, s];
      persistStoreIds(ids);
      setStoreIds(ids);
    }
    await fetchCarts(ids);
  }, [fetchCarts]);

  // Combinar ítems de todas las tiendas, añadiendo _storeId a cada uno
  const combinedItems = useMemo(() =>
    Object.entries(carts).flatMap(([storeId, cart]) =>
      (cart?.items ?? []).map(item => ({ ...item, _storeId: storeId }))
    ),
  [carts]);

  const cartCount = useMemo(() =>
    combinedItems.reduce((sum, item) => sum + item.quantity, 0),
  [combinedItems]);

  const subtotal = useMemo(() =>
    combinedItems.reduce((sum, item) => sum + (item.subtotal ?? 0), 0),
  [combinedItems]);

  const hasPriceChanges = useMemo(() =>
    Object.values(carts).some(c => c?.hasPriceChanges),
  [carts]);

  const cart = useMemo(() => ({
    items: combinedItems,
    totalItems: cartCount,
    subtotal,
    hasPriceChanges,
  }), [combinedItems, cartCount, subtotal, hasPriceChanges]);

  const updateQuantity = useCallback(async (cartItemId, quantity, storeId) => {
    if (!storeId) return;
    setItemLoading(cartItemId);
    setError(null);
    try {
      const updated = await cartService.updateItem(storeId, cartItemId, { quantity });
      setCarts(c => ({ ...c, [storeId]: updated }));
    } catch (err) {
      setError(err.message ?? "Error al actualizar la cantidad.");
    } finally {
      setItemLoading(null);
    }
  }, []);

  const removeCartItem = useCallback(async (cartItemId, storeId) => {
    if (!storeId) return;
    setItemLoading(cartItemId);
    setError(null);
    try {
      const updated = await cartService.removeItem(storeId, cartItemId);
      if (updated?.items?.length) {
        setCarts(c => ({ ...c, [storeId]: updated }));
      } else {
        // Carrito vacío: limpiar esa tienda
        setCarts(c => { const n = { ...c }; delete n[storeId]; return n; });
        const newIds = loadStoreIds().filter(id => id !== storeId);
        persistStoreIds(newIds);
        setStoreIds(newIds);
      }
    } catch (err) {
      setError(err.message ?? "Error al eliminar el ítem.");
    } finally {
      setItemLoading(null);
    }
  }, []);

  const emptyCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const ids = loadStoreIds();
      await Promise.allSettled(ids.map(id => cartService.clearCart(id)));
      setCarts({});
      setStoreIds([]);
      persistStoreIds([]);
    } catch (err) {
      setError(err.message ?? "Error al vaciar el carrito.");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    cart,
    cartCount,
    isOpen,
    loading,
    itemLoading,
    error,
    openCart,
    closeCart,
    refreshCart,
    updateQuantity,
    removeCartItem,
    emptyCart,
    clearError,
  };
}
