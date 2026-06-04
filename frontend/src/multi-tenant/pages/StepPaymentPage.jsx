/**
 * StepPaymentPage.jsx — Paso 4: Métodos de pago y envío
 * Ruta: /crear-tienda/pagos
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "./StoreContext";
import StepProgress from "../components/StepProgress";
import "../components/styles/StepPages.css";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CreditCard,
  ShoppingBag,
  Globe,
  Package,
  Truck,
} from "lucide-react";

// ── Alerta reutilizable ────────────────────────────────────────────────────────
function Alert({ type = "error", title, children }) {
  const cfg = {
    error:   { icon: <AlertCircle size={16} />, cls: "error"   },
    warning: { icon: <AlertCircle size={16} />, cls: "warning" },
  };
  const { icon, cls } = cfg[type] ?? cfg.error;
  return (
    <div className={`alert ${cls}`} role="alert">
      <span className="alert-icon">{icon}</span>
      <div className="alert-content">
        {title && <p className="alert-title">{title}</p>}
        {children && <p className="alert-body">{children}</p>}
      </div>
    </div>
  );
}

const PAYMENT_OPTIONS = [
  {
    id: "stripe",
    label: "Wonpy",
    icon: <CreditCard size={20} />,
    desc: "Tarjetas de crédito y débito",
  },
  {
    id: "mercadopago",
    label: "MercadoPago",
    icon: <ShoppingBag size={20} />,
    desc: "Pagos locales en Latinoamérica",
  },
];

const SHIPPING_OPTIONS = [
  {
    id: "nacional",
    label: "Nacional",
    icon: <Package size={20} />,
    desc: "Envíos dentro del país",
  },
  {
    id: "internacional",
    label: "Internacional",
    icon: <Globe size={20} />,
    desc: "Envíos a todo el mundo",
  },
  {
    id: "ambos",
    label: "Ambos",
    icon: <Truck size={20} />,
    desc: "Nacional e internacional",
  },
];

export default function StepPaymentPage() {
  const navigate = useNavigate();
  const { state, saveProgress, completeStep } = useStore();

  const [form, setForm] = useState({
    paymentMethod: state.payment?.paymentMethod ?? "",
    shipping:      state.payment?.shipping      ?? "",
  });

  const [errors, setErrors] = useState({});

  const handleBack = () => {
    saveProgress("payment", form);
    navigate("/crear-tienda/legal");
  };

  const handleNext = () => {
    const newErrors = {};
    if (!form.paymentMethod) newErrors.paymentMethod = "Selecciona un método de pago";
    if (!form.shipping)      newErrors.shipping      = "Selecciona el tipo de envío";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    completeStep("payment", form);
    navigate("/layout");
  };

  const selectPayment = (id) => {
    setForm((prev) => ({ ...prev, paymentMethod: id }));
    if (errors.paymentMethod) setErrors((prev) => ({ ...prev, paymentMethod: null }));
  };

  const selectShipping = (id) => {
    setForm((prev) => ({ ...prev, shipping: id }));
    if (errors.shipping) setErrors((prev) => ({ ...prev, shipping: null }));
  };

  return (
    <div className="step-page">
      <StepProgress />

      <div className="step-card">
        <div className="step-header">
          <button className="btn-back" onClick={handleBack} aria-label="Volver">
            <ArrowLeft size={16} />
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
                  onClick={() => selectPayment(opt.id)}
                >
                  <span className="option-icon">{opt.icon}</span>
                  <span className="option-label">{opt.label}</span>
                  <span className="option-desc">{opt.desc}</span>
                </button>
              ))}
            </div>
            {errors.paymentMethod && (
              <span className="field-hint hint-error">
                <AlertCircle size={11} /> {errors.paymentMethod}
              </span>
            )}
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
                  onClick={() => selectShipping(opt.id)}
                >
                  <span className="option-icon">{opt.icon}</span>
                  <span className="option-label">{opt.label}</span>
                  <span className="option-desc">{opt.desc}</span>
                </button>
              ))}
            </div>
            {errors.shipping && (
              <span className="field-hint hint-error">
                <AlertCircle size={11} /> {errors.shipping}
              </span>
            )}
          </div>

          {/* Alerta global si ambos están vacíos */}
          {errors.paymentMethod && errors.shipping && (
            <Alert type="error" title="Selecciones requeridas">
              Elige un método de pago y un tipo de envío para continuar.
            </Alert>
          )}

        </div>

        <div className="step-actions">
          <button className="btn-secondary" onClick={handleBack}>
            <ArrowLeft size={14} />
            Atrás
          </button>
          <button className="btn-primary" onClick={handleNext}>
            Continuar
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}