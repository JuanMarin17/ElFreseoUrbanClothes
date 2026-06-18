import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import './TabShared.css';

const PAYMENT_OPTS = [
  { value: 'mercadopago', label: 'MercadoPago' },
  { value: 'stripe',      label: 'Stripe' },
  { value: 'efectivo',    label: 'Efectivo' },
];

const SHIPPING_OPTS = [
  { value: 'digital', label: 'Digital / Descarga' },
  { value: 'fisico',  label: 'Envío físico' },
  { value: 'ambos',   label: 'Ambos' },
];

const DEFAULT = {
  legalName:     '',
  idNumber:      '',
  documentName:  'CUIT',
  paymentMethod: 'mercadopago',
  shipping:      'fisico',
};

export default function SettingsLegal({ settings, onSave }) {
  const [form,   setForm]   = useState(DEFAULT);
  const [saving, setSaving] = useState(false);
  const [msg,    setMsg]    = useState(null);

  useEffect(() => {
    if (!settings) return;
    const legal   = settings.legal   ?? {};
    const payment = settings.payment ?? {};
    setForm(f => ({
      ...f,
      legalName:    legal.legalName    ?? '',
      idNumber:     legal.idNumber     ?? '',
      documentName: legal.documentName ?? 'CUIT',
      paymentMethod: payment.paymentMethod ?? 'mercadopago',
      shipping:      payment.shipping      ?? 'fisico',
    }));
  }, [settings]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const showMsg = (text, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3500);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        legal:   { legalName: form.legalName, idNumber: form.idNumber, documentName: form.documentName },
        payment: { paymentMethod: form.paymentMethod, shipping: form.shipping },
      });
      showMsg('Información legal guardada.');
    } catch (err) {
      showMsg(err.message ?? 'Error al guardar.', false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="tab-root">
      <div className="tab-card">
        <p className="tab-card-title">Datos legales</p>

        <div className="tab-field">
          <label>Razón social</label>
          <input
            className="tab-input"
            placeholder="Ej: Juan García S.R.L."
            value={form.legalName}
            onChange={e => set('legalName', e.target.value)}
          />
        </div>

        <div className="tab-grid-2">
          <div className="tab-field">
            <label>Tipo de documento</label>
            <select className="tab-select" value={form.documentName} onChange={e => set('documentName', e.target.value)}>
              <option value="CUIT">CUIT</option>
              <option value="DNI">DNI</option>
              <option value="RUT">RUT</option>
              <option value="RFC">RFC</option>
              <option value="NIT">NIT</option>
            </select>
          </div>
          <div className="tab-field">
            <label>Número de {form.documentName}</label>
            <input
              className="tab-input"
              placeholder="Ej: 20-12345678-9"
              value={form.idNumber}
              onChange={e => set('idNumber', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="tab-card">
        <p className="tab-card-title">Método de pago</p>
        <div className="legal-radio-group">
          {PAYMENT_OPTS.map(opt => (
            <label key={opt.value} className="legal-radio-opt">
              <input
                type="radio"
                name="paymentMethod"
                value={opt.value}
                checked={form.paymentMethod === opt.value}
                onChange={() => set('paymentMethod', opt.value)}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="tab-card">
        <p className="tab-card-title">Tipo de envío</p>
        <div className="legal-radio-group">
          {SHIPPING_OPTS.map(opt => (
            <label key={opt.value} className="legal-radio-opt">
              <input
                type="radio"
                name="shipping"
                value={opt.value}
                checked={form.shipping === opt.value}
                onChange={() => set('shipping', opt.value)}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="tab-save-bar">
        {msg && (
          <span className={`tab-save-msg ${msg.ok ? 'tab-save-msg--ok' : 'tab-save-msg--err'}`}>
            {msg.text}
          </span>
        )}
        <button className="tab-save-btn" onClick={handleSave} disabled={saving}>
          {saving ? <span className="tab-spinner" /> : <Save size={14} />}
          <span>{saving ? 'Guardando…' : 'Guardar información legal'}</span>
        </button>
      </div>
    </div>
  );
}
