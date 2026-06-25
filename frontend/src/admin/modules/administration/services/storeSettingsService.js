/**
 * storeSettingsService.js
 * GET  /stores/settings/getSettings
 * POST /stores/settings/createSettings
 * POST /stores/settings/logo
 */

const API_BASE = import.meta.env.VITE_API_URL;

function buildHeaders(extra = {}) {
  const jwt     = localStorage.getItem("jwt");
  const storeId = localStorage.getItem("storeId");
  if (!storeId || storeId === "null") {
    throw new Error("No hay una tienda seleccionada (falta storeId).");
  }
  const h = { Accept: "application/json", "X-Store-Id": storeId, ...extra };
  if (jwt && jwt !== "null") h.Authorization = `Bearer ${jwt}`;
  return h;
}

async function req(method, path, body, timeoutMs = 10000) {
  const headers = buildHeaders(
    body !== undefined ? { "Content-Type": "application/json" } : {},
  );
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      signal: controller.signal,
      headers,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } finally {
    clearTimeout(timer);
  }

  if (res.status === 204 || res.status === 404) return null;

  const ct   = res.headers.get("Content-Type") ?? "";
  const json = ct.includes("application/json") ? await res.json().catch(() => ({})) : {};

  if (!res.ok) {
    const err  = new Error(json?.message ?? json?.error ?? `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return json?.data ?? json;
}

/** GET /stores/settings/getSettings — usa X-Store-Id */
export const getSettings = () => req("GET", "/stores/settings/getSettings");

/** POST /stores/settings/createSettings — completedStep OBLIGATORIO */
export const saveSettings = (payload) =>
  req("POST", "/stores/settings/createSettings", payload);

/** POST /stores/settings/logo — multipart, campo "image" */
export async function uploadLogo(file) {
  const h    = buildHeaders(); // sin Content-Type, lo pone el browser
  const form = new FormData();
  form.append("image", file);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000); // subida de archivo: más margen
  let res;
  try {
    res = await fetch(`${API_BASE}/stores/settings/logo`, {
      method: "POST",
      signal: controller.signal,
      headers: h,
      body: form,
    });
  } finally {
    clearTimeout(timer);
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err  = new Error(json?.message ?? `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return json?.data ?? json;
}
