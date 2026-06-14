import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useStore } from "../../pages/useStore";
import {
  sendBuilderMessage,
  getBuilderSessionHistory,
} from "../../pages/services/builderChatService";
import "./StoreBuilderChat.css";

/* ────────────────────────────────────────────
   Rutas del wizard donde aparece el chat
──────────────────────────────────────────── */
const WIZARD_PATHS = new Set([
  "/plan",
  "/crear-tienda/basico",
  "/crear-tienda/legal",
  "/crear-tienda/pagos",
  "/layout",
  "/customer",
  "/component",
  "/widgets",
  "/cms",
  "/cms/about",
  "/cms/contact",
  "/cms/locations",
  "/cms/returns",
  "/cms/faq",
  "/crear-tienda",
]);

const SESSION_KEY = "builder_chat_session_id";

const formatTime = (d) =>
  new Date(d).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });

const isHex = (s) => typeof s === "string" && /^#[0-9a-fA-F]{3,8}$/.test(s.trim());

/* ── Etiquetas legibles por acción ── */
const ACTION_LABELS = {
  SUGGEST_BASIC:      "Nombre y descripción de tienda",
  SUGGEST_STYLES:     "Paleta de colores",
  SUGGEST_COMPONENTS: "Componentes visuales",
  SUGGEST_LAYOUT:     "Layout de tienda",
  SUGGEST_LEGAL:      "Información legal",
  SUGGEST_PAYMENT:    "Métodos de pago y envío",
};

/* ── Convierte action_data en filas legibles ── */
function buildRows(action, data) {
  if (!data) return [];
  switch (action) {
    case "SUGGEST_BASIC":
      return [
        { key: "Nombre",      value: data.name        ?? "—" },
        { key: "Descripción", value: data.description ?? "—" },
      ];
    case "SUGGEST_STYLES":
      return [
        { key: "Fondo tarjeta",  value: data.cardBg           ?? "—", isColor: isHex(data.cardBg) },
        { key: "Botones",        value: data.colorBoton        ?? "—", isColor: isHex(data.colorBoton) },
        { key: "Títulos",        value: data.colorTitulo       ?? "—", isColor: isHex(data.colorTitulo) },
        { key: "Párrafos",       value: data.colorParrafo      ?? "—", isColor: isHex(data.colorParrafo) },
        { key: "Borde 1",        value: data.cardBorderColor1  ?? "—", isColor: isHex(data.cardBorderColor1) },
        { key: "Borde 2",        value: data.cardBorderColor2  ?? "—", isColor: isHex(data.cardBorderColor2) },
        { key: "Ancho borde",    value: data.cardBorderWidth ? `${data.cardBorderWidth}px` : "—" },
        { key: "Radio",          value: data.cardRadius        ? `${data.cardRadius}px`    : "—" },
      ];
    case "SUGGEST_COMPONENTS":
      return [
        { key: "Banner – título", value: data.banner?.title ?? "—" },
        { key: "Banner – fondo",  value: data.banner?.bg    ?? "—", isColor: isHex(data.banner?.bg) },
        { key: "Header – logo",   value: data.header?.logo  ?? "—" },
        { key: "Header – fondo",  value: data.header?.bg    ?? "—", isColor: isHex(data.header?.bg) },
        { key: "Footer – texto",  value: data.footer?.text  ?? "—" },
        { key: "Footer – fondo",  value: data.footer?.bg    ?? "—", isColor: isHex(data.footer?.bg) },
      ];
    case "SUGGEST_LAYOUT":
      return [
        { key: "Layout",      value: data.title       ?? data.id ?? "—" },
        { key: "Descripción", value: data.description ?? "—" },
      ];
    case "SUGGEST_LEGAL":
      return [
        { key: "Nombre legal", value: data.legalName ?? "—" },
        { key: "NIT / RUT",    value: data.idNumber  ?? "—" },
      ];
    case "SUGGEST_PAYMENT":
      return [
        { key: "Método de pago", value: data.paymentMethod ?? "—" },
        { key: "Envío",          value: data.shipping       ?? "—" },
      ];
    default:
      return Object.entries(data).map(([k, v]) => ({ key: k, value: String(v) }));
  }
}

/* ── Burbuja de mensaje ── */
function Bubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`bc-bubble bc-bubble--${isUser ? "user" : "ai"}`}>
      <div className="bc-bubble__text">{msg.content}</div>
      <span className="bc-bubble__time">{formatTime(msg.createdAt)}</span>
    </div>
  );
}

