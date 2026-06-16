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
  const { state, saveProgress, completeStep, saveDraft } = useStore();

  // Texto derivado del contexto — reacciona al instante a sugerencias de la IA
  const storeName    = state.basic?.name        ?? "";
  const storeDesc    = state.basic?.description ?? "";

  // Estado local solo para campos de UI que la IA no controla
  const [logoPreview, setLogoPreview] = useState(safeLogoUrl(state.basic?.logoPreview));
  const [uploading,   setUploading]   = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [errors,      setErrors]      = useState({});

  const cc = (len, max) => (
    <span style={{ display:"block", textAlign:"right", fontSize:11, marginTop:3, fontFamily:"Inter,sans-serif",
      color: len >= max ? "#ef4444" : len > max * 0.8 ? "#f59e0b" : "#555" }}>
      {len}/{max}
    </span>
  );

  const handleChange = (e) => {
    const { name: field, value } = e.target;
    saveDraft("basic", { ...(state.basic ?? {}), [field]: value, logoPreview });
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localPreview = URL.createObjectURL(file);
    setLogoPreview(localPreview);
    setUploading(true);
    setUploadError(null);

    try {
      const cloudUrl = await uploadStoreImage(file, "stores/logos");
      URL.revokeObjectURL(localPreview);
      setLogoPreview(cloudUrl);
      saveDraft("basic", { ...(state.basic ?? {}), logoPreview: cloudUrl });
      setUploading(false);
    } catch (err) {
      URL.revokeObjectURL(localPreview);
      setLogoPreview(safeLogoUrl(state.basic?.logoPreview));
      setUploading(false);
      setUploadError(err.message ?? "No se pudo subir el logo. Intenta de nuevo.");
    }
  };

  const handleBack = () => {
    saveProgress("basic", { name: storeName, description: storeDesc, logoPreview });
    navigate("/plan");
  };

  const handleNext = () => {
    const newErrors = {};
    if (!storeName.trim()) newErrors.name = "El nombre de la tienda es obligatorio";
    if (uploading)         newErrors.logo = "Espera a que el logo termine de subirse";

    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    completeStep("basic", { name: storeName, description: storeDesc, logoPreview });
    navigate("/crear-tienda/legal");
  };

  useEffect(() => {
    return () => {
      if (logoPreview?.startsWith("blob:")) {
        try { URL.revokeObjectURL(logoPreview); } catch {}
      }
    };
  }, [logoPreview]);

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
              value={storeName}
              onChange={handleChange}
              autoComplete="off"
              maxLength={200}
              className={
                errors.name ? "field-error" : storeName.trim() ? "field-success" : ""
              }
            />
            {cc(storeName.length, 200)}
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
              value={storeDesc}
              onChange={handleChange}
              rows={4}
              maxLength={200}
              style={{ resize: "none" }}
            />
            {cc(storeDesc.length, 200)}
          </div>

          {/* Logo */}
          <div className="field-block">
            <label>Logo de la tienda</label>
            <label
              className="upload-area"
              style={{ cursor: uploading ? "not-allowed" : "pointer" }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFile}
                disabled={uploading}
                hidden
              />
              {uploading ? (
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

            {uploadError && (
              <Alert type="error" title="Error al subir el logo">
                {uploadError}
              </Alert>
            )}

            {errors.logo && (
              <Alert type="warning" title="Logo en proceso">
                {errors.logo}
              </Alert>
            )}

            {logoPreview && !uploading && (
              <div className="logo-preview-wrap">
                <img
                  src={logoPreview}
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
            disabled={uploading}
          >
            {uploading ? (
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

