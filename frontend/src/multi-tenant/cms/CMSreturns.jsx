/**
 * CMSReturns.jsx — Política de Devoluciones
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../pages/StoreContext";
import StepProgress from "../components/StepProgress";
import "../components/styles/CMSeditor.css";

const DEFAULT = {
  title: "Política de Devoluciones y Cambios",
  intro: "",
  days: "30",
  conditions: "",
  process: "",
  exceptions: "",
  refundMethod: "original",
  allowExchanges: true,
  allowRefunds: true,
  requireReceipt: true,
  contactEmail: "",
};

const REFUND_OPTIONS = [
  { value: "original", label: "Método de pago original" },
  { value: "store", label: "Crédito en tienda" },
  { value: "both", label: "Ambas opciones" },
];

export default function CMSReturns() {
  const navigate = useNavigate();
  const { state, saveProgress } = useStore();

  const [data, setData] = useState(state.cms?.returns ?? DEFAULT);
  const [toast, setToast] = useState(false);

  const set = (k, v) => setData((p) => ({ ...p, [k]: v }));

  const handleSave = () => {
    const prevCms = state.cms ?? {};
    saveProgress("cms", {
      ...prevCms,
      returns: data,
      completed: [...new Set([...(prevCms.completed ?? []), "returns"])],
    });
    setToast(true);
    setTimeout(() => setToast(false), 2200);
  };

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

      <div className="cms-page cms-page--returns">
        <div className="cms-page__header">
          <div className="cms-page__icon">
            <i className="ti ti-arrow-back-up" />
          </div>
          <div className="cms-page__titles">
            <h1 className="cms-page__title">Devoluciones</h1>
            <p className="cms-page__sub">
              Define tu política de cambios, devoluciones y reembolsos
            </p>
          </div>
        </div>

        {/* Configuración rápida */}
        <div className="cms-form-card">
          <p className="cms-section-title">Configuración Rápida</p>

          <div className="field-row-2">
            <div className="field-group">
              <label>Días para Devolución</label>
              <input
                className="f-input-dark"
                placeholder="30"
                value={data.days}
                onChange={(e) => set("days", e.target.value)}
              />
            </div>
            <div className="field-group">
              <label>Correo de Devoluciones</label>
              <input
                className="f-input-dark"
                placeholder="devoluciones@mitienda.com"
                type="email"
                value={data.contactEmail}
                onChange={(e) => set("contactEmail", e.target.value)}
              />
            </div>
          </div>

          <div className="field-group">
            <label>Método de Reembolso</label>
            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                marginTop: 4,
              }}
            >
              {REFUND_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => set("refundMethod", opt.value)}
                  style={{
                    background:
                      data.refundMethod === opt.value ? "#ff6b6b22" : "#0a0a0a",
                    border: `1px solid ${
                      data.refundMethod === opt.value ? "#ff6b6b" : "#2a2a2a"
                    }`,
                    color: data.refundMethod === opt.value ? "#ff6b6b" : "#666",
                    borderRadius: 8,
                    padding: "8px 16px",
                    fontFamily: "Inter",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="toggle-field">
            <div className="toggle-field__info">
              <span className="toggle-field__label">Permitir cambios</span>
              <span className="toggle-field__desc">
                Los clientes pueden cambiar productos por talla u otro artículo
              </span>
            </div>
            <label className="toggle-wrap">
              <input
                type="checkbox"
                checked={data.allowExchanges}
                onChange={(e) => set("allowExchanges", e.target.checked)}
              />
              <span className="toggle-track" />
              <span className="toggle-thumb" />
            </label>
          </div>

          <div className="toggle-field">
            <div className="toggle-field__info">
              <span className="toggle-field__label">
                Permitir devoluciones con reembolso
              </span>
              <span className="toggle-field__desc">
                Reembolso al método de pago original
              </span>
            </div>
            <label className="toggle-wrap">
              <input
                type="checkbox"
                checked={data.allowRefunds}
                onChange={(e) => set("allowRefunds", e.target.checked)}
              />
              <span className="toggle-track" />
              <span className="toggle-thumb" />
            </label>
          </div>

          <div className="toggle-field">
            <div className="toggle-field__info">
              <span className="toggle-field__label">
                Requerir comprobante de compra
              </span>
              <span className="toggle-field__desc">
                Exige factura o número de pedido para procesar
              </span>
            </div>
            <label className="toggle-wrap">
              <input
                type="checkbox"
                checked={data.requireReceipt}
                onChange={(e) => set("requireReceipt", e.target.checked)}
              />
              <span className="toggle-track" />
              <span className="toggle-thumb" />
            </label>
          </div>
        </div>

        {/* Texto de la política */}
        <div className="cms-form-card">
          <p className="cms-section-title">Texto de la Política</p>

          <div className="field-group">
            <label>Título de la Página</label>
            <input
              className="f-input-dark"
              value={data.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </div>

          <div className="field-group">
            <label>Introducción</label>
            <textarea
              className="f-textarea-dark"
              placeholder="Breve descripción de tu política de devoluciones..."
              value={data.intro}
              onChange={(e) => set("intro", e.target.value)}
            />
          </div>

          <div className="field-group">
            <label>Condiciones para Devolución</label>
            <textarea
              className="f-textarea-dark"
              placeholder="- Producto sin uso&#10;- Etiquetas originales&#10;- Empaque original..."
              value={data.conditions}
              onChange={(e) => set("conditions", e.target.value)}
            />
          </div>

          <div className="field-group">
            <label>Proceso de Devolución</label>
            <textarea
              className="f-textarea-dark"
              placeholder="1. Contacta a nuestro equipo&#10;2. Envía el producto...&#10;3. Recibirás tu reembolso en..."
              value={data.process}
              onChange={(e) => set("process", e.target.value)}
            />
          </div>

          <div className="field-group">
            <label>Excepciones (productos no aplicables)</label>
            <textarea
              className="f-textarea-dark"
              placeholder="Ej: Ropa interior, productos en oferta final, artículos personalizados..."
              value={data.exceptions}
              onChange={(e) => set("exceptions", e.target.value)}
            />
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
        ✓ Política de devoluciones guardada
      </div>
    </div>
  );
}
