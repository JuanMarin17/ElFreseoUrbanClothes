// services/brandService.js
const BASE_URL = import.meta.env.VITE_API_URL ?? "";

/**
 * Obtiene todas las marcas activas.
 * GET /api/brands/active
 */
export const getBrands = async () => {
  const res = await fetch(`${BASE_URL}/api/brands/active`);
  if (!res.ok) throw new Error(`Error ${res.status} al obtener marcas.`);
  return res.json(); // Brand[]
};
