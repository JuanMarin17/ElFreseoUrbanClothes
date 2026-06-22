import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./Useauth";

/**
 * Protege el panel admin de una tienda (/tienda/:slug/admin/*):
 *  Exige sesión iniciada (si no hay JWT, redirige a /login).
 * La verificación de suscripción activa ya no expulsa a /planes: cada
 * página del panel (p. ej. configuración) gestiona su propio estado de
 * plan, así que el dueño siempre puede entrar a administrar su tienda.
 */
export default function SubscriptionGuard() {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return <div className="loading-spinner">Verificando acceso...</div>;
  }

  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
}
