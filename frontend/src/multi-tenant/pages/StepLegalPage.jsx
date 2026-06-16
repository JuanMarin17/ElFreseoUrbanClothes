/**
 * StepLegalPage.jsx " Paso 3: Informacion legal
 * Ruta: /crear-tienda/legal
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "./useStore";
import StepProgress from "../components/StepProgress";
import "../components/styles/StepPages.css";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  ArrowLeft,
  ArrowRight,
  User,
  Hash,
} from "lucide-react";

// "" Alerta reutilizable """"""""""""""""""""""""""""""""""""""""""""""""""""""""
function Alert({ type = "error", title, children }) {
  const cfg = {
    error:   { icon: <AlertCircle  size={16} />, cls: "error"   },
    success: { icon: <CheckCircle2 size={16} />, cls: "success" },
    warning: { icon: <AlertCircle  size={16} />, cls: "warning" },
    info:    { icon: <CheckCircle2 size={16} />, cls: "info"    },
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

export default function StepLegalPage() {
  const navigate = useNavigate();
  const { state, saveProgress, completeStep, saveDraft } = useStore();

  // Texto derivado del contexto — reacciona al instante a sugerencias de la IA
  const legalName = state.legal?.legalName ?? "";
  const idNumber  = state.legal?.idNumber  ?? "";

  // Estado local solo para campos que la IA no controla
  const [documentName, setDocumentName] = useState(state.legal?.documentName ?? null);
  const [errors,       setErrors]       = useState({});
  const [touched,      setTouched]      = useState({});

  const handleChange = (e) => {
    const { name: field, value } = e.target;
    saveDraft("legal", { ...(state.legal ?? {}), [field]: value });
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleBlur = (field) =>
    setTouched(prev => ({ ...prev, [field]: true }));

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setDocumentName(file.name);
  };

  const handleBack = () => {
    saveProgress("legal", { legalName, idNumber, documentName });
    navigate("/crear-tienda/basico");
  };

  const handleNext = () => {
    const newErrors = {};
    if (!legalName.trim()) newErrors.legalName = "El nombre legal es obligatorio";
    if (!idNumber.trim())  newErrors.idNumber  = "El numero de documento es obligatorio";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched({ legalName: true, idNumber: true });
      return;
    }

    completeStep("legal", { legalName, idNumber, documentName });
    navigate("/crear-tienda/pagos");
  };

  const fieldClass = (field, value) => {
    if (!touched[field]) return "";
    return value.trim() ? "field-success" : "field-error";
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
            <h1 className="step-title">Información legal</h1>
            <p className="step-subtitle">Datos para tu cuenta de vendedor</p>
          </div>
          <span className="step-badge">Paso 3 / 11</span>
        </div>

        <div className="step-body">

          {/* Nombre legal */}
          <div className="field-block">
            <label htmlFor="sl-legalName">
              <User size={11} style={{ marginRight: 5, verticalAlign: "middle" }} />
              Nombre legal / Razon social *
            </label>
            <input
              id="sl-legalName"
              name="legalName"
              placeholder="Ej: Juan Perez o Mi Empresa S.A.S"
              value={legalName}
              onChange={handleChange}
              onBlur={() => handleBlur("legalName")}
              autoComplete="off"
              className={fieldClass("legalName", legalName)}
            />
            {errors.legalName && (
              <span className="field-hint hint-error">
                <AlertCircle size={11} /> {errors.legalName}
              </span>
            )}
            {touched.legalName && !errors.legalName && legalName.trim() && (
              <span className="field-hint hint-ok">
                <CheckCircle2 size={11} /> Se ve bien
              </span>
            )}
          </div>

          {/* Numero de documento */}
          <div className="field-block">
            <label htmlFor="sl-idNumber">
              <Hash size={11} style={{ marginRight: 5, verticalAlign: "middle" }} />
              Numero de documento / NIT *
            </label>
            <input
              id="sl-idNumber"
              name="idNumber"
              placeholder="Ej: 123456789"
              value={idNumber}
              onChange={handleChange}
              onBlur={() => handleBlur("idNumber")}
              autoComplete="off"
              style={{ fontFamily: "monospace" }}
              className={fieldClass("idNumber", idNumber)}
            />
            {errors.idNumber && (
              <span className="field-hint hint-error">
                <AlertCircle size={11} /> {errors.idNumber}
              </span>
            )}
            {touched.idNumber && !errors.idNumber && idNumber.trim() && (
              <span className="field-hint hint-ok">
                <CheckCircle2 size={11} /> Se ve bien
              </span>
            )}
          </div>

          {/* Documento de identidad */}
          <div className="field-block">
            <label>Documento de identidad (opcional)</label>
            <label className="upload-area">
              <input
                type="file"
                accept=".pdf,.jpg,.png"
                onChange={handleFile}
                hidden
              />
              <FileText size={22} />
              <span>{documentName ?? "Haz clic para subir tu documento"}</span>
              {!documentName && (
                <span className="upload-area-hint">PDF, JPG o PNG · máx 10 MB</span>
              )}
            </label>
            {documentName && (
              <span className="field-hint hint-ok">
                <CheckCircle2 size={11} /> {documentName}
              </span>
            )}
          </div>

          {/* Alerta global si hay errores al intentar continuar */}
          {(errors.legalName || errors.idNumber) && (
            <Alert type="error" title="Campos requeridos incompletos">
              Completa los campos marcados antes de continuar.
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