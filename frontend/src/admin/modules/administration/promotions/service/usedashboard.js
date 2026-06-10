import { useState, useEffect, useCallback } from "react";
import {
  fetchAllPromotions,
  fetchAllCoupons,
  createPromotion,
  createCoupon,
  deactivatePromotion,
  deactivateCoupon,
  updatePromotion,
  updateCoupon,
} from "./promotion";

/**
 * useDashboard
 * Centraliza los datos y acciones del dashboard de promociones y cupones.
 */
export function useDashboard() {
  const [promotions, setPromotions] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  // Modal state
  const [modal, setModal] = useState({
    open: false,
    type: "promotion", // 'promotion' | 'coupon'
    mode: "create", // 'create' | 'edit'
    initial: null,
  });

  // Tab activo
  const [activeTab, setActiveTab] = useState("promotions");

  // Búsqueda
  const [searchPromo, setSearchPromo] = useState("");
  const [searchCoupon, setSearchCoupon] = useState("");

  /* ── Carga inicial ── */
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [promos, cups] = await Promise.all([
          fetchAllPromotions(),
          fetchAllCoupons(),
        ]);
        if (cancelled) return;
        setPromotions(promos ?? []);
        setCoupons(cups ?? []);
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
  }, []);

  /* ── Toasts ── */
  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  /* ── Abrir modal ── */
  const openCreateModal = useCallback((type) => {
    setModal({ open: true, type, mode: "create", initial: null });
  }, []);

  const openEditModal = useCallback((type, item) => {
    setModal({ open: true, type, mode: "edit", initial: item });
  }, []);

  const closeModal = useCallback(() => {
    setModal((prev) => ({ ...prev, open: false, initial: null }));
  }, []);

  /* ── Crear ── */
  const handleCreate = useCallback(
    async (payload) => {
      try {
        if (modal.type === "promotion") {
          const created = await createPromotion(payload);
          setPromotions((prev) => [created, ...prev]);
          addToast("Promoción creada exitosamente");
        } else {
          const created = await createCoupon(payload);
          setCoupons((prev) => [created, ...prev]);
          addToast("Cupón creado exitosamente");
        }
        closeModal();
      } catch (err) {
        addToast(err.message, "error");
        throw err; // Para que el hook del form no haga reset
      }
    },
    [modal.type, closeModal, addToast],
  );

  /* ── Editar ── */
  const handleEdit = useCallback(
    async (payload) => {
      const id = modal.initial?.promotionId ?? modal.initial?.couponId;
      try {
        if (modal.type === "promotion") {
          const updated = await updatePromotion(id, payload);
          setPromotions((prev) =>
            prev.map((p) => (p.promotionId === id ? updated : p)),
          );
          addToast("Promoción actualizada");
        } else {
          const updated = await updateCoupon(id, payload);
          setCoupons((prev) =>
            prev.map((c) => (c.couponId === id ? updated : c)),
          );
          addToast("Cupón actualizado");
        }
        closeModal();
      } catch (err) {
        addToast(err.message, "error");
        throw err;
      }
    },
    [modal, closeModal, addToast],
  );

  /* ── Desactivar ── */
  const handleDeactivatePromotion = useCallback(
    async (promotionId) => {
      try {
        await deactivatePromotion(promotionId);
        setPromotions((prev) =>
          prev.map((p) =>
            p.promotionId === promotionId ? { ...p, isActive: false } : p,
          ),
        );
        addToast("Promoción desactivada");
      } catch (err) {
        addToast(err.message, "error");
      }
    },
    [addToast],
  );

  const handleDeactivateCoupon = useCallback(
    async (couponId) => {
      try {
        await deactivateCoupon(couponId);
        setCoupons((prev) =>
          prev.map((c) =>
            c.couponId === couponId ? { ...c, isActive: false } : c,
          ),
        );
        addToast("Cupón desactivado");
      } catch (err) {
        addToast(err.message, "error");
      }
    },
    [addToast],
  );

  /* ── Filtrado por búsqueda ── */
  const filteredPromotions = promotions.filter((p) =>
    p.name?.toLowerCase().includes(searchPromo.toLowerCase()),
  );

  const filteredCoupons = coupons.filter((c) =>
    c.code?.toLowerCase().includes(searchCoupon.toLowerCase()),
  );

  /* ── KPIs ── */
  const kpis = {
    totalPromotions: promotions.length,
    activePromotions: promotions.filter((p) => p.isActive).length,
    totalCoupons: coupons.length,
    activeCoupons: coupons.filter((c) => c.isActive).length,
  };

  return {
    // Datos
    filteredPromotions,
    filteredCoupons,
    kpis,
    loading,
    error,
    toasts,

    // Modal
    modal,
    openCreateModal,
    openEditModal,
    closeModal,

    // Acciones
    handleCreate,
    handleEdit,
    handleDeactivatePromotion,
    handleDeactivateCoupon,

    // UI
    activeTab,
    setActiveTab,
    searchPromo,
    setSearchPromo,
    searchCoupon,
    setSearchCoupon,
  };
}
