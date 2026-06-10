import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createSubscription } from "../../../../../multi-tenant/pages/services/paymentService.js";
import "./Subscription.css";

const IS_DEV = import.meta.env.DEV;

const PLANS = [
  {
    id: "BASIC",
    name: "Plan Básico",
    price: 299,
    period: "/ mes",
    features: [
      "1 tienda activa",
      "Hasta 50 productos",
      "Soporte por email",
      "Asistente IA básico",
    ],
  },
  {
    id: "PRO",
    name: "Plan Pro",
    price: 799,
    period: "/ mes",
    featured: true,
    badge: "Más popular",
    features: [
      "3 tiendas activas",
      "Productos ilimitados",
      "Soporte prioritario",
      "Asistente IA completo",
      "Reportes avanzados",
    ],
  },
  {
    id: "ENTERPRISE",
    name: "Enterprise",
    price: 1999,
    period: "/ mes",
    features: [
      "Tiendas ilimitadas",
      "Productos ilimitados",
      "Soporte 24/7 dedicado",
      "IA personalizada",
      "API acceso completo",
      "SLA garantizado",
    ],
  },
];

const formatCOP = (n) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);

function getUserFromJwt() {
  try {
    const jwt = localStorage.getItem("jwt");
    if (!jwt || jwt === "null") return {};
    const p = JSON.parse(atob(jwt.split(".")[1]));
    return {
      userId: p.user_id ?? p.userId ?? p.sub ?? p.id ?? null,
      email:  p.email ?? p.mail ?? null,
    };
  } catch { return {}; }
}

export default function SubscriptionPlansPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null); // plan id en proceso
  const [error,   setError]   = useState(null);

  const tenantId = localStorage.getItem("storeId");
  const { email } = getUserFromJwt();

  const handleSelect = async (planId) => {
    if (!tenantId) {
      setError("No se encontró el ID de tu tienda. Asegúrate de haber creado una tienda primero.");
      return;
    }
    if (!email) {
      setError("No se encontró tu email. Intenta cerrar sesión y volver a entrar.");
      return;
    }

    setLoading(planId);
    setError(null);
    try {
      const data = await createSubscription(tenantId, planId, email);
      const url = IS_DEV ? data.sandboxCheckoutUrl : data.checkoutUrl;
      if (!url) throw new Error("El servidor no devolvió una URL de pago.");
      window.location.href = url;
    } catch (err) {
      setError(err.message ?? "No se pudo iniciar el pago. Intenta de nuevo.");
      setLoading(null);
    }
  };

  return (
    <div className="sub-root">
      <div className="sub-brand">
        <span className="sub-brand__logo">VEXIO</span>
        <span className="sub-brand__tag">Elige tu plan</span>
      </div>

      <div className="sub-plans">
        <h1 className="sub-plans__title">Activa tu tienda</h1>
        <p className="sub-plans__sub">
          Selecciona el plan que mejor se adapte a tu negocio. Puedes cambiarlo en cualquier momento.
        </p>

        <div className="sub-plans__grid">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`sub-plan-card${plan.featured ? " sub-plan-card--featured" : ""}`}
            >
              {plan.badge && <span className="sub-plan-card__badge">{plan.badge}</span>}
              <p className="sub-plan-card__name">{plan.name}</p>
              <p className="sub-plan-card__price">
                {formatCOP(plan.price)}
                <span>{plan.period}</span>
              </p>
              <p className="sub-plan-card__period">Facturado mensualmente</p>

              <ul className="sub-plan-card__features">
                {plan.features.map((f) => <li key={f}>{f}</li>)}
              </ul>

              <button
                className={`sub-btn ${plan.featured ? "sub-btn--primary" : "sub-btn--outline"}`}
                onClick={() => handleSelect(plan.id)}
                disabled={!!loading}
              >
                {loading === plan.id ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <span className="sub-spinner" /> Redirigiendo...
                  </span>
                ) : "Elegir plan"}
              </button>
            </div>
          ))}
        </div>

        {error && <p className="sub-error">{error}</p>}

        <p style={{ textAlign: "center", marginTop: 24, fontSize: 12, color: "#334155" }}>
          Pagos seguros con{" "}
          <strong style={{ color: "#6366f1" }}>MercadoPago</strong>
          {" "}· Cancela cuando quieras
        </p>
      </div>
    </div>
  );
}
