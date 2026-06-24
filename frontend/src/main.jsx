import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import axios from 'axios'
import './index.css'
import App from './App.jsx'
import { initUIPrefs } from './client/hooks/useUIPrefs.js'

// Aplica preferencias de UI (tema, fuente, etc.) antes del primer render
initUIPrefs();

// Evita que el navegador restaure el scroll de la entrada anterior del historial;
// el scroll al cambiar de ruta lo controla React Router (ver ScrollToTop en App.jsx)
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

/* ── Global 401 interceptor ────────────────────────────────────────────────
   When any request returns 401 (session invalidated from another device),
   clear local auth state and force a redirect to login.
   This covers both fetch-based and axios-based service calls.
─────────────────────────────────────────────────────────────────────────── */
function forceLogout() {
  localStorage.removeItem('jwt');
  localStorage.removeItem('userRole');
  localStorage.removeItem('storeId');
  window.location.replace('/login');
}

const hadSession = () => {
  const jwt = localStorage.getItem('jwt');
  return !!jwt && jwt !== 'null';
};

// Patch global window.fetch — covers every fetch() call in the app
const _nativeFetch = window.fetch.bind(window);
window.fetch = async (...args) => {
  const res = await _nativeFetch(...args);
  if (res.status === 401 && hadSession()) {
    forceLogout();
    // Return a promise that never resolves so callers never process the 401 body
    return new Promise(() => {});
  }
  return res;
};

// Axios response interceptor — covers accountService axios calls
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && hadSession()) {
      forceLogout();
    }
    return Promise.reject(error);
  }
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>,
)
