import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function parseJwt(token) {
  try {
    const decoded = JSON.parse(atob(token.split('.')[1]));
    return {
      userId:   decoded.user_id,
      userName: decoded.sub,
      rolId:    decoded.rol_id,
    };
  } catch {
    return null;
  }
}

/* ─── Extrae el mensaje exacto del backend ─── */
function extractBackendError(err) {
  return err?.response?.data?.message
      || err?.response?.data?.error
      || err?.message
      || 'Error inesperado';
}

const authService = {

  async login({ email, password }) {
    try {
      const { data } = await API.post('/users/login', { email, password });
      return data;
    } catch (err) {
      throw new Error(extractBackendError(err));
    }
  },

  async loginSecondStep({ email, code }) {
    try {
      const { data } = await API.post('/users/loginSecondStep', {
        email,
        code: Number(code),
      });
      localStorage.setItem('token', data.jwt);
      return { user: parseJwt(data.jwt), message: data.message };
    } catch (err) {
      throw new Error(extractBackendError(err));
    }
  },

  async register({ userName, email, password, phone }) {
    try {
      const { data } = await API.post('/users/register', {
        userName,
        email,
        password,
        phone,
      });
      return data;
    } catch (err) {
      throw new Error(extractBackendError(err));
    }
  },

  async registerSecondStep({ email, code }) {
    try {
      const { data } = await API.post('/users/registerSecondStep', {
        email,
        code: Number(code),
      });
      localStorage.setItem('token', data.jwt);
      return { user: parseJwt(data.jwt), message: data.message };
    } catch (err) {
      throw new Error(extractBackendError(err));
    }
  },

  async resendCode({ email }) {
    try {
      const { data } = await API.post('/users/resendVerificationCode', { email });
      return data;
    } catch (err) {
      throw new Error(extractBackendError(err));
    }
  },

  logout() {
    localStorage.removeItem('token');
  },

  getCurrentUser() {
    const token = localStorage.getItem('token');
    return token ? parseJwt(token) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  },
};

export default authService;