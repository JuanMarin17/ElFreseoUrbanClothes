const API_ROOT = import.meta.env.VITE_API_URL ?? "http://46.225.21.146:8080/api/v1";

// ─── Utilidad interna ─────────────────────────────────────────────────────────
async function postImage(folder, file) {
  if (!navigator.onLine) throw new Error("Sin conexión a internet");

  const formData = new FormData();
  formData.append("image", file); // el campo siempre se llama "image"

  const jwt = localStorage.getItem("jwt");
  const headers = jwt ? { Authorization: `Bearer ${jwt}` } : {};

  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(new Error("La subida del archivo tardó demasiado. Intenta de nuevo.")),
    20000,
  );
  let res;
  try {
    res = await fetch(`${API_ROOT}/upload?folder=${folder}`, {
      method: "POST",
      headers,
      body: formData,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Error al subir imagen: ${res.status}`);
  }

  const body = await res.json();
  // Soporta respuesta plana { url } y wrapper { data: { url } }
  const url = body?.url ?? body?.data?.url ?? body?.secure_url ?? null;
  if (!url) throw new Error("El servidor no devolvió una URL válida");
  return url;
}

/**
 * Sube una imagen de PRODUCTO.
 * POST /upload?folder=productos
 * @param {File} file
 * @returns {Promise<string>} URL de Cloudinary
 */
export async function uploadFile(file) {
  return postImage("productos", file);
}

/**
 * Sube una imagen de USUARIO (avatar / foto de perfil).
 * POST /upload?folder=usuarios
 */
export async function uploadUserImage(file) {
  return postImage("usuarios", file);
}

/**
 * Sube una imagen de TIENDA (logo, banner, etc.).
 * POST /upload?folder=<folder>
 * Carpetas disponibles: "stores/logos" | "stores/banners" | "general"
 */
export async function uploadStoreImage(file, folder = "general") {
  return postImage(folder, file);
}
