/**
 * CMSEditor.jsx
 * Hub principal del CMS — Contacto, Ayuda, Ubicaciones, Devoluciones, Quiénes Somos
 * Misma estética que ComponentCustomizer: dark theme, accentColor #8b3cf7/#f5c842
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../pages/StoreContext";
import StepProgress from "../components/StepProgress";
import "../components/styles/CMSeditor.css";

const CMS_SECTIONS = [
  {
    key: "about",
    label: "Quiénes Somos",
    icon: "ti-building-store",
    path: "/cms/about",
    desc: "Historia, misión y visión de tu marca",
    color: "#8b3cf7",
  },
  {
    key: "contact",
    label: "Contacto",
    icon: "ti-mail",
    path: "/cms/contact",
    desc: "Teléfono, correo y formulario de contacto",
    color: "#f5c842",
  },
  {
    key: "locations",
    label: "Ubicaciones",
    icon: "ti-map-pin",
    path: "/cms/locations",
    desc: "Tiendas físicas y puntos de venta",
    color: "#00d4aa",
  },
  {
    key: "returns",
    label: "Devoluciones",
    icon: "ti-arrow-back-up",
    path: "/cms/returns",
    desc: "Política de cambios y devoluciones",
    color: "#ff6b6b",
  },
  {
    key: "faq",
    label: "Ayuda / FAQ",
    icon: "ti-help-circle",
    path: "/cms/faq",
    desc: "Preguntas frecuentes y soporte",
    color: "#4ecdc4",
  },
];

export default function CMSEditor() {
  const navigate = useNavigate();
  const { state, completeStep, saveDraft } = useStore();

  const completedSections = state.cms?.completed ?? [];

  const handleBack = () => navigate("/widgets");

  const handleNext = () => {
    completeStep(8, state.cms ?? {});
    navigate("/crear-tienda");
  };

  return (
    <div className="admin-frame">
      <header className="admin-nav">
        <button onClick={handleBack} className="btn-back-arrow" title="Volver">
          ←
        </button>
        <div className="brand">
          {state.store?.name ?? "VEXIO"} <span>STUDIO V3</span>
        </div>
        <button className="btn-save-top" onClick={handleNext}>
          SIGUIENTE →
        </button>
      </header>

      <StepProgress />

      <main className="cms-hub">
        <div className="cms-hub__header">
          <p className="label-mini">PASO 8 — CONTENIDO DE PÁGINAS</p>
          <h1 className="cms-hub__title">Gestión de Contenido</h1>
          <p className="cms-hub__sub">
            Personaliza las páginas informativas de tu tienda. Cada sección
            puede editarse de forma independiente.
          </p>
        </div>

        <div className="cms-hub__grid">
          {CMS_SECTIONS.map((sec) => {
            const done = completedSections.includes(sec.key);
            return (
              <button
                key={sec.key}
                className={`cms-card ${done ? "cms-card--done" : ""}`}
                style={{ "--accent": sec.color }}
                onClick={() => navigate(sec.path)}
              >
                <div className="cms-card__icon">
                  <i className={`ti ${sec.icon}`} />
                </div>
                <div className="cms-card__body">
                  <span className="cms-card__label">{sec.label}</span>
                  <span className="cms-card__desc">{sec.desc}</span>
                </div>
                <div className="cms-card__status">
                  {done ? (
                    <span className="badge-done">✓ LISTO</span>
                  ) : (
                    <span className="badge-pending">EDITAR →</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="cms-hub__footer">
          <p className="cms-hint">
            💡 Puedes saltar secciones y completarlas después desde el panel de
            administración.
          </p>
          <button className="btn-save-top" onClick={handleNext}>
            FINALIZAR Y CREAR TIENDA →
          </button>
        </div>
      </main>
    </div>
  );
}
