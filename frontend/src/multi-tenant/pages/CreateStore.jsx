import "../components/styles/Store.css";
import "../components/styles/StepPages.css";
import { useNavigate } from "react-router-dom";
import { useStore } from "./StoreContext";
import { useState } from "react";
import VexioTermsPage from "../components/VexioTermsPage";
import StepProgress from "../components/StepProgress";
import useCreateStore from "../hooks/useCreateStore";

const HARDCODED_OWNER_ID = "00000000-0000-0000-0000-000000000001"; // ← reemplazar

export default function CreateStore() {
  const nav = useNavigate();
  const { state, completeStep } = useStore();

  // ── Estado local del formulario ─────────────────────────────────────────────
  const [form, setForm] = useState({
    name: state.basic?.name ?? state.store?.name ?? "",
    subdomain: state.store?.subdomain ?? "",
    accepted: state.store?.accepted ?? false,
  });

  // ── Hook de integración API ─────────────────────────────────────────────────
  const { loading, error, submit, clearError } = useCreateStore(
    state,
    HARDCODED_OWNER_ID,
  );

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleChange = (e) => {
    clearError();
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Genera slug automático a partir del nombre mientras el usuario escribe
  const handleNameChange = (e) => {
    const name = e.target.value;
    const autoSlug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // elimina tildes
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    clearError();
    setForm((prev) => ({
      ...prev,
      name,
      subdomain: prev.subdomain || autoSlug, // solo auto-completa si está vacío
    }));
  };

  const handleBack = () => {
    nav("/cms");
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.subdomain.trim() || !form.accepted) return;

    try {
      const createdStoreId = await submit(form);

      // Persiste el paso en el contexto local
      completeStep("store", { ...form, storeId: createdStoreId });

      // Navega al resultado con datos para mostrar el preview
      // Pasamos `bypassProtected: true` para evitar la redirección causada
      // por el guard mientras el estado `completedStep` se actualiza.
      nav("/resultado", {
        state: {
          previewState: {
            plan: state.plan ?? {},
            store: { ...form, storeId: createdStoreId },
            layout: state.layout ?? { id: "minimalista", title: "MINIMALISTA" },
            styles: state.styles ?? {},
            components: state.components ?? {},
            widgets: state.widgets ?? null,
          },
          clearStorage: true,
          bypassProtected: true,
        },
      });
    } catch {
      // El error ya está en el estado del hook
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  const isFormValid =
    form.name.trim() && form.subdomain.trim() && form.accepted;

  return (
    <div className="step-page">
      <StepProgress />

      <div className="step-card" style={{ maxWidth: 680 }}>
        <div className="step-header">
          <button className="btn-back" onClick={handleBack} disabled={loading}>
            ←
          </button>
          <div>
            <h1 className="step-title">Términos y crear tienda</h1>
            <p className="step-subtitle">
              {state.plan && (
                <>
                  Plan: <strong>{state.plan.name}</strong>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="step-body">
          {/* Nombre de la tienda */}
          <div className="field-block">
            <label htmlFor="cs-name">Nombre de la tienda *</label>
            <input
              id="cs-name"
              name="name"
              placeholder="Ej: Mi Tienda Urbana"
              value={form.name}
              onChange={handleNameChange}
              disabled={loading}
              autoComplete="off"
            />
          </div>

          {/* Subdominio */}
          <div className="field-block">
            <label htmlFor="cs-subdomain">
              Subdominio *
              <span
                style={{
                  color: "#888",
                  fontWeight: 400,
                  fontSize: 12,
                  marginLeft: 8,
                }}
              >
                {form.subdomain ? `${form.subdomain}.vexio.com` : ""}
              </span>
            </label>
            <input
              id="cs-subdomain"
              name="subdomain"
              placeholder="mi-tienda"
              value={form.subdomain}
              onChange={handleChange}
              disabled={loading}
              autoComplete="off"
              style={{ fontFamily: "monospace" }}
            />
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
            <label
              className="checkbox-container"
              style={{
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                name="accepted"
                checked={form.accepted}
                onChange={handleChange}
                disabled={loading}
                style={{ width: "auto", margin: 0, marginTop: 2 }}
              />
              <span style={{ fontSize: 13, color: "#aaa", lineHeight: 1.5 }}>
                He leído y acepto los términos y condiciones, políticas de
                privacidad y normas comerciales establecidas por Vexio.
              </span>
            </label>
          </section>

          {/* Error de la API */}
          {error && (
            <div
              className="alert error"
              role="alert"
              style={{ marginBottom: 12 }}
            >
              {error}
            </div>
          )}
        </div>

        <div className="step-actions">
          <button
            className="btn-secondary"
            onClick={handleBack}
            disabled={loading}
          >
            Atrás
          </button>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={!isFormValid || loading}
          >
            {loading ? "Creando tienda…" : "Crear tienda →"}
          </button>
        </div>
      </div>
    </div>
  );
}
