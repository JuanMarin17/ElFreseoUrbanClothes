import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "./useStore";
import { getPlans } from "./services/transactionService.js";
import "../components/styles/SelectPlan.css";
import { motion } from "framer-motion";
import StepProgress from "../components/StepProgress";

const PLAN_ORDER = { GRATUITO: 0, BASICO: 1, PRO: 2, PREMIUM: 3 };

const formatCOP = (n) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(n);

const FEATURE_LABEL_MAP = {
  POS:          "Punto de venta presencial",
  customDomain: "Dominio personalizado",
  analytics:    "Analíticas avanzadas",
  multiUser:    "Múltiples usuarios",
  support:      "Soporte prioritario",
  api:          "Acceso a API",
  whiteLabel:   "Sin marca Vexio",
  exportData:   "Exportación de datos",
  ai:           "Asistente IA",
  reports:      "Informes avanzados",
};

const PLAN_STATIC_BENEFITS = {
  GRATUITO: ["Tienda pública en Vexio", "Pasarela de pago básica", "Soporte por email"],
  BASICO:   ["Tienda pública en Vexio", "Dominio personalizado", "Pasarela de pago completa", "Soporte estándar"],
  PRO:      ["Tienda pública en Vexio", "Dominio personalizado", "Punto de venta presencial", "Analíticas avanzadas", "Soporte prioritario"],
  PREMIUM:  ["Tienda pública en Vexio", "Dominio personalizado", "Punto de venta presencial", "Analíticas avanzadas", "Múltiples usuarios", "Sin marca Vexio", "Soporte 24/7"],
};

function parsePlanFeatures(plan) {
  const lines = [
    plan.maxProducts >= 9999 || plan.maxProducts === -1
      ? "Productos ilimitados"
      : `Hasta ${plan.maxProducts} productos`,
    plan.maxPages >= 99 || plan.maxPages === -1
      ? "Páginas ilimitadas"
      : `Hasta ${plan.maxPages} página${plan.maxPages !== 1 ? "s" : ""}`,
    plan.maxAiCalls >= 9999 || plan.maxAiCalls === -1
      ? "IA ilimitada"
      : `${plan.maxAiCalls} llamadas IA / mes`,
  ];
  let hasExtras = false;
  try {
    const extras = JSON.parse(plan.features ?? "{}");
    for (const [k, v] of Object.entries(extras)) {
      if (v === false || v === null || v === "") continue;
      hasExtras = true;
      const label = FEATURE_LABEL_MAP[k];
      if (label) lines.push(label);
      else if (v !== true) lines.push(`${k}: ${v}`);
      else lines.push(k);
    }
  } catch {}
  if (!hasExtras && PLAN_STATIC_BENEFITS[plan.name]) {
    lines.push(...PLAN_STATIC_BENEFITS[plan.name]);
  }
  return lines;
}

const isAuthenticated = () => !!localStorage.getItem("jwt");

export default function SelectPlan({ showComponents }) {
  const { state, completeStep } = useStore();
  const nav = useNavigate();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedName, setSelectedName] = useState(state.plan?.name ?? null);

  useEffect(() => {
    getPlans()
      .then((data) => {
        const sorted = [...(data ?? [])].sort(
          (a, b) => (PLAN_ORDER[a.name] ?? 99) - (PLAN_ORDER[b.name] ?? 99)
        );
        setPlans(sorted);
      })
      .catch(() => {
        // Fallback a planes locales si la API falla
        setPlans([
          { planId: "gratuito", name: "GRATUITO", price: 0,     maxProducts: 10,  maxPages: 1,  maxAiCalls: 5,   features: "{}" },
          { planId: "basico",   name: "BASICO",   price: 29900, maxProducts: 50,  maxPages: 3,  maxAiCalls: 20,  features: "{}" },
          { planId: "pro",      name: "PRO",      price: 79900, maxProducts: 500, maxPages: 10, maxAiCalls: 100, features: "{}" },
          { planId: "premium",  name: "PREMIUM",  price: 199900,maxProducts: 9999,maxPages: 99, maxAiCalls: 9999,features: "{}" },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (plan) => {
    if (!isAuthenticated()) {
      nav("/login");
      return;
    }
    setSelectedName(plan.name);
    completeStep("plan", plan);
    nav("/crear-tienda/basico");
  };

  const handleBack = () => nav("/market");

  return (
    <div className="plan-container">
      {showComponents && <StepProgress />}

      <div className="header-plan">
        {showComponents && (
          <button className="back-btn" onClick={handleBack} aria-label="Volver">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}
        <div className="title-plan">
          <h1>Crear nueva tienda</h1>
          <p className="subtitle-plan">Elige un plan para comenzar</p>
        </div>
      </div>

      {loading ? (
        <div className="plan-loading">
          <span className="plan-spinner" />
          <span>Cargando planes...</span>
        </div>
      ) : (
        <div className={`plans-grid${plans.length === 4 ? " plans-grid--4" : ""}`}>
          {plans.map((plan, i) => {
            const isFree     = plan.price === 0;
            const isPopular  = plan.name === "PRO";
            const isSelected = selectedName === plan.name;
            const features   = parsePlanFeatures(plan);

            return (
              <motion.div
                key={plan.planId ?? plan.name}
                className={[
                  "plan-card",
                  isPopular ? "popular" : "",
                  isSelected ? "selected" : "",
                ].filter(Boolean).join(" ")}
                whileHover={{ scale: 1.01 }}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                {isPopular && <span className="badge">MÁS POPULAR</span>}

                <h2>{plan.name}</h2>
                <h3>
                  {isFree ? (
                    "Gratis"
                  ) : (
                    <>
                      {formatCOP(plan.price)}
                      <span>/mes</span>
                    </>
                  )}
                </h3>

                <ul>
                  {features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>

                <button onClick={() => handleSelect(plan)}>
                  Seleccionar
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
