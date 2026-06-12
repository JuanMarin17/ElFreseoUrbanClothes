import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import "./CheckoutResult.css";

export default function CheckoutFailure() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("external_reference");
  const storeUrl = slug ? `/tienda/${slug}` : "/";

  return (
    <div className="cr-root">
      <div className="cr-brand">
        <span className="cr-brand__logo">VEXIO</span>
      </div>

      <div className="cr-card">
        <div className="cr-icon cr-icon--red">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
            stroke="#f87171" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </div>

        <h1 className="cr-title">Pago rechazado</h1>
        <p className="cr-text">
          Tu pago no pudo procesarse. Verifica los datos de tu tarjeta o intenta con otro método de pago.
        </p>

        {reference && (
          <div className="cr-ref">
            <span className="cr-ref__label">Referencia</span>
            <code className="cr-ref__value">{reference}</code>
          </div>
        )}

        <div className="cr-actions">
          <button className="cr-btn cr-btn--primary" onClick={() => navigate(-1)}>
            Intentar de nuevo
          </button>
          <button className="cr-btn cr-btn--outline" onClick={() => navigate(storeUrl)}>
            Volver a la tienda
          </button>
        </div>
      </div>
    </div>
  );
}
