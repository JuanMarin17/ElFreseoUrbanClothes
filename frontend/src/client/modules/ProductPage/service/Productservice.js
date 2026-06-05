import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const productApi = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor: adjunta token JWT si existe
productApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("vx_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor: manejo global de errores
productApi.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "Error desconocido";
    return Promise.reject(new Error(message));
  },
);

/**
 * Obtiene el detalle completo de un producto por su ID.
 * GET /api/products/:id
 * @param {string|number} productId
 * @returns {Promise<ProductDetail>}
 */
export const fetchProductById = (productId) =>
  productApi.get(`/products/${productId}`);

/**
 * Obtiene las reseñas paginadas de un producto.
 * GET /api/products/:id/reviews?page=0&size=10
 * @param {string|number} productId
 * @param {number} page
 * @param {number} size
 * @returns {Promise<ReviewPage>}
 */
export const fetchProductReviews = (productId, page = 0, size = 10) =>
  productApi.get(`/products/${productId}/reviews`, {
    params: { page, size },
  });

/**
 * Obtiene productos relacionados por categoría.
 * GET /api/products/:id/related?limit=4
 * @param {string|number} productId
 * @param {number} limit
 * @returns {Promise<Product[]>}
 */
export const fetchRelatedProducts = (productId, limit = 4) =>
  productApi.get(`/products/${productId}/related`, {
    params: { limit },
  });

/**
 * Agrega el producto al carrito del usuario.
 * POST /api/cart/items
 * @param {{ productId, variantId, quantity }} payload
 * @returns {Promise<CartItem>}
 */
export const addToCart = (payload) => productApi.post("/cart/items", payload);

/**
 * Alterna el estado de wishlist del producto.
 * POST /api/wishlist/toggle
 * @param {{ productId }} payload
 * @returns {Promise<{ wishlisted: boolean }>}
 */
export const toggleWishlist = (payload) =>
  productApi.post("/wishlist/toggle", payload);