/* ── Tarjeta de sugerencia ── */
function SuggestionCard({ action, actionData, onApply, onEdit, onReject }) {
  const rows = buildRows(action, actionData);
  return (
    <div className="bc-suggestion">
      <p className="bc-suggestion__label">{ACTION_LABELS[action] ?? "Sugerencia"}</p>
      <div className="bc-suggestion__rows">
        {rows.map(({ key, value, isColor }) => (
          <div className="bc-suggestion__row" key={key}>
            <span className="bc-suggestion__key">{key}</span>
            <span className="bc-suggestion__val">
              {isColor && (
                <span
                  className="bc-suggestion__swatch"
                  style={{ background: value }}
                  aria-hidden="true"
                />
              )}
              {value}
            </span>
          </div>
        ))}
      </div>
      <div className="bc-suggestion__actions">
        <button className="bc-suggestion__apply" onClick={onApply}>
          Aplicar
        </button>
        <button className="bc-suggestion__edit" onClick={onEdit}>
          Editar
        </button>
        <button className="bc-suggestion__reject" onClick={onReject}>
          Rechazar
        </button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   StoreBuilderChat — componente principal
════════════════════════════════════════ */
export default function StoreBuilderChat() {
  const location = useLocation();
  const { state, saveProgress } = useStore();

  const [isOpen,         setIsOpen]         = useState(false);
  const [messages,       setMessages]       = useState([]);
  const [text,           setText]           = useState("");
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState(null);
  const [sessionId,      setSessionId]      = useState(() => localStorage.getItem(SESSION_KEY));
  const [pendingAction,  setPendingAction]  = useState(null);
  const [historyLoaded,  setHistoryLoaded]  = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef    = useRef(null);

  const isOnWizard = WIZARD_PATHS.has(location.pathname);
  const isLoggedIn = !!localStorage.getItem("jwt") && localStorage.getItem("jwt") !== "null";
  const hasMessages = messages.length > 0;

  /* ── Auto-scroll ── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, pendingAction]);

  /* ── Auto-resize textarea ── */
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
  }, [text]);

  /* ── Persistir session_id ── */
  useEffect(() => {
    if (sessionId) localStorage.setItem(SESSION_KEY, sessionId);
    else localStorage.removeItem(SESSION_KEY);
  }, [sessionId]);

  /* ── Cargar historial al abrir el panel ── */
  useEffect(() => {
    if (!isOpen || historyLoaded || !sessionId || !isLoggedIn || messages.length > 0) return;

    let cancelled = false;
    setLoading(true);

    getBuilderSessionHistory(sessionId)
      .then((history) => {
        if (cancelled || !Array.isArray(history)) return;
        setMessages(
          history.map((m) => ({
            role:      m.role,
            content:   m.content,
            createdAt: m.created_at,
          }))
        );
      })
      .catch(() => {
        /* Sesión inválida o expirada: descartamos el session_id guardado */
        if (!cancelled) {
          setSessionId(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setHistoryLoaded(true);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [isOpen, historyLoaded, sessionId, isLoggedIn, messages.length]);

  /* ── Aplicar acción al wizard ── */
  const applyAction = useCallback((action, actionData) => {
    switch (action) {
      case "SUGGEST_BASIC":
        saveProgress("basic", {
          ...(state.basic ?? {}),
          name:        actionData.name        ?? "",
          description: actionData.description ?? "",
        });
        break;
      case "SUGGEST_STYLES":
        saveProgress("styles", { ...(state.styles ?? {}), ...actionData });
        break;
      case "SUGGEST_COMPONENTS":
        saveProgress("components", { ...(state.components ?? {}), ...actionData });
        break;
      case "SUGGEST_LAYOUT":
        saveProgress("layout", {
          id:          actionData.id,
          title:       actionData.title,
          description: actionData.description,
        });
        break;
      case "SUGGEST_LEGAL":
        saveProgress("legal", {
          ...(state.legal ?? {}),
          legalName: actionData.legalName ?? "",
          idNumber:  actionData.idNumber  ?? "",
        });
        break;
      case "SUGGEST_PAYMENT":
        saveProgress("payment", {
          ...(state.payment ?? {}),
          paymentMethod: actionData.paymentMethod ?? "",
          shipping:      actionData.shipping       ?? "",
        });
        break;
    }
  }, [saveProgress, state]);

  /* ── Enviar mensaje ── */
  const doSend = useCallback(async (overrideText, { suppressAction = false } = {}) => {
    const content = (overrideText ?? text).trim();
    if (!content || loading) return;
    if (!isLoggedIn) { setError("Debes iniciar sesión para usar el asistente."); return; }

    setMessages(prev => [...prev, {
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    }]);
    if (!overrideText) setText("");
    setPendingAction(null);
    setError(null);
    setLoading(true);

    try {
      const res = await sendBuilderMessage(sessionId, content);

      if (!sessionId && res.session_id) setSessionId(res.session_id);

      setMessages(prev => [...prev, {
        role: "assistant",
        content: res.message,
        createdAt: new Date().toISOString(),
      }]);

      if (!suppressAction) {
        const validAction =
          res.action && res.action !== "null" && res.action in ACTION_LABELS
            ? res.action
            : null;
        if (validAction) {
          setPendingAction({ action: validAction, action_data: res.action_data ?? {} });
        }
      }
    } catch (err) {
      if (err.status === 401) {
        setError("Tu sesión expiró. Por favor inicia sesión de nuevo.");
      } else {
        setError(err.message ?? "No se pudo conectar con el asistente.");
      }
    } finally {
      setLoading(false);
    }
  }, [text, loading, sessionId, isLoggedIn]);

  /* ── Handlers de sugerencia ── */
  const handleApply = useCallback(() => {
    if (!pendingAction) return;
    applyAction(pendingAction.action, pendingAction.action_data ?? {});
    setPendingAction(null);
    doSend("Perfecto, apliqué la sugerencia.", { suppressAction: true });
  }, [pendingAction, applyAction, doSend]);

  /* Editar: pre-rellena el formulario y cierra el panel para que el usuario lo edite */
  const handleEdit = useCallback(() => {
    if (!pendingAction) return;
    applyAction(pendingAction.action, pendingAction.action_data ?? {});
    setPendingAction(null);
    setIsOpen(false);
  }, [pendingAction, applyAction]);

  /* Rechazar: descarta la sugerencia e informa a la IA */
  const handleReject = useCallback(() => {
    if (!pendingAction) return;
    setPendingAction(null);
    doSend("No, esa sugerencia no me convence. Propón algo diferente.");
  }, [pendingAction, doSend]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); doSend(); }
  }, [doSend]);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setSessionId(null);
    setHistoryLoaded(false);
    setPendingAction(null);
    setError(null);
    setText("");
  }, []);

  if (!isOnWizard) return null;

  return (
    <>
      {/* Botón flotante */}
      <button
        className="bc-fab"
        onClick={() => setIsOpen(o => !o)}
        aria-label="Asistente de creación de tienda"
        title="Store Builder AI"
      >
        {isOpen ? (
          <svg className="bc-fab__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg className="bc-fab__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        )}
        {!isOpen && hasMessages && <span className="bc-fab__badge" />}
      </button>

      {/* Backdrop */}
      <div
        className={`bc-backdrop ${isOpen ? "bc-backdrop--visible" : ""}`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside className={`bc-panel ${isOpen ? "bc-panel--open" : ""}`} aria-label="Store Builder AI">

        {/* Header */}
        <div className="bc-header">
          <div className="bc-header__icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="bc-header__info">
            <p className="bc-header__name">Store Builder AI</p>
            <p className="bc-header__sub">Asistente de creación de tienda</p>
          </div>
          <div className="bc-header__actions">
            {hasMessages && (
              <button className="bc-header__btn" onClick={handleNewChat} title="Nueva conversación" aria-label="Nueva conversación">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 .49-3" />
                </svg>
              </button>
            )}
            <button className="bc-header__btn" onClick={() => setIsOpen(false)} aria-label="Cerrar">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="bc-body">
          {!hasMessages && !loading ? (
            <div className="bc-empty">
              <div className="bc-empty__hero" aria-hidden="true">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <p className="bc-empty__title">Hola, soy tu asistente IA</p>
              <p className="bc-empty__sub">
                Te guío paso a paso para configurar tu tienda perfecta. Cuéntame qué tipo de negocio tienes.
              </p>
              <div className="bc-bubble bc-bubble--ai">
                <div className="bc-bubble__text">
                  {isLoggedIn
                    ? "¡Hola! Soy el asistente de Store Builder. Puedo sugerirte nombre, colores, layout y más para tu tienda. ¿Por dónde empezamos?"
                    : "Debes iniciar sesión para usar el asistente de creación de tienda."}
                </div>
                <span className="bc-bubble__time">{formatTime(new Date())}</span>
              </div>
            </div>
          ) : (
            <div className="bc-messages">
              {messages.map((msg, i) => <Bubble key={i} msg={msg} />)}
              {loading && (
                <div className="bc-typing" aria-label="El asistente está escribiendo">
                  <span className="bc-typing__dot" />
                  <span className="bc-typing__dot" />
                  <span className="bc-typing__dot" />
                </div>
              )}
              {!loading && pendingAction && (
                <SuggestionCard
                  action={pendingAction.action}
                  actionData={pendingAction.action_data}
                  onApply={handleApply}
                  onEdit={handleEdit}
                  onReject={handleReject}
                />
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bc-error" role="alert" onClick={() => setError(null)}>
            {error} · Toca para cerrar
          </div>
        )}

        {/* Input */}
        <div className="bc-footer">
          <div className="bc-footer__input-wrap">
            <textarea
              ref={textareaRef}
              className="bc-footer__textarea"
              placeholder={isLoggedIn ? "Escribe tu mensaje..." : "Inicia sesión para continuar"}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={loading || !isLoggedIn}
              aria-label="Mensaje al asistente"
            />
          </div>
          <button
            className="bc-footer__send"
            onClick={() => doSend()}
            disabled={loading || !text.trim() || !isLoggedIn}
            aria-label="Enviar mensaje"
          >
            {loading ? (
              <span className="bc-spinner" aria-hidden="true" />
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
