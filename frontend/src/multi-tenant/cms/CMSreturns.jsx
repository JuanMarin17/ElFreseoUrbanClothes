/**
 * CMSReturns.jsx — Política de Devoluciones
 * Modo wizard : StoreContext
 * Modo admin  : GET + PATCH /stores/cms
 * Nota: el campo `days` es number en el backend pero string en el input.
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "../pages/StoreContext";
import { getCms, patchCms } from "../pages/services/cmsService";
import StepProgress from "../components/StepProgress";
import "../components/styles/CMSeditor.css";

const DEFAULT = {
  title: "Política de Devoluciones y Cambios",
  intro: "", days: "30", conditions: "", process: "", exceptions: "",
  refundMethod: "original", allowExchanges: true, allowRefunds: true,
  requireReceipt: true, contactEmail: "",
};

const REFUND_OPTIONS = [
  { value: "original", label: "Método de pago original" },
  { value: "store",    label: "Crédito en tienda"       },
  { value: "both",     label: "Ambas opciones"          },
];

export default function CMSReturns() {
  const navigate    = useNavigate();
  const { slug }    = useParams();
  const isAdminMode = !!slug;
  const storeId     = isAdminMode ? localStorage.getItem("storeId") : null;
  const { state, saveProgress } = useStore();

  const [data,    setData]    = useState(isAdminMode ? DEFAULT : (state.cms?.returns ?? DEFAULT));
  const [toast,   setToast]   = useState(false);
  const [toastMsg,setToastMsg]= useState("");
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    if (!isAdminMode || !storeId) return;
    getCms(storeId)
      .then(cms => {
        if (!cms?.returns) return;
        // days llega como number desde el backend → convertir a string para el input
        setData({ ...DEFAULT, ...cms.returns, days: String(cms.returns.days ?? 30) });
      })
      .catch(() => {});
  }, []);

  const set = (k, v) => setData(p => ({ ...p, [k]: v }));

  const showToast = (msg) => { setToastMsg(msg); setToast(true); setTimeout(() => setToast(false), 2200); };

  const handleBack = () => navigate(isAdminMode ? `/tienda/${slug}/admin/cms` : "/cms");

  const handleSave = async () => {
    setSaving(true);
    // days se envía como number al backend
    const payload = { ...data, days: Number(data.days) || 30 };
    try {
      if (isAdminMode && storeId) {
        await patchCms(storeId, { returns: payload });
      } else {
        const prev = state.cms ?? {};
        saveProgress("cms", { ...prev, returns: data, completed: [...new Set([...(prev.completed ?? []), "returns"])] });
      }
      showToast("✓ Política de devoluciones guardada");
    } catch {
      showToast("✗ Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  // ── Formulario ────────────────────────────────────────────────────────────
  const form = (
    <div className="cms-page cms-page--returns">
      {!isAdminMode && (
        <div className="cms-page__header">
          <div className="cms-page__icon"><i className="ti ti-arrow-back-up" /></div>
          <div className="cms-page__titles">
            <h1 className="cms-page__title">Devoluciones</h1>
            <p className="cms-page__sub">Define tu política de cambios, devoluciones y reembolsos</p>
          </div>
        </div>
      )}

      <div className="cms-form-card">
        <p className="cms-section-title">Configuración Rápida</p>
        <div className="field-row-2">
          <div className="field-group">
            <label>Días para Devolución</label>
            <input className="f-input-dark" placeholder="30" value={data.days}
              onChange={e => set("days", e.target.value)} />
          </div>
          <div className="field-group">
            <label>Correo de Devoluciones</label>
            <input className="f-input-dark" type="email" placeholder="devoluciones@mitienda.com"
              value={data.contactEmail} onChange={e => set("contactEmail", e.target.value)} />
          </div>
        </div>

        <div className="field-group">
          <label>Método de Reembolso</label>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
            {REFUND_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => set("refundMethod", opt.value)} style={{
                background: data.refundMethod === opt.value ? "#ff6b6b22" : "#0a0a0a",
                border: `1px solid ${data.refundMethod === opt.value ? "#ff6b6b" : "#2a2a2a"}`,
                color: data.refundMethod === opt.value ? "#ff6b6b" : "#666",
                borderRadius: 8, padding: "8px 16px", fontFamily: "Inter",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}>{opt.label}</button>
            ))}
          </div>
        </div>

        {[
          { key: "allowExchanges",  label: "Permitir cambios",                     desc: "Los clientes pueden cambiar productos por talla u otro artículo" },
          { key: "allowRefunds",    label: "Permitir devoluciones con reembolso",   desc: "Reembolso al método de pago original" },
          { key: "requireReceipt",  label: "Requerir comprobante de compra",        desc: "Exige factura o número de pedido para procesar" },
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

      <div className="cms-form-card">
        <p className="cms-section-title">Texto de la Política</p>
        <div className="field-group">
          <label>Título de la Página</label>
          <input className="f-input-dark" value={data.title} onChange={e => set("title", e.target.value)} />
        </div>
        <div className="field-group">
          <label>Introducción</label>
          <textarea className="f-textarea-dark" placeholder="Breve descripción de tu política..."
            value={data.intro} onChange={e => set("intro", e.target.value)} />
        </div>
        <div className="field-group">
          <label>Condiciones para Devolución</label>
          <textarea className="f-textarea-dark" placeholder="- Producto sin uso&#10;- Etiquetas originales..."
            value={data.conditions} onChange={e => set("conditions", e.target.value)} />
        </div>
        <div className="field-group">
          <label>Proceso de Devolución</label>
          <textarea className="f-textarea-dark" placeholder="1. Contacta a nuestro equipo&#10;2. Envía el producto..."
            value={data.process} onChange={e => set("process", e.target.value)} />
        </div>
        <div className="field-group">
          <label>Excepciones (productos no aplicables)</label>
          <textarea className="f-textarea-dark" placeholder="Ej: Ropa interior, productos en oferta final..."
            value={data.exceptions} onChange={e => set("exceptions", e.target.value)} />
        </div>
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
          <div className="brand">Devoluciones <span>CMS</span></div>
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
