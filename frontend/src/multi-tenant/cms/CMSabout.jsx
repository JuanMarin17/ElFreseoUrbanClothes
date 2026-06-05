/**
 * CMSAbout.jsx — Quiénes Somos
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../pages/StoreContext";
import StepProgress from "../components/StepProgress";
import "../components/styles/CMSeditor.css";
const DEFAULT = {
  headline: "",
  story: "",
  mission: "",
  vision: "",
  founded: "",
  teamSize: "",
  showTeam: true,
  showTimeline: true,
};

export default function CMSAbout() {
  const navigate = useNavigate();
  const { state, saveProgress } = useStore();

  const [data, setData] = useState(state.cms?.about ?? DEFAULT);
  const [toast, setToast] = useState(false);

  const set = (k, v) => setData((p) => ({ ...p, [k]: v }));

  const showToast = () => {
    setToast(true);
    setTimeout(() => setToast(false), 2200);
  };

  const handleSave = () => {
    const prevCms = state.cms ?? {};
    saveProgress("cms", {
      ...prevCms,
      about: data,
      completed: [...new Set([...(prevCms.completed ?? []), "about"])],
    });
    showToast();
  };

  return (
    <div className="admin-frame">
      <header className="admin-nav">
        <button
          onClick={() => navigate("/cms")}
          className="btn-back-arrow"
          title="Volver"
        >
          ←
        </button>
        <div className="brand">
          {state.store?.name ?? "VEXIO"} <span>STUDIO V3</span>
        </div>
        <button className="btn-save-top" onClick={handleSave}>
          GUARDAR
        </button>
      </header>

      <StepProgress />

      <div className="cms-page cms-page--about">
        <div className="cms-page__header">
          <div className="cms-page__icon">
            <i className="ti ti-building-store" />
          </div>
          <div className="cms-page__titles">
            <h1 className="cms-page__title">Quiénes Somos</h1>
            <p className="cms-page__sub">
              Presenta tu marca, historia y valores a tus clientes
            </p>
          </div>
        </div>

        {/* Identidad */}
        <div className="cms-form-card">
          <p className="cms-section-title">Identidad de Marca</p>

          <div className="field-group">
            <label>Titular Principal</label>
            <input
              className="f-input-dark"
              placeholder="Ej: Más que ropa, una actitud"
              value={data.headline}
              onChange={(e) => set("headline", e.target.value)}
            />
          </div>

          <div className="field-group">
            <label>Nuestra Historia</label>
            <textarea
              className="f-textarea-dark"
              placeholder="Cuéntanos cómo nació tu marca, qué la inspiró..."
              value={data.story}
              onChange={(e) => set("story", e.target.value)}
              style={{ minHeight: 120 }}
            />
          </div>

          <div className="field-row-2">
            <div className="field-group">
              <label>Año de Fundación</label>
              <input
                className="f-input-dark"
                placeholder="2020"
                value={data.founded}
                onChange={(e) => set("founded", e.target.value)}
              />
            </div>
            <div className="field-group">
              <label>Tamaño del Equipo</label>
              <input
                className="f-input-dark"
                placeholder="Ej: 5 personas"
                value={data.teamSize}
                onChange={(e) => set("teamSize", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Misión y Visión */}
        <div className="cms-form-card">
          <p className="cms-section-title">Misión & Visión</p>

          <div className="field-group">
            <label>Misión</label>
            <textarea
              className="f-textarea-dark"
              placeholder="¿Qué problema resuelves y para quién?"
              value={data.mission}
              onChange={(e) => set("mission", e.target.value)}
            />
          </div>

          <div className="field-group">
            <label>Visión</label>
            <textarea
              className="f-textarea-dark"
              placeholder="¿Dónde quieres estar en 5 años?"
              value={data.vision}
              onChange={(e) => set("vision", e.target.value)}
            />
          </div>
        </div>

        {/* Opciones de visualización */}
        <div className="cms-form-card">
          <p className="cms-section-title">Opciones de Visualización</p>

          <div className="toggle-field">
            <div className="toggle-field__info">
              <span className="toggle-field__label">
                Mostrar sección de equipo
              </span>
              <span className="toggle-field__desc">
                Muestra nombres y fotos del equipo
              </span>
            </div>
            <label className="toggle-wrap">
              <input
                type="checkbox"
                checked={data.showTeam}
                onChange={(e) => set("showTeam", e.target.checked)}
              />
              <span className="toggle-track" />
              <span className="toggle-thumb" />
            </label>
          </div>

          <div className="toggle-field">
            <div className="toggle-field__info">
              <span className="toggle-field__label">
                Mostrar línea de tiempo
              </span>
              <span className="toggle-field__desc">
                Hitos importantes de la marca
              </span>
            </div>
            <label className="toggle-wrap">
              <input
                type="checkbox"
                checked={data.showTimeline}
                onChange={(e) => set("showTimeline", e.target.checked)}
              />
              <span className="toggle-track" />
              <span className="toggle-thumb" />
            </label>
          </div>
        </div>

        <div className="cms-save-row">
          <button className="btn-cms-back" onClick={() => navigate("/cms")}>
            ← Volver al CMS
          </button>
          <button className="btn-cms-save" onClick={handleSave}>
            GUARDAR CAMBIOS
          </button>
        </div>
      </div>

      <div className={`cms-toast ${toast ? "show" : ""}`}>
        ✓ Quiénes Somos guardado
      </div>
    </div>
  );
}
