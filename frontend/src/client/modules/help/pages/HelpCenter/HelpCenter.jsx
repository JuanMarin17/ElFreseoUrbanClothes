import React, { useState, useEffect } from 'react';
import {
  Search, ChevronDown, Plus, Send, X, RefreshCcw,
  MessageCircle, Clock, CheckCircle, AlertCircle,
  Inbox, ChevronLeft, Loader, Mail, MapPin, Zap,
  ShieldCheck, Package, CreditCard, Ticket,
} from 'lucide-react';
import './HelpCenter.css';
import HeaderMarket from '../../../../../utils/Header/HeaderMarket';
import { useAuth } from '../../../../../admin/modules/auth/pages/hook/Useauth';

/* Microservicio de soporte — puerto propio independiente del API principal */
const API_BASE = `${import.meta.env.VITE_API_URL ?? "http://localhost:8080/api/v1"}/support`;

const useCurrentUser = () => {
  const { user } = useAuth();
  if (!user) return { id: null, email: null, role: 'USER' };

  /* Decodifica el JWT para extraer todos los campos disponibles */
  let decoded = {};
  try {
    const jwt = localStorage.getItem('jwt');
    if (jwt) decoded = JSON.parse(atob(jwt.split('.')[1]));
  } catch { /* silent */ }

  /* Email: campo email del JWT → last_email guardado al hacer login → userName */
  const email =
    decoded.email ??
    localStorage.getItem('last_email') ??
    user.userName ??
    null;

  /* Id: user_id del JWT → userId parseado → sub */
  const id = decoded.user_id ?? user.userId ?? decoded.sub ?? null;

  /* Rol: mapeamos los roles del sistema → USER | OWNER del módulo de soporte */
  const rawRole = decoded.role ?? user.rolId ?? '';
  const role = (rawRole === 'ADMIN' || rawRole === 'SUPERADMIN') ? 'OWNER' : 'USER';

  if (import.meta.env.DEV) {
    console.debug('[Support] headers enviados →', { id, email, role });
  }

  return { id, email, role };
};

/* ══════════════════════════════════════════════════════════
   CAPA DE API — todas las llamadas al backend aquí
══════════════════════════════════════════════════════════ */

const buildHeaders = (user) => {
  const jwt = localStorage.getItem('jwt');
  return {
    'Content-Type':  'application/json',
    'X-User-Id':     user.id,
    'X-User-Email':  user.email,
    'X-User-Role':   user.role,
    ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
  };
};

