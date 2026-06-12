/**
 * StepBasicPage.jsx - Paso 2: Informacion basica de la tienda
 * Ruta: /crear-tienda/basico
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "./useStore";
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

function Alert({ type = "error", title, children }) {
  const cfg = {
    error:   { icon: <AlertCircle size={16} />,  cls: "error" },
    success: { icon: <CheckCircle2 size={16} />, cls: "success" },
    warning: { icon: <AlertCircle size={16} />,  cls: "warning" },
    info:    { icon: <CheckCircle2 size={16} />, cls: "info" },
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

const safeLogoUrl = (url) => (url && url.startsWith("http") ? url : null);

export default function StepBasicPage() {
  const navigate = useNavigate();
  const { state, saveProgress, completeStep } = useStore();

  const [form, setForm] = useState({
    name:        state.basic?.name ?? "",
    description: state.basic?.description ?? "",
    logoPreview: safeLogoUrl(state.basic?.logoPreview),
    uploading:   false,
    uploadError: null,
  });

  const [errors, setErrors] = useState({});

  const cc = (len, max) => (
    <span style={{ display:"block", textAlign:"right", fontSize:11, marginTop:3, fontFamily:"Inter,sans-serif",
      color: len >= max ? "#ef4444" : len > max * 0.8 ? "#f59e0b" : "#555" }}>
      {len}/{max}
    </span>
  );

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
      uploading:   true,
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
        uploading:   false,
        uploadError: err.message ?? "No se pudo subir el logo. Intenta de nuevo.",
      }));
    }
  };

  const handleBack = () => {
    saveProgress("basic", {
      name:        form.name,
      description: form.description,
      logoPreview: form.logoPreview,
    });
    navigate("/plan");
  };

  const handleNext = () => {
    const newErrors = {};
    if (!form.name.trim())  newErrors.name = "El nombre de la tienda es obligatorio";
    if (form.uploading)     newErrors.logo = "Espera a que el logo termine de subirse";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    completeStep("basic", {
      name:        form.name,
      description: form.description,
      logoPreview: form.logoPreview,
    });
    navigate("/crear-tienda/legal");
  };

  useEffect(() => {
    return () => {
      if (form.logoPreview?.startsWith("blob:")) {
        try { URL.revokeObjectURL(form.logoPreview); } catch {}
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
          <div className="step-header-text">
            <h1 className="step-title">Información básica</h1>
            <p className="step-subtitle">Cuéntanos sobre tu tienda</p>
          </div>
          <span className="step-badge">Paso 2 / 11</span>
        </div>

        <div className="step-body">

          {/* Nombre */}
          <div className="field-block">
            <label htmlFor="sb-name">
              <Store size={11} style={{ marginRight: 5, verticalAlign: "middle" }} />
              Nombre de la tienda *
            </label>
            <input
              id="sb-name"
              name="name"
              placeholder="Ej: Mi Tienda Urbana"
              value={form.name}
              onChange={handleChange}
              autoComplete="off"
              maxLength={200}
              className={
                errors.name ? "field-error" : form.name.trim() ? "field-success" : ""
              }
            />
            {cc(form.name.length, 200)}
            {errors.name && (
              <span className="field-hint hint-error">
                <AlertCircle size={11} /> {errors.name}
              </span>
            )}
          </div>

          {/* Descripcion */}
          <div className="field-block">
            <label htmlFor="sb-description">Descripcion</label>
            <textarea
              id="sb-description"
              name="description"
              placeholder="Describe tu tienda en pocas palabras..."
              value={form.description}
              onChange={handleChange}
              rows={4}
              maxLength={200}
              style={{ resize: "none" }}
            />
            {cc(form.description.length, 200)}
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
                  <Loader2 size={22} style={{ animation: "spin 0.9s cubic-bezier(0.5,0,0.5,1) infinite" }} />
                  <span>Subiendo logo...</span>
                </>
              ) : (
                <>
                  <Upload size={22} />
                  <span>Haz clic para subir tu logo</span>
                  <span className="upload-area-hint">PNG, JPG o SVG · máx 5 MB</span>
                </>
              )}
            </label>

            {form.uploadError && (
              <Alert type="error" title="Error al subir el logo">
                {form.uploadError}
              </Alert>
            )}

            {errors.logo && (
              <Alert type="warning" title="Logo en proceso">
                {errors.logo}
              </Alert>
            )}

            {form.logoPreview && !form.uploading && (
              <div className="logo-preview-wrap">
                <img
                  src={form.logoPreview}
                  className="logo-preview"
                  alt="Vista previa del logo"
                />
              </div>
            )}
          </div>

          {errors.name && errors.logo && (
            <Alert type="error" title="Completa los campos requeridos">
              Revisa los campos marcados antes de continuar.
            </Alert>
          )}
        </div>

        <div className="step-actions">
          <button className="btn-secondary" onClick={handleBack}>
            <ArrowLeft size={14} />
            Atras
          </button>
          <button
            className="btn-primary"
            onClick={handleNext}
            disabled={form.uploading}
          >
            {form.uploading ? (
              <>
                <span className="spinner" />
                Subiendo...
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

