import "../components/styles/Store.css";
import "../components/styles/StepPages.css";
import { useNavigate } from "react-router-dom";
import { useStore } from "./StoreContext";
import { useAuth } from "../../admin/modules/auth/pages/hook/Useauth";
import { useState } from "react";
import { createSubscription } from "./services/paymentService.js";
import { AlertCircle, CheckCircle2, ArrowLeft, ArrowRight, Info, Store, Globe, CreditCard } from "lucide-react";
import VexioTermsPage from "../components/VexioTermsPage";
import StepProgress from "../components/StepProgress";

const IS_DEV = import.meta.env.DEV;
const PLAN_API_ID = { basico: "BASIC", pro: "PRO", premium: "ENTERPRISE" };

function getEmailFromJwt() {
  try {
    const jwt = localStorage.getItem("jwt");
    if (!jwt || jwt === "null") return null;
    const p = JSON.parse(atob(jwt.split(".")[1]));
    return p.email ?? p.mail ?? null;
  } catch { return null; }
}
import useCreateStore from "../hooks/useCreateStore";

/* ── Componente de alerta reutilizable ─────────────────────────────────────── */
function Alert({ type = "error", title, children }) {
  const cfg = {
    error:   { icon: <AlertCircle  size={16} />, cls: "error"   },
    success: { icon: <CheckCircle2 size={16} />, cls: "success" },
    warning: { icon: <AlertCircle  size={16} />, cls: "warning" },
    info:    { icon: <Info         size={16} />, cls: "info"    },
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

/* ── Página principal ──────────────────────────────────────────────────────── */
export default function CreateStore() {
  const nav = useNavigate();
  const { state, completeStep } = useStore();
  const { user } = useAuth();
  const ownerId = user?.userId ?? user?.id ?? "";

  // ── Estado local del formulario ─────────────────────────────────────────────
  const [form, setForm] = useState({
    name:      state.basic?.name ?? state.store?.name ?? "",
    subdomain: state.store?.subdomain ?? "",
    accepted:  state.store?.accepted ?? false,
  });

  const [touched,      setTouched]      = useState({ name: false, subdomain: false });
  const [paymentError, setPaymentError] = useState(null);  // msg de error de pago
  const [createdId,    setCreatedId]    = useState(null);  // storeId ya creado

  // ── Hook de integración API ─────────────────────────────────────────────────
  const { loading, error, submit, clearError } = useCreateStore(state, ownerId);

  // ── Validaciones inline ─────────────────────────────────────────────────────
  const subdomainValid = /^[a-z0-9-]{3,}$/.test(form.subdomain);
  const nameValid      = form.name.trim().length >= 2;

  // ── Handlers ────────────────────────────────────────────────────────────────
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

  const retryPayment = async (storeId) => {
    setPaymentError(null);
    const email  = getEmailFromJwt() ?? user?.email ?? "";
    const planId = PLAN_API_ID[state.plan?.id] ?? "BASIC";
    try {
      sessionStorage.setItem("sub_return_to", "/resultado");
      const payment = await createSubscription(storeId, planId, email);
      const url = IS_DEV ? payment.sandboxCheckoutUrl : payment.checkoutUrl;
      if (url) { window.location.href = url; }
    } catch (err) {
      setPaymentError(err.message ?? "Error al iniciar el pago.");
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.subdomain.trim() || !form.accepted) return;
    try {
      const createdStoreId = await submit(form);
      completeStep("store", { ...form, storeId: createdStoreId });
      localStorage.setItem("storeId", createdStoreId);
      setCreatedId(createdStoreId);
      await retryPayment(createdStoreId);
    } catch {
      // error de creación ya capturado en el hook
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  const isFormValid = nameValid && subdomainValid && form.accepted;

  return (
    <div className="step-page">
      <StepProgress />

      <div className="step-card" style={{ maxWidth: 680 }}>

        {/* Header */}
        <div className="step-header">
          <button className="btn-back" onClick={handleBack} disabled={loading} aria-label="Volver">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="step-title">Términos y crear tienda</h1>
            <p className="step-subtitle">
              {state.plan && <>Plan: <strong>{state.plan.name}</strong></>}
            </p>
          </div>
        </div>

        {/* Cuerpo */}
        <div className="step-body">

          {/* Nombre de la tienda */}
          <div className="field-block">
            <label htmlFor="cs-name">
              <Store size={11} style={{ marginRight: 5, verticalAlign: "middle" }} />
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
                  ? nameValid ? "field-success" : "field-error"
                  : ""
              }
            />
            {touched.name && !nameValid && (
              <span className="field-hint hint-error">
                <AlertCircle size={11} /> Mínimo 2 caracteres
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
              <Globe size={11} style={{ marginRight: 5, verticalAlign: "middle" }} />
              Subdominio *
              {form.subdomain && (
                <span style={{ color: "#3e78ff", fontWeight: 400, fontSize: 12, marginLeft: 8, textTransform: "none", letterSpacing: 0 }}>
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
                  ? subdomainValid ? "field-success" : "field-error"
                  : ""
              }
            />
            {touched.subdomain && !subdomainValid && (
              <span className="field-hint hint-error">
                <AlertCircle size={11} /> Solo letras minúsculas, números y guiones. Mínimo 3 caracteres.
              </span>
            )}
            {touched.subdomain && subdomainValid && (
              <span className="field-hint hint-ok">
                <CheckCircle2 size={11} /> Subdominio disponible
              </span>
            )}
          </div>

          {/* Términos y condiciones */}
          <div className="field-block">
            <label>Términos y condiciones</label>
            <div className="terms-scroll-box">
              <VexioTermsPage />
            </div>
          </div>

          {/* Checkbox de aceptación */}
          <section className="terms-acceptance">
            <label className="checkbox-container">
              <input
                type="checkbox"
                name="accepted"
                checked={form.accepted}
                onChange={handleChange}
                disabled={loading}
              />
              <span style={{ fontSize: 13, color: form.accepted ? "#4ade80" : "#aaa", lineHeight: 1.5, transition: "color 0.2s" }}>
                He leído y acepto los términos y condiciones, políticas de
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

        {/* ── Modal error de pago ── */}
        {paymentError && createdId && (
          <div style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 20,
          }}>
            <div style={{
              background: "#0e1220", border: "1px solid #1e2230",
              borderRadius: 16, padding: "28px 28px 24px",
              maxWidth: 420, width: "100%",
              display: "flex", flexDirection: "column", gap: 16,
              fontFamily: "Inter, sans-serif",
            }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: "#271e0c", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <CreditCard size={18} color="#fbbf24" />
                </div>
                <div>
                  <p style={{ margin: "0 0 4px", fontWeight: 700, color: "#f0f4ff", fontSize: 15 }}>
                    Tu tienda fue creada, pero el pago falló
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>
                    {paymentError}
                  </p>
                </div>
              </div>

              <div style={{ background: "#080b14", borderRadius: 10, padding: "12px 14px", fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>
                Tu tienda ya está registrada. Puedes intentar el pago nuevamente o hacerlo más tarde desde <strong style={{ color: "#94a3b8" }}>Mis tiendas → Activar suscripción</strong>.
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => retryPayment(createdId)}
                  style={{
                    flex: 1, background: "#6366f1", border: "none",
                    color: "#fff", padding: "11px 0", borderRadius: 10,
                    fontWeight: 700, fontSize: 13, cursor: "pointer",
                  }}
                >
                  Reintentar pago
                </button>
                <button
                  onClick={() => nav("/resultado")}
                  style={{
                    flex: 1, background: "transparent",
                    border: "1px solid #1e2230", color: "#64748b",
                    padding: "11px 0", borderRadius: 10,
                    fontWeight: 600, fontSize: 13, cursor: "pointer",
                  }}
                >
                  Ir al resultado
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="step-actions">
          <button
            className="btn-secondary"
            onClick={handleBack}
            disabled={loading}
          >
            <ArrowLeft size={14} />
            Atrás
          </button>

          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={!isFormValid || loading}
          >
            {loading ? (
              <>
                <span className="spinner" />
                Creando tienda…
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