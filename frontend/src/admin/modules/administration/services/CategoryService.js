// services/categoryService.js
const BASE_URL = import.meta.env.VITE_API_URL ?? "";

/**
 * Obtiene todas las categorías activas.
 * GET /api/categories/active
 */
export const getCategories = async () => {
  const res = await fetch(`${BASE_URL}/api/categories/active`);
  if (!res.ok) throw new Error(`Error ${res.status} al obtener categorías.`);
  return res.json(); // Category[]
};

/**
 * Crea una nueva categoría.
 * POST /api/categories   { name }
 */
export const createCategory = async (name) => {
  const res = await fetch(`${BASE_URL}/api/categories`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ name }),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => "Error al crear categoría.");
    throw new Error(msg || `Error ${res.status}`);
  }
  return res.json(); // Category creada
};