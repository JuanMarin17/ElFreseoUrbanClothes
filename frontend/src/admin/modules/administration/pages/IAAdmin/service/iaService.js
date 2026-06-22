import axios from "axios";

const IA_BASE = `${import.meta.env.VITE_API_URL ?? "/api/v1"}/ia/admin`;

const ia = axios.create({
  baseURL: IA_BASE,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

ia.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwt");
  const storeId = localStorage.getItem("storeId");
  // Store-specific role takes priority over JWT global role
  const storedRole = localStorage.getItem("userRole");

  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (storeId) config.headers["X-Store-Id"] = storeId;

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.user_id) config.headers["X-User-Id"] = payload.user_id;
      const role =
        storedRole && storedRole !== "null" ? storedRole : payload.role;
      if (role) config.headers["X-User-Role"] = role;
    } catch {
      if (storedRole && storedRole !== "null")
        config.headers["X-User-Role"] = storedRole;
    }
  } else if (storedRole && storedRole !== "null") {
    config.headers["X-User-Role"] = storedRole;
  }

  return config;
});

ia.interceptors.response.use(
  (r) => r.data,
  (error) => {
    if (!error.response) {
      const err = new Error("Sin conexión al servidor.");
      err.status = 0;
      return Promise.reject(err);
    }
    const err = new Error(
      error.response?.data?.message || error.message || "Error desconocido",
    );
    err.status = error.response.status;
    return Promise.reject(err);
  },
);

export const sendChat = (body) => ia.post("/chat", body);
export const getSessions = () => ia.get("/sessions");
export const getSessionHistory = (sessionId) =>
  ia.get(`/sessions/${sessionId}/history`);
export const deleteSession = (sessionId) =>
  ia.delete(`/sessions/${sessionId}`);
export const deleteAllSessions = () => ia.delete("/sessions");
export const analyzeImage = (body) => ia.post("/image/analyze", body);
