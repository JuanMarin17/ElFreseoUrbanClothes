import { useEffect, useState } from "react";
import { Navigate, Outlet, useParams } from "react-router-dom";
import { useAuth } from "./Useauth";
import { getStoreBySlug } from "../../../../../multi-tenant/pages/services/storeService";
import { getLimits } from "../../../../../multi-tenant/pages/services/transactionService";

/**
 * Protege el panel admin de una tienda (/tienda/:slug/admin/*):
 *  1. Exige sesión iniciada (si no hay JWT, redirige a /login).
 *  2. Verifica que la suscripción de la tienda esté activa; si no, redirige a /planes.
 * Si el chequeo de suscripción falla por un error de red/servidor, se deja pasar
 * (fail-open) — la autorización real de cada acción la sigue validando el backend.
 */
export default function SubscriptionGuard() {
  const { user, loading: authLoading } = useAuth();
  const { slug } = useParams();

  const [checking, setChecking] = useState(true);
  const [blockedTo, setBlockedTo] = useState(null);

  useEffect(() => {
    if (authLoading || !user) { setChecking(false); return; }

    let active = true;
    (async () => {
      try {
        const store = await getStoreBySlug(slug);
        const storeId = store?.storeId ?? store?.id ?? null;
        if (!storeId) return;

        const limits = await getLimits(storeId);
        if (active && limits?.active === false) {
          setBlockedTo("/planes");
        }
      } catch (err) {
        console.warn("SubscriptionGuard: no se pudo verificar la suscripción", err);
      } finally {
        if (active) setChecking(false);
      }
    })();

    return () => { active = false; };
  }, [slug, user, authLoading]);

  if (authLoading || checking) {
    return <div className="loading-spinner">Verificando acceso...</div>;
  }

  if (!user) return <Navigate to="/login" replace />;
  if (blockedTo) return <Navigate to={blockedTo} replace />;

  return <Outlet />;
}
