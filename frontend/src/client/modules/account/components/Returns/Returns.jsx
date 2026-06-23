import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Plus, X, Upload, Clock, CheckCircle2, XCircle, ChevronRight, Package, AlertCircle, ShoppingBag, Hash } from 'lucide-react';
import { getMyReturns, createReturn } from '../../../../../utils/returnsService';
import accountService from '../../services/accountService';
import './Returns.css';

const STATUS_MAP = {
  PENDING:  { label: 'Pendiente',  icon: Clock,          color: '#f59e0b', bg: 'rgba(245,158,11,0.1)'  },
  APPROVED: { label: 'Aprobada',   icon: CheckCircle2,   color: '#22c55e', bg: 'rgba(34,197,94,0.1)'   },
  REJECTED: { label: 'Rechazada',  icon: XCircle,        color: '#ef4444', bg: 'rgba(239,68,68,0.1)'   },
};

const REASONS = [
  'Producto defectuoso',
  'Producto diferente al pedido',
  'Talla incorrecta',
  'Cambié de opinión',
  'Llegó dañado',
  'Otro',
];

function relDate(iso) {
  if (!iso) return '';
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(new Date(iso));
}

function ReturnCard({ item }) {
  const s = STATUS_MAP[item.status] ?? STATUS_MAP.PENDING;
  const Icon = s.icon;
  return (
    <div className="ret-card">
      <div className="ret-card__icon"><Package size={18} /></div>
      <div className="ret-card__body">
        <div className="ret-card__top">
          <span className="ret-card__id">#{item.id?.slice(-8) ?? '—'}</span>
          <span className="ret-badge" style={{ color: s.color, background: s.bg }}>
            <Icon size={11} /> {s.label}
          </span>
        </div>
        <p className="ret-card__reason">{item.reason ?? '—'}</p>
        {item.description && <p className="ret-card__desc">{item.description}</p>}
        <p className="ret-card__date">{relDate(item.createdAt)}</p>
      </div>
      <ChevronRight size={15} className="ret-card__arrow" />
    </div>
  );
}

function fmtMoney(n) {
  return `$${Number(n ?? 0).toLocaleString('es-CO')}`;
}

