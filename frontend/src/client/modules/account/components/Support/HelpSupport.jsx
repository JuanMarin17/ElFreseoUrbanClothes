import React, { useState, useEffect } from 'react';
import { HelpCircle, Plus, ExternalLink, Terminal, History, Send } from 'lucide-react';
import accountService from '../../services/accountService';
import './HelpSupport.css';

const TICKET_STATUS = {
  Resuelto:   { color: '#00ffff', label: 'RESOLVED' },
  'En Espera': { color: '#f28a60', label: 'PENDING_REVIEW' },
  Abierto:    { color: '#7880fd', label: 'ACTIVE_QUERY' },
};

export default function HelpSupport() {
  const [tickets, setTickets]   = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ subject: '', message: '' });

  useEffect(() => {
    accountService.getTickets()
      .then(({ data }) => setTickets(data))
      .catch(() => {});
  }, []);

  const handleCreate = async () => {
    try {
      const { data } = await accountService.createTicket(form);
      setTickets(t => [data, ...t]);
      setForm({ subject: '', message: '' });
      setShowForm(false);
    } catch (e) {
      console.error("SYS_LOG: Error al crear el ticket.");
    }
  };

  return (
    <div className="support-section">
      <div className="support-header-main">
        <span className="info-tag">SOPORTE_TECNICO_CENTRAL</span>
        <div className="header-actions">
          <h2 className="section-title">AYUDA Y SOPORTE</h2>
          <button className="new-ticket-btn" onClick={() => setShowForm(s => !s)}>
            <Plus size={16} /> <span>OPEN_NEW_TICKET</span>
          </button>
        </div>
      </div>

      {showForm && (
        <div className="sec-card form-card-entry animate-fade">
          <div className="card-header-tech">
            <Terminal size={14} /> <span>NUEVO_REPORTE_INCIDENCIA</span>
          </div>
          <div className="sec-form-body">
            <div className="field-box">
              <label>ASUNTO_TEMA</label>
              <input
                className="tech-input"
                placeholder="Ej. Incidencia con envío ID-99..."
                value={form.subject}
                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              />
            </div>
            <div className="field-box">
              <label>LOG_MENSAJE</label>
              <textarea
                className="tech-input support-textarea"
                placeholder="Describe el caso detalladamente..."
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              />
            </div>
            <button className="submit-ticket-btn" onClick={handleCreate}>
              <Send size={15} /> <span>SUBMIT_TO_CORE</span>
            </button>
          </div>
        </div>
      )}

      {/* Historial de Tickets */}
      <div className="sec-card history-card">
        <div className="card-header-tech">
          <History size={14} /> <span>LOG_HISTORIAL_TICKETS</span>
        </div>
        
        {tickets.length === 0 ? (
          <div className="empty-state">
            <p className="sec-desc">NULL: NO SE ENCONTRARON REGISTROS DE SOPORTE.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="tickets-table">
              <thead>
                <tr>
                  <th>TICKET_ID</th>
                  <th>ASUNTO</th>
                  <th>ESTADO</th>
                  <th>UPDATE_TIMESTAMP</th>
                  <th className="text-right">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(t => (
                  <tr key={t.id}>
                    <td className="id-cell">#{t.id}</td>
                    <td className="subject-cell">{t.subject.toUpperCase()}</td>
                    <td>
                      <span 
                        className="status-badge-tech" 
                        style={{ color: TICKET_STATUS[t.status]?.color }}
                      >
                        {TICKET_STATUS[t.status]?.label || t.status}
                      </span>
                    </td>
                    <td className="date-cell">{t.updatedAt}</td>
                    <td className="text-right">
                      <button className="ticket-link-btn">
                        <ExternalLink size={14} /> <span>LOGS</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}