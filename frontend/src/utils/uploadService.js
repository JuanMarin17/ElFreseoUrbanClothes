const API_ROOT = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1';

/**
 * Sube un archivo al backend como multipart/form-data.
 * El backend se encarga de subirlo a Cloudinary y devuelve la URL.
 * @param {File} file
 * @returns {Promise<string>} URL del archivo subido
 */
export async function uploadFile(file) {
  if (!navigator.onLine) throw new Error('Sin conexión a internet');

  const formData = new FormData();
  formData.append('file', file);

  const jwt = localStorage.getItem('jwt');
  const headers = jwt ? { Authorization: `Bearer ${jwt}` } : {};

  const res = await fetch(`${API_ROOT}/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Error al subir archivo: ${res.status}`);
  }

  const data = await res.json();
  const url = data.url ?? data.imageUrl ?? data.secure_url ?? data.fileUrl ?? null;
  if (!url) throw new Error('El servidor no devolvió una URL válida');
  return url;
}
