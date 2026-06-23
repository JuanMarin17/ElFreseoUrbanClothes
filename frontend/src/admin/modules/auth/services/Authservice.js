import axios from "axios";
import { uploadUserImage } from "../../../../utils/uploadService";
import { clearAllChatSessions } from "../../../../utils/chatSession.js";

const BASE_URL = import.meta.env.VITE_API_URL;

const API = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

API.interceptors.request.use((config) => {
  const jwt = localStorage.getItem("jwt");
  // Auth endpoints don't need (and can break on) an existing token
  if (jwt && !config.url?.startsWith("/auth/")) {
    config.headers.Authorization = `Bearer ${jwt}`;
  }
  return config;
});

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

    // Auth endpoints must propagate their errors directly — never attempt a refresh.
    if (original.url?.startsWith("/auth/")) {
      return Promise.reject(error);
    }

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

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

      return API(original);
    } catch (refreshError) {
      processQueue(refreshError, null);
      localStorage.removeItem("jwt");
      clearAllChatSessions();
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

function parseJwt(jwt) {
  try {
    const b64 = jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(decodeURIComponent(atob(b64).split("").map(c => "%" + c.charCodeAt(0).toString(16).padStart(2, "0")).join("")));
    if (decoded.exp * 1000 < Date.now()) return null;
    return {
      userId: decoded.user_id,
      userName: decoded.sub,
      rolId: decoded.role,
    };
  } catch {
    return null;
  }
}

function extractBackendError(err) {
  if (!navigator.onLine || err.code === "ERR_NETWORK") {
    return "Sin conexión a internet. Verifica tu red e intenta de nuevo.";
  }

  const status = err?.response?.status;
  const raw = err?.response?.data;
  const msg = (
    typeof raw === "string" ? raw : (raw?.message ?? raw?.error ?? "")
  ).toLowerCase();

  if (import.meta.env.DEV) {
    console.warn("[AuthError raw]", err?.response?.data);
    if (raw?.errors)
      console.warn("[AuthError fields]", JSON.stringify(raw.errors, null, 2));
  }

  const validationMap = {
    "password must be longer than or equal to 8":
      "La contraseña debe tener al menos 8 caracteres",
    "password must be at least":
      "La contraseña debe tener al menos 8 caracteres",
    "password is too short": "La contraseña debe tener al menos 8 caracteres",
    "email must be an email": "El formato del correo no es válido",
    "email is not valid": "El formato del correo no es válido",
    "username must be longer": "El nombre de usuario es muy corto",
    "phone must be a number": "El teléfono solo debe contener números",
    "must be shorter than or equal":
      "Uno de los campos supera el largo permitido",
    "should not be empty": "Hay campos obligatorios vacíos",
  };

  const businessMap = {
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
    for (const [key, value] of Object.entries(validationMap)) {
      if (msg.includes(key)) return value;
    }
    for (const [key, value] of Object.entries(businessMap)) {
      if (msg.includes(key)) return value;
    }
    // Solo devolver el mensaje crudo para errores de cliente (4xx), no para 5xx
    if (status && status < 500) return msg;
  }

  if (status === 400)
    return "Datos inválidos, revisa los campos e intenta de nuevo";
  if (status === 401) return "Correo o contraseña incorrectos";
  if (status === 404) return "No existe una cuenta con ese correo";
  if (status === 409) return "Ya existe una cuenta con ese correo";
  if (status === 422) return "Datos inválidos, revisa los campos e intenta de nuevo";
  if (status === 429) return "Demasiadas peticiones, espera unos minutos e intenta de nuevo";
  if (status === 500) return "Error del servidor, intenta más tarde";

  return "Ocurrió un error inesperado, intenta de nuevo";
}

const authService = {
  uploadAvatar: (file) => uploadUserImage(file),

  async login({ email, password }) {
    try {
      localStorage.removeItem("jwt");
      localStorage.setItem("last_email", email);
      const { data } = await API.post("/auth/login", { email, password });
      if (import.meta.env.DEV) {
        console.log("[login paso 1] response →", JSON.stringify(data));
      }
      return data;
    } catch (err) {
      throw new Error(extractBackendError(err));
    }
  },

  async loginSecondStep({ email, code }) {
    try {
      const payload = { email, code: Number(code) };
      if (import.meta.env.DEV) {
        console.log("[loginSecondStep] payload →", JSON.stringify(payload));
      }
      const { data } = await axios.post(
        `${BASE_URL}/auth/loginSecondStep`,
        payload,
        { headers: { "Content-Type": "application/json" } },
      );
      if (import.meta.env.DEV) {
        console.log("[loginSecondStep] response →", data);
      }
      if (!data.jwt) throw new Error("No se recibió el token");
      localStorage.setItem("jwt", data.jwt);
      return { user: parseJwt(data.jwt), message: data.message };
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("[loginSecondStep] error status →", err?.response?.status);
        console.error("[loginSecondStep] error body  →", err?.response?.data);
      }
      throw new Error(extractBackendError(err));
    }
  },

  async register({ userName, email, password, phone, imageProfile }) {
    try {
      // El microservicio de usuarios valida phone como numérico → quitar +, espacios, guiones
      const cleanPhone = phone ? phone.replace(/\D/g, "") : "";
      const payload = {
        userName,
        email,
        password,
        phone: cleanPhone,
        imageProfile,
      };
      if (import.meta.env.DEV)
        console.log("[Register payload]", JSON.stringify(payload, null, 2));
      const { data } = await API.post("/auth/register", payload);
      return data;
    } catch (err) {
      throw new Error(extractBackendError(err));
    }
  },

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

  async forgotPassword({ email }) {
    try {
      const { data } = await API.post("/auth/forgotPassword", { email });
      localStorage.setItem("recovery_email", email);
      return data;
    } catch (err) {
      throw new Error(extractBackendError(err));
    }
  },

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
    clearAllChatSessions();
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
