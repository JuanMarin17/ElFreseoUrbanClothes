import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPlans,
  checkout,
  getSubscription,
} from "../../../../../multi-tenant/pages/services/transactionService.js";
import "./Subscription.css";

const PLAN_ORDER = { GRATUITO: 0, BASICO: 1, PRO: 2, PREMIUM: 3 };

const formatCOP = (n) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 2,
  }).format(n);

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";

function parseFeaturesLabel(plan) {
  const lines = [];
  try {
    const obj = JSON.parse(plan.features ?? "{}");
    for (const [k, v] of Object.entries(obj)) {
      if (v !== false && v !== null && v !== "") lines.push(`${k}: ${v}`);
    }
  } catch {}
  return lines;
}

export default function SubscriptionPlansPage() {
  const navigate = useNavigate();
  const storeId = localStorage.getItem("storeId");

  const [plans, setPlans] = useState([]);
  const [currentSub, setCurrentSub] = useState(null);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [error, setError] = useState(null);
  const [successPlan, setSuccessPlan] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [plansResult, subResult] = await Promise.allSettled([
          getPlans(),
          storeId ? getSubscription(storeId) : Promise.reject({ status: 404 }),
        ]);

        if (plansResult.status === "fulfilled") {
          const sorted = [...(plansResult.value ?? [])].sort(
            (a, b) =>
              (PLAN_ORDER[a.name] ?? 99) - (PLAN_ORDER[b.name] ?? 99)
          );
          setPlans(sorted);
        } else {
          setError("No se pudieron cargar los planes. Intenta de nuevo.");
        }

        if (subResult.status === "fulfilled") {
          setCurrentSub(subResult.value);
        }
        // 404 = sin suscripción activa — OK
      } finally {
        setLoadingPlans(false);
      }
    };
    load();
  }, [storeId]);

  const handleSelect = async (plan) => {
    if (!storeId) {
      setError(
        "No se encontró el ID de tu tienda. Asegúrate de haber creado una tienda primero."
      );
      return;
    }

    setProcessing(plan.name);
    setError(null);
    try {
      const data = await checkout({ storeId, planName: plan.name });

      if (!data.paymentUrl || data.status === "APPROVED") {
        // Plan GRATUITO o ya aprobado
        const updated = await getSubscription(storeId).catch(() => null);
        setCurrentSub(updated);
        setSuccessPlan(plan.name);
      } else {
        // Planes de pago → redirigir a MercadoPago
        window.location.href = data.paymentUrl;
      }
    } catch (err) {
      if (err.status === 400) {
        setError("Ya tienes una suscripción activa a este plan.");
      } else if (err.status === 403) {
        setError("Solo el propietario de la tienda puede gestionar suscripciones.");
      } else {
        setError(err.message ?? "No se pudo iniciar el proceso. Intenta de nuevo.");
      }
    } finally {
      setProcessing(null);
    }
  };

  const currentPlanName =
    currentSub?.planName ?? currentSub?.plan ?? null;
  const isActive = currentSub?.status === "ACTIVE";
  const currentOrdinal = isActive ? (PLAN_ORDER[currentPlanName] ?? -1) : -1;

  if (loadingPlans) {
    return (
      <div className="sub-root">
        <div className="sub-brand">
          <span className="sub-brand__logo">VEXIO</span>
        </div>
        <div className="sub-loading">
          <span className="sub-spinner" />
          <span>Cargando planes...</span>
        </div>
      </div>
    );
  }

  if (successPlan) {
    return (
      <div className="sub-root">
        <div className="sub-brand">
          <span className="sub-brand__logo">VEXIO</span>
        </div>
        <div className="sub-result">
          <div className="sub-result__icon sub-result__icon--green">
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
          </div>
          <h1 className="sub-result__title">¡Plan activado!</h1>
          <p className="sub-result__text">
            Tu plan <strong style={{ color: "#a5b4fc" }}>{successPlan}</strong>{" "}
            fue activado correctamente. Ya puedes usar todas sus funciones.
          </p>
          <div className="sub-result__actions">
            <button
              className="sub-btn sub-btn--primary"
              onClick={() => navigate("/tiendas")}
            >
              Ir al dashboard →
            </button>
            <button
              className="sub-btn sub-btn--outline"
              onClick={() => setSuccessPlan(null)}
            >
              Ver planes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sub-root">
      <div className="sub-brand">
        <span className="sub-brand__logo">VEXIO</span>
        <span className="sub-brand__tag">Planes de suscripción</span>
      </div>

      <div className="sub-plans sub-plans--wide">
        <h1 className="sub-plans__title">Elige tu plan</h1>
        <p className="sub-plans__sub">
          Selecciona el plan que mejor se adapte a tu negocio. Puedes
          cambiarlo en cualquier momento.
        </p>

        {isActive && (
          <div className="sub-current-info">
            <span className="sub-current-info__label">Plan actual:</span>
            <span className="sub-current-info__plan">{currentPlanName}</span>
            {currentSub?.expiresAt && (
              <span className="sub-current-info__exp">
                · Vence: {formatDate(currentSub.expiresAt)}
              </span>
            )}
            {currentSub?.renewalAt &&
              new Date(currentSub.renewalAt) - new Date() <
                3 * 24 * 60 * 60 * 1000 && (
                <span className="sub-current-info__alert">
                  ⚠ Renovación próxima
                </span>
              )}
          </div>
        )}

        <div className="sub-plans__grid sub-plans__grid--4">
          {plans.map((plan) => {
            const isCurrent =
              plan.name === currentPlanName && isActive;
            const ordinal = PLAN_ORDER[plan.name] ?? 0;
            const isUpgrade = currentOrdinal >= 0 && ordinal > currentOrdinal;
            const isDowngrade =
              currentOrdinal >= 0 && ordinal < currentOrdinal;
            const isFeatured = plan.name === "PRO";
            const extraFeatures = parseFeaturesLabel(plan);

            let btnLabel = "Seleccionar plan";
            if (isCurrent) btnLabel = "Plan actual";
            else if (isUpgrade) btnLabel = "Mejorar plan ↑";
            else if (isDowngrade) btnLabel = "Reducir plan ↓";

            const btnClass =
              isFeatured && !isCurrent
                ? "sub-btn sub-btn--primary"
                : "sub-btn sub-btn--outline";

            return (
              <div
                key={plan.planId ?? plan.name}
                className={[
                  "sub-plan-card",
                  isFeatured && !isCurrent ? "sub-plan-card--featured" : "",
                  isCurrent ? "sub-plan-card--current" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {isCurrent && (
                  <span className="sub-plan-card__badge sub-plan-card__badge--active">
                    Plan actual
                  </span>
                )}
                {isFeatured && !isCurrent && (
                  <span className="sub-plan-card__badge">Más popular</span>
                )}

                <p className="sub-plan-card__name">{plan.name}</p>
                <p className="sub-plan-card__price">
                  {plan.price === 0 ? (
                    "Gratis"
                  ) : (
                    <>
                      {formatCOP(plan.price)}
                      <span>/ mes</span>
                    </>
                  )}
                </p>
                {plan.price > 0 && (
                  <p className="sub-plan-card__period">
                    Facturado mensualmente
                  </p>
                )}

                <ul className="sub-plan-card__features">
                  <li>
                    {plan.maxProducts === -1 || plan.maxProducts >= 9999
                      ? "Productos ilimitados"
                      : `${plan.maxProducts} productos máx.`}
                  </li>
                  <li>
                    {plan.maxPages === -1 || plan.maxPages >= 99
                      ? "Páginas ilimitadas"
                      : `${plan.maxPages} página${
                          plan.maxPages !== 1 ? "s" : ""
                        } máx.`}
                  </li>
                  <li>
                    {plan.maxAiCalls === -1 || plan.maxAiCalls >= 9999
                      ? "IA ilimitada"
                      : `${plan.maxAiCalls} llamadas IA / mes`}
                  </li>
                  {extraFeatures.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>

                {isDowngrade && !isCurrent && (
                  <p className="sub-plan-downgrade-note">
                    ⚠ Reducción de funcionalidades
                  </p>
                )}

                <button
                  className={btnClass}
                  onClick={() => !isCurrent && handleSelect(plan)}
                  disabled={isCurrent || !!processing}
                >
                  {processing === plan.name ? (
                    <span className="sub-btn-loading">
                      <span className="sub-spinner" />
                      Procesando...
                    </span>
                  ) : (
                    btnLabel
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {error && <p className="sub-error">{error}</p>}

        <p className="sub-footer-note">
          Pagos seguros con{" "}
          <strong style={{ color: "#6366f1" }}>MercadoPago</strong> · Cancela
          cuando quieras
        </p>
      </div>
    </div>
  );
}
