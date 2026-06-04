/**
 * CMSContact.jsx — Contacto
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../pages/StoreContext";
import StepProgress from "../components/StepProgress";
import "../components/styles/CMSeditor.css";

const DEFAULT = {
  email: "",
  phone: "",
  whatsapp: "",
  instagram: "",
  tiktok: "",
  hours: "",
  showForm: true,
  showSocials: true,
  formTitle: "Escríbenos",
  formSubtitle: "Respondemos en menos de 24 horas",
};

export default function CMSContact() {
  const navigate = useNavigate();
  const { state, saveProgress } = useStore();

  const [data, setData] = useState(state.cms?.contact ?? DEFAULT);
  const [toast, setToast] = useState(false);

  const set = (k, v) => setData((p) => ({ ...p, [k]: v }));

  const handleSave = () => {
    const prevCms = state.cms ?? {};
    saveProgress("cms", {
      ...prevCms,
      contact: data,
      completed: [...new Set([...(prevCms.completed ?? []), "contact"])],
    });
    setToast(true);
    setTimeout(() => setToast(false), 2200);
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

      <div className="cms-page cms-page--contact">
        <div className="cms-page__header">
          <div className="cms-page__icon">
            <i className="ti ti-mail" />
          </div>
          <div className="cms-page__titles">
            <h1 className="cms-page__title">Contacto</h1>
            <p className="cms-page__sub">
              Información de contacto y canales de comunicación
            </p>
          </div>
        </div>

        {/* Info básica */}
        <div className="cms-form-card">
          <p className="cms-section-title">Información de Contacto</p>

          <div className="field-row-2">
            <div className="field-group">
              <label>Correo Electrónico</label>
              <input
                className="f-input-dark"
                placeholder="hola@mitienda.com"
                type="email"
                value={data.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </div>
            <div className="field-group">
              <label>Teléfono</label>
              <input
                className="f-input-dark"
                placeholder="+57 300 000 0000"
                value={data.phone}
                onChange={(e) => set("phone", e.target.value)}
              />
            </div>
          </div>

          <div className="field-group">
            <label>WhatsApp</label>
            <input
              className="f-input-dark"
              placeholder="+57 300 000 0000 (con código de país)"
              value={data.whatsapp}
              onChange={(e) => set("whatsapp", e.target.value)}
            />
          </div>

          <div className="field-group">
            <label>Horario de Atención</label>
            <input
              className="f-input-dark"
              placeholder="Lun – Vie: 9am – 6pm | Sáb: 10am – 2pm"
              value={data.hours}
              onChange={(e) => set("hours", e.target.value)}
            />
          </div>
        </div>

        {/* Redes sociales */}
        <div className="cms-form-card">
          <p className="cms-section-title">Redes Sociales</p>

          <div className="field-row-2">
            <div className="field-group">
              <label>Instagram</label>
              <input
                className="f-input-dark"
                placeholder="@mitienda"
                value={data.instagram}
                onChange={(e) => set("instagram", e.target.value)}
              />
            </div>
            <div className="field-group">
              <label>TikTok</label>
              <input
                className="f-input-dark"
                placeholder="@mitienda"
                value={data.tiktok}
                onChange={(e) => set("tiktok", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="cms-form-card">
          <p className="cms-section-title">Formulario de Contacto</p>

          <div className="field-group">
            <label>Título del Formulario</label>
            <input
              className="f-input-dark"
              value={data.formTitle}
              onChange={(e) => set("formTitle", e.target.value)}
            />
          </div>

          <div className="field-group">
            <label>Subtítulo</label>
            <input
              className="f-input-dark"
              value={data.formSubtitle}
              onChange={(e) => set("formSubtitle", e.target.value)}
            />
          </div>

          <div className="toggle-field">
            <div className="toggle-field__info">
              <span className="toggle-field__label">Mostrar formulario</span>
              <span className="toggle-field__desc">
                Activa el formulario de contacto en tu tienda
              </span>
            </div>
            <label className="toggle-wrap">
              <input
                type="checkbox"
                checked={data.showForm}
                onChange={(e) => set("showForm", e.target.checked)}
              />
              <span className="toggle-track" />
              <span className="toggle-thumb" />
            </label>
          </div>

          <div className="toggle-field">
            <div className="toggle-field__info">
              <span className="toggle-field__label">
                Mostrar redes sociales
              </span>
              <span className="toggle-field__desc">
                Muestra íconos de redes en la página de contacto
              </span>
            </div>
            <label className="toggle-wrap">
              <input
                type="checkbox"
                checked={data.showSocials}
                onChange={(e) => set("showSocials", e.target.checked)}
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
        ✓ Contacto guardado correctamente
      </div>
    </div>
  );
}
