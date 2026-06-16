import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSubscription } from "../../../../../multi-tenant/pages/services/transactionService.js";
import "./Subscription.css";

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";

const STATUS_LABELS = {
  ACTIVE:    "ACTIVA",
  PENDING:   "PENDIENTE",
  EXPIRED:   "VENCIDA",
  CANCELLED: "CANCELADA",
};

export default function SubscriptionSuccess() {
  const navigate = useNavigate();
  const storeId = localStorage.getItem("storeId");
  const returnTo = sessionStorage.getItem("sub_return_to") ?? "/tiendas";

  const [sub,     setSub]     = useState(null);
  const [polling, setPolling] = useState(false);
  const [error,   setError]   = useState(null);

  const fetchSub = async () => {
    if (!storeId) return null;
    try {
      const data = await getSubscription(storeId);
      setSub(data);
      return data?.status;
    } catch (err) {
      if (err.status !== 404) {
        setError(err.message ?? "No se pudo verificar el estado de la suscripción.");
      }
      return null;
    }
  };

  useEffect(() => {
    fetchSub().then((status) => {
      if (status && status !== "ACTIVE") {
        setPolling(true);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!polling) return;
    let count = 0;
    const id = setInterval(async () => {
      count++;
      const status = await fetchSub();
      if (status === "ACTIVE" || count >= 8) {
        clearInterval(id);
        setPolling(false);
      }
    }, 3000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [polling]);

  const isActive = sub?.status === "ACTIVE";

  return (
    <div className="sub-root">
      <div className="sub-brand">
        <span className="sub-brand__logo">VEXIO</span>
      </div>

      <div className="sub-result">
        <div
          className={`sub-result__icon ${
            isActive ? "sub-result__icon--green" : "sub-result__icon--amber"
          }`}
        >
          {isActive ? (
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#4ade80"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <span
              className="sub-spinner"
              style={{
                borderTopColor: "#4ade80",
                borderColor: "rgba(74,222,128,.2)",
              }}
            />
          )}
        </div>

        <h1 className="sub-result__title">
          {isActive ? "¡Suscripción activa!" : "Confirmando tu pago..."}
        </h1>
        <p className="sub-result__text">
          {isActive
            ? "Tu suscripción fue aprobada. Ya puedes acceder a todas las funciones de tu dashboard."
            : polling
            ? "Estamos verificando tu pago con MercadoPago, por favor espera..."
            : "Verificando el estado de tu suscripción..."}
        </p>

        {polling && (
          <div className="sub-polling">
            <span
              className="sub-spinner"
              style={{
                borderTopColor: "#fbbf24",
                borderColor: "rgba(251,191,36,.2)",
                width: 16,
                height: 16,
              }}
            />
            Esperando confirmación de MercadoPago...
          </div>
        )}

        {sub && (
          <div className="sub-result__card">
            <div className="sub-result__row">
              <span className="sub-result__row-label">Plan</span>
              <span className="sub-result__row-value">
                {sub.planName ?? sub.plan ?? "—"}
              </span>
            </div>
            <div className="sub-result__row">
              <span className="sub-result__row-label">Estado</span>
              <span
                className={`sub-result__status sub-result__status--${(sub.status ?? "").toLowerCase()}`}
              >
                {STATUS_LABELS[sub.status] ?? sub.status}
              </span>
            </div>
            {sub.expiresAt && (
              <div className="sub-result__row">
                <span className="sub-result__row-label">Vence</span>
                <span className="sub-result__row-value">
                  {formatDate(sub.expiresAt)}
                </span>
              </div>
            )}
            {sub.renewalAt && (
              <div className="sub-result__row">
                <span className="sub-result__row-label">Renovación</span>
                <span className="sub-result__row-value">
                  {formatDate(sub.renewalAt)}
                </span>
              </div>
            )}
          </div>
        )}

        {error && <p className="sub-error">{error}</p>}

        <div className="sub-result__actions">
          <button
            className="sub-btn sub-btn--primary"
            disabled={!isActive}
            onClick={() => {
              sessionStorage.removeItem("sub_return_to");
              navigate(returnTo);
            }}
          >
            {isActive ? "Ir al dashboard →" : "Esperando aprobación..."}
          </button>
          {!isActive && (
            <button
              className="sub-btn sub-btn--outline"
              onClick={() => navigate("/planes")}
            >
              Ver planes
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
