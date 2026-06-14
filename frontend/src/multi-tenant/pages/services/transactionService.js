/**
 * transactionService.js
 * Planes de suscripción de la plataforma (Transaction Service).
 * Base URL: /api/v1/transactions
 */

const BASE = "http://46.225.21.146:8080/api/v1/transactions";

const buildHeaders = () => {
  const jwt = localStorage.getItem("jwt");
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(jwt && jwt !== "null" ? { Authorization: `Bearer ${jwt}` } : {}),
  };
};

async function request(method, path, body) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    method,
    headers: buildHeaders(),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (res.status === 204) return null;

  let data;
  const ct = res.headers.get("Content-Type") ?? "";
  if (ct.includes("application/json")) {
    try { data = await res.json(); } catch { data = {}; }
  } else {
    const text = await res.text().catch(() => "");
    console.error(`[transactionService] Respuesta no-JSON (${res.status}):`, text.slice(0, 300));
    data = { message: text.slice(0, 200) || `Error ${res.status}` };
  }

  if (!res.ok) {
    const msg = data?.message ?? data?.error ?? data?.detail ?? `Error ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data?.data ?? data;
}

/** GET /plans — Array de PlanResponseDTO */
export const getPlans = () =>
  request("GET", "/plans");

/**
 * POST /checkout
 * @param {{ storeId: string, planName: string }} body
 * @returns {{ transactionId, paymentUrl, status }}
 */
export const checkout = (body) =>
  request("POST", "/checkout", body);

/**
 * GET /subscription/{storeId}
 * @returns {{ subscriptionId, storeId, planName, status, startedAt, expiresAt, renewalAt }}
 */
export const getSubscription = (storeId) =>
  request("GET", `/subscription/${storeId}`);

/**
 * GET /limits/{storeId}
 * @returns {{ planName, active, maxProducts, maxPages, maxAiCalls, features }}
 */
export const getLimits = (storeId) =>
  request("GET", `/limits/${storeId}`);

/**
 * GET /history/{storeId}
 * @returns {Array<{ transactionId, storeId, planName, mpPaymentId, amount, status, type, createdAt }>}
 */
export const getTransactionHistory = (storeId) =>
  request("GET", `/history/${storeId}`);

/**
 * GET /plan-history/{storeId}
 * @returns {Array<{ historyId, storeId, fromPlan, toPlan, changedAt, reason }>}
 */
export const getPlanHistory = (storeId) =>
  request("GET", `/plan-history/${storeId}`);

/**
 * DELETE /subscription/{storeId} — 204 No Content
 */
export const cancelSubscription = (storeId) =>
  request("DELETE", `/subscription/${storeId}`);

/** GET /all — Solo SUPERADMIN */
export const getAllTransactions = () =>
  request("GET", "/all");
