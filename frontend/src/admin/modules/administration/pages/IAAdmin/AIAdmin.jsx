import { useState, useEffect, useRef } from "react";
import { useIAAdmin } from "./service/useIAAdmin";
import ActionRenderer from "./components/ActionRenderer";
import "./AIAdmin.css";

const SUGGESTIONS = [
  "¿Cómo van las ventas hoy?",
  "¿Qué productos tienen bajo stock?",
  "Sugerencias de colores para mi tienda",
  "Resumen de pedidos recientes",
];

// ─── Shared: Typing Indicator ────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="ai__bubble-wrap ai__bubble-wrap--bot">
      <div className="ai__bubble ai__bubble--bot ai__typing">
        <span className="ai__dot" />
        <span className="ai__dot" />
        <span className="ai__dot" />
      </div>
    </div>
  );
}

// ─── Markdown renderer (sin dependencias externas) ───────────────────────────
function parseInline(text) {
  const parts = [];
  const regex = /\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match;
  let idx = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    parts.push(<strong key={idx++}>{match[1]}</strong>);
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

function MarkdownText({ content }) {
  if (!content) return null;

  // Convierte listas numeradas inline ("intro 2. item 3. item") a líneas separadas
  const normalized = content
    .replace(/([^\n])\s+(\d+)\.\s+/g, (_, before, num) => `${before}\n${num}. `)
    .trim();

  const lines = normalized.split('\n');
  const elements = [];
  let listItems = [];
  let listType = null;
  let key = 0;

  const flushList = () => {
    if (!listItems.length) return;
    const Tag = listType === 'ul' ? 'ul' : 'ol';
    elements.push(
      <Tag key={key++} className={`ai__md-${listType}`}>
        {listItems.map((item, i) => (
          <li key={i} className="ai__md-li">{parseInline(item)}</li>
        ))}
      </Tag>
    );
    listItems = [];
    listType = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) { flushList(); continue; }

    const numMatch = line.match(/^(\d+)[.)]\s+(.+)/);
    if (numMatch) {
      if (listType === 'ul') flushList();
      listType = 'ol';
      listItems.push(numMatch[2]);
      continue;
    }

    const bulletMatch = line.match(/^[-*•]\s+(.+)/);
    if (bulletMatch) {
      if (listType === 'ol') flushList();
      listType = 'ul';
      listItems.push(bulletMatch[1]);
      continue;
    }

    flushList();
    elements.push(<p key={key++} className="ai__md-p">{parseInline(line)}</p>);
  }

  flushList();
  return <div className="ai__markdown">{elements}</div>;
}

// ─── Generated image download helper ─────────────────────────────────────────
function downloadGeneratedImage(base64, mime) {
  const ext  = mime?.split("/")[1] ?? "jpg";
  const link = document.createElement("a");
  link.href     = `data:${mime};base64,${base64}`;
  link.download = `producto.${ext}`;
  link.click();
}

// ─── Confirm dialog ─────────────────────────────────────────────────────────
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

// ─── Report download component ────────────────────────────────────────────────
function ReportDownload({ base64, mimeType, filename }) {
  const download = () => {
    try {
      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      const blob  = new Blob([bytes], { type: mimeType });
      const url   = URL.createObjectURL(blob);
      const a     = document.createElement("a");
      a.href      = url;
      a.download  = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      const a     = document.createElement("a");
      a.href      = `data:${mimeType};base64,${base64}`;
      a.download  = filename;
      a.click();
    }
  };
  const icon = mimeType?.includes("sheet") ? "📊" : mimeType?.includes("pdf") ? "📄" : "🖼️";
  return (
    <button className="ai__report-dl" onClick={download}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      {icon} Descargar {filename}
    </button>
  );
}

