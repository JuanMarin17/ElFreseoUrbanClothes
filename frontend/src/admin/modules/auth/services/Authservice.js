import axios from "axios";
import { uploadFile } from "../../../../utils/uploadService";

const BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://46.225.21.146:8080/api/v1";

const API = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

API.interceptors.request.use((config) => {
  const jwt = localStorage.getItem("jwt");
  if (jwt) config.headers.Authorization = `Bearer ${jwt}`;
  return config;
});

// ─── Interceptor de respuesta: refresca el token automáticamente en 401 ───────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token),
  );
  failedQueue = [];
};

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Solo interceptar 401 y evitar bucle infinito
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    // Si ya hay un refresh en curso, encolar esta petición
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers["Authorization"] = `Bearer ${token}`;
        return API(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    const oldToken = localStorage.getItem("jwt");

    try {
      // Usar axios directo (no API) para evitar que este request pase por el interceptor
      const { data } = await axios.post(
        `${BASE_URL}/auth/refresh-token`,
        {},
        { headers: { Authorization: `Bearer ${oldToken}` } },
      );

      if (!data.jwt) throw new Error("No se recibió el token renovado");

      localStorage.setItem("jwt", data.jwt);
      API.defaults.headers.common["Authorization"] = `Bearer ${data.jwt}`;
      original.headers["Authorization"] = `Bearer ${data.jwt}`;
      processQueue(null, data.jwt);

      return API(original); // reintenta la petición original con el nuevo token
    } catch (refreshError) {
      processQueue(refreshError, null);
      localStorage.removeItem("jwt");
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

function parseJwt(jwt) {
  try {
    const decoded = JSON.parse(atob(jwt.split(".")[1]));
    return {
      userId: decoded.user_id,
      userName: decoded.sub,
      rolId: decoded.role,
    };
  } catch {
    return null;
  }
}

/* ─── Mensajes limpios y amigables ─── */
function extractBackendError(err) {
  /* Sin internet */
  if (!navigator.onLine || err.code === "ERR_NETWORK") {
    return "Sin conexión a internet. Verifica tu red e intenta de nuevo.";
  }

  const msg = err?.response?.data?.message || "";

  /* Mapeo de mensajes técnicos → amigables */
  const map = {
    "correo o contraseña incorrectos": "Correo o contraseña incorrectos",
    incorrectcredentials: "Correo o contraseña incorrectos",
    "user not found": "No existe una cuenta con ese correo",
    "invalid otp": "Código inválido o expirado",
    otp: "Código inválido o expirado",
    "user already exists": "Ya existe una cuenta con ese correo",
    "already exists": "Ya existe una cuenta con ese correo",
    "role not found": "Error de configuración, contacta soporte",
  };

  if (msg) {
    const lower = msg.toLowerCase();
    for (const [key, value] of Object.entries(map)) {
      if (lower.includes(key)) return value;
    }
    return msg;
  }

  /* Errores HTTP genéricos */
  const status = err?.response?.status;
  if (status === 401) return "Correo o contraseña incorrectos";
  if (status === 404) return "No existe una cuenta con ese correo";
  if (status === 409) return "Ya existe una cuenta con ese correo";
  if (status === 500) return "Error del servidor, intenta más tarde";

  return "Ocurrió un error inesperado, intenta de nuevo";
}

const authService = {
  uploadAvatar: (file) => uploadFile(file),

  /* ─── Login paso 1 ─── */
  async login({ email, password }) {
    try {
      /* Guardar email ANTES del request para que quede aunque falle */
      localStorage.setItem("last_email", email);
      const { data } = await API.post("/auth/login", { email, password });
      return data;
    } catch (err) {
      throw new Error(extractBackendError(err));
    }
  },

  /* ─── Login paso 2 ─── */
  async loginSecondStep({ email, code }) {
    try {
      const { data } = await API.post("/auth/loginSecondStep", {
        email,
        code: Number(code),
      });
      if (!data.jwt) throw new Error("No se recibió el token");
      localStorage.setItem("jwt", data.jwt);
      return { user: parseJwt(data.jwt), message: data.message };
    } catch (err) {
      throw new Error(extractBackendError(err));
    }
  },

  /* ─── Register paso 1 ─── */
  async register({ userName, email, password, phone, imageProfile }) {
    try {
      const { data } = await API.post("/auth/register", {
        userName,
        email,
        password,
        phone,
        imageProfile,
      });
      return data;
    } catch (err) {
      throw new Error(extractBackendError(err));
    }
  },

  /* ─── Register paso 2 ─── */
  async registerSecondStep({ email, code }) {
    try {
      const { data } = await API.post("/auth/registerSecondStep", {
        email,
        code: Number(code),
      });
      if (!data.jwt) throw new Error("No se recibió el token");
      localStorage.setItem("jwt", data.jwt);
      return { user: parseJwt(data.jwt), message: data.message };
    } catch (err) {
      throw new Error(extractBackendError(err));
    }
  },

  /* ─── Reenviar código ─── */
  async resendCode({ email }) {
    try {
      const { data } = await API.post("/auth/resendVerificationCode", {
        email,
      });
      return data;
    } catch (err) {
      throw new Error(extractBackendError(err));
    }
  },

  /* ─── Recuperar contraseña paso 1 ─── */
  async forgotPassword({ email }) {
    try {
      const { data } = await API.post("/auth/forgotPassword", { email });
      localStorage.setItem("recovery_email", email);
      return data;
    } catch (err) {
      throw new Error(extractBackendError(err));
    }
  },

  /* ─── Recuperar contraseña paso 2 ─── */
  async forgotPasswordSecondStep({ email, code, password }) {
    try {
      const { data } = await API.put("/auth/forgotPasswordSecondStep", {
        email,
        code,
        password,
      });
      localStorage.removeItem("recovery_email");
      return data;
    } catch (err) {
      throw new Error(extractBackendError(err));
    }
  },

  /* ─── Refresh token (llamada proactiva desde el hook de 3 minutos) ─── */
  async refreshToken() {
    const oldToken = localStorage.getItem("jwt");
    if (!oldToken) return null;
    try {
      const { data } = await axios.post(
        `${BASE_URL}/auth/refresh-token`,
        {},
        { headers: { Authorization: `Bearer ${oldToken}` } },
      );
      if (!data.jwt) return null;
      localStorage.setItem("jwt", data.jwt);
      return parseJwt(data.jwt);
    } catch {
      return null;
    }
  },

  logout() {
    localStorage.removeItem("jwt");
    localStorage.removeItem("last_email");
  },

  getCurrentUser() {
    const jwt = localStorage.getItem("jwt");
    return jwt ? parseJwt(jwt) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem("jwt");
  },
};

export default authService;
