import axios from "axios";
import { uploadFile } from "../../../../utils/uploadService";

const BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://46.225.21.146:8080/api/v1";

const TOKEN_KEY = "jwt"; // ← clave correcta

const getToken = () => localStorage.getItem(TOKEN_KEY);

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

const getUserIdFromToken = () => {
  const token = getToken();
  if (!token) return null;
  try {
    const decoded = JSON.parse(atob(token.split(".")[1]));
    return decoded.user_id;
  } catch {
    return null;
  }
};

const getAuthHeaderWithUserId = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
    "X-User-Id": getUserIdFromToken(),
  },
});

const accountService = {
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

  changePassword: async () => ({ data: { message: "Contraseña actualizada" } }),
  getSessions: async () => ({ data: [] }),
  closeSession: async () => ({ data: {} }),
  toggle2FA: async () => ({ data: {} }),
  getOrders: async () => ({ data: [] }),
  getOrderDetail: async () => ({ data: {} }),
  getAddresses: async () => ({ data: [] }),
  addAddress: async (data) => ({
    data: { ...data, id: Date.now().toString() },
  }),
  updateAddress: async (id, data) => ({ data: { ...data, id } }),
  deleteAddress: async () => ({ data: {} }),
  getPreferences: async () => ({
    data: { newCollections: false, offers: false, events: false, blog: false },
  }),
  updatePreferences: async (data) => ({ data }),
  getTickets: async () => ({ data: [] }),
  createTicket: async (data) => ({
    data: {
      ...data,
      id: Date.now().toString(),
      status: "Abierto",
      updatedAt: new Date().toISOString().split("T")[0],
    },
  }),
};

export default accountService;
