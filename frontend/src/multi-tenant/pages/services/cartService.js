/**
 * cartService.js
 * Carrito de compras — por tienda y por usuario (JWT inyectado por el Gateway).
 * Nota: storeId va en la URL, NO en los headers.
 */

import { authFetch } from "../../../utils/authFetch";

const BASE = import.meta.env.VITE_API_URL;

const buildHeaders = () => {
  const jwt = localStorage.getItem("jwt");
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(jwt && jwt !== "null" ? { Authorization: `Bearer ${jwt}` } : {}),
  };
};

async function request(method, path, body) {
  const res = await authFetch(`${BASE}${path}`, {
    method,
    headers: buildHeaders(),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (res.status === 204) return null;

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

/** Obtener carrito activo (lo crea si no existe, nunca devuelve 404). */
export const getCart = (storeId) => request("GET", `/stores/${storeId}/cart`);

/** Agregar producto al carrito. Si ya existe, suma la cantidad. */
export const addItem = (storeId, { productId, variantId, quantity }) =>
  request("POST", `/stores/${storeId}/cart/items`, { productId, variantId, quantity });

/** Cambiar cantidad de un ítem. quantity=0 elimina el ítem automáticamente. */
export const updateItem = (storeId, cartItemId, { quantity }) =>
  request("PUT", `/stores/${storeId}/cart/items/${cartItemId}`, { quantity });

/** Eliminar un ítem del carrito. */
export const removeItem = (storeId, cartItemId) =>
  request("DELETE", `/stores/${storeId}/cart/items/${cartItemId}`);

/** Vaciar y destruir el carrito (responde 204 sin body). */
export const clearCart = (storeId) =>
  request("DELETE", `/stores/${storeId}/cart`);
