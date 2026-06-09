/**
 * cmsService.js
 * GET   /api/v1/stores/cms  — lee la config CMS completa
 * PATCH /api/v1/stores/cms  — actualiza solo las secciones enviadas
 *
 * Requieren: Authorization: Bearer <jwt>  y  X-Store-Id: <uuid>
 */

const API_ROOT = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api/v1";

function buildHeaders(storeId) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("jwt") ?? ""}`,
    "X-Store-Id": storeId,
  };
}

async function request(url, storeId, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: buildHeaders(storeId),
  });
  const ct   = res.headers.get("Content-Type") ?? "";
  const body = ct.includes("application/json") ? await res.json() : await res.text();
  if (!res.ok) {
    const msg = typeof body === "object" ? (body.message ?? `Error ${res.status}`) : body;
    throw new Error(msg || `Error ${res.status}`);
  }
  return body?.data ?? body;
}

export function getCms(storeId) {
  return request(`${API_ROOT}/stores/cms`, storeId);
}

export function patchCms(storeId, data) {
  return request(`${API_ROOT}/stores/cms`, storeId, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
