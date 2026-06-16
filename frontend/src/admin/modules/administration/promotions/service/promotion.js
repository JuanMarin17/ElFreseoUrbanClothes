const BASE = import.meta.env.VITE_API_URL;

function buildHeaders() {
  const jwt     = localStorage.getItem("jwt");
  const storeId = localStorage.getItem("storeId");
  const h = { "Content-Type": "application/json" };

  if (jwt && jwt !== "null")     h["Authorization"] = `Bearer ${jwt}`;
  if (storeId && storeId !== "null") h["X-Store-Id"] = storeId;

  return h;
}

async function apiFetch(method, path, body) {
  const options = { method, headers: buildHeaders() };
  if (body !== undefined) options.body = JSON.stringify(body);

  const res  = await fetch(`${BASE}${path}`, options);
  let   data;
  try { data = await res.json(); } catch { data = {}; }

  if (!res.ok) {
    const msg = data?.message ?? data?.error ?? `Error ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  return data?.data ?? data;
}

// ── PROMOCIONES ──────────────────────────────────────────────────────────────
export const fetchAllPromotions    = ()          => apiFetch("GET",    "/promotions/getAllPromotions");
export const fetchActivePromotions = ()          => apiFetch("GET",    "/promotions/getActivePromotions");
export const createPromotion       = (dto)       => apiFetch("POST",   "/promotions/createPromotion", dto);
export const updatePromotion       = (id, dto)   => apiFetch("PUT",    `/promotions/updatePromotion/${id}`, dto);
export const deactivatePromotion   = (id)        => apiFetch("DELETE", `/promotions/deactivatePromotion/${id}`);

// ── CUPONES ──────────────────────────────────────────────────────────────────
export const fetchAllCoupons    = ()          => apiFetch("GET",    "/coupons/getAllCoupons");
export const fetchActiveCoupons = ()          => apiFetch("GET",    "/coupons/getActiveCoupons");
export const createCoupon       = (dto)       => apiFetch("POST",   "/coupons/createCoupon", dto);
export const updateCoupon       = (id, dto)   => apiFetch("PUT",    `/coupons/updateCoupon/${id}`, dto);
export const deactivateCoupon   = (id)        => apiFetch("DELETE", `/coupons/deactivateCoupon/${id}`);
export const validateCoupon     = (code)      => apiFetch("POST",   "/coupons/validate", { code });
export const redeemCoupon       = (code)      => apiFetch("POST",   "/coupons/redeem",   { code });
export const fetchRedemptions   = (couponId)  => apiFetch("GET",    `/coupons/redemptions/${couponId}`);
