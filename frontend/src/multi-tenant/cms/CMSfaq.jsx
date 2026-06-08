/**
 * CMSFAQ.jsx — Preguntas Frecuentes
 * Modo wizard : StoreContext
 * Modo admin  : GET + PATCH /stores/cms
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "../pages/StoreContext";
import { getCms, patchCms } from "../pages/services/cmsService";
import StepProgress from "../components/StepProgress";
import "../components/styles/CMSeditor.css";

const CATEGORIES = [
  { value: "general",  label: "General"   },
  { value: "pedidos",  label: "Pedidos"   },
  { value: "pagos",    label: "Pagos"     },
  { value: "envios",   label: "Envíos"    },
  { value: "productos",label: "Productos" },
];

const EMPTY_FAQ = () => ({ id: Date.now() + Math.random(), question: "", answer: "", category: "general" });

const STARTER_FAQS = [
  { id: 1, question: "¿Cuánto tarda en llegar mi pedido?",    answer: "Los pedidos se procesan en 1-2 días hábiles y el envío tarda entre 3-7 días.", category: "envios"  },
  { id: 2, question: "¿Cómo puedo rastrear mi pedido?",       answer: "Una vez despachado recibirás un correo con el número de guía.",                 category: "pedidos" },
  { id: 3, question: "¿Qué métodos de pago aceptan?",         answer: "Aceptamos tarjetas, transferencias y pagos contra entrega.",                    category: "pagos"   },
];

export default function CMSFAQ() {
  const navigate    = useNavigate();
  const { slug }    = useParams();
  const isAdminMode = !!slug;
  const storeId     = isAdminMode ? localStorage.getItem("storeId") : null;
  const { state, saveProgress } = useStore();

  const initFaqs = () => {
    if (isAdminMode) return STARTER_FAQS;
    return state.cms?.faq?.items?.length ? state.cms.faq.items : STARTER_FAQS;
  };

  const [faqs,        setFaqs]        = useState(initFaqs);
  const [pageTitle,   setPageTitle]   = useState(isAdminMode ? "Preguntas Frecuentes" : (state.cms?.faq?.pageTitle    ?? "Preguntas Frecuentes"));
  const [pageSubtitle,setPageSubtitle]= useState(isAdminMode ? "Encuentra respuestas a las preguntas más comunes" : (state.cms?.faq?.pageSubtitle ?? "Encuentra respuestas a las preguntas más comunes"));
  const [showSearch,  setShowSearch]  = useState(isAdminMode ? true : (state.cms?.faq?.showSearch ?? true));
  const [activeFilter,setActiveFilter]= useState("all");
  const [expandedId,  setExpandedId]  = useState(null);
  const [toast,       setToast]       = useState(false);
  const [toastMsg,    setToastMsg]    = useState("");
  const [saving,      setSaving]      = useState(false);

  useEffect(() => {
    if (!isAdminMode || !storeId) return;
    getCms(storeId)
      .then(cms => {
        if (!cms?.faq) return;
        const { items, pageTitle: pt, pageSubtitle: ps, showSearch: ss } = cms.faq;
        if (items?.length) setFaqs(items.map((f, i) => ({ ...f, id: f.id ?? i })));
        if (pt) setPageTitle(pt);
        if (ps) setPageSubtitle(ps);
        if (ss !== undefined) setShowSearch(ss);
      })
      .catch(() => {});
  }, []);

  const updateFaq = (id, field, val) =>
    setFaqs(prev => prev.map(f => f.id === id ? { ...f, [field]: val } : f));
  const removeFaq = (id) => setFaqs(prev => prev.filter(f => f.id !== id));
  const addFaq    = ()   => { const nw = EMPTY_FAQ(); setFaqs(p => [...p, nw]); setExpandedId(nw.id); };

  const showToast = (msg) => { setToastMsg(msg); setToast(true); setTimeout(() => setToast(false), 2200); };

  const handleBack = () => navigate(isAdminMode ? `/tienda/${slug}/admin/cms` : "/cms");

  const handleSave = async () => {
    setSaving(true);
    const faqData = {
      pageTitle, pageSubtitle, showSearch,
      items: faqs.map(({ id: _id, ...f }, i) => ({ ...f, sortOrder: i })),
    };
    try {
      if (isAdminMode && storeId) {
        await patchCms(storeId, { faq: faqData });
      } else {
        const prev = state.cms ?? {};
        saveProgress("cms", { ...prev, faq: faqData, completed: [...new Set([...(prev.completed ?? []), "faq"])] });
      }
      showToast("✓ FAQ guardado correctamente");
    } catch {
      showToast("✗ Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const filtered = activeFilter === "all" ? faqs : faqs.filter(f => f.category === activeFilter);

  // ── Formulario ────────────────────────────────────────────────────────────
  const form = (
    <div className="cms-page cms-page--faq">
      {!isAdminMode && (
        <div className="cms-page__header">
          <div className="cms-page__icon"><i className="ti ti-help-circle" /></div>
          <div className="cms-page__titles">
            <h1 className="cms-page__title">Ayuda / FAQ</h1>
            <p className="cms-page__sub">Gestiona las preguntas frecuentes de tu tienda</p>
          </div>
        </div>
      )}

      <div className="cms-form-card">
        <p className="cms-section-title">Configuración de la Página</p>
        <div className="field-group">
          <label>Título de la Página</label>
          <input className="f-input-dark" value={pageTitle} onChange={e => setPageTitle(e.target.value)} />
        </div>
        <div className="field-group">
          <label>Subtítulo</label>
          <input className="f-input-dark" value={pageSubtitle} onChange={e => setPageSubtitle(e.target.value)} />
        </div>
        <div className="toggle-field">
          <div className="toggle-field__info">
            <span className="toggle-field__label">Activar buscador en FAQ</span>
            <span className="toggle-field__desc">Los clientes podrán buscar entre las preguntas</span>
          </div>
          <label className="toggle-wrap">
            <input type="checkbox" checked={showSearch} onChange={e => setShowSearch(e.target.checked)} />
            <span className="toggle-track" /><span className="toggle-thumb" />
          </label>
        </div>
      </div>

      <div className="cms-form-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <p className="cms-section-title" style={{ margin: 0 }}>Preguntas ({faqs.length})</p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["all", ...CATEGORIES.map(c => c.value)].map(val => {
              const label = val === "all" ? "TODOS" : CATEGORIES.find(c => c.value === val)?.label.toUpperCase();
              return (
                <button key={val} onClick={() => setActiveFilter(val)} style={{
                  background: activeFilter === val ? "#4ecdc422" : "transparent",
                  border: `1px solid ${activeFilter === val ? "#4ecdc4" : "#2a2a2a"}`,
                  color: activeFilter === val ? "#4ecdc4" : "#555",
                  borderRadius: 6, padding: "4px 10px", fontFamily: "Inter",
                  fontSize: 11, fontWeight: 600, cursor: "pointer", letterSpacing: 1,
                }}>{label}</button>
              );
            })}
          </div>
        </div>

        <div className="cms-list">
          {filtered.map((faq, idx) => (
            <div key={faq.id} className="cms-list-item"
              style={{ borderColor: expandedId === faq.id ? "#4ecdc444" : undefined }}>
              <div className="cms-list-item__header" style={{ cursor: "pointer" }}
                onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}>
                <div className="cms-list-item__num">{idx + 1}</div>
                <span style={{ fontFamily: "Inter", fontSize: 13, color: faq.question ? "#ccc" : "#555", flex: 1, fontWeight: faq.question ? 500 : 400 }}>
                  {faq.question || "Nueva pregunta..."}
                </span>
                <span style={{ color: "#555", fontSize: 16, transition: "transform 0.2s", transform: expandedId === faq.id ? "rotate(180deg)" : "none" }}>↓</span>
                <button className="cms-list-item__remove" onClick={e => { e.stopPropagation(); removeFaq(faq.id); }}>×</button>
              </div>

              {expandedId === faq.id && (
                <div style={{ marginTop: 8 }}>
                  <div className="field-group">
                    <label>Categoría</label>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {CATEGORIES.map(cat => (
                        <button key={cat.value} onClick={() => updateFaq(faq.id, "category", cat.value)} style={{
                          background: faq.category === cat.value ? "#4ecdc422" : "#0a0a0a",
                          border: `1px solid ${faq.category === cat.value ? "#4ecdc4" : "#2a2a2a"}`,
                          color: faq.category === cat.value ? "#4ecdc4" : "#555",
                          borderRadius: 6, padding: "5px 12px", fontFamily: "Inter", fontSize: 12, cursor: "pointer",
                        }}>{cat.label}</button>
                      ))}
                    </div>
                  </div>
                  <div className="field-group">
                    <label>Pregunta</label>
                    <input className="f-input-dark" placeholder="¿Cuál es la pregunta?"
                      value={faq.question} onChange={e => updateFaq(faq.id, "question", e.target.value)} />
                  </div>
                  <div className="field-group">
                    <label>Respuesta</label>
                    <textarea className="f-textarea-dark" placeholder="Escribe la respuesta completa aquí..."
                      value={faq.answer} onChange={e => updateFaq(faq.id, "answer", e.target.value)} style={{ minHeight: 80 }} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <button className="btn-add-item" onClick={addFaq}>+ AGREGAR PREGUNTA</button>
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
          <div className="brand">Ayuda / FAQ <span>CMS</span></div>
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
