import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './Useauth';
import authService from '../../services/Authservice';

const REFRESH_THRESHOLD_SECONDS = 180; // renovar si quedan menos de 3 minutos
const CHECK_INTERVAL_MS = 30_000;      // verificar cada 30 segundos

function getTokenExp(jwt) {
  try {
    const payload = JSON.parse(atob(jwt.split('.')[1]));
    return typeof payload.exp === 'number' ? payload.exp : null;
  } catch {
    return null;
  }
}

export function useTokenGuard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const refreshingRef = useRef(false);

  useEffect(() => {
    if (!user) return;

    const check = async () => {
      const jwt = localStorage.getItem('jwt');

      if (!jwt) {
        logout();
        navigate('/login', { replace: true });
        return;
      }

      const exp = getTokenExp(jwt);
      if (exp === null) return; // token sin campo exp → no hacer nada

      const nowSeconds = Math.floor(Date.now() / 1000);
      const secondsLeft = exp - nowSeconds;

      if (secondsLeft <= 0) {
        // Token expirado localmente → cerrar sesión
        logout();
        navigate('/login', { replace: true });
        return;
      }

      if (secondsLeft <= REFRESH_THRESHOLD_SECONDS && !refreshingRef.current) {
        // Quedan menos de 3 minutos → renovar de forma preventiva
        refreshingRef.current = true;
        try {
          await authService.refreshToken();
        } finally {
          refreshingRef.current = false;
        }
      }
    };

    check(); // verificar al montar
    const interval = setInterval(check, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [user, logout, navigate]);
}
