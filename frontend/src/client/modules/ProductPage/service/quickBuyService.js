import { authFetch } from "../../../../utils/authFetch";

const BASE = import.meta.env.VITE_API_URL;

function buildHeaders() {
  const jwt = localStorage.getItem("jwt");
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(jwt && jwt !== "null" ? { Authorization: `Bearer ${jwt}` } : {}),
  };
}

async function request(method, path, body) {
  const res = await authFetch(`${BASE}${path}`, {
    method,
    headers: buildHeaders(),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    const msg = data?.message ?? data?.error ?? `Error ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  return data?.data ?? data;
}

/** POST /stores/{storeId}/orders/quick-buy — compra directa de un producto */
export function placeQuickBuy(storeId, payload) {
  return request("POST", `/stores/${storeId}/orders/quick-buy`, payload);
}

export async function fetchUserProfile() {
  const jwt = localStorage.getItem("jwt");
  if (!jwt || jwt === "null") return null;
  try {
    const res = await authFetch(`${BASE}/users/me`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.data ?? data;
  } catch {
    return null;
  }
}
