import { useTokenGuard } from './useTokenGuard';

/**
 * Componente sin UI que activa el controlador del token.
 * Colocarlo dentro de AuthProvider + BrowserRouter (ej. en App.jsx).
 */
export function TokenGuard() {
  useTokenGuard();
  return null;
}
