import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../pages/StoreContext";
import "../components/styles/SelectPlan.css";
import { motion } from "framer-motion";
import StepProgress from "../components/StepProgress";

const plans = [
  {
    id: "basico",
    name: "BÁSICO",
    price: "$19",
    features: ["1 Tienda", "Productos ilimitados", "Plantillas básicas", "Soporte por email"],
  },
  {
    id: "pro",
    name: "PRO",
    price: "$39",
    popular: true,
    features: ["Tiendas ilimitadas", "Productos ilimitados", "Plantillas premium", "Dominio personalizado", "Soporte prioritario"],
  },
  {
    id: "premium",
    name: "PREMIUM",
    price: "$79",
    features: ["Todo en Pro", "Analíticas avanzadas", "Integraciones", "Soporte 24/7", "Acceso API"],
  },
];

const isAuthenticated = () => !!localStorage.getItem('jwt');

export default function SelectPlan({ showComponents }) {
  const { state, completeStep, resetStep } = useStore();
  const nav = useNavigate();
  const [selectedId, setSelectedId] = useState(state.plan?.id ?? null);

  const handleSelect = (plan) => {
    if (!isAuthenticated()) {
      sessionStorage.setItem('pendingPlan', plan.id);
      nav('/login');
      return;
    }
    setSelectedId(plan.id);
    completeStep(1, plan);
    nav("/crear-tienda/basico");
  };

  const handleBack = () => {
    nav('/market'); // ← siempre va al inicio
  };

  return (
    <div className="plan-container">
      {showComponents && <StepProgress />}

      <div className="header-plan">
        {showComponents && (
          <button className="back-btn" onClick={handleBack}>←</button>
        )}
        <div className="title-plan">
          <h1>Crear nueva tienda</h1>
          <p className="subtitle-plan">Elige un plan para comenzar</p>
        </div>
      </div>

      <div className="plans-grid">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.id}
            className={`plan-card ${plan.popular ? "popular" : ""} ${selectedId === plan.id ? "selected" : ""}`}
            whileHover={{ scale: 1.01 }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            {plan.popular && <span className="badge">MÁS POPULAR</span>}
            <h2>{plan.name}</h2>
            <h3>{plan.price} <span>/mes</span></h3>
            <ul>
              {plan.features.map((f, idx) => (
                <li key={idx}>✔ {f}</li>
              ))}
            </ul>
            <button onClick={() => handleSelect(plan)}>
              Seleccionar
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}