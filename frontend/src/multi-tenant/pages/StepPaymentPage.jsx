/**
 * StepPaymentPage.jsx — Paso 4: Métodos de pago y envío
 * Ruta: /crear-tienda/pagos
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "./StoreContext";
import StepProgress from "../components/StepProgress";
import "../components/styles/StepPages.css";

const PAYMENT_OPTIONS = [
  {
    id: "stripe",
    label: "Wonpy",
    icon: "💳",
    desc: "Tarjetas de crédito y débito",
  },
  {
    id: "mercadopago",
    label: "MercadoPago",
    icon: "🟦",
    desc: "Pagos locales en Latinoamérica",
  },
];

const SHIPPING_OPTIONS = [
  { id: "nacional", label: "Nacional", desc: "Envíos dentro del país" },
  {
    id: "internacional",
    label: "Internacional",
    desc: "Envíos a todo el mundo",
  },
  { id: "ambos", label: "Ambos", desc: "Nacional e internacional" },
];

export default function StepPaymentPage() {
  const navigate = useNavigate();
  const { state, saveProgress, completeStep } = useStore();

  const [form, setForm] = useState({
    paymentMethod: state.payment?.paymentMethod ?? "",
    shipping: state.payment?.shipping ?? "",
  });

  const handleBack = () => {
    saveProgress("payment", form);
    navigate("/crear-tienda/legal");
  };

  const handleNext = () => {
    if (!form.paymentMethod) return alert("Selecciona un método de pago");
    if (!form.shipping) return alert("Selecciona el tipo de envío");
    completeStep("payment", form);
    navigate("/layout"); // Ahora el siguiente paso es elegir layout
  };

  return (
    <div className="step-page">
      <StepProgress />

      <div className="step-card">
        <div className="step-header">
          <button className="btn-back" onClick={handleBack}>
            ←
          </button>
          <div>
            <h1 className="step-title">Pagos y envíos</h1>
            <p className="step-subtitle">Configura cómo cobras y envías</p>
          </div>
        </div>

        <div className="step-body">
          {/* Método de pago */}
          <div className="field-block">
            <label>Método de pago *</label>
            <div className="option-grid">
              {PAYMENT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`option-card ${form.paymentMethod === opt.id ? "selected" : ""}`}
                  onClick={() =>
                    setForm((prev) => ({ ...prev, paymentMethod: opt.id }))
                  }
                >
                  <span className="option-icon">{opt.icon}</span>
                  <span className="option-label">{opt.label}</span>
                  <span className="option-desc">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tipo de envío */}
          <div className="field-block">
            <label>Tipo de envío *</label>
            <div className="option-grid">
              {SHIPPING_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`option-card ${form.shipping === opt.id ? "selected" : ""}`}
                  onClick={() =>
                    setForm((prev) => ({ ...prev, shipping: opt.id }))
                  }
                >
                  <span className="option-label">{opt.label}</span>
                  <span className="option-desc">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="step-actions">
          <button className="btn-secondary" onClick={handleBack}>
            Atrás
          </button>
          <button className="btn-primary" onClick={handleNext}>
            Continuar →
          </button>
        </div>
      </div>
    </div>
  );
}
