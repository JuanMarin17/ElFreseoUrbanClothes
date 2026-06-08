/**
 * CMSContact.jsx — Contacto
 * Modo wizard : StoreContext
 * Modo admin  : GET + PATCH /stores/cms
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "../pages/StoreContext";
import { getCms, patchCms } from "../pages/services/cmsService";
import StepProgress from "../components/StepProgress";
import "../components/styles/CMSeditor.css";

const DEFAULT = {
  email: "", phone: "", whatsapp: "", instagram: "", tiktok: "",
  hours: "", formTitle: "Escríbenos", formSubtitle: "Respondemos en menos de 24 horas",
  showForm: true, showSocials: true,
};

export default function CMSContact() {
  const navigate    = useNavigate();
  const { slug }    = useParams();
  const isAdminMode = !!slug;
  const storeId     = isAdminMode ? localStorage.getItem("storeId") : null;
  const { state, saveProgress } = useStore();

  const [data,    setData]    = useState(isAdminMode ? DEFAULT : (state.cms?.contact ?? DEFAULT));
  const [toast,   setToast]   = useState(false);
  const [toastMsg,setToastMsg]= useState("");
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    if (!isAdminMode || !storeId) return;
    getCms(storeId)
      .then(cms => { if (cms?.contact) setData({ ...DEFAULT, ...cms.contact }); })
      .catch(() => {});
  }, []);

  const set = (k, v) => setData(p => ({ ...p, [k]: v }));

  const showToast = (msg) => { setToastMsg(msg); setToast(true); setTimeout(() => setToast(false), 2200); };

  const handleBack = () => navigate(isAdminMode ? `/tienda/${slug}/admin/cms` : "/cms");

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isAdminMode && storeId) {
        await patchCms(storeId, { contact: data });
      } else {
        const prev = state.cms ?? {};
        saveProgress("cms", { ...prev, contact: data, completed: [...new Set([...(prev.completed ?? []), "contact"])] });
      }
      showToast("✓ Contacto guardado correctamente");
    } catch {
      showToast("✗ Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  // ── Formulario ────────────────────────────────────────────────────────────
  const form = (
    <div className="cms-page cms-page--contact">
      {!isAdminMode && (
        <div className="cms-page__header">
          <div className="cms-page__icon"><i className="ti ti-mail" /></div>
          <div className="cms-page__titles">
            <h1 className="cms-page__title">Contacto</h1>
            <p className="cms-page__sub">Información de contacto y canales de comunicación</p>
          </div>
        </div>
      )}

      <div className="cms-form-card">
        <p className="cms-section-title">Información de Contacto</p>
        <div className="field-row-2">
          <div className="field-group">
            <label>Correo Electrónico</label>
            <input className="f-input-dark" type="email" placeholder="hola@mitienda.com"
              value={data.email} onChange={e => set("email", e.target.value)} />
          </div>
          <div className="field-group">
            <label>Teléfono</label>
            <input className="f-input-dark" placeholder="+57 300 000 0000"
              value={data.phone} onChange={e => set("phone", e.target.value)} />
          </div>
        </div>
        <div className="field-group">
          <label>WhatsApp</label>
          <input className="f-input-dark" placeholder="+57 300 000 0000 (con código de país)"
            value={data.whatsapp} onChange={e => set("whatsapp", e.target.value)} />
        </div>
        <div className="field-group">
          <label>Horario de Atención</label>
          <input className="f-input-dark" placeholder="Lun – Vie: 9am – 6pm | Sáb: 10am – 2pm"
            value={data.hours} onChange={e => set("hours", e.target.value)} />
        </div>
      </div>

      <div className="cms-form-card">
        <p className="cms-section-title">Redes Sociales</p>
        <div className="field-row-2">
          <div className="field-group">
            <label>Instagram</label>
            <input className="f-input-dark" placeholder="@mitienda"
              value={data.instagram} onChange={e => set("instagram", e.target.value)} />
          </div>
          <div className="field-group">
            <label>TikTok</label>
            <input className="f-input-dark" placeholder="@mitienda"
              value={data.tiktok} onChange={e => set("tiktok", e.target.value)} />
          </div>
        </div>
      </div>

      <div className="cms-form-card">
        <p className="cms-section-title">Formulario de Contacto</p>
        <div className="field-group">
          <label>Título del Formulario</label>
          <input className="f-input-dark" value={data.formTitle}
            onChange={e => set("formTitle", e.target.value)} />
        </div>
        <div className="field-group">
          <label>Subtítulo</label>
          <input className="f-input-dark" value={data.formSubtitle}
            onChange={e => set("formSubtitle", e.target.value)} />
        </div>
        {[
          { key: "showForm",    label: "Mostrar formulario",       desc: "Activa el formulario de contacto en tu tienda" },
          { key: "showSocials", label: "Mostrar redes sociales",   desc: "Muestra íconos de redes en la página de contacto" },
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

  if (isAdminMode) {
    return (
      <>
        <header className="admin-nav" style={{ position: "relative", marginBottom: 8 }}>
          <button onClick={handleBack} className="btn-back-arrow">←</button>
          <div className="brand">Contacto <span>CMS</span></div>
          <button className="btn-save-top" onClick={handleSave} disabled={saving}>
            {saving ? "..." : "GUARDAR"}
          </button>
        </header>
        {form}
        {toast$}
      </>
    );
  }

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
