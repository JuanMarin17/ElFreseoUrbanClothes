// services/categoryService.js
const BASE_URL =  "http://localhost:8080/api/v1";

/**
 * Obtiene todas las categorías activas.
 * GET /api/categories/active
 */
export const getCategories = async () => {
  const res = await fetch("http://localhost:8080/api/v1/categories/active");

  const text = await res.text(); 

  if (!res.ok) {
    throw new Error(`Error ${res.status}: ${text}`);
  }

  try {
    return JSON.parse(text); // 👈 parse manual
  } catch (e) {
    throw new Error("La respuesta no es JSON válido");
  }
};
/**
 * Crea una nueva categoría.
 * POST /api/categories   { name }
 */
export const createCategory = async (name) => {
  const res = await fetch(`${BASE_URL}/categories`, {
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