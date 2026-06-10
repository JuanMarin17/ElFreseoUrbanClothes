// userService.js
// Servicio profesional para la gestión de usuarios y conexión con la API backend

const API_URL = "http://46.225.21.146:8081";

/**
 * Crea un nuevo usuario en el sistema.
 * @param {Object} userData - Datos del usuario a crear
 * @returns {Promise<Object>} - Respuesta de la API
 */
export async function createUser(userData) {
  try {
    const response = await fetch(`${API_URL}/usuarios`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Error al crear el usuario");
    }

    return await response.json();
  } catch (error) {
    // Log profesional para debugging
    console.error("Error en createUser:", error);
    throw error;
  }
}
