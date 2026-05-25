// services/brandService.js
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api/v1";

/**
 * Obtiene todas las marcas activas.
 * GET /api/v1/brands/active
 */
export const getBrands = async () => {
  const res = await fetch(`${BASE_URL}/brands/active`);
  const text = await res.text();
  if (!res.ok) throw new Error(`Error ${res.status}: ${text}`);
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("La respuesta no es JSON válido (probablemente HTML del backend)");
  }
};

/**
 * Crea una nueva marca.
 * POST /api/v1/brands   { name }
 */
export const createBrand = async (name) => {
  const res = await fetch(`${BASE_URL}/brands`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => "Error al crear marca.");
    throw new Error(msg || `Error ${res.status}`);
  }
  return res.json(); // Brand creada: { brandId, name, ... }
};