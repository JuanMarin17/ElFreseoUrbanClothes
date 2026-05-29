/**
 * StepBasicPage.jsx — Paso 2: Información básica de la tienda
 * Ruta: /crear-tienda/basico
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "./StoreContext";
import StepProgress from "../components/StepProgress";
import { uploadFile } from "../../utils/uploadService";
import "../components/styles/StepPages.css";

export default function StepBasicPage() {
  const navigate = useNavigate();
  const { state, saveProgress, completeStep } = useStore();

const [form, setForm] = useState({
  name: state.basic?.name ?? "",
  description: state.basic?.description ?? "",
  logoPreview: state.basic?.logoPreview ?? null,
  logo: null,
  uploading: false,  // ← nuevo
});

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

const handleFile = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const localPreview = URL.createObjectURL(file);
  setForm((prev) => ({ ...prev, logoPreview: localPreview, uploading: true }));

  try {
    const url = await uploadFile(file);
    setForm((prev) => ({ ...prev, logoPreview: url, uploading: false }));
  } catch (err) {
    console.error("Error subiendo imagen:", err);
    setForm((prev) => ({ ...prev, uploading: false }));
  }
};

  const handleBack = () => {
    saveProgress("basic", form);
    navigate("/plan");
  };

  const handleNext = () => {
    if (!form.name.trim()) return alert("El nombre de la tienda es obligatorio");
    completeStep("basic", { name: form.name, description: form.description, logoPreview: form.logoPreview });
    navigate("/crear-tienda/legal");
  };

  return (
    <div className="step-page">
      <StepProgress />

      <div className="step-card">
        <div className="step-header">
          <button className="btn-back" onClick={handleBack}>
            ←
          </button>
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
            <label className="upload-area">
              <input
                type="file"
                accept="image/*"
                onChange={handleFile}
                hidden
              />
              <span>{form.uploading ? "⏳ Subiendo..." : "📁 Subir logo"}</span>
            </label>

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
          <button className="btn-secondary" onClick={handleBack}>
            Atrás
          </button>
          <button className="btn-primary" onClick={handleNext}>
            Continuar →
          </button>
        </div>
      </div>
    </div>
  );
}
