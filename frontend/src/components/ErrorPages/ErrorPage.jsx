import { Link } from "react-router-dom";
import Logo from "../../assets/LogoVexios/Logovexio.png";
import "./ErrorPage.css";

export default function ErrorPage({ code, icon, title, message, actions = [], details }) {
  return (
    <div className="erp-page">
      <div className="erp-noise" />
      <div className="erp-glow" />

      <div className="erp-card">
        <img src={Logo} alt="Vexio" className="erp-logo" />

        <div className="erp-icon">{icon}</div>

        {code && <p className="erp-code">{code}</p>}
        <h1 className="erp-title">{title}</h1>
        <p className="erp-message">{message}</p>

        {details && (
          <details className="erp-details">
            <summary>Detalles técnicos</summary>
            <pre>{details}</pre>
          </details>
        )}

        {actions.length > 0 && (
          <div className="erp-actions">
            {actions.map((a, i) =>
              a.to ? (
                <Link
                  key={i}
                  to={a.to}
                  className={`erp-btn ${a.primary ? "erp-btn--primary" : "erp-btn--ghost"}`}
                >
                  {a.label}
                </Link>
              ) : (
                <button
                  key={i}
                  onClick={a.onClick}
                  className={`erp-btn ${a.primary ? "erp-btn--primary" : "erp-btn--ghost"}`}
                >
                  {a.label}
                </button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
