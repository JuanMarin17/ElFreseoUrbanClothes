import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Loader2, Check, X, Filter, Eye } from 'lucide-react';
import { getAllReturns, updateReturnStatus } from '../../../../../utils/returnsService';
import './AdminReturnsPage.css';

const STATUS_OPTS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'];

const STATUS_LABELS = {
  ALL:      'Todos',
  PENDING:  'Pendientes',
  APPROVED: 'Aprobadas',
  REJECTED: 'Rechazadas',
};

const STATUS_COLORS = {
  PENDING:  { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  APPROVED: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)'   },
  REJECTED: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)'    },
};

function relDate(iso) {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(new Date(iso));
}

function ActionModal({ ret, onClose, onUpdate }) {
  const [status, setStatus] = useState(ret.status ?? 'PENDING');
  const [note, setNote]     = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await updateReturnStatus(ret.id, status, note);
      onUpdate(ret.id, status);
      onClose();
    } catch (e) {
      setError(e.message ?? 'Error al actualizar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="adr-overlay" onClick={onClose}>
      <div className="adr-modal" onClick={e => e.stopPropagation()}>
        <div className="adr-modal-header">
          <h3>Gestionar devolución</h3>
          <button onClick={onClose} className="adr-close-btn"><X size={15} /></button>
        </div>
        <div className="adr-modal-body">
          <div className="adr-detail">
            <p className="adr-detail-id">ID: <strong>{ret.id}</strong></p>
            <p className="adr-detail-reason">Motivo: <strong>{ret.reason ?? '—'}</strong></p>
            {ret.description && <p className="adr-detail-desc">{ret.description}</p>}
            {ret.imageUrl && (
              <img src={ret.imageUrl} alt="Foto del producto" className="adr-img" />
            )}
          </div>

          <div className="adr-field">
            <label>Estado</label>
            <div className="adr-status-opts">
              {['PENDING', 'APPROVED', 'REJECTED'].map(s => (
                <button
                  key={s}
                  className={`adr-status-btn ${status === s ? 'active' : ''}`}
                  data-status={s}
                  onClick={() => setStatus(s)}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          <div className="adr-field">
            <label>Nota interna (opcional)</label>
            <textarea
              className="adr-textarea"
              placeholder="Motivo de aprobación o rechazo..."
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>

          {error && <div className="adr-error">{error}</div>}
        </div>
        <div className="adr-modal-footer">
          <button className="adr-btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="adr-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 size={13} className="adr-spin" /> : <Check size={13} />}
            <span>{saving ? 'Guardando…' : 'Guardar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminReturnsPage() {
  const [returns, setReturns]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [filter, setFilter]       = useState('ALL');
  const [selected, setSelected]   = useState(null);

  const load = useCallback(async (status) => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllReturns(1, 50, status === 'ALL' ? undefined : status);
      const list = Array.isArray(data) ? data
        : Array.isArray(data?.data)    ? data.data
        : Array.isArray(data?.content) ? data.content
        : [];
      setReturns(list);
    } catch (e) {
      setError(e.message ?? 'No se pudieron cargar las devoluciones.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(filter); }, [load, filter]);

  const handleUpdate = (id, newStatus) => {
    setReturns(list => list.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  return (
    <div className="adr-root">
      <div className="adr-header">
        <div>
          <p className="adr-eyebrow">Panel de administración</p>
          <h1 className="adr-title">Devoluciones</h1>
          <p className="adr-subtitle">Revisá y gestioná las solicitudes de devolución de tus clientes.</p>
        </div>
        <button className="adr-refresh-btn" onClick={() => load(filter)} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'adr-spin' : ''} />
        </button>
      </div>

      {/* Filtros */}
      <div className="adr-filters">
        <Filter size={14} className="adr-filter-icon" />
        {STATUS_OPTS.map(s => (
          <button
            key={s}
            className={`adr-filter-btn ${filter === s ? 'active' : ''}`}
            onClick={() => setFilter(s)}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {error && <div className="adr-error-banner">{error}</div>}

      <div className="adr-table-card">
        {loading ? (
          <div className="adr-loading">
            <Loader2 size={20} className="adr-spin" /> Cargando...
          </div>
        ) : returns.length === 0 ? (
          <div className="adr-empty">
            <RefreshCw size={32} className="adr-empty-icon" />
            <p className="adr-empty-title">Sin devoluciones</p>
            <p className="adr-empty-sub">No hay solicitudes con el filtro seleccionado.</p>
          </div>
        ) : (
          <div className="adr-table-wrap">
            <table className="adr-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Motivo</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {returns.map((r, i) => {
                  const sc = STATUS_COLORS[r.status] ?? STATUS_COLORS.PENDING;
                  return (
                    <tr key={r.id ?? i} className="adr-row" onClick={() => setSelected(r)}>
                      <td className="adr-cell-id">#{r.id?.slice(-8) ?? '—'}</td>
                      <td>{r.userName ?? r.userId ?? '—'}</td>
                      <td>{r.reason ?? '—'}</td>
                      <td>
                        <span className="adr-status-tag" style={{ color: sc.color, background: sc.bg }}>
                          {STATUS_LABELS[r.status] ?? r.status}
                        </span>
                      </td>
                      <td className="adr-cell-date">{relDate(r.createdAt)}</td>
                      <td>
                        <button className="adr-view-btn" title="Gestionar">
                          <Eye size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <ActionModal
          ret={selected}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}
