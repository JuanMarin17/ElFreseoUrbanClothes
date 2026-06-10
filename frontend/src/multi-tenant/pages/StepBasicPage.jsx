/**
 * StepBasicPage.jsx — Paso 2: Información básica de la tienda
 * Ruta: /crear-tienda/basico
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "./StoreContext";
import StepProgress from "../components/StepProgress";
import { uploadStoreImage } from "../../utils/uploadService";
import "../components/styles/StepPages.css";
import {
  AlertCircle,
  CheckCircle2,
  Upload,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Store,
} from "lucide-react";

// ── Alerta reutilizable ────────────────────────────────────────────────────────
function Alert({ type = "error", title, children }) {
  const cfg = {
    error: { icon: <AlertCircle size={16} />, cls: "error" },
    success: { icon: <CheckCircle2 size={16} />, cls: "success" },
    warning: { icon: <AlertCircle size={16} />, cls: "warning" },
    info: { icon: <CheckCircle2 size={16} />, cls: "info" },
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

// Solo restaurar la preview si es una URL real de Cloudinary (no un blob: de sesión anterior)
const safeLogoUrl = (url) => (url && url.startsWith("http") ? url : null);

export default function StepBasicPage() {
  const navigate = useNavigate();
  const { state, saveProgress, completeStep } = useStore();

  const [form, setForm] = useState({
    name: state.basic?.name ?? "",
    description: state.basic?.description ?? "",
    logoPreview: safeLogoUrl(state.basic?.logoPreview),
    uploading: false,
    uploadError: null,
  });

  // Errores de validación inline (solo se muestran tras intentar continuar)
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    // Limpiar error del campo cuando el usuario escribe
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: null }));
    }
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localPreview = URL.createObjectURL(file);
    setForm((prev) => ({
      ...prev,
      logoPreview: localPreview,
      uploading: true,
      uploadError: null,
    }));

    try {
      const cloudUrl = await uploadStoreImage(file, "stores/logos");
      URL.revokeObjectURL(localPreview);
      setForm((prev) => ({ ...prev, logoPreview: cloudUrl, uploading: false }));
    } catch (err) {
      URL.revokeObjectURL(localPreview);
      setForm((prev) => ({
        ...prev,
        logoPreview: safeLogoUrl(state.basic?.logoPreview),
        uploading: false,
        uploadError:
          err.message ?? "No se pudo subir el logo. Intenta de nuevo.",
      }));
    }
  };

  const handleBack = () => {
    saveProgress("basic", {
      name: form.name,
      description: form.description,
      logoPreview: form.logoPreview,
    });
    navigate("/plan");
  };

  const handleNext = () => {
    const newErrors = {};
    if (!form.name.trim())
      newErrors.name = "El nombre de la tienda es obligatorio";
    if (form.uploading)
      newErrors.logo = "Espera a que el logo termine de subirse";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    completeStep("basic", {
      name: form.name,
      description: form.description,
      logoPreview: form.logoPreview,
    });
    navigate("/crear-tienda/legal");
  };

  // Revocar cualquier ObjectURL temporal al desmontar o cuando cambie preview
  useEffect(() => {
    return () => {
      if (
        form.logoPreview &&
        typeof form.logoPreview === "string" &&
        form.logoPreview.startsWith("blob:")
      ) {
        try {
          URL.revokeObjectURL(form.logoPreview);
        } catch {}
      }
    };
  }, [form.logoPreview]);

  return (
    <div className="step-page">
      <StepProgress />

      <div className="step-card">
        <div className="step-header">
          <button className="btn-back" onClick={handleBack} aria-label="Volver">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="step-title">Información básica</h1>
            <p className="step-subtitle">Cuéntanos sobre tu tienda</p>
          </div>
        </div>

        <div className="step-body">
          {/* Nombre */}
          <div className="field-block">
            <label htmlFor="sb-name">
              <Store
                size={11}
                style={{ marginRight: 5, verticalAlign: "middle" }}
              />
              Nombre de la tienda *
            </label>
            <input
              id="sb-name"
              name="name"
              placeholder="Ej: Mi Tienda Urbana"
              value={form.name}
              onChange={handleChange}
              autoComplete="off"
              className={
                errors.name
                  ? "field-error"
                  : form.name.trim()
                    ? "field-success"
                    : ""
              }
            />
            {errors.name && (
              <span className="field-hint hint-error">
                <AlertCircle size={11} /> {errors.name}
              </span>
            )}
          </div>

          {/* Descripción */}
          <div className="field-block">
            <label htmlFor="sb-description">Descripción</label>
            <textarea
              id="sb-description"
              name="description"
              placeholder="Describe tu tienda en pocas palabras..."
              value={form.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          {/* Logo */}
          <div className="field-block">
            <label>Logo de la tienda</label>
            <label
              className="upload-area"
              style={{ cursor: form.uploading ? "not-allowed" : "pointer" }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFile}
                disabled={form.uploading}
                hidden
              />
              {form.uploading ? (
                <>
                  <Loader2
                    size={16}
                    style={{ animation: "spin 0.7s linear infinite" }}
                  />
                  <span>Subiendo logo…</span>
                </>
              ) : (
                <>
                  <Upload size={16} />
                  <span>Subir logo</span>
                </>
              )}
            </label>

            {/* Error de upload */}
            {form.uploadError && (
              <Alert type="error" title="Error al subir el logo">
                {form.uploadError}
              </Alert>
            )}

            {/* Error de validación del logo (subiendo) */}
            {errors.logo && (
              <Alert type="warning" title="Logo en proceso">
                {errors.logo}
              </Alert>
            )}

            {/* Preview */}
            {form.logoPreview && !form.uploading && (
              <img
                src={form.logoPreview}
                className="logo-preview"
                alt="Vista previa del logo"
              />
            )}
          </div>

          {/* Error general si hay múltiples errores */}
          {errors.name && errors.logo && (
            <Alert type="error" title="Completa los campos requeridos">
              Revisa los campos marcados antes de continuar.
            </Alert>
          )}
        </div>

        <div className="step-actions">
          <button className="btn-secondary" onClick={handleBack}>
            <ArrowLeft size={14} />
            Atrás
          </button>
          <button
            className="btn-primary"
            onClick={handleNext}
            disabled={form.uploading}
          >
            {form.uploading ? (
              <>
                <span className="spinner" />
                Subiendo…
              </>
            ) : (
              <>
                Continuar
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
