import { useNavigate } from "react-router-dom";
import "./Subscription.css";

export default function SubscriptionFailure() {
  const navigate = useNavigate();
  // Si venía del wizard de creación, volver al selector de planes del wizard
  const returnTo = sessionStorage.getItem("sub_return_to");
  const retryRoute = returnTo ? "/plan" : "/planes";

  return (
    <div className="sub-root">
      <div className="sub-brand">
        <span className="sub-brand__logo">VEXIO</span>
      </div>

      <div className="sub-result">
        <div className="sub-result__icon sub-result__icon--red">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </div>

        <h1 className="sub-result__title">Pago no completado</h1>
        <p className="sub-result__text">
          El pago fue rechazado o cancelado. No se realizó ningún cargo.
          Puedes intentarlo de nuevo con otro método de pago.
        </p>

        <div className="sub-result__card">
          <div className="sub-result__row">
            <span className="sub-result__row-label">Estado</span>
            <span className="sub-result__status sub-result__status--rejected">Rechazado</span>
          </div>
          <div className="sub-result__row">
            <span className="sub-result__row-label">Cargo realizado</span>
            <span className="sub-result__row-value">Ninguno</span>
          </div>
        </div>

        <div className="sub-result__actions">
          <button className="sub-btn sub-btn--primary" onClick={() => navigate(retryRoute)}>
            Intentar de nuevo
          </button>
          <button className="sub-btn sub-btn--outline" onClick={() => navigate("/tiendas")}>
            Volver a mis tiendas
          </button>
        </div>
      </div>
    </div>
  );
}
