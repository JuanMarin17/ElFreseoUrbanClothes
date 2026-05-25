import axios from "axios";

// ─── Cliente Axios base ───────────────────────────────────────────────────────
// El API Gateway en :8080 enruta /api/v1/* → microservicios correspondientes.
const api = axios.create({
  baseURL: "http://localhost:8080",
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ─── Helper: inyectar headers de contexto por petición ───────────────────────
// El backend (ProductService) exige X-Store-Id y X-User-Role en CADA petición.
// Se leen de localStorage (o donde los guarde tu auth) y se adjuntan aquí
// para no repetir esta lógica en cada llamada.
const authHeaders = () => {
  const storeId = localStorage.getItem("storeId");
  const role = localStorage.getItem("userRole"); // "ADMIN" | "OWNER"

  if (!storeId)
    throw new Error("No se encontró el storeId. Por favor inicia sesión.");
  if (!role)
    throw new Error(
      "No se encontró el rol de usuario. Por favor inicia sesión.",
    );

  return {
    "X-Store-Id": storeId,
    "X-User-Role": role,
  };
};

// ─── Interceptor global de errores ───────────────────────────────────────────
// Extrae el mensaje legible del ApiResponseDTO que devuelve Spring.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.code === "ERR_NETWORK" ||
      error.code === "ERR_CONNECTION_REFUSED"
    ) {
      return Promise.reject(
        new Error(
          "No se puede conectar al servidor. " +
            "Verifica que el API Gateway esté corriendo en el puerto 8080.",
        ),
      );
    }

    if (error.response) {
      // El backend devuelve { message, status, data, timestamp }
      const mensaje =
        error.response.data?.message ??
        `Error del servidor (${error.response.status})`;
      return Promise.reject(new Error(mensaje));
    }

    return Promise.reject(error);
  },
);

// ─── Helper: extraer .data del ApiResponseDTO ────────────────────────────────
// Spring devuelve siempre { message, status, data: <payload>, timestamp }.
// Esta función extrae el payload para que los llamadores reciban los datos
// directamente, sin tener que hacer response.data.data en cada sitio.
const extractData = (response) => response.data?.data ?? response.data;

// ═════════════════════════════════════════════════════════════════════════════
// PRODUCTS
// ═════════════════════════════════════════════════════════════════════════════

// ─── GET /api/v1/products?page=0&size=10 ─────────────────────────────────────
export const getProducts = async (page = 0, size = 10) => {
  const { data } = await api.get("/api/v1/products", {
    params: { page, size },
    headers: authHeaders(),
  });
  return extractData({ data });
};

// ─── GET /api/v1/products/all ────────────────────────────────────────────────
export const getAllProducts = async () => {
  const { data } = await api.get("/api/v1/products/all", {
    headers: authHeaders(),
  });
  return extractData({ data });
};

// ─── GET /api/v1/products/all/active ─────────────────────────────────────────
export const getAllActiveProducts = async () => {
  const { data } = await api.get("/api/v1/products/all/active", {
    headers: authHeaders(),
  });
  return extractData({ data });
};

// ─── GET /api/v1/products/active?page=0&size=10 ──────────────────────────────
export const getActiveProducts = async (page = 0, size = 10) => {
  const { data } = await api.get("/api/v1/products/active", {
    params: { page, size },
    headers: authHeaders(),
  });
  return extractData({ data });
};

// ─── GET /api/v1/products/new ────────────────────────────────────────────────
export const getNewProducts = async () => {
  const { data } = await api.get("/api/v1/products/new", {
    headers: authHeaders(),
  });
  return extractData({ data });
};

// ─── GET /api/v1/products/:id ────────────────────────────────────────────────
export const getProductById = async (id) => {
  const { data } = await api.get(`/api/v1/products/${id}`, {
    headers: authHeaders(),
  });
  return extractData({ data });
};

// ─── POST /api/v1/products ───────────────────────────────────────────────────
/**
 * Crea un producto nuevo.
 *
 * El backend espera:
 * {
 *   name:        string           — obligatorio
 *   description: string           — opcional
 *   brandId:     string | null    — UUID como string, null si no aplica
 *   categoryIds: string[]         — array de UUIDs como string
 *   images:      string[]         — URLs de Cloudinary (máx. 6)
 *   variants: [{
 *     sku:      string
 *     price:    number
 *     stock:    number
 *     minStock: number
 *   }]
 * }
 *
 * FIX:
 * - brandId vacío ("") → null  (evita UUID.fromString("") en Spring)
 * - categoryIds se garantiza como array vacío si no viene
 * - Se adjuntan headers X-Store-Id y X-User-Role requeridos por el Service
 */
export const createProduct = async (productData) => {
  const payload = {
    name: productData.name,
    description: productData.description ?? "",
    brandId: productData.brandId || null, // "" → null
    categoryIds: productData.categoryIds ?? [],
    images: productData.images ?? [],
    variants: productData.variants ?? [],
  };

  const { data } = await api.post("/api/v1/products", payload, {
    headers: authHeaders(),
  });

  return extractData({ data });
};

// ─── PUT /api/v1/products/:id ────────────────────────────────────────────────
export const updateProduct = async (id, productData) => {
  const payload = {
    name: productData.name,
    description: productData.description ?? "",
    brandId: productData.brandId || null,
    categoryIds: productData.categoryIds ?? [],
    images: productData.images ?? [],
    variants: productData.variants ?? [],
  };

  const { data } = await api.put(`/api/v1/products/${id}`, payload, {
    headers: authHeaders(),
  });

  return extractData({ data });
};

// ─── PUT /api/v1/products/inactive/:id ───────────────────────────────────────
export const inactivateProduct = async (id) => {
  const { data } = await api.put(`/api/v1/products/inactive/${id}`, null, {
    headers: authHeaders(),
  });
  return extractData({ data });
};

// ─── PUT /api/v1/products/active/:id ─────────────────────────────────────────
export const activateProduct = async (id) => {
  const { data } = await api.put(`/api/v1/products/active/${id}`, null, {
    headers: authHeaders(),
  });
  return extractData({ data });
};
