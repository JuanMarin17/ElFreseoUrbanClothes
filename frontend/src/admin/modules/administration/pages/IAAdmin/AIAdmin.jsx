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

// ─── Shared: Message Bubble ──────────────────────────────────────────────────
function MessageBubble({ msg }) {
  const isUser = msg.role === "user";
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
        <p className="ai__bubble-text">{msg.content}</p>
        {!isUser && msg.action && (
          <ActionRenderer
            action={msg.action}
            action_data={msg.action_data}
            enhanced_image_base64={msg.enhanced_image_base64}
            enhanced_image_mime_type={msg.enhanced_image_mime_type}
            originalImageSrc={msg.originalImagePreviewUrl}
          />
        )}
      </div>
    </div>
  );
}

// ─── Shared: Input Area ──────────────────────────────────────────────────────
function InputArea({ inputText, setInputText, selectedImage, setSelectedImage, sendMessage, isLoading }) {
  const fileInputRef = useRef(null);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="ai__input-area">
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
          disabled={isLoading}
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
          placeholder="Pregúntame algo..."
          rows={1}
          disabled={isLoading}
        />
        <button
          className="ai__send-btn"
          onClick={() => sendMessage()}
          disabled={isLoading || !inputText.trim()}
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
    sessionId,
    messages,
    isLoading,
    inputText,
    setInputText,
    selectedImage,
    setSelectedImage,
    sessions,
    sendMessage,
    loadSessions,
    loadSession,
    newConversation,
  } = useIAAdmin();

  const [darkMode, setDarkMode] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen && hasAccess) loadSessions();
  }, [isOpen, hasAccess]);

  if (!hasAccess) return null;

  return (
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
              onClick={newConversation}
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
              title="Colapsar panel"
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
                <button
                  key={sid}
                  className={`ai__session-chip${sessionId === sid ? " ai__session-chip--active" : ""}`}
                  onClick={() => loadSession(sid)}
                  title={sid}
                >
                  Conv. {sessions.length - i}
                </button>
              ))}
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
                <MessageBubble key={msg.message_id} msg={msg} />
              ))}
              {isLoading && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>

            <InputArea
              inputText={inputText}
              setInputText={setInputText}
              selectedImage={selectedImage}
              setSelectedImage={setSelectedImage}
              sendMessage={sendMessage}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Full Page Mode (standalone route /IA) ────────────────────────────────────
function IAAdminPage() {
  const {
    hasAccess,
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
    sendMessage,
    loadSessions,
    loadSession,
    newConversation,
  } = useIAAdmin();

  const [darkMode, setDarkMode]           = useState(false);
  const [showSessions, setShowSessions]   = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (hasAccess) loadSessions();
  }, [hasAccess]);

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
          <h2 className="ia-sessions-title">Conversaciones</h2>
          <button
            className="ai__icon-btn ia-sessions-new"
            onClick={newConversation}
            title="Nueva conversación"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nueva
          </button>
        </div>

        <div className="ia-sessions-list">
          {sessionsLoading ? (
            <p className="ia-sessions-empty">Cargando...</p>
          ) : sessions.length === 0 ? (
            <p className="ia-sessions-empty">Sin conversaciones anteriores.</p>
          ) : (
            sessions.map((sid, i) => (
              <button
                key={sid}
                className={`ia-session-item${sessionId === sid ? " ia-session-item--active" : ""}`}
                onClick={() => loadSession(sid)}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Conversación {sessions.length - i}
              </button>
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
              onClick={newConversation}
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
        <div className="ia-messages-area">
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
            <MessageBubble key={msg.message_id} msg={msg} />
          ))}
          {isLoading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="ia-input-wrapper">
          <InputArea
            inputText={inputText}
            setInputText={setInputText}
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
            sendMessage={sendMessage}
            isLoading={isLoading}
          />
        </div>
      </main>
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
