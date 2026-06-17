import axios from "axios";
import { uploadFile } from "../../../../utils/uploadService";
import { authFetch } from "../../../../utils/authFetch";

const BASE_URL = import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_URL;

const TOKEN_KEY = "jwt";

const getToken = () => localStorage.getItem(TOKEN_KEY);

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

function getUserIdFromToken() {
  const token = getToken();
  if (!token) return null;
  try {
    const b64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(
      decodeURIComponent(
        atob(b64)
          .split("")
          .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
          .join(""),
      ),
    );
    return decoded.user_id ?? null;
  } catch {
    return null;
  }
}

const getAuthHeaderWithUserId = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
    "X-User-Id": getUserIdFromToken(),
  },
});

function buildFetchHeaders() {
  const h = { "Content-Type": "application/json", Accept: "application/json" };
  const token = getToken();
  if (token && token !== "null") h.Authorization = `Bearer ${token}`;
  return h;
}

async function fetchApi(method, path, body) {
  const res = await authFetch(`${BASE_URL}${path}`, {
    method,
    headers: buildFetchHeaders(),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  if (res.status === 204) return { data: null };
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = json?.message ?? json?.error ?? `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return { data: json?.data ?? json };
}

const accountService = {
  /* ── Perfil ──────────────────────────────────────────────────────────────── */
  getProfile: () => axios.get(`${BASE_URL}/users/me`, getAuthHeader()),

  updateProfile: async ({ userName, phone, imageProfile }) => {
    const userId = getUserIdFromToken();
    if (!userId) throw new Error("No se encontró el usuario en el token");
    return axios.put(
      `${BASE_URL}/users/update`,
      { userName, phone, imageProfile },
      getAuthHeaderWithUserId(),
    );
  },

  uploadAvatar: (file) => uploadFile(file),

  /* ── Contraseña ──────────────────────────────────────────────────────────── */
  changePassword: async ({ currentPassword, newPassword }) => {
    return fetchApi("PUT", "/users/me/password", {
      currentPassword,
      newPassword,
    });
  },

  /* ── Sesiones ────────────────────────────────────────────────────────────── */
  getSessions: async () => {
    const userId = getUserIdFromToken();
    if (!userId) return { data: [] };
    try {
      return await fetchApi("GET", `/auth/sessions/${userId}`);
    } catch {
      return { data: [] };
    }
  },

  closeSession: async (sessionId) =>
    fetchApi("DELETE", `/auth/sessions/${sessionId}`),

  closeAllSessions: async () => fetchApi("DELETE", "/auth/sessions"),

  toggle2FA: async (enable) =>
    fetchApi("PUT", "/auth/2fa", { enabled: enable }),

  /* ── Órdenes ─────────────────────────────────────────────────────────────── */
  getOrders: async () => {
    const STATUS_LABELS = {
      PENDING:    "Pendiente",
      CONFIRMED:  "Confirmado",
      PROCESSING: "En proceso",
      SHIPPED:    "Enviado",
      DELIVERED:  "Entregado",
      CANCELLED:  "Cancelado",
      REFUNDED:   "Reembolsado",
    };

    const storeId = localStorage.getItem("storeId");
    if (!storeId || storeId === "null") return { data: [] };

    const res = await fetchApi("GET", `/stores/${storeId}/orders`);
    const apiOrders = Array.isArray(res.data) ? res.data : (res.data?.content ?? []);

    const normalized = apiOrders.map((o) => ({
      id:     o.id ?? o.orderId,
      date:   o.createdAt
                ? new Date(o.createdAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })
                : "—",
      status: STATUS_LABELS[o.status] ?? o.status ?? "Pendiente",
      total:  o.total ?? 0,
      items: (o.items ?? []).map((it) => ({
        image: it.imageUrl ?? it.image ?? "",
        name:  it.productName ?? it.name ?? "Producto",
        qty:   it.quantity ?? it.qty ?? 1,
        price: it.unitPrice ?? it.price ?? 0,
      })),
    }));

    return { data: normalized };
  },
  getOrderDetail: async () => ({ data: {} }),

  /* ── Direcciones ─────────────────────────────────────────────────────────── */
  getAddresses: async () => ({ data: [] }),
  addAddress: async (data) => ({
    data: { ...data, id: Date.now().toString() },
  }),
  updateAddress: async (id, data) => ({ data: { ...data, id } }),
  deleteAddress: async () => ({ data: {} }),

  /* ── Preferencias ────────────────────────────────────────────────────────── */
  getPreferences: async () => {
    try {
      return await fetchApi("GET", "/preferences");
    } catch {
      return {
        data: {
          newCollections: false,
          offers: false,
          events: false,
          blog: false,
        },
      };
    }
  },

  updatePreferences: async (prefs) => {
    try {
      return await fetchApi("PUT", "/preferences", prefs);
    } catch {
      return { data: prefs };
    }
  },

  /* ── Soporte / Tickets ───────────────────────────────────────────────────── */
  getTickets: async () => {
    try {
      return await fetchApi("GET", "/support");
    } catch {
      return { data: [] };
    }
  },

  createTicket: async (data) => {
    try {
      return await fetchApi("POST", "/support", data);
    } catch {
      return {
        data: {
          ...data,
          id: Date.now().toString(),
          status: "Abierto",
          updatedAt: new Date().toISOString().split("T")[0],
        },
      };
    }
  },

  getTicketById: async (id) => {
    try {
      return await fetchApi("GET", `/support/${id}`);
    } catch {
      return { data: null };
    }
  },

  updateTicket: async (id, payload) =>
    fetchApi("PUT", `/support/${id}`, payload),
};

export default accountService;
