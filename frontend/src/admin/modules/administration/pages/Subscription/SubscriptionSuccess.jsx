import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getSubscription } from "../../../../../multi-tenant/pages/services/paymentService.js";
import "./Subscription.css";

const MAX_ATTEMPTS = 5;
const POLL_INTERVAL = 3000;

const formatDate = (d) => d ? new Date(d).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" }) : "—";

export default function SubscriptionSuccess() {
  const navigate    = useNavigate();
  // tenantId puede ser storeId (dashboard) o userId (wizard de creación)
  const tenantId    = localStorage.getItem("storeId") ?? (() => {
    try {
      const jwt = localStorage.getItem("jwt");
      if (!jwt || jwt === "null") return null;
      const p = JSON.parse(atob(jwt.split(".")[1]));
      return p.user_id ?? p.userId ?? p.sub ?? null;
    } catch { return null; }
  })();
  // Ruta a la que volver después de confirmar el pago (set por el flujo que llamó al pago)
  const returnTo = sessionStorage.getItem("sub_return_to") ?? "/tiendas";

  const [sub,       setSub]       = useState(null);
  const [polling,   setPolling]   = useState(false);
  const [attempts,  setAttempts]  = useState(0);
  const [error,     setError]     = useState(null);
  const intervalRef = useRef(null);

  const fetchSub = async () => {
    if (!tenantId) return;
    try {
      const data = await getSubscription(tenantId);
      setSub(data);
      return data?.status;
    } catch (err) {
      setError(err.message ?? "No se pudo verificar el estado de la suscripción.");
      return null;
    }
  };

  useEffect(() => {
    fetchSub().then((status) => {
      if (status && status !== "APPROVED") {
        // Iniciar polling hasta APPROVED o max intentos
        setPolling(true);
      }
    });
  }, []);

  useEffect(() => {
    if (!polling) return;
    let count = 0;

    intervalRef.current = setInterval(async () => {
      count++;
      setAttempts(count);
      const status = await fetchSub();
      if (status === "APPROVED" || count >= MAX_ATTEMPTS) {
        clearInterval(intervalRef.current);
        setPolling(false);
      }
    }, POLL_INTERVAL);

    return () => clearInterval(intervalRef.current);
  }, [polling]);

  const isApproved = sub?.status === "APPROVED";

  return (
    <div className="sub-root">
      <div className="sub-brand">
        <span className="sub-brand__logo">VEXIO</span>
      </div>

      <div className="sub-result">
        <div className="sub-result__icon sub-result__icon--green">
          {isApproved ? (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <span className="sub-spinner" style={{ borderTopColor: "#4ade80", borderColor: "rgba(74,222,128,.2)" }} />
          )}
        </div>

        <h1 className="sub-result__title">
          {isApproved ? "¡Suscripción activa!" : "Confirmando tu pago..."}
        </h1>
        <p className="sub-result__text">
          {isApproved
            ? "Tu suscripción fue aprobada. Ya puedes acceder a todas las funciones de tu dashboard."
            : polling
              ? `Estamos verificando tu pago con MercadoPago (intento ${attempts}/${MAX_ATTEMPTS})...`
              : "Verificando el estado de tu suscripción..."}
        </p>

        {polling && (
          <div className="sub-polling">
            <span className="sub-spinner" style={{ borderTopColor: "#fbbf24", borderColor: "rgba(251,191,36,.2)", width: 16, height: 16 }} />
            Esperando confirmación de MercadoPago...
          </div>
        )}

        {sub && (
          <div className="sub-result__card">
            <div className="sub-result__row">
              <span className="sub-result__row-label">Plan</span>
              <span className="sub-result__row-value">{sub.plan}</span>
            </div>
            <div className="sub-result__row">
              <span className="sub-result__row-label">Estado</span>
              <span className={`sub-result__status sub-result__status--${sub.status?.toLowerCase()}`}>
                {sub.status}
              </span>
            </div>
            {sub.expiresAt && (
              <div className="sub-result__row">
                <span className="sub-result__row-label">Próxima renovación</span>
                <span className="sub-result__row-value">{formatDate(sub.nextBillingAt ?? sub.expiresAt)}</span>
              </div>
            )}
          </div>
        )}

        {error && <p className="sub-error">{error}</p>}

        <div className="sub-result__actions">
          <button
            className="sub-btn sub-btn--primary"
            disabled={!isApproved}
            onClick={() => {
              sessionStorage.removeItem("sub_return_to");
              navigate(returnTo);
            }}
          >
            {isApproved
              ? returnTo.startsWith("/crear-tienda") ? "Continuar creando tienda →" : "Ir al dashboard →"
              : "Esperando aprobación..."}
          </button>
        </div>
      </div>
    </div>
  );
}
