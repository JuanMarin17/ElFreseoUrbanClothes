import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://46.225.21.146:8080/api";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("vx_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "Error desconocido";
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
  api.post("/promotions/createPromotion", dto);

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
export const createCoupon = (dto) => api.post("/coupons/createCoupon", dto);

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