const api = {
  /** POST /tickets — Crea un ticket */
  createTicket: (user, subject) =>
    fetch(`${API_BASE}/tickets`, {
      method:  'POST',
      headers: buildHeaders(user),
      body:    JSON.stringify({ subject }),
    }).then(handleResponse),

  /** GET /tickets/me — Mis tickets (USER) */
  getMyTickets: (user) =>
    fetch(`${API_BASE}/tickets/me`, {
      headers: buildHeaders(user),
    }).then(handleResponse),

  /** GET /tickets — Todos los tickets (solo OWNER) */
  getAllTickets: (user) =>
    fetch(`${API_BASE}/tickets`, {
      headers: buildHeaders(user),
    }).then(handleResponse),

  /** GET /tickets/:id — Detalle de un ticket */
  getTicket: (user, ticketId) =>
    fetch(`${API_BASE}/tickets/${ticketId}`, {
      headers: buildHeaders(user),
    }).then(handleResponse),

  /** GET /tickets/:id/messages — Mensajes del ticket */
  getMessages: (user, ticketId) =>
    fetch(`${API_BASE}/tickets/${ticketId}/messages`, {
      headers: buildHeaders(user),
    }).then(handleResponse),

  /** POST /tickets/:id/reply — Responder (solo OWNER) */
  replyTicket: (user, ticketId, message) =>
    fetch(`${API_BASE}/tickets/${ticketId}/reply`, {
      method:  'POST',
      headers: buildHeaders(user),
      body:    JSON.stringify({ message }),
    }).then(handleResponse),

  /** PATCH /tickets/:id/close — Cerrar ticket (solo OWNER) */
  closeTicket: (user, ticketId) =>
    fetch(`${API_BASE}/tickets/${ticketId}/close`, {
      method:  'PATCH',
      headers: buildHeaders(user),
    }).then(handleResponse),
};

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (import.meta.env.DEV) {
      console.error('[Support] Error response →', res.status, data);
    }
    const msg = data?.message || data?.error || `Error ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

/* ══════════════════════════════════════════════════════════
   HELPERS DE UI
══════════════════════════════════════════════════════════ */

const STATUS_MAP = {
  OPEN:        { label: 'Abierto',     color: 'var(--fire)',  Icon: AlertCircle  },
  IN_PROGRESS: { label: 'En proceso',  color: '#f59e0b',      Icon: Clock        },
  CLOSED:      { label: 'Cerrado',     color: '#6b7280',      Icon: CheckCircle  },
};

function StatusBadge({ status }) {
  const { label, color, Icon } = STATUS_MAP[status] || STATUS_MAP.OPEN;
  return (
    <span style={{
      display:      'inline-flex',
      alignItems:   'center',
      gap:          5,
      fontSize:     '.72rem',
      fontWeight:   700,
      letterSpacing: '.06em',
      textTransform: 'uppercase',
      color,
      background:   `${color}18`,
      border:       `1px solid ${color}40`,
      borderRadius:  5,
      padding:      '3px 10px',
    }}>
      <Icon size={11} /> {label}
    </span>
  );
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
      <Loader size={24} color="var(--fire)" style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ── Toast flotante ── */
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  const isError = type === 'error';
  const bg      = isError ? '#dc2626' : '#16a34a';

  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
      background: bg, color: '#fff', borderRadius: 10,
      padding: '14px 20px', fontSize: '.88rem', fontWeight: 600,
      display: 'flex', alignItems: 'center', gap: 10,
      boxShadow: `0 8px 32px ${bg}55`,
      maxWidth: 380, animation: 'hc-slideIn .25s ease',
    }}>
      <style>{`@keyframes hc-slideIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>
      {isError ? <AlertCircle size={17} /> : <CheckCircle size={17} />}
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: .75, padding: 0 }}>
        <X size={15} />
      </button>
    </div>
  );
}

/* ── Banner de feedback inline (dentro de forms/modal) ── */
function FeedbackBanner({ feedback }) {
  if (!feedback) return null;
  const isError = feedback.type === 'error';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '10px 14px', borderRadius: 8, marginTop: 12,
      background: isError ? '#fef2f2' : '#f0fdf4',
      border: `1px solid ${isError ? '#fca5a5' : '#86efac'}`,
      color: isError ? '#dc2626' : '#16a34a',
      fontSize: '.84rem', fontWeight: 500,
    }}>
      {isError ? <AlertCircle size={15} /> : <CheckCircle size={15} />}
      {feedback.message}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   FAQ estática
══════════════════════════════════════════════════════════ */

const FAQS = [
  { id: 1, question: '¿Cuánto tarda el envío?',
    answer: 'Los envíos nacionales tardan entre 2 y 5 días hábiles. Recibirás un número de guía en cuanto tu pedido salga de bodega.' },
  { id: 2, question: '¿Cómo hago un cambio o devolución?',
    answer: 'Tienes 15 días tras recibir tu compra. La prenda debe estar en perfecto estado y con etiquetas originales. Abre un ticket de soporte y te guiamos.' },
  { id: 3, question: '¿Qué métodos de pago aceptan?',
    answer: 'Aceptamos tarjetas de crédito y débito, PSE, Nequi, Daviplata y pago contra entrega en ciudades seleccionadas.' },
  { id: 4, question: '¿Cuándo recibiré respuesta a mi ticket?',
    answer: 'Nuestro equipo responde en menos de 24 horas hábiles. Recibirás un email de notificación cuando te respondamos.' },
];

/* ══════════════════════════════════════════════════════════
   VISTA: CONVERSACIÓN (detalle de un ticket + mensajes)
══════════════════════════════════════════════════════════ */

