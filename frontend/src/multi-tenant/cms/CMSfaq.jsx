/**
 * CMSFAQ.jsx — Preguntas Frecuentes / Ayuda
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../pages/StoreContext";
import StepProgress from "../components/StepProgress";
import "../components/styles/CMSeditor.css";

const EMPTY_FAQ = () => ({
  id: Date.now() + Math.random(),
  question: "",
  answer: "",
  category: "general",
});

const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "pedidos", label: "Pedidos" },
  { value: "pagos", label: "Pagos" },
  { value: "envios", label: "Envíos" },
  { value: "productos", label: "Productos" },
];

const STARTER_FAQS = [
  {
    id: 1,
    question: "¿Cuánto tarda en llegar mi pedido?",
    answer:
      "Los pedidos se procesan en 1-2 días hábiles y el envío tarda entre 3-7 días dependiendo de tu ciudad.",
    category: "envios",
  },
  {
    id: 2,
    question: "¿Cómo puedo rastrear mi pedido?",
    answer:
      "Una vez despachado tu pedido, recibirás un correo con el número de guía para rastrearlo.",
    category: "pedidos",
  },
  {
    id: 3,
    question: "¿Qué métodos de pago aceptan?",
    answer:
      "Aceptamos tarjetas de crédito/débito, transferencias bancarias y pagos contra entrega en ciudades principales.",
    category: "pagos",
  },
];

export default function CMSFAQ() {
  const navigate = useNavigate();
  const { state, saveProgress } = useStore();

  const [faqs, setFaqs] = useState(
    state.cms?.faq?.items?.length ? state.cms.faq.items : STARTER_FAQS,
  );
  const [pageTitle, setPageTitle] = useState(
    state.cms?.faq?.pageTitle ?? "Preguntas Frecuentes",
  );
  const [pageSubtitle, setPageSubtitle] = useState(
    state.cms?.faq?.pageSubtitle ??
      "Encuentra respuestas a las preguntas más comunes",
  );
  const [showSearch, setShowSearch] = useState(
    state.cms?.faq?.showSearch ?? true,
  );
  const [activeFilter, setActiveFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [toast, setToast] = useState(false);

  const updateFaq = (id, field, value) =>
    setFaqs((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: value } : f)),
    );

  const removeFaq = (id) => setFaqs((prev) => prev.filter((f) => f.id !== id));

  const addFaq = () => {
    const nw = EMPTY_FAQ();
    setFaqs((prev) => [...prev, nw]);
    setExpandedId(nw.id);
  };

  const handleSave = () => {
    const prevCms = state.cms ?? {};
    saveProgress("cms", {
      ...prevCms,
      faq: { items: faqs, pageTitle, pageSubtitle, showSearch },
      completed: [...new Set([...(prevCms.completed ?? []), "faq"])],
    });
    setToast(true);
    setTimeout(() => setToast(false), 2200);
  };

  const filtered =
    activeFilter === "all"
      ? faqs
      : faqs.filter((f) => f.category === activeFilter);

  return (
    <div className="admin-frame">
      <header className="admin-nav">
        <button onClick={() => navigate("/cms")} className="btn-back-arrow">
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

      <div className="cms-page cms-page--faq">
        <div className="cms-page__header">
          <div className="cms-page__icon">
            <i className="ti ti-help-circle" />
          </div>
          <div className="cms-page__titles">
            <h1 className="cms-page__title">Ayuda / FAQ</h1>
            <p className="cms-page__sub">
              Gestiona las preguntas frecuentes de tu tienda
            </p>
          </div>
        </div>

        {/* Encabezado de la página */}
        <div className="cms-form-card">
          <p className="cms-section-title">Configuración de la Página</p>

          <div className="field-group">
            <label>Título de la Página</label>
            <input
              className="f-input-dark"
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
            />
          </div>

          <div className="field-group">
            <label>Subtítulo</label>
            <input
              className="f-input-dark"
              value={pageSubtitle}
              onChange={(e) => setPageSubtitle(e.target.value)}
            />
          </div>

          <div className="toggle-field">
            <div className="toggle-field__info">
              <span className="toggle-field__label">
                Activar buscador en FAQ
              </span>
              <span className="toggle-field__desc">
                Los clientes podrán buscar entre las preguntas
              </span>
            </div>
            <label className="toggle-wrap">
              <input
                type="checkbox"
                checked={showSearch}
                onChange={(e) => setShowSearch(e.target.checked)}
              />
              <span className="toggle-track" />
              <span className="toggle-thumb" />
            </label>
          </div>
        </div>

        {/* Preguntas */}
        <div className="cms-form-card">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <p className="cms-section-title" style={{ margin: 0 }}>
              Preguntas ({faqs.length})
            </p>
            {/* Filtro por categoría */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <button
                onClick={() => setActiveFilter("all")}
                style={{
                  background:
                    activeFilter === "all" ? "#4ecdc422" : "transparent",
                  border: `1px solid ${activeFilter === "all" ? "#4ecdc4" : "#2a2a2a"}`,
                  color: activeFilter === "all" ? "#4ecdc4" : "#555",
                  borderRadius: 6,
                  padding: "4px 10px",
                  fontFamily: "Inter",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                  letterSpacing: 1,
                  transition: "all 0.2s",
                }}
              >
                TODOS
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setActiveFilter(cat.value)}
                  style={{
                    background:
                      activeFilter === cat.value ? "#4ecdc422" : "transparent",
                    border: `1px solid ${
                      activeFilter === cat.value ? "#4ecdc4" : "#2a2a2a"
                    }`,
                    color: activeFilter === cat.value ? "#4ecdc4" : "#555",
                    borderRadius: 6,
                    padding: "4px 10px",
                    fontFamily: "Inter",
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                    letterSpacing: 1,
                    transition: "all 0.2s",
                  }}
                >
                  {cat.label.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="cms-list">
            {filtered.map((faq, idx) => (
              <div
                key={faq.id}
                className="cms-list-item"
                style={{
                  borderColor: expandedId === faq.id ? "#4ecdc444" : undefined,
                }}
              >
                {/* Header del FAQ item */}
                <div
                  className="cms-list-item__header"
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    setExpandedId(expandedId === faq.id ? null : faq.id)
                  }
                >
                  <div className="cms-list-item__num">{idx + 1}</div>
                  <span
                    style={{
                      fontFamily: "Inter",
                      fontSize: 13,
                      color: faq.question ? "#ccc" : "#555",
                      flex: 1,
                      fontWeight: faq.question ? 500 : 400,
                    }}
                  >
                    {faq.question || "Nueva pregunta..."}
                  </span>
                  <span
                    style={{
                      color: "#555",
                      fontSize: 16,
                      transition: "transform 0.2s",
                      transform:
                        expandedId === faq.id ? "rotate(180deg)" : "none",
                    }}
                  >
                    ↓
                  </span>
                  <button
                    className="cms-list-item__remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFaq(faq.id);
                    }}
                  >
                    ×
                  </button>
                </div>

                {/* Campos expandidos */}
                {expandedId === faq.id && (
                  <div style={{ marginTop: 8 }}>
                    <div className="field-group">
                      <label>Categoría</label>
                      <div
                        style={{ display: "flex", gap: 6, flexWrap: "wrap" }}
                      >
                        {CATEGORIES.map((cat) => (
                          <button
                            key={cat.value}
                            onClick={() =>
                              updateFaq(faq.id, "category", cat.value)
                            }
                            style={{
                              background:
                                faq.category === cat.value
                                  ? "#4ecdc422"
                                  : "#0a0a0a",
                              border: `1px solid ${
                                faq.category === cat.value
                                  ? "#4ecdc4"
                                  : "#2a2a2a"
                              }`,
                              color:
                                faq.category === cat.value ? "#4ecdc4" : "#555",
                              borderRadius: 6,
                              padding: "5px 12px",
                              fontFamily: "Inter",
                              fontSize: 12,
                              cursor: "pointer",
                              transition: "all 0.2s",
                            }}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="field-group">
                      <label>Pregunta</label>
                      <input
                        className="f-input-dark"
                        placeholder="¿Cuál es la pregunta?"
                        value={faq.question}
                        onChange={(e) =>
                          updateFaq(faq.id, "question", e.target.value)
                        }
                      />
                    </div>

                    <div className="field-group">
                      <label>Respuesta</label>
                      <textarea
                        className="f-textarea-dark"
                        placeholder="Escribe la respuesta completa aquí..."
                        value={faq.answer}
                        onChange={(e) =>
                          updateFaq(faq.id, "answer", e.target.value)
                        }
                        style={{ minHeight: 80 }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button className="btn-add-item" onClick={addFaq}>
            + AGREGAR PREGUNTA
          </button>
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
        ✓ FAQ guardado correctamente
      </div>
    </div>
  );
}
