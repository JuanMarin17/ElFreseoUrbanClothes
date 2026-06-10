import "../components/styles/Store.css";
import "../components/styles/StepPages.css";
import { useNavigate } from "react-router-dom";
import { useStore } from "./useStore";
import { useAuth } from "../../admin/modules/auth/pages/hook/Useauth";
import { useState } from "react";
import { AlertCircle, CheckCircle2, ArrowLeft, ArrowRight, Info, Store, Globe } from "lucide-react";
import VexioTermsPage from "../components/VexioTermsPage";
import StepProgress from "../components/StepProgress";

import useCreateStore from "../hooks/useCreateStore";

/* â”€â”€ Componente de alerta reutilizable â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function Alert({ type = "error", title, children }) {
  const cfg = {
    error: { icon: <AlertCircle size={16} />, cls: "error" },
    success: { icon: <CheckCircle2 size={16} />, cls: "success" },
    warning: { icon: <AlertCircle size={16} />, cls: "warning" },
    info: { icon: <Info size={16} />, cls: "info" },
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

/* â”€â”€ Pagina principal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export default function CreateStore() {
  const nav = useNavigate();
  const { state, completeStep } = useStore();
  const { user } = useAuth();
  const ownerId = user?.userId ?? user?.id ?? "";

  // â”€â”€ Estado local del formulario â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [form, setForm] = useState({
    name: state.basic?.name ?? state.store?.name ?? "",
    subdomain: state.store?.subdomain ?? "",
    accepted: state.store?.accepted ?? false,
  });

  const [touched, setTouched] = useState({ name: false, subdomain: false });

  // â”€â”€ Hook de integracion API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const { loading, error, submit, clearError } = useCreateStore(state, ownerId);

  // â”€â”€ Validaciones inline â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const subdomainValid = /^[a-z0-9-]{3,}$/.test(form.subdomain);
  const nameValid = form.name.trim().length >= 2;

  // â”€â”€ Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleChange = (e) => {
    clearError();
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    const autoSlug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    clearError();
    setForm((prev) => ({
      ...prev,
      name,
      subdomain: prev.subdomain || autoSlug,
    }));
  };

  const handleBlur = (field) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const handleBack = () => nav("/widgets");

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.subdomain.trim() || !form.accepted) return;
    try {
      const createdStoreId = await submit(form);
      const updatedStore = { ...form, storeId: createdStoreId };
      completeStep("store", updatedStore);
      localStorage.setItem("storeId", createdStoreId);
      // Pasamos el estado actual como previewState para que StoreResult lo use,
      // y clearStorage para que limpie el wizard del localStorage al llegar.
      nav("/resultado", {
        state: {
          bypassProtected: true,
          clearStorage: true,
          previewState: { ...state, store: updatedStore },
        },
      });
    } catch {
      // error de creación ya capturado en el hook
    }
  };

  // â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const isFormValid = nameValid && subdomainValid && form.accepted;

  return (
    <div className="step-page">
      <StepProgress />

      <div className="step-card" style={{ maxWidth: 680 }}>
        {/* Header */}
        <div className="step-header">
          <button
            className="btn-back"
            onClick={handleBack}
            disabled={loading}
            aria-label="Volver"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="step-title">Terminos y crear tienda</h1>
            <p className="step-subtitle">
              {state.plan && (
                <>
                  Plan: <strong>{state.plan.name}</strong>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Cuerpo */}
        <div className="step-body">
          {/* Nombre de la tienda */}
          <div className="field-block">
            <label htmlFor="cs-name">
              <Store
                size={11}
                style={{ marginRight: 5, verticalAlign: "middle" }}
              />
              Nombre de la tienda *
            </label>
            <input
              id="cs-name"
              name="name"
              placeholder="Ej: Mi Tienda Urbana"
              value={form.name}
              onChange={handleNameChange}
              onBlur={() => handleBlur("name")}
              disabled={loading}
              autoComplete="off"
              className={
                touched.name
                  ? nameValid
                    ? "field-success"
                    : "field-error"
                  : ""
              }
            />
            {touched.name && !nameValid && (
              <span className="field-hint hint-error">
                <AlertCircle size={11} /> Minimo 2 caracteres
              </span>
            )}
            {touched.name && nameValid && (
              <span className="field-hint hint-ok">
                <CheckCircle2 size={11} /> Se ve bien
              </span>
            )}
          </div>

          {/* Subdominio */}
          <div className="field-block">
            <label htmlFor="cs-subdomain">
              <Globe
                size={11}
                style={{ marginRight: 5, verticalAlign: "middle" }}
              />
              Subdominio *
              {form.subdomain && (
                <span
                  style={{
                    color: "#3e78ff",
                    fontWeight: 400,
                    fontSize: 12,
                    marginLeft: 8,
                    textTransform: "none",
                    letterSpacing: 0,
                  }}
                >
                  {form.subdomain}.freseo.com
                </span>
              )}
            </label>
            <input
              id="cs-subdomain"
              name="subdomain"
              placeholder="mi-tienda"
              value={form.subdomain}
              onChange={handleChange}
              onBlur={() => handleBlur("subdomain")}
              disabled={loading}
              autoComplete="off"
              style={{ fontFamily: "monospace" }}
              className={
                touched.subdomain
                  ? subdomainValid
                    ? "field-success"
                    : "field-error"
                  : ""
              }
            />
            {touched.subdomain && !subdomainValid && (
              <span className="field-hint hint-error">
                <AlertCircle size={11} /> Solo letras minusculas, numeros y
                guiones. Minimo 3 caracteres.
              </span>
            )}
            {touched.subdomain && subdomainValid && (
              <span className="field-hint hint-ok">
                <CheckCircle2 size={11} /> Subdominio disponible
              </span>
            )}
          </div>

          {/* Terminos y condiciones */}
          <div className="field-block">
            <label>Terminos y condiciones</label>
            <div className="terms-scroll-box">
              <VexioTermsPage />
            </div>
          </div>

          {/* Checkbox de aceptacion */}
          <section className="terms-acceptance">
            <label className="checkbox-container">
              <input
                type="checkbox"
                name="accepted"
                checked={form.accepted}
                onChange={handleChange}
                disabled={loading}
              />
              <span
                style={{
                  fontSize: 13,
                  color: form.accepted ? "#4ade80" : "#aaa",
                  lineHeight: 1.5,
                  transition: "color 0.2s",
                }}
              >
                He leido y acepto los terminos y condiciones, politicas de
                privacidad y normas comerciales establecidas por Vexio.
              </span>
            </label>
          </section>

          {/* Error de la API */}
          {error && (
            <Alert type="error" title="No se pudo crear la tienda">
              {error}
            </Alert>
          )}
        </div>


        {/* Acciones */}
        <div className="step-actions">
          <button
            className="btn-secondary"
            onClick={handleBack}
            disabled={loading}
          >
            <ArrowLeft size={14} />
            Atras
          </button>

          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={!isFormValid || loading}
          >
            {loading ? (
              <>
                <span className="spinner" />
                Creando tienda...
              </>
            ) : (
              <>
                Crear tienda y pagar
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