function TicketConversation({ ticket, user, onBack, onToast, onTicketUpdated }) {
  const [messages, setMessages]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [reply, setReply]         = useState('');
  const [sending, setSending]     = useState('');
  const [feedback, setFeedback]   = useState(null);
  const isOwner = user.role === 'OWNER';

  // Promise chain directo en el efecto — el linter no detecta setState síncrono
  useEffect(() => {
    api.getMessages(user, ticket.ticketId)
      .then((data) => setMessages(Array.isArray(data) ? data : []))
      .catch((err) => onToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, [user, ticket.ticketId, onToast]);

  // Usada solo desde event handlers (handleReply), no desde efectos
  const refreshMessages = () => {
    api.getMessages(user, ticket.ticketId)
      .then((data) => setMessages(Array.isArray(data) ? data : []))
      .catch(() => {});
  };

  const handleReply = async () => {
    if (!reply.trim()) return;
    setFeedback(null);
    try {
      setSending('reply');
      await api.replyTicket(user, ticket.ticketId, reply.trim());
      setReply('');
      setFeedback({ type: 'success', message: '✓ Respuesta enviada. El usuario recibirá un email.' });
      onTicketUpdated();
      refreshMessages();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'No se pudo enviar la respuesta.' });
    } finally {
      setSending('');
    }
  };

  const handleClose = async () => {
    if (!window.confirm('¿Cerrar este ticket? El usuario recibirá un email de notificación.')) return;
    setFeedback(null);
    try {
      setSending('close');
      await api.closeTicket(user, ticket.ticketId);
      setFeedback({ type: 'success', message: '✓ Ticket cerrado correctamente.' });
      onTicketUpdated();
      setTimeout(onBack, 1200);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'No se pudo cerrar el ticket.' });
    } finally {
      setSending('');
    }
  };

  return (

    <div className="hc-conversation">
      <div className="hc-conv-header">
        <button className="hc-back-btn" onClick={onBack}>
          <ChevronLeft size={16} /> Volver
        </button>
        <div className="hc-conv-title-group">
          <h2 className="hc-conv-subject">{ticket.subject}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <StatusBadge status={ticket.status} />
            <span style={{ fontSize: '.76rem', color: 'var(--off)' }}>
              Abierto el {formatDate(ticket.createdAt)}
            </span>
            {isOwner && (
              <span style={{ fontSize: '.76rem', color: 'var(--off)' }}>
                · Usuario: {ticket.userId}
              </span>
            )}
          </div>
        </div>
        {/* Solo OWNER puede cerrar si no está cerrado */}
        {isOwner && ticket.status !== 'CLOSED' && (
          <button
            className="hc-close-ticket-btn"
            onClick={handleClose}
            disabled={sending === 'close'}
          >
            {sending === 'close'
              ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
              : <X size={14} />}
            Cerrar ticket
          </button>
        )}
      </div>

      {/* Lista de mensajes */}
      <div className="hc-messages-list">
        {loading ? <Spinner /> : messages.length === 0 ? (
          <div className="hc-empty">
            <MessageCircle size={32} color="var(--off)" />
            <p>Aún no hay mensajes en este ticket.</p>
            {isOwner && <p style={{ fontSize: '.82rem' }}>Sé el primero en responder.</p>}
          </div>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.senderId === user.id;
            const isAdminMsg   = user.role === 'OWNER' ? isOwnMessage : !isOwnMessage;
            return (
              <div
                key={msg.messageId}
                className={`hc-message ${isOwnMessage ? 'hc-message--own' : 'hc-message--other'}`}
              >
                <div className="hc-message-bubble">
                  <div className="hc-message-sender">
                    {isOwnMessage
                      ? (isOwner ? '🛡️ Soporte Vexio' : 'Tú')
                      : (isOwner ? `Usuario` : '🛡️ Soporte Vexio')}
                  </div>
                  <p className="hc-message-text">{msg.message}</p>
                  <span className="hc-message-time">{formatDate(msg.createdAt)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Feedback de acciones (reply / close) */}
      {feedback && (
        <div style={{ padding: '0 0 4px' }}>
          <FeedbackBanner feedback={feedback} />
        </div>
      )}

      {/* Caja de respuesta — solo OWNER y ticket no cerrado */}
      {isOwner && ticket.status !== 'CLOSED' && (
        <div className="hc-reply-box">
          <textarea
            className="hc-reply-input"
            placeholder="Escribe tu respuesta al usuario... (el sistema enviará un email automáticamente)"
            value={reply}
            onChange={(e) => { setReply(e.target.value); setFeedback(null); }}
            rows={3}
            onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) handleReply(); }}
          />
          <div className="hc-reply-footer">
            <span style={{ fontSize: '.74rem', color: 'var(--off)' }}>Ctrl+Enter para enviar</span>
            <button
              className="neon-button"
              onClick={handleReply}
              disabled={!reply.trim() || sending === 'reply'}
              style={{ marginTop: 0, padding: '10px 22px', fontSize: '.82rem' }}
            >
              {sending === 'reply'
                ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
                : <Send size={14} />}
              Responder
            </button>
          </div>
        </div>
      )}

      {/* Ticket cerrado: aviso */}
      {ticket.status === 'CLOSED' && (
        <div className="hc-closed-notice">
          <CheckCircle size={16} color="#6b7280" />
          Este ticket está cerrado. Si necesitas más ayuda, abre uno nuevo.
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   VISTA: LISTA DE TICKETS
══════════════════════════════════════════════════════════ */

function TicketList({ user, onSelect, onToast, refreshTrigger }) {
  const [tickets, setTickets]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('ALL');
  const isOwner = user.role === 'OWNER';

  // Promise chain directo — evita setState síncrono en efecto
  useEffect(() => {
    (isOwner ? api.getAllTickets(user) : api.getMyTickets(user))
      .then((data) => setTickets(Array.isArray(data) ? data : []))
      .catch((err) => onToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, [user, isOwner, onToast, refreshTrigger]);

  // Llamada desde el botón refrescar (event handler, no efecto)
  const handleRefresh = () => {
    setLoading(true);
    (isOwner ? api.getAllTickets(user) : api.getMyTickets(user))
      .then((data) => setTickets(Array.isArray(data) ? data : []))
      .catch((err) => onToast(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  const filtered = filter === 'ALL'
    ? tickets
    : tickets.filter((t) => t.status === filter);

  const counts = {
    ALL:         tickets.length,
    OPEN:        tickets.filter((t) => t.status === 'OPEN').length,
    IN_PROGRESS: tickets.filter((t) => t.status === 'IN_PROGRESS').length,
    CLOSED:      tickets.filter((t) => t.status === 'CLOSED').length,
  };

  return (
    <div className="hc-ticket-list">
      <div className="hc-ticket-list-header">
        <h2 className="section-title" style={{ marginBottom: 0 }}>
          {isOwner ? 'Todos los tickets' : 'Mis tickets'}
        </h2>
        <button className="hc-refresh-btn" onClick={handleRefresh} title="Actualizar">
          <RefreshCcw size={15} />
        </button>
      </div>

      {/* Filtros de estado */}
      <div className="hc-filter-tabs">
        {[
          { key: 'ALL',         label: 'Todos'      },
          { key: 'OPEN',        label: 'Abiertos'   },
          { key: 'IN_PROGRESS', label: 'En proceso' },
          { key: 'CLOSED',      label: 'Cerrados'   },
        ].map(({ key, label }) => (
          <button
            key={key}
            className={`hc-filter-tab${filter === key ? ' active' : ''}`}
            onClick={() => setFilter(key)}
          >
            {label}
            <span className="hc-filter-count">{counts[key]}</span>
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? <Spinner /> : filtered.length === 0 ? (
        <div className="hc-empty">
          <Inbox size={32} color="var(--off)" />
          <p>{filter === 'ALL' ? 'No tienes tickets aún.' : `No hay tickets ${STATUS_MAP[filter]?.label.toLowerCase()}.`}</p>
        </div>
      ) : (
        <div className="hc-tickets">
          {filtered.map((ticket) => (
            <button
              key={ticket.ticketId}
              className="hc-ticket-row"
              onClick={() => onSelect(ticket)}
            >
              <div className="hc-ticket-row-left">
                <Ticket size={16} color="var(--fire)" style={{ flexShrink: 0 }} />
                <div>
                  <p className="hc-ticket-subject">{ticket.subject}</p>
                  <span className="hc-ticket-date">{formatDate(ticket.createdAt)}</span>
                  {isOwner && (
                    <span className="hc-ticket-userid">ID usuario: {ticket.userId}</span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <StatusBadge status={ticket.status} />
                <ChevronDown size={14} color="var(--off)" style={{ transform: 'rotate(-90deg)' }} />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MODAL: CREAR TICKET
══════════════════════════════════════════════════════════ */

function CreateTicketModal({ user, onClose, onCreated, onToast }) {
  const [subject,  setSubject]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const [feedback, setFeedback] = useState(null);

  const SUBJECTS = [
    'Problema con mi pedido',
    'No recibí mi paquete',
    'Quiero hacer una devolución',
    'Problema con el pago',
    'Mi cuenta fue bloqueada',
    'Otro',
  ];

  const handleSubmit = async () => {
    if (!subject.trim()) return;
    setFeedback(null);
    try {
      setLoading(true);
      await api.createTicket(user, subject.trim());
      setFeedback({ type: 'success', message: '✓ Ticket creado. Recibirás un email de confirmación.' });
      onCreated();
      setTimeout(onClose, 1500);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'No se pudo crear el ticket.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hc-modal-overlay" onClick={onClose}>
      <div className="hc-modal" onClick={(e) => e.stopPropagation()}>
        <div className="hc-modal-header">
          <h3>Nuevo ticket de soporte</h3>
          <button className="hc-modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <p style={{ color: 'var(--off)', fontSize: '.88rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          Cuéntanos tu problema. Nuestro equipo te responderá en menos de 24 h
          y recibirás un email de confirmación.
        </p>

        {/* Sugerencias rápidas */}
        <p style={{ fontSize: '.76rem', color: 'var(--off)', marginBottom: 8, letterSpacing: '.05em', textTransform: 'uppercase' }}>
          Selección rápida
        </p>
        <div className="hc-quick-subjects">
          {SUBJECTS.map((s) => (
            <button
              key={s}
              className={`hc-quick-subject${subject === s ? ' active' : ''}`}
              onClick={() => setSubject(s)}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input manual */}
        <div className="input-group" style={{ marginTop: '1.5rem' }}>
          <input
            type="text"
            id="ticket-subject"
            required
            value={subject}
            onChange={(e) => { setSubject(e.target.value); setFeedback(null); }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
            maxLength={120}
          />
          <label htmlFor="ticket-subject">O escribe tu asunto aquí</label>
          <div className="input-line" style={{ width: subject ? '100%' : 0 }} />
        </div>

        {/* Mensaje de éxito / error inline */}
        <FeedbackBanner feedback={feedback} />

        <div style={{ display: 'flex', gap: 10, marginTop: '1rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: '1px solid #334155',
              color: '#94a3b8', padding: '10px 20px', borderRadius: 6,
              cursor: 'pointer', fontSize: '.84rem',
            }}
          >
            Cancelar
          </button>
          <button
            className="neon-button"
            onClick={handleSubmit}
            disabled={!subject.trim() || loading}
            style={{ marginTop: 0, padding: '10px 22px', fontSize: '.84rem' }}
          >
            {loading
              ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
              : <Plus size={14} />}
            {loading ? 'Creando...' : 'Crear ticket'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SECCIÓN FAQ
══════════════════════════════════════════════════════════ */

function FaqSection({ searchQuery }) {
  const [open, setOpen] = useState(null);
  const filtered = FAQS.filter((f) =>
    f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <section className="faq-section">
      <h2 className="section-title">Preguntas Frecuentes</h2>
      {filtered.length === 0 ? (
        <p style={{ color: 'var(--off)', fontSize: '.9rem' }}>
          No hay resultados para "{searchQuery}". Abre un ticket si necesitas ayuda personalizada.
        </p>
      ) : (
        <div className="accordion-group">
          {filtered.map((faq) => (
            <div
              key={faq.id}
              className={`accordion-item${open === faq.id ? ' active' : ''}`}
              onClick={() => setOpen(open === faq.id ? null : faq.id)}
            >
              <div className="accordion-header">
                <span>{faq.question}</span>
                <div className="icon-wrapper">
                  <ChevronDown size={16} className="arrow-icon" />
                </div>
              </div>
              <div className="accordion-content">
                <div className="content-inner">{faq.answer}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   FORMULARIO RÁPIDO DE CONTACTO
══════════════════════════════════════════════════════════ */

function QuickContactForm({ user, onToast }) {
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim()) return;
    try {
      setLoading(true);
      await api.createTicket(user, subject.trim());
      setSent(true);
      onToast('Ticket creado. Revisa tu email para la confirmación.');
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (sent) return (
    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--off)' }}>
      <CheckCircle size={32} color="var(--fire)" style={{ marginBottom: 12 }} />
      <p style={{ fontWeight: 600, color: 'var(--white)' }}>¡Ticket creado!</p>
      <p style={{ fontSize: '.84rem', marginTop: 6 }}>Revisa tu email. Te respondemos pronto.</p>
    </div>
  );

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="input-group">
        <input
          type="text" id="quick-subject" required
          value={subject} onChange={(e) => setSubject(e.target.value)}
        />
        <label htmlFor="quick-subject">¿En qué podemos ayudarte?</label>
        <div className="input-line" style={{ width: subject ? '100%' : 0 }} />
      </div>
      <button type="submit" className="neon-button"
        disabled={!subject.trim() || loading}
        style={{ marginTop: '.5rem' }}>
        {loading
          ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
          : <Send size={14} />}
        Enviar y crear ticket
      </button>
    </form>
  );
}

/* ══════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL — HelpCenter
══════════════════════════════════════════════════════════ */

const HelpCenter = () => {
  const user = useCurrentUser();
  const isOwner = user.role === 'OWNER';

  // Vista activa: 'home' | 'tickets' | 'conversation'
  const [view, setView]             = useState('home');
  const [selectedTicket, setTicket] = useState(null);
  const [showModal, setShowModal]   = useState(false);
  const [searchQuery, setSearch]    = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast]           = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });
  const triggerRefresh = () => setRefreshKey((k) => k + 1);

  const openTicket = (ticket) => {
    setTicket(ticket);
    setView('conversation');
  };

  const backToTickets = () => {
    setView('tickets');
    setTicket(null);
    triggerRefresh();
  };

  /* ── VISTA: CONVERSACIÓN ──────────────────────── */
  if (view === 'conversation' && selectedTicket) {
    return (
      <>
        <HeaderMarket />
        <div className="hc-atmosphere" />
        <div className="help-container">
          <TicketConversation
            ticket={selectedTicket}
            user={user}
            onBack={backToTickets}
            onToast={showToast}
            onTicketUpdated={triggerRefresh}
          />
        </div>
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      </>
    );
  }

  /* ── VISTA: MIS TICKETS / TODOS (OWNER) ───────── */
  if (view === 'tickets') {
    return (
      <>
        <HeaderMarket />
        <div className="hc-atmosphere" />
        <div className="help-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '2rem' }}>
            <button className="hc-back-btn" onClick={() => setView('home')}>
              <ChevronLeft size={16} /> Inicio
            </button>
            {!isOwner && (
              <button className="neon-button" onClick={() => setShowModal(true)}
                style={{ marginTop: 0, padding: '9px 20px', fontSize: '.82rem', marginLeft: 'auto' }}>
                <Plus size={14} /> Nuevo ticket
              </button>
            )}
          </div>
          <TicketList
            user={user}
            onSelect={openTicket}
            onToast={showToast}
            refreshTrigger={refreshKey}
          />
        </div>
        {showModal && (
          <CreateTicketModal
            user={user}
            onClose={() => setShowModal(false)}
            onCreated={triggerRefresh}
            onToast={showToast}
          />
        )}
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      </>
    );
  }

  /* ── VISTA: HOME ──────────────────────────────── */
  return (
    <>
      <HeaderMarket />
      <div className="hc-atmosphere" />
      <div className="help-container">

       

        {/* Header */}
        <header className="help-header">
          <h1>
            Centro de Ayuda <span className="neon-text">VEXIO</span>
          </h1>
          <p className="subtitle">
            {isOwner ? 'Panel de soporte — OWNER' : 'Soporte de élite para tu estilo urbano'}
          </p>

          {/* Buscador */}
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Buscar en preguntas frecuentes..."
              className="neon-search"
              value={searchQuery}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </header>

        {/* Tarjetas de acción rápida */}
        <section className="support-cards">
          {/* Ver mis tickets / Ver todos (OWNER) */}
          <div className="glass-card" onClick={() => setView('tickets')}>
            <div className="card-icon">
              <Inbox size={30} />
            </div>
            <h3>{isOwner ? 'Todos los tickets' : 'Mis tickets'}</h3>
            <p>{isOwner ? 'Gestiona y responde solicitudes.' : 'Consulta el estado de tus solicitudes.'}</p>
          </div>

          {/* Crear ticket (solo usuarios normales) */}
          {!isOwner && (
            <div className="glass-card" onClick={() => setShowModal(true)}>
              <div className="card-icon"><Plus size={30} /></div>
              <h3>Abrir ticket</h3>
              <p>Cuéntanos tu problema y te ayudamos en menos de 24 h.</p>
            </div>
          )}

          {/* Categorías de soporte */}
          <div className="glass-card">
            <div className="card-icon"><MessageCircle size={30} /></div>
            <h3>WhatsApp</h3>
            <p>Asesoría personalizada e inmediata.</p>
          </div>
        </section>

        {/* Categorías */}
        <section className="categories-section">
          <h2 className="section-title">Explorar por tema</h2>
          <div className="categories-grid">
            {[
              { icon: <Package size={22} />,    title: 'Pedidos',       desc: 'Gestión y estados'       },
              { icon: <CreditCard size={22} />, title: 'Pagos',         desc: 'Métodos y facturación'   },
              { icon: <RefreshCcw size={22} />, title: 'Devoluciones',  desc: 'Políticas de cambio'     },
              { icon: <ShieldCheck size={22} />,title: 'Seguridad',     desc: 'Privacidad de datos'     },
            ].map((cat) => (
              <div
                key={cat.title}
                className="category-item"
                style={{ cursor: 'pointer' }}
                onClick={() => setSearch(cat.title.toLowerCase())}
              >
                <div className="category-icon">{cat.icon}</div>
                <h4>{cat.title}</h4>
                <p>{cat.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ filtrable */}
        <FaqSection searchQuery={searchQuery} />

        {/* Contacto */}
        <section className="contact-section">
          <div className="contact-grid">
            <div className="contact-info">
              <h2>¿Aún tienes <span>dudas?</span></h2>
              <p>Abre un ticket y nuestro equipo te responderá en menos de 24 horas. También puedes escribirnos directamente.</p>
              <div className="contact-details">
                <div className="detail-item"><Mail size={16} color="var(--fire)" /> soporte@vexio.co</div>
                <div className="detail-item"><MapPin size={16} color="var(--fire)" /> Montenegro, Quindío — CO</div>
                <div className="detail-item"><Zap size={16} color="var(--fire)" /> Respuesta en &lt; 24 h</div>
              </div>
              {!isOwner && (
                <button className="neon-button" onClick={() => setShowModal(true)}
                  style={{ marginTop: '1.5rem', width: 'fit-content' }}>
                  <Plus size={14} /> Abrir ticket ahora
                </button>
              )}
            </div>

            {/* Solo usuarios — formulario rápido que crea ticket */}
            {!isOwner && (
              <div>
                <p style={{ color: 'var(--off)', fontSize: '.84rem', marginBottom: '1.5rem' }}>
                  O escríbenos un mensaje y lo convertimos en un ticket automáticamente.
                </p>
                <QuickContactForm user={user} onToast={showToast} />
              </div>
            )}

            {/* OWNER — instrucciones de panel */}
            {isOwner && (
              <div style={{
                background: 'rgba(255,85,0,.04)', border: '1px solid var(--fire)',
                borderRadius: 12, padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: 12,
              }}>
                <p style={{ color: 'var(--fire)', fontWeight: 700, fontSize: '.88rem', letterSpacing: '.08em', textTransform: 'uppercase' }}>
                  Panel OWNER activo
                </p>
                <p style={{ color: 'var(--off)', fontSize: '.86rem', lineHeight: 1.65 }}>
                  Desde aquí puedes ver todos los tickets de los usuarios, responderlos y cerrarlos.
                  Cada acción envía un email automático al usuario afectado.
                </p>
                <button className="neon-button" onClick={() => setView('tickets')}
                  style={{ marginTop: '.5rem', width: 'fit-content' }}>
                  <Inbox size={14} /> Ver todos los tickets
                </button>
              </div>
            )}
          </div>
        </section>

        <footer className="help-footer">
          <p>© 2026 <strong>VEXIO</strong> Urban Clothes — All rights reserved.</p>
        </footer>
      </div>

      {showModal && (
        <CreateTicketModal
          user={user}
          onClose={() => setShowModal(false)}
          onCreated={triggerRefresh}
          onToast={showToast}
        />
      )}
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </>
  );
};


export default HelpCenter;