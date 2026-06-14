import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getSubscription } from "../../../../../multi-tenant/pages/services/transactionService.js";
import "./Subscription.css";

const POLL_INTERVAL = 5000;
const MAX_POLLS = 24; // 2 minutos máx de polling activo

export default function SubscriptionPending() {
  const navigate  = useNavigate();
  const storeId   = localStorage.getItem("storeId");

  const [sub,      setSub]      = useState(null);
  const [active,   setActive]   = useState(false);
  const [attempts, setAttempts] = useState(0);
  const intervalRef = useRef(null);

  const fetchSub = async () => {
    if (!storeId) return null;
    try {
      const data = await getSubscription(storeId);
      setSub(data);
      return data?.status;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    // Carga inicial
    fetchSub();

    let count = 0;
    intervalRef.current = setInterval(async () => {
      count++;
      setAttempts(count);
      const status = await fetchSub();
      if (status === "ACTIVE" || count >= MAX_POLLS) {
        clearInterval(intervalRef.current);
        if (status === "ACTIVE") setActive(true);
      }
    }, POLL_INTERVAL);

    return () => clearInterval(intervalRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="sub-root">
      <div className="sub-brand">
        <span className="sub-brand__logo">VEXIO</span>
      </div>

      <div className="sub-result">
        <div
          className={`sub-result__icon ${
            active ? "sub-result__icon--green" : "sub-result__icon--amber"
          }`}
        >
          {active ? (
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
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
        </div>

        <h1 className="sub-result__title">
          {active ? "¡Pago confirmado!" : "Pago en proceso"}
        </h1>
        <p className="sub-result__text">
          {active
            ? "Tu suscripción fue activada correctamente. Ya puedes usar tu dashboard."
            : "Tu pago está siendo procesado. Esto puede tardar unos minutos u horas dependiendo del método de pago (efectivo, transferencia). Te avisaremos cuando esté confirmado."}
        </p>

        {!active && (
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
            Verificando estado{attempts > 0 ? ` (${attempts})` : ""}...
          </div>
        )}

        <div className="sub-result__card">
          <div className="sub-result__row">
            <span className="sub-result__row-label">Plan</span>
            <span className="sub-result__row-value">
              {sub?.planName ?? sub?.plan ?? "—"}
            </span>
          </div>
          <div className="sub-result__row">
            <span className="sub-result__row-label">Estado</span>
            <span
              className={`sub-result__status sub-result__status--${active ? "active" : "pending"}`}
            >
              {active ? "ACTIVA" : "PENDIENTE"}
            </span>
          </div>
          <div className="sub-result__row">
            <span className="sub-result__row-label">Verificación</span>
            <span className="sub-result__row-value">Automática cada 5 s</span>
          </div>
        </div>

        <div className="sub-result__actions">
          <button
            className="sub-btn sub-btn--primary"
            disabled={!active}
            onClick={() => navigate("/tiendas")}
          >
            {active ? "Ir al dashboard →" : "Esperando confirmación..."}
          </button>
          <button
            className="sub-btn sub-btn--outline"
            onClick={() => navigate("/planes")}
          >
            Ver planes
          </button>
        </div>
      </div>
    </div>
  );
}
