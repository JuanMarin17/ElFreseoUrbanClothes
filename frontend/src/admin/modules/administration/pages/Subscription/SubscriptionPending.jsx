import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { isSubscriptionActive } from "../../../../../multi-tenant/pages/services/paymentService.js";
import "./Subscription.css";

const POLL_INTERVAL = 5000;

export default function SubscriptionPending() {
  const navigate  = useNavigate();
  const tenantId  = localStorage.getItem("storeId");
  const [active,  setActive]  = useState(false);
  const [attempts, setAttempts] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!tenantId) return;

    intervalRef.current = setInterval(async () => {
      setAttempts(a => a + 1);
      try {
        const result = await isSubscriptionActive(tenantId);
        if (result === true || result === "true") {
          setActive(true);
          clearInterval(intervalRef.current);
        }
      } catch {
        // silencioso — seguir intentando
      }
    }, POLL_INTERVAL);

    return () => clearInterval(intervalRef.current);
  }, [tenantId]);

  return (
    <div className="sub-root">
      <div className="sub-brand">
        <span className="sub-brand__logo">VEXIO</span>
      </div>

      <div className="sub-result">
        <div className="sub-result__icon sub-result__icon--amber">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <h1 className="sub-result__title">Pago en proceso</h1>
        <p className="sub-result__text">
          Tu pago está siendo procesado. Esto puede tardar unos minutos.
          Te notificaremos cuando esté confirmado.
        </p>

        {!active && (
          <div className="sub-polling">
            <span className="sub-spinner" style={{ borderTopColor: "#fbbf24", borderColor: "rgba(251,191,36,.2)", width: 16, height: 16 }} />
            Verificando estado{attempts > 0 ? ` (${attempts} intentos)` : ""}...
          </div>
        )}

        <div className="sub-result__card">
          <div className="sub-result__row">
            <span className="sub-result__row-label">Estado</span>
            <span className={`sub-result__status sub-result__status--${active ? "approved" : "pending"}`}>
              {active ? "APROBADO" : "PENDIENTE"}
            </span>
          </div>
          <div className="sub-result__row">
            <span className="sub-result__row-label">Verificación automática</span>
            <span className="sub-result__row-value">Cada 5 segundos</span>
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
          <button className="sub-btn sub-btn--outline" onClick={() => navigate("/planes")}>
            Cambiar plan
          </button>
        </div>
      </div>
    </div>
  );
}
