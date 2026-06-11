import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://46.225.21.146:8080/api";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token   = localStorage.getItem("jwt");
  const storeId = localStorage.getItem("storeId");
  const role    = localStorage.getItem("userRole");

  if (token)   config.headers.Authorization  = `Bearer ${token}`;
  if (storeId) config.headers["X-Store-Id"]  = storeId;
  if (role)    config.headers["X-User-Role"] = role;

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.user_id) config.headers["X-User-Id"] = payload.user_id;
    } catch {}
  }

  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
      return Promise.reject(new Error("No se pudo conectar con el servidor. Verifica que el backend esté activo."));
    }
    if (!error.response) {
      return Promise.reject(new Error("Sin conexión al servidor. Verifica que el backend esté corriendo."));
    }
    const message = error.response?.data?.message || error.message || "Error desconocido";
    return Promise.reject(new Error(message));
  },
);

/* ─────────────────────────────────────────────
   PROMOCIONES — /promotions
   ───────────────────────────────────────────── */

/** GET /promotions/all */
export const fetchAllPromotions = () => api.get("/promotions/all");

/** GET /promotions/getActivePromotions */
export const fetchActivePromotions = () =>
  api.get("/promotions/getActivePromotions");

/**
 * POST /promotions/createPromotion
 *
 * Payload actual del backend (ampliar cuando el DTO esté listo):
 * {
 *   name, discount, discountType,        ← ya soportados
 *   productId, startDate, endDate,        ← pendientes en el DTO
 *   userId, reason                        ← pendientes en el DTO
 * }
 */
export const createPromotion = (dto) =>
  api.post("/promotions/createPromotion", {
    ...dto,
    storeId: localStorage.getItem("storeId"),
  });

/** PUT /promotions/:id */
export const updatePromotion = (promotionId, dto) =>
  api.put(`/promotions/${promotionId}`, dto);

/** DELETE /promotions/:id — desactiva (no borra) */
export const deactivatePromotion = (promotionId) =>
  api.delete(`/promotions/${promotionId}`);

/* ─────────────────────────────────────────────
   CUPONES — /coupons
   ───────────────────────────────────────────── */

/** GET /coupons/all */
export const fetchAllCoupons = () => api.get("/coupons/all");

/** GET /coupons/getActiveCoupons */
export const fetchActiveCoupons = () => api.get("/coupons/getActiveCoupons");

/**
 * POST /coupons/createCoupon
 *
 * Payload actual:
 * {
 *   code, discount, discountType,         ← ya soportados
 *   productId, startDate, endDate,        ← pendientes en el DTO
 *   userId, reason                        ← pendientes en el DTO
 * }
 */
export const createCoupon = (dto) =>
  api.post("/coupons/createCoupon", {
    ...dto,
    storeId: localStorage.getItem("storeId"),
  });

/** PUT /coupons/:id */
export const updateCoupon = (couponId, dto) =>
  api.put(`/coupons/${couponId}`, dto);

/** DELETE /coupons/:id */
export const deactivateCoupon = (couponId) =>
  api.delete(`/coupons/${couponId}`);

/** POST /coupons/redeem/:code */
export const redeemCoupon = (code) => api.post(`/coupons/redeem/${code}`);

/** GET /coupons/:id/redemptions */
export const fetchRedemptions = (couponId) =>
  api.get(`/coupons/${couponId}/redemptions`);
