import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import "./CheckoutResult.css";

export default function CheckoutPending() {
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
        <div className="cr-icon cr-icon--amber">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
            stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <h1 className="cr-title">Pago en revisión</h1>
        <p className="cr-text">
          Tu pago está siendo procesado. Te notificaremos por correo en cuanto se confirme.
          Este proceso puede tomar hasta 24 horas.
        </p>

        {reference && (
          <div className="cr-ref">
            <span className="cr-ref__label">Referencia</span>
            <code className="cr-ref__value">{reference}</code>
          </div>
        )}

        <div className="cr-actions">
          <button className="cr-btn cr-btn--primary" onClick={() => navigate(storeUrl)}>
            Volver a la tienda
          </button>
        </div>
      </div>
    </div>
  );
}
