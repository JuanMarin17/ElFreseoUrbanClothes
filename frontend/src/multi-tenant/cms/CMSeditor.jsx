/**
 * CMSEditor.jsx
 * Hub del CMS " funciona en dos modos:
 *   - Wizard (/cms):                  sin storeId en params, usa StoreContext
 *   - Admin  (/tienda/:slug/admin/cms): slug en params, carga secciones completadas desde API
 */

import React, { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "../pages/useStore";
import { getCms } from "../pages/services/cmsService";
import StepProgress from "../components/StepProgress";
import "../components/styles/CMSeditor.css";

const CMS_SECTIONS = [
  { key: "about",     label: "Quienes Somos", icon: "ti-building-store", desc: "Historia, mision y vision de tu marca",          color: "#8b3cf7" },
  { key: "contact",   label: "Contacto",      icon: "ti-mail",           desc: "Telefono, correo y formulario de contacto",       color: "#f5c842" },
  { key: "locations", label: "Ubicaciones",   icon: "ti-map-pin",        desc: "Tiendas fisicas y puntos de venta",               color: "#00d4aa" },
  { key: "returns",   label: "Devoluciones",  icon: "ti-arrow-back-up",  desc: "Politica de cambios y devoluciones",              color: "#ff6b6b" },
  { key: "faq",       label: "Ayuda / FAQ",   icon: "ti-help-circle",    desc: "Preguntas frecuentes y soporte",                  color: "#4ecdc4" },
];

export default function CMSEditor() {
  const navigate   = useNavigate();
  const { slug }   = useParams();
  const isAdminMode = !!slug;
  const storeId    = isAdminMode ? localStorage.getItem("storeId") : null;

  const { state, completeStep } = useStore();

  // En admin mode cargamos que secciones ya tienen datos
  const [completedSections, setCompletedSections] = useState(
    isAdminMode ? [] : (state.cms?.completed ?? [])
  );

  useEffect(() => {
    if (!isAdminMode || !storeId) return;
    getCms(storeId)
      .then(cms => {
        if (!cms) return;
        const filled = CMS_SECTIONS
          .filter(s => cms[s.key] != null)
          .map(s => s.key);
        setCompletedSections(filled);
      })
      .catch(() => {});
  }, []);

  const pathFor = (key) =>
    isAdminMode
      ? `/tienda/${slug}/admin/cms/${key}`
      : `/cms/${key}`;

  const handleBack = () =>
    isAdminMode ? navigate(`/tienda/${slug}/admin/dashboard`) : navigate("/widgets");

  const handleNext = () => {
    completeStep(8, state.cms ?? {});
    navigate("/crear-tienda");
  };

  // "" Grid de secciones (compartido entre modos) """"""""""""""""""""""""""""
  const grid = (
    <div className="cms-hub__grid">
      {CMS_SECTIONS.map((sec) => {
        const done = completedSections.includes(sec.key);
        return (
          <button
            key={sec.key}
            className={`cms-card ${done ? "cms-card--done" : ""}`}
            style={{ "--accent": sec.color }}
            onClick={() => navigate(pathFor(sec.key))}
          >
            <div className="cms-card__icon"><i className={`ti ${sec.icon}`} /></div>
            <div className="cms-card__body">
              <span className="cms-card__label">{sec.label}</span>
              <span className="cms-card__desc">{sec.desc}</span>
            </div>
            <div className="cms-card__status">
              {done
                ? <span className="badge-done">" LISTO</span>
                : <span className="badge-pending">EDITAR '</span>}
            </div>
          </button>
        );
      })}
    </div>
  );

  // "" Admin mode: renderiza dentro de AdminLayout (sin admin-frame propio) ""
  if (isAdminMode) {
    return (
      <div className="cms-hub" style={{ padding: "0 0 40px" }}>
        <div className="cms-hub__header">
          <h1 className="cms-hub__title">Gestion de Contenido</h1>
          <p className="cms-hub__sub">
            Personaliza las paginas informativas de tu tienda.
          </p>
        </div>
        {grid}
      </div>
    );
  }

  // "" Wizard mode: pagina completa standalone """""""""""""""""""""""""""""""
  return (
    <div className="admin-frame">
      <header className="admin-nav">
        <button onClick={handleBack} className="btn-back-arrow" title="Volver">
          <ArrowLeft size={16} />
        </button>
        <div className="brand">{state.store?.name ?? "VEXIO"} <span>STUDIO V3</span></div>
        <button className="btn-save-top" onClick={handleNext}>SIGUIENTE <ArrowRight size={14} /></button>
      </header>

      <StepProgress />

      <main className="cms-hub">
        <div className="cms-hub__header">
          <p className="label-mini">PASO 8 " CONTENIDO DE PAGINAS</p>
          <h1 className="cms-hub__title">Gestion de Contenido</h1>
          <p className="cms-hub__sub">
            Personaliza las paginas informativas de tu tienda. Cada seccion
            puede editarse de forma independiente.
          </p>
        </div>

        {grid}

        <div className="cms-hub__footer">
          <p className="cms-hint">
            Puedes saltar secciones y completarlas despues desde el panel de administracion.
          </p>
          <button className="btn-save-top" onClick={handleNext}>
            FINALIZAR Y CREAR TIENDA <ArrowRight size={14} />
          </button>
        </div>
      </main>
    </div>
  );
}