export default function Returns() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [orderMode, setOrderMode] = useState('select'); // 'select' | 'manual'
  const [form, setForm] = useState({ orderId: '', reason: '', description: '', imageUrl: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileRef = useRef();

  const hasOrders = orders.length > 0;

  useEffect(() => {
    setLoading(true);
    getMyReturns()
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.data ?? data?.content ?? []);
        setReturns(list);
      })
      .catch(() => setReturns([]))
      .finally(() => setLoading(false));

    setLoadingOrders(true);
    accountService.getOrders()
      .then(({ data }) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setLoadingOrders(false));
  }, []);

  const openForm = () => {
    setOrderMode(hasOrders ? 'select' : 'manual');
    setShowForm(s => !s);
  };

  const handleSubmit = async () => {
    if (!form.orderId.trim() || !form.reason) {
      setError('La orden y el motivo son obligatorios.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const result = await createReturn(form);
      const newReturn = result?.data ?? result;
      setReturns(r => [newReturn, ...r]);
      setForm({ orderId: '', reason: '', description: '', imageUrl: '' });
      setShowForm(false);
      setSuccess('Solicitud enviada con éxito. Te notificaremos el resultado.');
      setTimeout(() => setSuccess(''), 5000);
    } catch (e) {
      setError(e.message ?? 'Error al enviar la solicitud. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ret-root">
      <div className="ret-header">
        <div>
          <p className="ret-eyebrow">Gestión de productos</p>
          <h2 className="ret-title">Mis Devoluciones</h2>
          <p className="ret-subtitle">Solicita el retorno de un producto y seguí el estado aquí.</p>
        </div>
        <button className="ret-new-btn" onClick={openForm}>
          {showForm ? <X size={15} /> : <Plus size={15} />}
          <span>{showForm ? 'Cancelar' : 'Nueva solicitud'}</span>
        </button>
      </div>

      {success && (
        <div className="ret-success-banner">
          <CheckCircle2 size={15} /> {success}
        </div>
      )}

      {showForm && (
        <div className="ret-form-card">
          <h3 className="ret-form-title">Solicitud de devolución</h3>

          <div className="ret-field">
            <label>¿Qué compra deseas devolver? *</label>

            {!loadingOrders && hasOrders && (
              <div className="ret-mode-tabs">
                <button
                  type="button"
                  className={`ret-mode-tab${orderMode === 'select' ? ' ret-mode-tab--on' : ''}`}
                  onClick={() => { setOrderMode('select'); setForm(f => ({ ...f, orderId: '' })); }}
                >
                  <ShoppingBag size={13} /> Seleccionar compra
                </button>
                <button
                  type="button"
                  className={`ret-mode-tab${orderMode === 'manual' ? ' ret-mode-tab--on' : ''}`}
                  onClick={() => { setOrderMode('manual'); setForm(f => ({ ...f, orderId: '' })); }}
                >
                  <Hash size={13} /> Número de guía
                </button>
              </div>
            )}

            {loadingOrders ? (
              <p className="ret-field-hint">Cargando tus compras…</p>
            ) : orderMode === 'select' && hasOrders ? (
              <select
                className="ret-input ret-select"
                value={form.orderId}
                onChange={e => setForm(f => ({ ...f, orderId: e.target.value }))}
              >
                <option value="">Seleccionar una compra...</option>
                {orders.map(o => (
                  <option key={o.id} value={o.id}>
                    Orden #{String(o.id).slice(-8)} — {o.date} — {o.status} — {fmtMoney(o.total)}
                  </option>
                ))}
              </select>
            ) : (
              <>
                <input
                  className="ret-input"
                  placeholder="Ej: abc123-... (número de guía o de orden)"
                  value={form.orderId}
                  onChange={e => setForm(f => ({ ...f, orderId: e.target.value }))}
                />
                {!hasOrders && (
                  <p className="ret-field-hint">
                    Aún no tienes pedidos registrados en esta tienda. Ingresa el número de guía o de orden que recibiste en tu confirmación de compra.
                  </p>
                )}
              </>
            )}
          </div>

          <div className="ret-field">
            <label>Motivo *</label>
            <select
              className="ret-input ret-select"
              value={form.reason}
              onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
            >
              <option value="">Seleccionar motivo...</option>
              {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="ret-field">
            <label>Descripción adicional</label>
            <textarea
              className="ret-input ret-textarea"
              placeholder="Describe el problema con más detalle..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div className="ret-field">
            <label>URL de foto del producto (opcional)</label>
            <input
              className="ret-input"
              placeholder="https://..."
              value={form.imageUrl}
              onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
            />
            <p className="ret-field-hint">Subí la imagen a cualquier servicio (Imgur, Cloudinary, etc.) y pegá el link.</p>
          </div>

          {error && (
            <div className="ret-error">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <div className="ret-form-footer">
            <button className="ret-submit-btn" onClick={handleSubmit} disabled={submitting}>
              {submitting ? <span className="ret-spinner" /> : <RefreshCw size={14} />}
              <span>{submitting ? 'Enviando…' : 'Enviar solicitud'}</span>
            </button>
          </div>
        </div>
      )}

      <div className="ret-list-card">
        <div className="ret-list-header">
          <RefreshCw size={14} />
          <span>Mis solicitudes</span>
          {returns.length > 0 && <span className="ret-count">{returns.length}</span>}
        </div>

        {loading ? (
          <div className="ret-loading">
            <span className="ret-spinner" /> Cargando...
          </div>
        ) : returns.length === 0 ? (
          <div className="ret-empty">
            <RefreshCw size={32} className="ret-empty-icon" />
            <p className="ret-empty-title">Sin solicitudes</p>
            <p className="ret-empty-sub">Cuando realices una solicitud de devolución aparecerá aquí con su estado.</p>
          </div>
        ) : (
          <div className="ret-list">
            {returns.map((item, i) => (
              <ReturnCard key={item.id ?? i} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
