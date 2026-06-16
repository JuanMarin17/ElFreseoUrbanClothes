import { authFetch } from "../../../../utils/authFetch";

const BASE = import.meta.env.VITE_API_URL;

function simulateOrder(payload) {
  const numeric = String(Date.now()).slice(-8);
  const id = `QB-${numeric}`;
  return {
    orderId:     id,
    orderNumber: id,
    status:      "PENDING",
    createdAt:   new Date().toISOString(),
    total:       payload.total,
    _simulated:  true,
  };
}

// The backend has no quick-buy endpoint and rejects cart-based /orders when cart is empty.
// Simulate locally (same as CheckoutPage fallback) until the backend implements it.
export function placeQuickBuy(_storeId, payload) {
  return Promise.resolve(simulateOrder(payload));
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
