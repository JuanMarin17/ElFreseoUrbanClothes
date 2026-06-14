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

/* ── Response normalization ── */
function extractList(res) {
  if (Array.isArray(res?.data))    return res.data;
  if (Array.isArray(res))          return res;
  if (Array.isArray(res?.content)) return res.content;
  return [];
}

/* ── Metadata helpers (dates / message / minPurchase stored in localStorage) ── */
const PROMO_META_KEY  = "vexio_promo_meta";
const COUPON_META_KEY = "vexio_coupon_meta";

function loadAllMeta(key) {
  try { return JSON.parse(localStorage.getItem(key) ?? "{}"); } catch { return {}; }
}

function persistMeta(key, id, meta) {
  const all = loadAllMeta(key);
  all[id] = { ...(all[id] ?? {}), ...meta };
  localStorage.setItem(key, JSON.stringify(all));
}

function enrichList(list, key, idField) {
  const all = loadAllMeta(key);
  return list.map((item) => ({ ...item, _meta: all[item[idField]] ?? {} }));
}

/* ── Separate API payload from metadata ── */
function splitPayload(payload) {
  const { _meta, ...api } = payload;
  return { api, meta: _meta ?? {} };
}

export function useDashboard() {
  const [promotions, setPromotions] = useState([]);
  const [coupons,    setCoupons]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  const [toasts, setToasts] = useState([]);

  const [modal, setModal] = useState({
    open: false,
    type: "promotion",
    mode: "create",
    initial: null,
  });

  const [activeTab,     setActiveTab]     = useState("promotions");
  const [searchPromo,   setSearchPromo]   = useState("");
  const [searchCoupon,  setSearchCoupon]  = useState("");

  /* ── Load ── */
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [promosResult, cupsResult] = await Promise.allSettled([
          fetchAllPromotions(),
          fetchAllCoupons(),
        ]);
        if (cancelled) return;

        if (promosResult.status === "fulfilled") {
          setPromotions(enrichList(extractList(promosResult.value), PROMO_META_KEY, "promotionId"));
        }
        if (cupsResult.status === "fulfilled") {
          setCoupons(enrichList(extractList(cupsResult.value), COUPON_META_KEY, "couponId"));
        }

        const failed = [promosResult, cupsResult].find((r) => r.status === "rejected");
        if (failed) setError(failed.reason?.message ?? "Error al cargar datos");
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  /* ── Toasts ── */
  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  /* ── Modal ── */
  const openCreateModal = useCallback((type) => {
    setModal({ open: true, type, mode: "create", initial: null });
  }, []);

  const openEditModal = useCallback((type, item) => {
    setModal({ open: true, type, mode: "edit", initial: item });
  }, []);

  const closeModal = useCallback(() => {
    setModal((prev) => ({ ...prev, open: false, initial: null }));
  }, []);

  /* ── Create ── */
  const handleCreate = useCallback(
    async (payload) => {
      const { api, meta } = splitPayload(payload);
      try {
        if (modal.type === "promotion") {
          const res     = await createPromotion(api);
          const created = res?.data ?? res;
          if (created?.promotionId) persistMeta(PROMO_META_KEY, created.promotionId, meta);
          setPromotions((prev) => [{ ...created, _meta: meta }, ...prev]);
          addToast("Promoción creada exitosamente");
        } else {
          const res     = await createCoupon(api);
          const created = res?.data ?? res;
          if (created?.couponId) persistMeta(COUPON_META_KEY, created.couponId, meta);
          setCoupons((prev) => [{ ...created, _meta: meta }, ...prev]);
          addToast("Cupón creado exitosamente");
        }
        closeModal();
      } catch (err) {
        addToast(err.message, "error");
        throw err;
      }
    },
    [modal.type, closeModal, addToast],
  );

  /* ── Edit ── */
  const handleEdit = useCallback(
    async (payload) => {
      const { api, meta } = splitPayload(payload);
      const id = modal.initial?.promotionId ?? modal.initial?.couponId;
      try {
        if (modal.type === "promotion") {
          const res     = await updatePromotion(id, api);
          const updated = res?.data ?? res;
          if (id) persistMeta(PROMO_META_KEY, id, meta);
          setPromotions((prev) =>
            prev.map((p) => (p.promotionId === id ? { ...updated, _meta: meta } : p)),
          );
          addToast("Promoción actualizada");
        } else {
          const res     = await updateCoupon(id, api);
          const updated = res?.data ?? res;
          if (id) persistMeta(COUPON_META_KEY, id, meta);
          setCoupons((prev) =>
            prev.map((c) => (c.couponId === id ? { ...updated, _meta: meta } : c)),
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

  /* ── Deactivate ── */
  const handleDeactivatePromotion = useCallback(
    async (promotionId) => {
      try {
        await deactivatePromotion(promotionId);
        setPromotions((prev) =>
          prev.map((p) => (p.promotionId === promotionId ? { ...p, isActive: false } : p)),
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
          prev.map((c) => (c.couponId === couponId ? { ...c, isActive: false } : c)),
        );
        addToast("Cupón desactivado");
      } catch (err) {
        addToast(err.message, "error");
      }
    },
    [addToast],
  );

  /* ── Filtered lists ── */
  const filteredPromotions = promotions.filter((p) =>
    p.name?.toLowerCase().includes(searchPromo.toLowerCase()),
  );

  const filteredCoupons = coupons.filter((c) =>
    c.code?.toLowerCase().includes(searchCoupon.toLowerCase()),
  );

  /* ── KPIs ── */
  const kpis = {
    totalPromotions:  promotions.length,
    activePromotions: promotions.filter((p) => p.isActive).length,
    totalCoupons:     coupons.length,
    activeCoupons:    coupons.filter((c) => c.isActive).length,
  };

  return {
    filteredPromotions,
    filteredCoupons,
    kpis,
    loading,
    error,
    toasts,
    modal,
    openCreateModal,
    openEditModal,
    closeModal,
    handleCreate,
    handleEdit,
    handleDeactivatePromotion,
    handleDeactivateCoupon,
    activeTab,
    setActiveTab,
    searchPromo,
    setSearchPromo,
    searchCoupon,
    setSearchCoupon,
  };
}
