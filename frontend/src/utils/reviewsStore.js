/**
 * reviewsStore.js
 * Capa de acceso a la API real de reseñas — /api/v1/reviews
 */

const BASE = "http://46.225.21.146:8080/api/v1/reviews";

const AVATAR_COLORS = [
  '#8b5cf6', '#2563FF', '#ec4899', '#10b981',
  '#f59e0b', '#ef4444', '#06b6d4', '#84cc16',
];

function pickColor(name) {
  return AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
}

function getJwt() {
  return localStorage.getItem("jwt");
}

function authHeaders() {
  const jwt = getJwt();
  const h = { "Content-Type": "application/json", Accept: "application/json" };
  if (jwt && jwt !== "null") h.Authorization = `Bearer ${jwt}`;
  return h;
}

function relativeDate(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora mismo";
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `hace ${days} día${days !== 1 ? 's' : ''}`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `hace ${weeks} semana${weeks !== 1 ? 's' : ''}`;
  const months = Math.floor(days / 30);
  return `hace ${months} mes${months !== 1 ? 'es' : ''}`;
}

function normalizeReview(r) {
  return {
    id:          r.id,
    name:        r.userName ?? "Usuario",
    initials:    (r.userName ?? "U").slice(0, 2).toUpperCase(),
    avatarColor: pickColor(r.userName ?? ""),
    email:       r.userEmail ?? "",
    rating:      r.rating,
    text:        r.text,
    date:        relativeDate(r.createdAt),
    likes:       r.likes ?? 0,
    isUserReview: true,
  };
}

/**
 * Devuelve el objeto paginado completo { data, total, page, totalPages }
 * donde data es el array de reseñas normalizadas.
 */
export async function getUserReviews(page = 1, limit = 50, sort = "newest") {
  try {
    const res = await fetch(`${BASE}?page=${page}&limit=${limit}&sort=${sort}`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return {
      ...json,
      data: (json.data ?? []).map(normalizeReview),
    };
  } catch {
    return { data: [], total: 0, page: 1, totalPages: 0 };
  }
}

/**
 * Crea una nueva reseña. Lanza error descriptivo si 409 o 400.
 * Retorna la reseña normalizada.
 */
export async function addUserReview(rating, text) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ rating, text }),
  });

  if (res.status === 409) {
    throw Object.assign(new Error("Ya tienes una reseña publicada"), { code: 409 });
  }
  if (res.status === 400) {
    const body = await res.json().catch(() => ({}));
    const msg = body.errors
      ? Object.values(body.errors).flat().join(" ")
      : body.message ?? "Datos inválidos";
    throw Object.assign(new Error(msg), { code: 400 });
  }
  if (res.status === 401) {
    throw Object.assign(new Error("Debes iniciar sesión para publicar una reseña"), { code: 401 });
  }
  if (res.status === 403) {
    throw Object.assign(new Error("Tu cuenta no tiene permiso para publicar reseñas"), { code: 403 });
  }
  if (!res.ok) {
    throw Object.assign(new Error("Error al publicar la reseña"), { code: res.status });
  }

  const review = await res.json();
  return normalizeReview(review);
}

/**
 * Retorna true si el usuario autenticado ya tiene una reseña.
 * Retorna false si no está autenticado, si 404 o si hay error de red.
 */
export async function hasUserAlreadyReviewed() {
  const jwt = getJwt();
  if (!jwt || jwt === "null") return false;
  try {
    const res = await fetch(`${BASE}/me`, { headers: authHeaders() });
    if (res.status === 404 || res.status === 403) return false;
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Retorna la reseña del usuario autenticado o null si no tiene / no está logueado.
 */
export async function getMyReview() {
  const jwt = getJwt();
  if (!jwt || jwt === "null") return null;
  try {
    const res = await fetch(`${BASE}/me`, { headers: authHeaders() });
    if (!res.ok) return null;
    const r = await res.json();
    return normalizeReview(r);
  } catch {
    return null;
  }
}

/**
 * Toggle like en una reseña. Retorna { likes, liked }.
 */
export async function toggleLike(reviewId) {
  const res = await fetch(`${BASE}/${reviewId}/like`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status}`), { code: res.status });
  return res.json();
}

/**
 * Elimina una reseña (solo dueño o admin).
 */
export async function deleteReview(reviewId) {
  const res = await fetch(`${BASE}/${reviewId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (res.status === 403) {
    throw Object.assign(new Error("No tienes permiso para eliminar esta reseña"), { code: 403 });
  }
  if (!res.ok && res.status !== 204) {
    throw Object.assign(new Error(`HTTP ${res.status}`), { code: res.status });
  }
}
