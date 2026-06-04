/**
 * paymentService.js
 * Suscripciones de tenants con MercadoPago.
 */

const BASE = `${import.meta.env.VITE_API_URL ?? "/api/v1"}/payments`;

const headers = () => {
  const jwt = localStorage.getItem("jwt");
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(jwt && jwt !== "null" ? { Authorization: `Bearer ${jwt}` } : {}),
  };
};

async function request(method, path, body) {
  const url = `${BASE}${path}`;
  if (body !== undefined) {
    console.log(`[paymentService] ${method} ${url}`, body);
  }

  const res = await fetch(url, {
    method,
    headers: headers(),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (res.status === 204) return null;

  // Intentar parsear como JSON; si falla leer como texto (ej. stack trace HTML/500)
  let data;
  const ct = res.headers.get("Content-Type") ?? "";
  if (ct.includes("application/json")) {
    try { data = await res.json(); } catch { data = {}; }
  } else {
    const text = await res.text().catch(() => "");
    console.error(`[paymentService] Respuesta no-JSON (${res.status}):`, text.slice(0, 300));
    data = { message: text.slice(0, 200) || `Error ${res.status}` };
  }

  if (!res.ok) {
    const msg = data?.message ?? data?.error ?? data?.detail ?? `Error ${res.status}`;
    console.error(`[paymentService] ${res.status} en ${method} ${url}:`, msg, data);
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data?.data ?? data;
}

/**
 * Crear checkout de suscripción.
 * @param {string} tenantId
 * @param {"BASIC"|"PRO"|"ENTERPRISE"} plan
 * @param {string} payerEmail
 * @returns {{ id, tenantId, plan, status, checkoutUrl, sandboxCheckoutUrl }}
 */
export const createSubscription = (tenantId, plan, payerEmail) =>
  request("POST", "/subscription", { tenantId, plan, payerEmail });

/**
 * Consultar estado de la suscripción del tenant.
 * @returns {{ id, tenantId, plan, status, active, startsAt, expiresAt, nextBillingAt }}
 */
export const getSubscription = (tenantId) =>
  request("GET", `/subscription/${tenantId}`);

/**
 * Verificar si el tenant tiene suscripción activa.
 * @returns {boolean}
 */
export const isSubscriptionActive = (tenantId) =>
  request("GET", `/subscription/${tenantId}/active`);