// ─── Shared: Message Bubble ──────────────────────────────────────────────────
function MessageBubble({ msg, onStartFresh }) {
  const isUser = msg.role === "user";
  const hasGeneratedImage = !isUser && msg.generated_image_base64;

  return (
    <div
      className={[
        "ai__bubble-wrap",
        `ai__bubble-wrap--${isUser ? "user" : "bot"}`,
        msg.isError ? "ai__bubble-wrap--error" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={[
          "ai__bubble",
          `ai__bubble--${isUser ? "user" : "bot"}`,
          msg.isError ? "ai__bubble--error" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {isUser && msg.imagePreviewUrl && (
          <img
            src={msg.imagePreviewUrl}
            alt="Imagen adjunta"
            className="ai__bubble-image"
          />
        )}
        {isUser
          ? <p className="ai__bubble-text">{msg.content}</p>
          : <MarkdownText content={msg.content} />
        }
        {hasGeneratedImage && (
          <div className="ai__generated-image-wrap">
            <img
              src={`data:${msg.generated_image_mime_type};base64,${msg.generated_image_base64}`}
              alt="Imagen generada por IA"
              className="ai__generated-image"
            />
            <button
              className="ai__generated-image-dl"
              onClick={() => downloadGeneratedImage(msg.generated_image_base64, msg.generated_image_mime_type)}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Descargar imagen
            </button>
          </div>
        )}
        {!isUser && msg.report_base64 && (
          <div className="ai__report-wrap">
            {msg.action_data?.format === "chart" && (
              <img
                src={`data:image/png;base64,${msg.report_base64}`}
                alt="Gráfica generada"
                className="ai__report-chart"
              />
            )}
            <ReportDownload
              base64={msg.report_base64}
              mimeType={msg.report_mime_type}
              filename={msg.report_filename}
            />
          </div>
        )}
        {!isUser && msg.action && (
          <ActionRenderer
            action={msg.action}
            action_data={msg.action_data}
            enhanced_image_base64={msg.enhanced_image_base64}
            enhanced_image_mime_type={msg.enhanced_image_mime_type}
            originalImageSrc={msg.originalImagePreviewUrl}
          />
        )}
        {/* El backend a veces devuelve 500 sin más detalle tras varios turnos en
            la misma sesión; ofrecer salida directa en vez de dejar el chat muerto. */}
        {msg.isError && onStartFresh && (
          <button className="ai__error-retry-btn" onClick={onStartFresh}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Empezar nueva conversación
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Shared: Input Area ──────────────────────────────────────────────────────
function InputArea({ inputText, setInputText, selectedImage, setSelectedImage, sendMessage, isLoading, isRateLimited, rateLimitText }) {
  const fileInputRef = useRef(null);
  const disabled = isLoading || isRateLimited;

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="ai__input-area">
      {isRateLimited && (
        <div className="ai__cooldown-banner" role="status">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>{rateLimitText}</span>
        </div>
      )}
      {selectedImage && (
        <div className="ai__img-preview">
          <img
            src={URL.createObjectURL(selectedImage)}
            alt="Vista previa"
            className="ai__img-thumb"
          />
          <span className="ai__img-name">{selectedImage.name}</span>
          <button
            className="ai__img-remove"
            onClick={() => setSelectedImage(null)}
            title="Quitar imagen"
          >
            ×
          </button>
        </div>
      )}
      <div className="ai__input-row">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => {
            setSelectedImage(e.target.files?.[0] || null);
            e.target.value = "";
          }}
        />
        <button
          className="ai__attach-btn"
          onClick={() => fileInputRef.current?.click()}
          title="Adjuntar imagen"
          disabled={disabled}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </button>
        <textarea
          className="ai__input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKey}
          placeholder={isRateLimited ? "Límite de peticiones alcanzado..." : "Pregúntame algo..."}
          rows={1}
          disabled={disabled}
        />
        <button
          className="ai__send-btn"
          onClick={() => sendMessage()}
          disabled={disabled || !inputText.trim()}
        >
          {isLoading ? (
            <span className="ai__spinner" />
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Sidebar Mode (embedded in AdminLayout) ───────────────────────────────────
function IAAdminSidebar({ isOpen, setIsOpen }) {
  const {
    hasAccess,
    checkingAccess,
    sessionId,
    messages,
    isLoading,
    inputText,
    setInputText,
    selectedImage,
    setSelectedImage,
    sessions,
    toastError,
    setToastError,
    isRateLimited,
    rateLimitText,
    sendMessage,
    loadSessions,
    loadSession,
    newConversation,
    removeSession,
    removeAllSessions,
  } = useIAAdmin();

  const [darkMode, setDarkMode]         = useState(
    () => localStorage.getItem("adminTheme") !== "light"
  );
  const [confirmAction, setConfirmAction] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen && hasAccess) loadSessions();
  }, [isOpen, hasAccess, loadSessions]);

  // Cerrar con Escape, como cualquier ventana emergente
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === "Escape") setIsOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, setIsOpen]);

  useEffect(() => {
    const wrapper = document.querySelector(".admin-terminal-wrapper");
    if (!wrapper) return;
    const obs = new MutationObserver(() => {
      setDarkMode(wrapper.dataset.theme !== "light");
    });
    obs.observe(wrapper, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  if (!hasAccess) {
    // Sin feedback aquí, el botón del header parecía "no hacer nada" al
    // dar clic. Mostramos algo solo si el panel está abierto y ya se
    // resolvió la verificación (evita parpadeo mientras checkingAccess).
    if (!isOpen || checkingAccess) return null;
    return (
      <>
        <button
          type="button"
          className="ai-backdrop"
          aria-label="Cerrar asistente"
          onClick={() => setIsOpen(false)}
        />
        <div className={`ai-layout-sidebar is-open ${darkMode ? "ai--dark" : "ai--light"}`}>
          <div className="ai-sidebar-inner">
            <div className="ia-denied-card" style={{ margin: "auto" }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              </svg>
              <h2>Acceso Denegado</h2>
              <p>Solo administradores y propietarios pueden acceder al asistente de IA.</p>
              <button className="confirm-cancel" style={{ marginTop: 12 }} onClick={() => setIsOpen(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {isOpen && (
        <button
          type="button"
          className="ai-backdrop"
          aria-label="Cerrar asistente"
          onClick={() => setIsOpen(false)}
        />
      )}
      <div
        className={`ai-layout-sidebar ${isOpen ? "is-open" : "is-closed"} ${
          darkMode ? "ai--dark" : "ai--light"
        }`}
      >
      <div className="ai-sidebar-inner">
        {/* Header */}
        <header className="ai__header">
          <div className="ai__header-info">
            <div className="ai__status-dot" />
            <div>
              <h1 className="ai__header-title">VX AI Workspace</h1>
              <p className="ai__header-sub">Asistente Administrativo</p>
            </div>
          </div>
          <div className="ai__header-actions">
            <button
              className="ai__icon-btn"
              onClick={() => setConfirmAction({ title: "Nueva conversación", message: "¿Borrar la conversación actual y empezar una nueva?", fn: newConversation })}
              title="Nueva conversación"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <button
              className="ai__theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
              title="Cambiar tema"
            >
              {darkMode ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.22" x2="5.64" y2="17.78" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            <button
              className="ai__close-btn"
              onClick={() => setIsOpen(false)}
              title="Cerrar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </header>

        <div className="ai-sidebar__body">
          {/* Session chips */}
          {sessions.length > 0 && (
            <div className="ai__session-chips">
              {sessions.slice(0, 6).map((sid, i) => (
                <div key={sid} className="ai__session-chip-wrap">
                  <button
                    className={`ai__session-chip${sessionId === sid ? " ai__session-chip--active" : ""}`}
                    onClick={() => loadSession(sid)}
                    title={sid}
                  >
                    Conv. {sessions.length - i}
                  </button>
                  <button
                    className="ai__session-chip-del"
                    onClick={(e) => { e.stopPropagation(); setConfirmAction({ title: "Eliminar conversación", message: "¿Eliminar esta conversación del historial?", fn: () => removeSession(sid) }); }}
                    title="Eliminar conversación"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                className="ai__session-chip-del-all"
                onClick={() => setConfirmAction({ title: "Borrar historial", message: "¿Borrar todas las conversaciones? Esta acción no se puede deshacer.", fn: removeAllSessions })}
                title="Borrar todo el historial"
              >
                Borrar todo
              </button>
            </div>
          )}

          {/* Suggestions (only when chat is empty) */}
          {messages.length === 0 && !isLoading && (
            <div className="ai__suggestions">
              {SUGGESTIONS.map((q) => (
                <button
                  key={q}
                  className="ai__sugg-btn"
                  onClick={() => sendMessage(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Chat log */}
          <div className="ai__chat-container">
            <div className="ai__chat-log">
              {messages.map((msg) => (
                <MessageBubble key={msg.message_id} msg={msg} onStartFresh={newConversation} />
              ))}
              {isLoading && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>

            {toastError && (
              <div className="ai__rate-toast" role="alert">
                <span>⚠️ {toastError}</span>
                <button className="ai__rate-toast__close" onClick={() => setToastError(null)}>×</button>
              </div>
            )}

            <InputArea
              inputText={inputText}
              setInputText={setInputText}
              selectedImage={selectedImage}
              setSelectedImage={setSelectedImage}
              sendMessage={sendMessage}
              isLoading={isLoading}
              isRateLimited={isRateLimited}
              rateLimitText={rateLimitText}
            />
          </div>
        </div>
      </div>

      {confirmAction && (
        <ConfirmDialog
          title={confirmAction.title}
          message={confirmAction.message}
          onConfirm={() => { confirmAction.fn(); setConfirmAction(null); }}
          onCancel={() => setConfirmAction(null)}
        />
      )}
      </div>
    </>
  );
}

// ─── Full Page Mode (standalone route /IA) ────────────────────────────────────
function IAAdminPage() {
  const {
    hasAccess,
    checkingAccess,
    role,
    sessionId,
    messages,
    isLoading,
    inputText,
    setInputText,
    selectedImage,
    setSelectedImage,
    sessions,
    sessionsLoading,
    toastError,
    setToastError,
    isRateLimited,
    rateLimitText,
    sendMessage,
    loadSessions,
    loadSession,
    newConversation,
    removeSession,
    removeAllSessions,
  } = useIAAdmin();

  const [darkMode, setDarkMode]             = useState(
    () => localStorage.getItem("adminTheme") !== "light"
  );
  const [showSessions, setShowSessions]     = useState(true);
  const [confirmAction, setConfirmAction]   = useState(null);
  const messagesAreaRef = useRef(null);

  useEffect(() => {
    const el = messagesAreaRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isLoading]);

  useEffect(() => {
    if (hasAccess) loadSessions();
  }, [hasAccess, loadSessions]);

  useEffect(() => {
    const wrapper = document.querySelector(".admin-terminal-wrapper");
    if (!wrapper) return;
    const obs = new MutationObserver(() => {
      setDarkMode(wrapper.dataset.theme !== "light");
    });
    obs.observe(wrapper, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  if (checkingAccess) {
    return (
      <div className={`ia-page ${darkMode ? "ai--dark" : "ai--light"} ia-page--denied`}>
        <div className="ia-denied-card">
          <span className="ai__spinner" />
          <p>Verificando acceso...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className={`ia-page ${darkMode ? "ai--dark" : "ai--light"} ia-page--denied`}>
        <div className="ia-denied-card">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          </svg>
          <h2>Acceso Denegado</h2>
          <p>Solo administradores y propietarios pueden acceder al asistente de IA.</p>
          {role && <p className="ia-denied-role">Tu rol actual: <strong>{role}</strong></p>}
        </div>
      </div>
    );
  }

  return (
    <div className={`ia-page ${darkMode ? "ai--dark" : "ai--light"}`}>
      {/* Sessions sidebar */}
      <aside className={`ia-sessions-panel${showSessions ? " is-open" : ""}`}>
        <div className="ia-sessions-header">
          <h2 className="ia-sessions-title">Historial</h2>
          {sessions.length > 0 && (
            <button
              className="ai__icon-btn ia-sessions-del-all"
              onClick={() => setConfirmAction({ title: "Borrar historial", message: "¿Borrar todas las conversaciones? Esta acción no se puede deshacer.", fn: removeAllSessions })}
              title="Borrar todo el historial"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4h6v2" />
              </svg>
            </button>
          )}
        </div>

        {/* Nueva conversación — botón prominente */}
        <div className="ia-sessions-new-wrap">
          <button
            className="ia-sessions-new-btn"
            onClick={newConversation}
            title="Nueva conversación"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nueva conversación
          </button>
        </div>

        <div className="ia-sessions-list">
          {sessionsLoading ? (
            <p className="ia-sessions-empty">Cargando...</p>
          ) : sessions.length === 0 ? (
            <p className="ia-sessions-empty">Sin conversaciones anteriores.</p>
          ) : (
            sessions.map((sid, i) => (
              <div
                key={sid}
                className={`ia-session-item${sessionId === sid ? " ia-session-item--active" : ""}`}
              >
                <button
                  className="ia-session-item__btn"
                  onClick={() => loadSession(sid)}
                >
                  <span className="ia-session-num">{sessions.length - i}</span>
                  <span className="ia-session-label">Conversación {sessions.length - i}</span>
                </button>
                <button
                  className="ia-session-item__del"
                  onClick={() => setConfirmAction({ title: "Eliminar conversación", message: "¿Eliminar esta conversación del historial?", fn: () => removeSession(sid) })}
                  title="Eliminar"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main chat */}
      <main className="ia-chat-main">
        {/* Header */}
        <header className="ia-chat-header">
          <div className="ia-chat-header-left">
            <button
              className="ai__icon-btn"
              onClick={() => setShowSessions(!showSessions)}
              title="Historial"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div className="ai__status-dot" />
            <div>
              <h1 className="ia-chat-title">Asistente IA</h1>
              <p className="ia-chat-sub">
                {sessionId ? "Sesión activa" : "Nueva conversación"}
              </p>
            </div>
          </div>
          <div className="ia-chat-header-right">
            <button
              className="ai__icon-btn"
              onClick={() => setConfirmAction({ title: "Nueva conversación", message: "¿Borrar la conversación actual y empezar una nueva?", fn: newConversation })}
              title="Nueva conversación"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <button
              className="ai__theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
              title="Cambiar tema"
            >
              {darkMode ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.22" x2="5.64" y2="17.78" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="ia-messages-area" ref={messagesAreaRef}>
          {messages.length === 0 && !isLoading && (
            <div className="ia-welcome">
              <div className="ia-welcome-icon">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
                </svg>
              </div>
              <h3 className="ia-welcome-title">Asistente IA de Vexio</h3>
              <p className="ia-welcome-sub">
                Pregúntame sobre ventas, inventario, pedidos, promociones y más.
                También puedo analizar imágenes de tus productos.
              </p>
              <div className="ia-welcome-suggestions">
                {SUGGESTIONS.map((q) => (
                  <button
                    key={q}
                    className="ai__sugg-btn"
                    onClick={() => sendMessage(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <MessageBubble key={msg.message_id} msg={msg} onStartFresh={newConversation} />
          ))}
          {isLoading && <TypingIndicator />}
        </div>

        {/* Toast rate limit */}
        {toastError && (
          <div className="ai__rate-toast" role="alert">
            <span>⚠️ {toastError}</span>
            <button className="ai__rate-toast__close" onClick={() => setToastError(null)}>×</button>
          </div>
        )}

        {/* Input */}
        <div className="ia-input-wrapper">
          <InputArea
            inputText={inputText}
            setInputText={setInputText}
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
            sendMessage={sendMessage}
            isLoading={isLoading}
            isRateLimited={isRateLimited}
            rateLimitText={rateLimitText}
          />
        </div>
      </main>

      {confirmAction && (
        <ConfirmDialog
          title={confirmAction.title}
          message={confirmAction.message}
          onConfirm={() => { confirmAction.fn(); setConfirmAction(null); }}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
}

// ─── Root Export: detects sidebar vs page mode ────────────────────────────────
export default function AIAdmin({ isOpen, setIsOpen }) {
  if (isOpen === undefined) {
    return <IAAdminPage />;
  }
  return <IAAdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} />;
}
