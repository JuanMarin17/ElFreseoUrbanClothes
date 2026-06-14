/**
 * StepPaymentPage.jsx " Paso 4: Metodos de pago y envio
 * Ruta: /crear-tienda/pagos
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "./useStore";
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

// "" Alerta reutilizable """"""""""""""""""""""""""""""""""""""""""""""""""""""""
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
    id: "mercadopago",
    label: "MercadoPago",
    icon: <ShoppingBag size={20} />,
    desc: "Pagos locales en Latinoamerica",
  },
];

const SHIPPING_OPTIONS = [
  {
    id: "nacional",
    label: "Nacional",
    icon: <Package size={20} />,
    desc: "Envios dentro del pais",
  },
  {
    id: "internacional",
    label: "Internacional",
    icon: <Globe size={20} />,
    desc: "Envios a todo el mundo",
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

  const [errors, setErrors] = useState({});

  const paymentMethod = state.payment?.paymentMethod ?? "";
  const shipping      = state.payment?.shipping      ?? "";

  const handleBack = () => navigate("/crear-tienda/legal");

  const handleNext = () => {
    const newErrors = {};
    if (!paymentMethod) newErrors.paymentMethod = "Selecciona un metodo de pago";
    if (!shipping)      newErrors.shipping      = "Selecciona el tipo de envio";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    completeStep("payment", { paymentMethod, shipping });
    navigate("/layout");
  };

  const selectPayment = (id) => {
    saveProgress("payment", { paymentMethod: id, shipping });
    if (errors.paymentMethod) setErrors(prev => ({ ...prev, paymentMethod: null }));
  };

  const selectShipping = (id) => {
    saveProgress("payment", { paymentMethod, shipping: id });
    if (errors.shipping) setErrors(prev => ({ ...prev, shipping: null }));
  };

  return (
    <div className="step-page">
      <StepProgress />

      <div className="step-card">
        <div className="step-header">
          <button className="btn-back" onClick={handleBack} aria-label="Volver">
            <ArrowLeft size={16} />
          </button>
          <div className="step-header-text">
            <h1 className="step-title">Pagos y envíos</h1>
            <p className="step-subtitle">Configura cómo cobras y envías</p>
          </div>
          <span className="step-badge">Paso 4 / 11</span>
        </div>

        <div className="step-body">

          {/* Metodo de pago */}
          <div className="field-block">
            <label>Metodo de pago *</label>
            <div className="option-grid">
              {PAYMENT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`option-card ${paymentMethod === opt.id ? "selected" : ""}`}
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

          {/* Tipo de envio */}
          <div className="field-block">
            <label>Tipo de envio *</label>
            <div className="option-grid">
              {SHIPPING_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`option-card ${shipping === opt.id ? "selected" : ""}`}
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

          {/* Alerta global si ambos estan vacios */}
          {errors.paymentMethod && errors.shipping && (
            <Alert type="error" title="Selecciones requeridas">
              Elige un metodo de pago y un tipo de envio para continuar.
            </Alert>
          )}

        </div>

        <div className="step-actions">
          <button className="btn-secondary" onClick={handleBack}>
            <ArrowLeft size={14} />
            Atras
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