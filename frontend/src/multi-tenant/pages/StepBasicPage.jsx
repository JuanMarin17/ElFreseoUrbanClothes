/**
 * StepBasicPage.jsx — Paso 2: Información básica de la tienda
 * Ruta: /crear-tienda/basico
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "./StoreContext";
import StepProgress from "../components/StepProgress";
import { uploadStoreImage } from "../../utils/uploadService";
import "../components/styles/StepPages.css";

// Solo restaurar la preview si es una URL real de Cloudinary (no un blob: de sesión anterior)
const safeLogoUrl = (url) =>
  url && url.startsWith("http") ? url : null;

export default function StepBasicPage() {
  const navigate = useNavigate();
  const { state, saveProgress, completeStep } = useStore();

  const [form, setForm] = useState({
    name:        state.basic?.name        ?? "",
    description: state.basic?.description ?? "",
    logoPreview: safeLogoUrl(state.basic?.logoPreview),
    uploading:   false,
    uploadError: null,
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Mostrar preview local inmediata mientras sube
    const localPreview = URL.createObjectURL(file);
    setForm((prev) => ({ ...prev, logoPreview: localPreview, uploading: true, uploadError: null }));

    try {
      const cloudUrl = await uploadStoreImage(file, 'stores/logos');
      // Liberar blob local y reemplazar con la URL permanente de Cloudinary
      URL.revokeObjectURL(localPreview);
      setForm((prev) => ({ ...prev, logoPreview: cloudUrl, uploading: false }));
    } catch (err) {
      URL.revokeObjectURL(localPreview);
      setForm((prev) => ({
        ...prev,
        logoPreview: safeLogoUrl(state.basic?.logoPreview), // volver al logo anterior si existía
        uploading: false,
        uploadError: err.message ?? "Error al subir el logo",
      }));
    }
  };

  const handleBack = () => {
    saveProgress("basic", { name: form.name, description: form.description, logoPreview: form.logoPreview });
    navigate("/plan");
  };

  const handleNext = () => {
    if (!form.name.trim()) return alert("El nombre de la tienda es obligatorio");
    if (form.uploading) return alert("Espera a que el logo termine de subirse");
    completeStep("basic", {
      name:        form.name,
      description: form.description,
      logoPreview: form.logoPreview,
    });
    navigate("/crear-tienda/legal");
  };

  return (
    <div className="step-page">
      <StepProgress />

      <div className="step-card">
        <div className="step-header">
          <button className="btn-back" onClick={handleBack}>←</button>
          <div>
            <h1 className="step-title">Información básica</h1>
            <p className="step-subtitle">Cuéntanos sobre tu tienda</p>
          </div>
        </div>

        <div className="step-body">
          <div className="field-block">
            <label>Nombre de la tienda *</label>
            <input
              name="name"
              placeholder="Ej: Mi Tienda Urbana"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="field-block">
            <label>Descripción</label>
            <textarea
              name="description"
              placeholder="Describe tu tienda en pocas palabras..."
              value={form.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="field-block">
            <label>Logo de la tienda</label>
            <label className="upload-area" style={{ cursor: form.uploading ? "not-allowed" : "pointer" }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleFile}
                disabled={form.uploading}
                hidden
              />
              <span>{form.uploading ? "⏳ Subiendo..." : "📁 Subir logo"}</span>
            </label>

            {form.uploadError && (
              <p style={{ color: "#ef4444", fontSize: 12, marginTop: 6 }}>
                ⚠ {form.uploadError}
              </p>
            )}

            {form.logoPreview && !form.uploading && (
              <img
                src={form.logoPreview}
                className="logo-preview"
                alt="Logo preview"
              />
            )}
          </div>
        </div>

        <div className="step-actions">
          <button className="btn-secondary" onClick={handleBack}>Atrás</button>
          <button
            className="btn-primary"
            onClick={handleNext}
            disabled={form.uploading}
          >
            Continuar →
          </button>
        </div>
      </div>
    </div>
  );
}
