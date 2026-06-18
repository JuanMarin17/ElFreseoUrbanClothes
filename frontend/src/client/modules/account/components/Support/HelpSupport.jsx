import React, { useState, useEffect, useRef } from 'react';
import { HelpCircle, Plus, ExternalLink, MessageSquare, History, Send, X, Package, CreditCard, RefreshCw, ShieldCheck } from 'lucide-react';
import accountService from '../../services/accountService';
import './HelpSupport.css';

const TICKET_STATUS = {
  Resuelto:    { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   label: 'Resuelto' },
  'En Espera': { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  label: 'En revisión' },
  Abierto:     { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  label: 'Abierto' },
};

const QUICK_TOPICS = [
  { icon: Package,     label: 'Problemas con mi pedido',   desc: 'Seguimiento, retrasos y cancelaciones' },
  { icon: CreditCard,  label: 'Pagos y facturación',        desc: 'Cobros, reembolsos y métodos de pago' },
  { icon: RefreshCw,   label: 'Devoluciones',               desc: 'Cómo gestionar una devolución' },
  { icon: ShieldCheck, label: 'Seguridad de la cuenta',     desc: 'Contraseña, acceso y privacidad' },
];

export default function HelpSupport() {
  const [tickets, setTickets]   = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ subject: '', message: '' });
  const [sending, setSending]   = useState(false);
  const revealRefs = useRef([]);

  useEffect(() => {
    accountService.getTickets()
      .then(({ data }) => setTickets(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const els = revealRefs.current.filter(Boolean);
    if (!els.length) return;
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('hs-in-view');
          obs.unobserve(e.target);
        }
      }),
      { threshold: 0.1 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [showForm]);

  const handleCreate = async () => {
    if (!form.subject.trim() || !form.message.trim()) return;
    setSending(true);
    try {
      const { data } = await accountService.createTicket(form);
      setTickets(t => [data, ...t]);
      setForm({ subject: '', message: '' });
      setShowForm(false);
    } catch {
      /* error silencioso */
    } finally {
      setSending(false);
    }
  };

  const handleTopicClick = (label) => {
    setForm(f => ({ ...f, subject: label }));
    setShowForm(true);
  };

  return (
    <div className="hs-root">

      {/* ── Header ── */}
      <div className="hs-header">
        <div>
          <p className="hs-eyebrow">Centro de soporte</p>
          <h2 className="hs-title">Ayuda y Soporte</h2>
          <p className="hs-subtitle">¿Tienes un problema? Estamos aquí para resolverlo.</p>
        </div>
        <button className="hs-new-btn" onClick={() => setShowForm(s => !s)}>
          {showForm ? <X size={16} /> : <Plus size={16} />}
          <span>{showForm ? 'Cancelar' : 'Nuevo ticket'}</span>
        </button>
      </div>

      {/* ── Atajos rápidos ── */}
      {!showForm && (
        <div className="hs-topics hs-reveal" ref={el => { revealRefs.current[0] = el; }}>
          {QUICK_TOPICS.map(({ icon: Icon, label, desc }, i) => (
            <button key={label} className="hs-topic-card" onClick={() => handleTopicClick(label)} style={{ '--delay': `${i * 70}ms` }}>
              <span className="hs-topic-icon"><Icon size={18} /></span>
              <div>
                <p className="hs-topic-label">{label}</p>
                <p className="hs-topic-desc">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ── Formulario ── */}
      {showForm && (
        <div className="hs-form-card hs-animate-in">
          <div className="hs-card-header">
            <MessageSquare size={15} />
            <span>Nuevo ticket de soporte</span>
          </div>
          <div className="hs-form-body">
            <div className="hs-field">
              <label>Asunto</label>
              <input
                className="hs-input"
                placeholder="Ej: Problema con mi pedido #1234"
                value={form.subject}
                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              />
            </div>
            <div className="hs-field">
              <label>Describe tu problema</label>
              <textarea
                className="hs-input hs-textarea"
                placeholder="Cuéntanos con detalle qué pasó para poder ayudarte más rápido..."
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              />
            </div>
            <div className="hs-form-footer">
              <p className="hs-form-hint">Tiempo de respuesta habitual: menos de 24 h</p>
              <button
                className="hs-submit-btn"
                onClick={handleCreate}
                disabled={sending || !form.subject.trim() || !form.message.trim()}
              >
                {sending ? <span className="hs-spinner" /> : <Send size={15} />}
                <span>{sending ? 'Enviando…' : 'Enviar ticket'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Historial de Tickets ── */}
      <div className="hs-history-card hs-reveal" ref={el => { revealRefs.current[1] = el; }}>
        <div className="hs-card-header">
          <History size={15} />
          <span>Mis tickets</span>
          {tickets.length > 0 && <span className="hs-count-badge">{tickets.length}</span>}
        </div>

        {tickets.length === 0 ? (
          <div className="hs-empty">
            <div className="hs-empty-icon"><HelpCircle size={32} /></div>
            <p className="hs-empty-title">Sin tickets por ahora</p>
            <p className="hs-empty-desc">Cuando abras un ticket de soporte, aparecerá aquí con su estado en tiempo real.</p>
            <button className="hs-empty-cta" onClick={() => setShowForm(true)}>
              <Plus size={14} /> Abrir mi primer ticket
            </button>
          </div>
        ) : (
          <div className="hs-table-wrap">
            <table className="hs-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Asunto</th>
                  <th>Estado</th>
                  <th className="hs-hide-sm">Actualizado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t, i) => {
                  const s = TICKET_STATUS[t.status] ?? TICKET_STATUS['Abierto'];
                  return (
                    <tr key={t.id} style={{ '--delay': `${i * 55}ms` }}>
                      <td className="hs-id-cell">#{t.id}</td>
                      <td className="hs-subject-cell">{t.subject}</td>
                      <td>
                        <span className="hs-badge" style={{ color: s.color, background: s.bg }}>
                          {s.label}
                        </span>
                      </td>
                      <td className="hs-hide-sm hs-date-cell">{t.updatedAt}</td>
                      <td className="hs-action-cell">
                        <button className="hs-view-btn">
                          <ExternalLink size={14} />
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

    </div>
  );
}
