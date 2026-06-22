import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useStore } from "../../pages/useStore";
import {
  sendBuilderMessage,
  getBuilderSessionHistory,
  deleteBuilderSession,
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

// Orden real del wizard (mismo orden que StepProgress.jsx / ProtectedStep.jsx)
const WIZARD_STEPS = [
  { path: "/plan",                label: "Elegir plan" },
  { path: "/crear-tienda/basico", label: "Información básica" },
  { path: "/crear-tienda/legal",  label: "Información legal" },
  { path: "/crear-tienda/pagos",  label: "Métodos de pago y envío" },
  { path: "/layout",              label: "Selección de layout" },
  { path: "/customer",            label: "Colores y estilos" },
  { path: "/component",           label: "Componentes visuales" },
  { path: "/widgets",             label: "Widgets" },
  { path: "/cms",                 label: "Contenido (CMS)" },
  { path: "/crear-tienda",        label: "Confirmar y crear tienda" },
];

function currentWizardStep(pathname) {
  const normalized = pathname.startsWith("/cms/") ? "/cms" : pathname;
  const idx = WIZARD_STEPS.findIndex((s) => s.path === normalized);
  return idx >= 0 ? { ...WIZARD_STEPS[idx], index: idx, total: WIZARD_STEPS.length } : null;
}

// A qué paso conviene llevar al usuario después de aplicar cada tipo de sugerencia
const NEXT_STEP_PATH = {
  SUGGEST_BASIC:      "/crear-tienda/legal",
  SUGGEST_LEGAL:      "/crear-tienda/pagos",
  SUGGEST_PAYMENT:    "/layout",
  SUGGEST_LAYOUT:     "/customer",
  SUGGEST_STYLES:     "/component",
  SUGGEST_COMPONENTS: "/widgets",
};

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

/* ── Descarga de imagen generada ── */
function downloadGeneratedImage(base64, mime) {
  const ext  = mime?.split("/")[1] ?? "jpg";
  const link = document.createElement("a");
  link.href     = `data:${mime};base64,${base64}`;
  link.download = `producto.${ext}`;
  link.click();
}

/* ── Burbuja de mensaje ── */
function Bubble({ msg }) {
  const isUser = msg.role === "user";
  const hasGeneratedImage = !isUser && msg.generatedImageBase64;

  return (
    <div className={`bc-bubble bc-bubble--${isUser ? "user" : "ai"}`}>
      <div className="bc-bubble__text">{msg.content}</div>
      {hasGeneratedImage && (
        <div className="bc-generated-image-wrap">
          <img
            src={`data:${msg.generatedImageMime};base64,${msg.generatedImageBase64}`}
            alt="Imagen generada por IA"
            className="bc-generated-image"
          />
          <button
            className="bc-generated-image-dl"
            onClick={() => downloadGeneratedImage(msg.generatedImageBase64, msg.generatedImageMime)}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Descargar imagen
          </button>
        </div>
      )}
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

/* ── Modal de confirmación ── */
function ConfirmDialog({ title, message, onConfirm, onCancel }) {
  return (
    <div className="vx-confirm-overlay" onClick={onCancel} role="dialog" aria-modal="true">
      <div className="vx-confirm-box" onClick={e => e.stopPropagation()}>
        <div className="vx-confirm-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4h6v2" />
          </svg>
        </div>
        <h3 className="vx-confirm-title">{title}</h3>
        <p className="vx-confirm-msg">{message}</p>
        <div className="vx-confirm-actions">
          <button className="vx-confirm-cancel" onClick={onCancel}>Cancelar</button>
          <button className="vx-confirm-ok" onClick={onConfirm}>Eliminar</button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   StoreBuilderChat — componente principal
════════════════════════════════════════ */
export default function StoreBuilderChat() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state, completeStep } = useStore();
  const wizardStep = currentWizardStep(location.pathname);

  const [isOpen,         setIsOpen]         = useState(false);
  const [messages,       setMessages]       = useState([]);
  const [text,           setText]           = useState("");
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState(null);
  const [sessionId,      setSessionId]      = useState(() => localStorage.getItem(SESSION_KEY));
  const [pendingAction,  setPendingAction]  = useState(null);
  const [historyLoaded,  setHistoryLoaded]  = useState(false);
  const [confirmAction,  setConfirmAction]  = useState(null);

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

  /* ── Aplicar acción al wizard (completa el paso, no solo guarda un borrador) ── */
  const applyAction = useCallback((action, actionData) => {
    switch (action) {
      case "SUGGEST_BASIC":
        completeStep("basic", {
          ...(state.basic ?? {}),
          name:        actionData.name        ?? "",
          description: actionData.description ?? "",
        });
        break;
      case "SUGGEST_STYLES":
        completeStep("styles", { ...(state.styles ?? {}), ...actionData });
        break;
      case "SUGGEST_COMPONENTS":
        completeStep("components", { ...(state.components ?? {}), ...actionData });
        break;
      case "SUGGEST_LAYOUT":
        completeStep("layout", {
          id:          actionData.id,
          title:       actionData.title,
          description: actionData.description,
        });
        break;
      case "SUGGEST_LEGAL":
        completeStep("legal", {
          ...(state.legal ?? {}),
          legalName: actionData.legalName ?? "",
          idNumber:  actionData.idNumber  ?? "",
        });
        break;
      case "SUGGEST_PAYMENT":
        completeStep("payment", {
          ...(state.payment ?? {}),
          paymentMethod: actionData.paymentMethod ?? "",
          shipping:      actionData.shipping       ?? "",
        });
        break;
    }
  }, [completeStep, state]);

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
      const res = await sendBuilderMessage(sessionId, content, {
        path: location.pathname,
        step: wizardStep?.label ?? null,
        stepIndex: wizardStep?.index ?? null,
        totalSteps: wizardStep?.total ?? null,
        completedStep: state.completedStep,
      });

      if (!sessionId && res.session_id) setSessionId(res.session_id);

      setMessages(prev => [...prev, {
        role:                "assistant",
        content:             res.message,
        generatedImageBase64: res.generated_image_base64 ?? null,
        generatedImageMime:   res.generated_image_mime_type ?? "image/jpeg",
        createdAt:           new Date().toISOString(),
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
  }, [text, loading, sessionId, isLoggedIn, location.pathname, wizardStep, state.completedStep]);

  /* ── Handlers de sugerencia ── */
  const handleApply = useCallback(() => {
    if (!pendingAction) return;
    applyAction(pendingAction.action, pendingAction.action_data ?? {});
    setPendingAction(null);
    const nextPath = NEXT_STEP_PATH[pendingAction.action];
    if (nextPath) {
      doSend("Perfecto, apliqué la sugerencia. Avanzando al siguiente paso.", { suppressAction: true });
      navigate(nextPath);
    } else {
      doSend("Perfecto, apliqué la sugerencia.", { suppressAction: true });
    }
  }, [pendingAction, applyAction, doSend, navigate]);

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
    const prevSession = sessionId;
    setMessages([]);
    setSessionId(null);
    setHistoryLoaded(false);
    setPendingAction(null);
    setError(null);
    setText("");
    if (prevSession) {
      deleteBuilderSession(prevSession).catch(() => {});
    }
  }, [sessionId]);

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
              <button
                className="bc-header__btn"
                onClick={() => setConfirmAction({ title: "Eliminar conversación", message: "¿Estás seguro de que quieres borrar esta conversación? Esta acción no se puede deshacer.", fn: handleNewChat })}
                title="Nueva conversación"
                aria-label="Nueva conversación"
              >
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

      {confirmAction && (
        <ConfirmDialog
          title={confirmAction.title}
          message={confirmAction.message}
          onConfirm={() => { confirmAction.fn(); setConfirmAction(null); }}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </>
  );
}
