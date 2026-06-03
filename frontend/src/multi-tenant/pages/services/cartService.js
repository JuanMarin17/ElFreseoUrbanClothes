/**
 * cartService.js
 * Carrito de compras — por tienda y por usuario (JWT via Gateway).
 */

const BASE = "http://localhost:8080/api/v1";

const buildHeaders = (storeId) => {
  const jwt = localStorage.getItem("jwt");
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(jwt && jwt !== "null" ? { Authorization: `Bearer ${jwt}` } : {}),
    ...(storeId ? { "X-Store-Id": storeId } : {}),
  };
};

async function request(method, path, storeId, body) {
  const options = {
    method,
    headers: buildHeaders(storeId),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  };

  const res = await fetch(`${BASE}${path}`, options);

  if (res.status === 204) return null;

  let data;
  try { data = await res.json(); } catch { data = {}; }

  if (!res.ok) {
    const msg = data?.message ?? data?.error ?? `Error ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  return data?.data ?? data;
}

/** Obtener carrito activo (lo crea si no existe). */
export const getCart = (storeId) =>
  request("GET", `/stores/${storeId}/cart`, storeId);

/** Agregar producto al carrito. Si ya existe, suma la cantidad. */
export const addItem = (storeId, { productId, quantity }) =>
  request("POST", `/stores/${storeId}/cart/items`, storeId, { productId, quantity });

/** Cambiar cantidad de un ítem. Si quantity = 0 se elimina automáticamente. */
export const updateItem = (storeId, cartItemId, { quantity }) =>
  request("PUT", `/stores/${storeId}/cart/items/${cartItemId}`, storeId, { quantity });

/** Eliminar un ítem del carrito. */
export const removeItem = (storeId, cartItemId) =>
  request("DELETE", `/stores/${storeId}/cart/items/${cartItemId}`, storeId);

/** Vaciar el carrito completamente (responde 204). */
export const clearCart = (storeId) =>
  request("DELETE", `/stores/${storeId}/cart`, storeId);
