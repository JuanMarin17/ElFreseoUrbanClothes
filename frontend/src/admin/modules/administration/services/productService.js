import axios from "axios";

// ─── Toda petición pasa por el API Gateway (puerto 8080) ─────────────────────
// El Gateway enruta /api/v1/products → microservicio product en 8084
const api = axios.create({
  baseURL: "http://localhost:8080",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ─── Interceptor: errores legibles ───────────────────────────────────────────
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
      const mensaje =
        error.response.data?.message ??
        String(
          error.response.data ??
            `Error del servidor (${error.response.status})`,
        );
      return Promise.reject(new Error(mensaje));
    }
    return Promise.reject(error);
  },
);

// ─── GET /api/v1/products?page=0&size=10 ─────────────────────────────────────
export const getProducts = async (page = 0, size = 10) => {
  const { data } = await api.get("/api/v1/products", {
    params: { page, size },
  });
  return data;
};

// ─── GET /api/v1/products/all ────────────────────────────────────────────────
export const getAllProducts = async () => {
  const { data } = await api.get("/api/v1/products/all");
  return data;
};

// ─── GET /api/v1/products/all/active ─────────────────────────────────────────
export const getAllActiveProducts = async () => {
  const { data } = await api.get("/api/v1/products/all/active");
  return data;
};

// ─── GET /api/v1/products/active?page=0&size=10 ──────────────────────────────
export const getActiveProducts = async (page = 0, size = 10) => {
  const { data } = await api.get("/api/v1/products/active", {
    params: { page, size },
  });
  return data;
};

// ─── GET /api/v1/products/new ────────────────────────────────────────────────
export const getNewProducts = async () => {
  const { data } = await api.get("/api/v1/products/new");
  return data;
};

// ─── GET /api/v1/products/:id ────────────────────────────────────────────────
export const getProductById = async (id) => {
  const { data } = await api.get(`/api/v1/products/${id}`);
  return data;
};

// ─── POST /api/v1/products ───────────────────────────────────────────────────
/**
 * @param {{
 *   name:        string,
 *   description: string,
 *   brandId:     string | null,
 *   categoryIds: string[],
 *   images:      string[],    ← URLs (base64 o Cloudinary)
 *   variants: {
 *     sku:      string,
 *     price:    number,
 *     stock:    number,
 *     minStock: number
 *   }[]
 * }} productData
 */
export const createProduct = async (productData) => {
  const { data } = await api.post("/api/v1/products", {
    name: productData.name,
    description: productData.description ?? "",
    brandId: productData.brandId ?? null,
    categoryIds: productData.categoryIds ?? [],
    images: productData.images ?? [],
    variants: productData.variants ?? [],
  });
  return data;
};

// ─── PUT /api/v1/products/:id ────────────────────────────────────────────────
export const updateProduct = async (id, productData) => {
  const { data } = await api.put(`/api/v1/products/${id}`, {
    name: productData.name,
    description: productData.description ?? "",
    brandId: productData.brandId ?? null,
    categoryIds: productData.categoryIds ?? [],
    images: productData.images ?? [],
    variants: productData.variants ?? [],
  });
  return data;
};

// ─── PUT /api/v1/products/inactive/:id ───────────────────────────────────────
export const inactivateProduct = async (id) => {
  const { data } = await api.put(`/api/v1/products/inactive/${id}`);
  return data;
};

// ─── PUT /api/v1/products/active/:id ─────────────────────────────────────────
export const activateProduct = async (id) => {
  const { data } = await api.put(`/api/v1/products/active/${id}`);
  return data;
};
