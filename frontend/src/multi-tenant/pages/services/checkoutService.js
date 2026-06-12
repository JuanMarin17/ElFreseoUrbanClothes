const API = import.meta.env.VITE_API_URL ?? "http://46.225.21.146:8080/api/v1";

function buildHeaders() {
  const jwt = localStorage.getItem("jwt");
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(jwt && jwt !== "null" ? { Authorization: `Bearer ${jwt}` } : {}),
  };
}

async function request(method, url, body) {
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
    data = { message: text.slice(0, 200) || `Error ${res.status}` };
  }

  if (!res.ok) {
    const msg = data?.message ?? data?.error ?? `Error ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  return data?.data ?? data;
}

export const getOAuthStatus = (tenantId) =>
  request("GET", `${API}/oauth/connect?tenantId=${encodeURIComponent(tenantId)}`);

export const disconnectOAuth = (tenantId) =>
  request("DELETE", `${API}/oauth/disconnect/${tenantId}`);

export const createCheckoutPro = (payload) =>
  request("POST", `${API}/payments/checkout/pro`, payload);

export const createCheckoutCard = (payload) =>
  request("POST", `${API}/payments/checkout/card`, payload);

export const getMPPublicKey = (tenantId) =>
  request("GET", `${API}/payments/public-key/${tenantId}`);
