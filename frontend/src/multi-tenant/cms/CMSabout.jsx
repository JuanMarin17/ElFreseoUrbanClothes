/**
 * CMSAbout.jsx — Quiénes Somos
 * Modo wizard (/cms/about):            usa StoreContext, sin API
 * Modo admin  (/tienda/:slug/admin/cms/about): GET+PATCH contra /stores/cms
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "../pages/StoreContext";
import { getCms, patchCms } from "../pages/services/cmsService";
import StepProgress from "../components/StepProgress";
import "../components/styles/CMSeditor.css";

const DEFAULT = {
  headline: "", story: "", mission: "", vision: "",
  founded: "", teamSize: "", showTeam: true, showTimeline: true,
};

export default function CMSAbout() {
  const navigate    = useNavigate();
  const { slug }    = useParams();
  const isAdminMode = !!slug;
  const storeId     = isAdminMode ? localStorage.getItem("storeId") : null;
  const { state, saveProgress } = useStore();

  const [data,    setData]    = useState(isAdminMode ? DEFAULT : (state.cms?.about ?? DEFAULT));
  const [toast,   setToast]   = useState(false);
  const [toastMsg,setToastMsg]= useState("");
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    if (!isAdminMode || !storeId) return;
    getCms(storeId)
      .then(cms => { if (cms?.about) setData({ ...DEFAULT, ...cms.about }); })
      .catch(() => {});
  }, []);

  const set = (k, v) => setData(p => ({ ...p, [k]: v }));

  const showToast = (msg) => { setToastMsg(msg); setToast(true); setTimeout(() => setToast(false), 2200); };

  const handleBack = () => navigate(isAdminMode ? `/tienda/${slug}/admin/cms` : "/cms");

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isAdminMode && storeId) {
        await patchCms(storeId, { about: data });
      } else {
        const prev = state.cms ?? {};
        saveProgress("cms", { ...prev, about: data, completed: [...new Set([...(prev.completed ?? []), "about"])] });
      }
      showToast("✓ Quiénes Somos guardado");
    } catch {
      showToast("✗ Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  // ── Formulario (compartido entre modos) ──────────────────────────────────
  const form = (
    <div className="cms-page cms-page--about">
      {!isAdminMode && (
        <div className="cms-page__header">
          <div className="cms-page__icon"><i className="ti ti-building-store" /></div>
          <div className="cms-page__titles">
            <h1 className="cms-page__title">Quiénes Somos</h1>
            <p className="cms-page__sub">Presenta tu marca, historia y valores a tus clientes</p>
          </div>
        </div>
      )}

      <div className="cms-form-card">
        <p className="cms-section-title">Identidad de Marca</p>
        <div className="field-group">
          <label>Titular Principal</label>
          <input className="f-input-dark" placeholder="Ej: Más que ropa, una actitud"
            value={data.headline} onChange={e => set("headline", e.target.value)} />
        </div>
        <div className="field-group">
          <label>Nuestra Historia</label>
          <textarea className="f-textarea-dark" placeholder="Cuéntanos cómo nació tu marca..."
            value={data.story} onChange={e => set("story", e.target.value)} style={{ minHeight: 120 }} />
        </div>
        <div className="field-row-2">
          <div className="field-group">
            <label>Año de Fundación</label>
            <input className="f-input-dark" placeholder="2020"
              value={data.founded} onChange={e => set("founded", e.target.value)} />
          </div>
          <div className="field-group">
            <label>Tamaño del Equipo</label>
            <input className="f-input-dark" placeholder="Ej: 5 personas"
              value={data.teamSize} onChange={e => set("teamSize", e.target.value)} />
          </div>
        </div>
      </div>

      <div className="cms-form-card">
        <p className="cms-section-title">Misión &amp; Visión</p>
        <div className="field-group">
          <label>Misión</label>
          <textarea className="f-textarea-dark" placeholder="¿Qué problema resuelves y para quién?"
            value={data.mission} onChange={e => set("mission", e.target.value)} />
        </div>
        <div className="field-group">
          <label>Visión</label>
          <textarea className="f-textarea-dark" placeholder="¿Dónde quieres estar en 5 años?"
            value={data.vision} onChange={e => set("vision", e.target.value)} />
        </div>
      </div>

      <div className="cms-form-card">
        <p className="cms-section-title">Opciones de Visualización</p>
        {[
          { key: "showTeam",     label: "Mostrar sección de equipo",  desc: "Muestra nombres y fotos del equipo" },
          { key: "showTimeline", label: "Mostrar línea de tiempo",    desc: "Hitos importantes de la marca" },
        ].map(({ key, label, desc }) => (
          <div className="toggle-field" key={key}>
            <div className="toggle-field__info">
              <span className="toggle-field__label">{label}</span>
              <span className="toggle-field__desc">{desc}</span>
            </div>
            <label className="toggle-wrap">
              <input type="checkbox" checked={data[key]} onChange={e => set(key, e.target.checked)} />
              <span className="toggle-track" /><span className="toggle-thumb" />
            </label>
          </div>
        ))}
      </div>

      <div className="cms-save-row">
        <button className="btn-cms-back" onClick={handleBack}>← Volver al CMS</button>
        <button className="btn-cms-save" onClick={handleSave} disabled={saving}>
          {saving ? "Guardando..." : "GUARDAR CAMBIOS"}
        </button>
      </div>
    </div>
  );

  const toast$ = <div className={`cms-toast ${toast ? "show" : ""}`}>{toastMsg}</div>;

  // ── Admin mode ────────────────────────────────────────────────────────────
  if (isAdminMode) {
    return (
      <>
        <header className="admin-nav" style={{ position: "relative", marginBottom: 8 }}>
          <button onClick={handleBack} className="btn-back-arrow">←</button>
          <div className="brand">Quiénes Somos <span>CMS</span></div>
          <button className="btn-save-top" onClick={handleSave} disabled={saving}>
            {saving ? "..." : "GUARDAR"}
          </button>
        </header>
        {form}
        {toast$}
      </>
    );
  }

  // ── Wizard mode ───────────────────────────────────────────────────────────
  return (
    <div className="admin-frame">
      <header className="admin-nav">
        <button onClick={handleBack} className="btn-back-arrow" title="Volver">←</button>
        <div className="brand">{state.store?.name ?? "VEXIO"} <span>STUDIO V3</span></div>
        <button className="btn-save-top" onClick={handleSave} disabled={saving}>
          {saving ? "..." : "GUARDAR"}
        </button>
      </header>
      <StepProgress />
      {form}
      {toast$}
    </div>
  );
}
