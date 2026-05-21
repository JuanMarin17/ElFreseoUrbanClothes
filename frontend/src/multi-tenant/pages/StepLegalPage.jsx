/**
 * StepLegalPage.jsx — Paso 3: Información legal
 * Ruta: /crear-tienda/legal
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "./StoreContext";
import StepProgress from "../components/StepProgress";
import "../components/styles/StepPages.css";

export default function StepLegalPage() {
  const navigate = useNavigate();
  const { state, saveProgress, completeStep } = useStore();

  const [form, setForm] = useState({
    legalName: state.legal?.legalName ?? "",
    idNumber: state.legal?.idNumber ?? "",
    documentName: state.legal?.documentName ?? null,
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm((prev) => ({ ...prev, documentName: file.name }));
  };

  const handleBack = () => {
    saveProgress("legal", form);
    navigate("/crear-tienda/basico");
  };

  const handleNext = () => {
    if (!form.legalName.trim()) return alert("El nombre legal es obligatorio");
    if (!form.idNumber.trim()) return alert("El número de documento es obligatorio");
    completeStep("legal", form);
    navigate("/crear-tienda/pagos");
  };

  return (
    <div className="step-page">
      <StepProgress />

      <div className="step-card">
        <div className="step-header">
          <button className="btn-back" onClick={handleBack}>←</button>
          <div>
            <h1 className="step-title">Información legal</h1>
            <p className="step-subtitle">Datos para tu cuenta de vendedor</p>
          </div>
        </div>

        <div className="step-body">
          <div className="field-block">
            <label>Nombre legal / Razón social *</label>
            <input
              name="legalName"
              placeholder="Ej: Juan Pérez o Mi Empresa S.A.S"
              value={form.legalName}
              onChange={handleChange}
            />
          </div>

          <div className="field-block">
            <label>Número de documento / NIT *</label>
            <input
              name="idNumber"
              placeholder="Ej: 123456789"
              value={form.idNumber}
              onChange={handleChange}
            />
          </div>

          <div className="field-block">
            <label>Documento de identidad (opcional)</label>
            <label className="upload-area">
              <input type="file" accept=".pdf,.jpg,.png" onChange={handleFile} hidden />
              <span>📄 {form.documentName ?? "Subir documento"}</span>
            </label>
          </div>
        </div>

        <div className="step-actions">
          <button className="btn-secondary" onClick={handleBack}>Atrás</button>
          <button className="btn-primary" onClick={handleNext}>Continuar →</button>
        </div>
      </div>
    </div>
  );
}
