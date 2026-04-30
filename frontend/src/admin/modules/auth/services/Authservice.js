import axios from 'axios';

/* ─── AXIOS INSTANCE ───────────────────────── */
const API = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

/* ─── INTERCEPTOR JWT ─────────────────────── */
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ─── PARSE JWT ───────────────────────────── */
function parseJwt(token) {
  try {
    const base64 = token.split('.')[1];
    const decoded = JSON.parse(atob(base64));
    return {
      userId:   decoded.user_id,
      userName: decoded.sub,
      rolId:    decoded.rol_id,
    };
  } catch {
    return null;
  }
}

/* ─── SERVICE ─────────────────────────────── */
const authService = {

  /* ── LOGIN PASO 1
     DTO: LoginRequestDTO → { email: String, password: String }
     Respuesta: MessageResponseDTO → { message: String }          */
  async login({ email, password }) {
    const { data } = await API.post('/users/login', {
      email,      // String — @NotBlank @Email
      password,   // String — @NotBlank
    });
    return data;  // { message }
  },

  /* ── LOGIN PASO 2
     DTO: ValidationCodeDTO → { email: String, code: Integer }
     Respuesta: JwtResponseDTO → { jwt: String, message: String } */
  async loginSecondStep({ email, code }) {
    const { data } = await API.post('/users/loginSecondStep', {
      email,
      code: Number(code), // backend espera Integer, no String
    });
    localStorage.setItem('token', data.jwt);
    return { user: parseJwt(data.jwt), message: data.message };
  },

  /* ── REGISTER PASO 1
     DTO: UserRequestDTO → { userName, email, password, phone }
     Todos @NotBlank. password mínimo 8 chars. phone 7-15 dígitos.
     Respuesta: MessageResponseDTO → { message: String }          */
  async register({ userName, email, password, phone }) {
    const { data } = await API.post('/users/register', {
      "userName" : userName, // @Size(min=3, max=30)
      "email": email,    // @Email
      "password": password, // @Size(min=8)
      "phone": phone,    // @Pattern "^[0-9]{7,15}$"
    });
    console.log(data);
    return data; // { message }
  },

  /* ── REGISTER PASO 2
     DTO: ValidationCodeDTO → { email: String, code: Integer }
     Respuesta: JwtResponseDTO → { jwt: String, message: String } */
  async registerSecondStep({ email, code }) {
    const { data } = await API.post('/users/registerSecondStep', {
      email,
      code: Number(code),
    });
    localStorage.setItem('token', data.jwt);
    return { user: parseJwt(data.jwt), message: data.message };
  },

  /* ── REENVIAR CÓDIGO
     DTO: EmailRequestDTO → { email: String }
     Respuesta: MessageResponseDTO → { message: String }          */
  async resendCode({ email }) {
    const { data } = await API.post('/users/resendVerificationCode', { email });
    return data; // { message }
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