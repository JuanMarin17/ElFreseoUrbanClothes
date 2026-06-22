import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { sendMessage, deleteSession, deleteAllSessions } from "../../pages/services/aiChatService.js";
import { getChatSession, setChatSession, clearChatSession } from "../../../utils/chatSession.js";
import "./AiChatDrawer.css";

const formatCOP = (n) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(n ?? 0);

const formatTime = (d) =>
  new Date(d).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });

const SUGGESTIONS = [
  "¿Qué productos tienen disponibles?",
  "Busco una camiseta talla M",
  "¿Tienen descuentos activos?",
  "Quiero ver las novedades",
];

/* ── Tarjeta de recomendación ────────────────── */
function RecCard({ product, storeId }) {
  const navigate = useNavigate();
  const img      = product.imageUrl ?? product.images?.[0]?.url ?? null;
  const name     = product.name ?? "Producto";
  const variants = product.variants ?? [];
  const price    = variants.length
    ? Math.min(...variants.map(v => v.price).filter(p => p != null))
    : (product.price ?? null);
  const totalStock = variants.length
    ? variants.reduce((sum, v) => sum + (v.stock ?? 0), 0)
    : null;
  const productId = product.productId ?? product.id;

  const goToProduct = () => {
    if (!productId) return;
    navigate(`/products/${productId}?src=store${storeId ? `&sid=${storeId}` : ""}`);
  };

  return (
    <div
      className="ai-rec-card"
      onClick={goToProduct}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && goToProduct()}
    >
      {img ? (
        <img src={img} alt={name} className="ai-rec-card__img" />
      ) : (
        <div className="ai-rec-card__img-placeholder">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
      )}
      <div className="ai-rec-card__body">
        <p className="ai-rec-card__name">{name}</p>
        {price != null && <p className="ai-rec-card__price">{formatCOP(price)}</p>}
        {totalStock != null && (
          <p className={`ai-rec-card__stock ${totalStock === 0 ? "ai-rec-card__stock--out" : ""}`}>
            {totalStock === 0 ? "Sin stock" : `${totalStock} disponibles`}
          </p>
        )}
      </div>
    </div>
  );
}

/* ── Burbuja de mensaje ──────────────────────── */
function Bubble({ msg, storeId }) {
  const isUser = msg.role === "user";
  return (
    <div className={`ai-bubble ai-bubble--${isUser ? "user" : "assistant"}`}>
      {!isUser && <span className="ai-bubble__sender">✦ Asistente IA</span>}
      {msg.imagePreview && <img src={msg.imagePreview} alt="adjunto" className="ai-bubble__img" />}
      <div className="ai-bubble__text">{msg.content}</div>
      {msg.actionToast && (
        <div className={`ai-action-toast ${msg.actionToast.variant ?? ""}`}>
          <span>{msg.actionToast.icon}</span>
          <span>{msg.actionToast.text}</span>
        </div>
      )}
      {msg.recommendations?.length > 0 && (
        <div className="ai-recommendations">
          <p className="ai-recommendations__title">Productos sugeridos</p>
          <div className="ai-recommendations__grid">
            {msg.recommendations.map((p, i) => (
              <RecCard key={p.productId ?? p.id ?? i} product={p} storeId={storeId} />
            ))}
          </div>
        </div>
      )}
      <span className="ai-bubble__time">{formatTime(msg.createdAt)}</span>
    </div>
  );
}

/* ── Mini bar chart ──────────────────────────── */
const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Hoy"];

function MiniBarChart({ products }) {
  const total = products.length || 1;
  const vals  = [
    Math.round(total * 0.46),
    Math.round(total * 0.57),
    Math.round(total * 0.48),
    Math.round(total * 0.61),
    Math.round(total * 0.52),
    Math.round(total * 0.64),
    Math.round(total * 0.41),
  ];
  const max = Math.max(...vals, 1);
  return (
    <div className="ai-bars">
      {DAYS.map((day, i) => {
        const active = i === DAYS.length - 1;
        const pct    = Math.round((vals[i] / max) * 100);
        return (
          <div className="ai-bar-wrap" key={day}>
            <div
              className={`ai-bar${active ? " ai-bar--active" : ""}`}
              style={{ height: `${Math.max(pct * 0.60, 4)}px` }}
            />
            <span className={`ai-bar-lbl${active ? " ai-bar-lbl--active" : ""}`}>{day}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════════
   AiChatDrawer
   Props:
     storeId       string
     onCartRefresh fn
     accentColor   string
     products      array
     storeName     string
════════════════════════════════════════════ */
export default function AiChatDrawer({ storeId, onCartRefresh, accentColor, products = [], storeName = "Tienda" }) {
  const [isOpen,    setIsOpen]    = useState(false);
  const [messages,  setMessages]  = useState([]);
  const [text,      setText]      = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const [sessionId, setSessionId] = useState(() => getChatSession(storeId));

  const [hiddenAlerts, setHiddenAlerts] = useState([]);

  const [imageFile,     setImageFile]     = useState(null);
  const [imagePreview,  setImagePreview]  = useState(null);
  const [imageBase64,   setImageBase64]   = useState(null);
  const [imageMimeType, setImageMimeType] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef    = useRef(null);
  const fileInputRef   = useRef(null);

  const isLoggedIn = !!localStorage.getItem("jwt") && localStorage.getItem("jwt") !== "null";
  const hasMessages = messages.length > 0;

  /* stats derivados de los productos */
  const totalProducts = products.length;
  const categories    = [...new Set(products.map(p => p.category).filter(Boolean))].length || Math.max(1, Math.floor(totalProducts / 3));
  const topProducts   = [...products].slice(0, 4);
  const maxTopVal     = topProducts.length ? Math.max(...topProducts.map((_, i) => totalProducts - i * 2)) : 1;

  const ALERTS = [
    { id: "tip1", type: "amber", text: "Envíame una foto de lo que buscas y te ayudo a encontrar algo similar en la tienda." },
    { id: "tip2", type: "blue",  text: "Puedo agregar productos a tu carrito, verificar tallas y avisarte cuando haya stock." },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
  }, [text]);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImageMimeType(file.type);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setImagePreview(dataUrl);
      setImageBase64(dataUrl.split(",")[1]);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, []);

  const clearImage = useCallback(() => {
    setImageFile(null);
    setImagePreview(null);
    setImageBase64(null);
    setImageMimeType(null);
  }, []);

  const resolveAction = useCallback((action, actionData) => {
    if (!action) return null;
    switch (action) {
      case "ADD_TO_CART":
        if (onCartRefresh) onCartRefresh();
        return { icon: "🛒", text: "Producto agregado al carrito", variant: "ai-action-toast--green" };
      case "STOCK_NOTIFY":
        return { icon: "🔔", text: "Alerta de stock activada", variant: "ai-action-toast--amber" };
      case "SUPPORT_TICKET":
        return { icon: "🎫", text: `Ticket creado: ${actionData?.subject ?? ""}`, variant: "" };
      case "ORDER_SUMMARY":
        if (onCartRefresh) onCartRefresh();
        return { icon: "📦", text: "Resumen de orden en tu carrito", variant: "" };
      case "VALIDATE_COUPON":
        return { icon: "🏷️", text: "Cupón aplicado", variant: "ai-action-toast--green" };
      case "CREATE_REVIEW":
        return { icon: "⭐", text: "Reseña guardada", variant: "ai-action-toast--green" };
      case "COMPARE":
        return { icon: "↔️", text: "Comparando productos", variant: "" };
      default:
        return null;
    }
  }, [onCartRefresh]);

  const handleSend = useCallback(async (overrideText) => {
    const content = (overrideText ?? text).trim();
    if (!content && !imageBase64) return;
    if (loading) return;
    if (!isLoggedIn) { setError("Debes iniciar sesión para usar el asistente."); return; }

    const userMsg = {
      role: "user",
      content: content || "📷 Imagen enviada",
      imagePreview: imagePreview ?? undefined,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setText("");
    clearImage();
    setError(null);
    setLoading(true);

    try {
      const res = await sendMessage(sessionId, content || "Analiza esta imagen", imageBase64, imageMimeType, storeId);
      if (!sessionId && res.session_id) {
        setSessionId(res.session_id);
        setChatSession(storeId, res.session_id);
      }

      const toast = resolveAction(res.action, res.action_data);
      const recs = res.product_recommendations ?? [];

      setMessages(prev => [...prev, {
        role: "assistant",
        content: res.message,
        actionToast: toast,
        recommendations: recs,
        createdAt: new Date().toISOString(),
      }]);
    } catch (err) {
      setError(err.message ?? "No se pudo conectar con el asistente.");
    } finally {
      setLoading(false);
    }
  }, [text, imageBase64, imagePreview, imageMimeType, loading, sessionId, isLoggedIn, clearImage, resolveAction]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }, [handleSend]);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setSessionId(null);
    clearChatSession(storeId);
    setError(null);
    clearImage();
  }, [clearImage, storeId]);

  const handleDeleteSession = useCallback(async () => {
    if (!sessionId) return;
    const sid = sessionId;
    setMessages([]);
    setSessionId(null);
    clearChatSession(storeId);
    setError(null);
    clearImage();
    try {
      await deleteSession(sid, storeId);
    } catch {
      // silent — local state already cleared
    }
  }, [sessionId, storeId, clearImage]);

  const handleDeleteAll = useCallback(async () => {
    setMessages([]);
    setSessionId(null);
    clearChatSession(storeId);
    setError(null);
    clearImage();
    try {
      await deleteAllSessions(storeId);
    } catch {
      // silent
    }
  }, [storeId, clearImage]);

  return (
    <>
      {/* Botón flotante */}
      <button
        className="ai-fab"
        onClick={() => setIsOpen(o => !o)}
        aria-label="Abrir asistente IA"
        title="Asistente de compras IA"
        style={accentColor ? { background: accentColor } : undefined}
      >
        {isOpen ? (
          <svg className="ai-fab__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg className="ai-fab__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
            <path d="M5 3V7M19 17v4M3 5h4M17 19h4"/>
          </svg>
        )}
        {!isOpen && hasMessages && <span className="ai-fab__badge" />}
      </button>

      {/* Backdrop */}
      <div
        className={`ai-backdrop ${isOpen ? "ai-backdrop--visible" : ""}`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside className={`ai-panel ${isOpen ? "ai-panel--open" : ""}`} aria-label="Asistente de compras IA">

        {/* Header */}
        <div className="ai-header">
          <div className="ai-header__avatar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
            </svg>
          </div>
          <div className="ai-header__info">
            <p className="ai-header__name">Asistente IA</p>
            <p className="ai-header__sub"><span className="ai-header__online" />{storeName} · en línea</p>
          </div>
          <div className="ai-header__actions">
            {hasMessages && (
              <>
                <button
                  className="ai-header__btn"
                  onClick={() => setConfirmAction({ title: "Eliminar conversación", message: "¿Eliminar esta conversación y su historial? Esta acción no se puede deshacer.", fn: handleDeleteSession })}
                  title="Borrar esta conversación"
                  aria-label="Borrar conversación"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4h6v2" />
                  </svg>
                </button>
                <button
                  className="ai-header__btn"
                  onClick={() => setConfirmAction({ title: "Nueva conversación", message: "¿Borrar la conversación actual y empezar una nueva?", fn: handleNewChat })}
                  title="Nueva conversación"
                  aria-label="Nueva conversación"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 4 1 10 7 10" />
                    <path d="M3.51 15a9 9 0 1 0 .49-3" />
                  </svg>
                </button>
              </>
            )}
            <button className="ai-header__btn" onClick={() => setIsOpen(false)} aria-label="Cerrar">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body scrollable */}
        <div className="ai-body">
          {!hasMessages ? (
            /* ── Vista dashboard ── */
            <div className="ai-dashboard">

              {/* Welcome hero */}
              <div className="ai-welcome">
                <div className="ai-welcome__avatar">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                    <path d="M5 3V7M19 17v4M3 5h4M17 19h4"/>
                  </svg>
                </div>
                <div className="ai-welcome__text">
                  <h3 className="ai-welcome__title">¿En qué te ayudo?</h3>
                  <p className="ai-welcome__sub">Tu asesor de compras personal</p>
                </div>
              </div>

              <p className="ai-section-label">Resumen de la tienda</p>

              {/* Stat cards */}
              <div className="ai-stats">
                <div className="ai-stat-card ai-stat-card--blue">
                  <span className="ai-stat-card__icon">🛍️</span>
                  <span className="ai-stat-label">Productos</span>
                  <span className="ai-stat-value">{totalProducts}</span>
                  <span className="ai-stat-sub">disponibles</span>
                </div>
                <div className="ai-stat-card ai-stat-card--green">
                  <span className="ai-stat-card__icon">📂</span>
                  <span className="ai-stat-label">Categorías</span>
                  <span className="ai-stat-value">{categories}</span>
                  <span className="ai-stat-sub">en tienda</span>
                </div>
                <div className="ai-stat-card ai-stat-card--amber">
                  <span className="ai-stat-card__icon">✨</span>
                  <span className="ai-stat-label">Asesor IA</span>
                  <span className="ai-stat-value" style={{ fontSize: 15, paddingTop: 2 }}>Activo</span>
                  <span className="ai-stat-sub">disponible</span>
                </div>
              </div>

              {/* Chart + product list */}
              <div className="ai-two-col">
                <div className="ai-card">
                  <p className="ai-card__title">Rango de Precios</p>
                  <MiniBarChart products={products} />
                </div>
                <div className="ai-card">
                  <p className="ai-card__title">Productos Destacados</p>
                  {topProducts.length > 0 ? (
                    <div className="ai-prod-list">
                      {topProducts.map((p, i) => {
                        const price = p.variants?.[0]?.price ?? p.price ?? null;
                        const pct   = Math.round(((topProducts.length - i) / topProducts.length) * 100);
                        return (
                          <div className="ai-prod-row" key={p.id ?? i}>
                            <span className="ai-prod-row__name">{p.name}</span>
                            <div className="ai-prod-row__bar-wrap">
                              <div className="ai-prod-row__bar" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="ai-prod-row__val">
                              {price != null ? formatCOP(price).replace("$", "$") : "—"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p style={{ fontSize: 12, color: "#94a3b8" }}>Sin productos cargados</p>
                  )}
                </div>
              </div>

              {/* Alert banners */}
              <div className="ai-alerts">
                {ALERTS.filter(a => !hiddenAlerts.includes(a.id)).map(a => (
                  <div key={a.id} className={`ai-alert ai-alert--${a.type}`}>
                    <span className="ai-alert__text">{a.text}</span>
                    <button
                      className="ai-alert__close"
                      onClick={() => setHiddenAlerts(prev => [...prev, a.id])}
                      aria-label="Cerrar alerta"
                    >✕</button>
                  </div>
                ))}
              </div>

              {/* Mensaje inicial del asistente */}
              <div className="ai-messages" style={{ paddingTop: 4, paddingBottom: 4 }}>
                <div className="ai-bubble ai-bubble--assistant">
                  <span className="ai-bubble__sender">✦ Asistente IA</span>
                  <div className="ai-bubble__text">
                    {isLoggedIn
                      ? `¡Hola! Soy tu asistente de compras IA. Puedo ayudarte a encontrar productos, verificar tallas, aplicar cupones y más. ¿En qué te puedo ayudar hoy?`
                      : "¡Hola! Para usar el asistente debes iniciar sesión primero."}
                  </div>
                  <span className="ai-bubble__time">{formatTime(new Date())}</span>
                </div>
              </div>

            </div>
          ) : (
            /* ── Vista conversación ── */
            <div className="ai-messages">
              {messages.map((msg, i) => <Bubble key={i} msg={msg} storeId={storeId} />)}
              {loading && (
                <div className="ai-typing">
                  <span className="ai-typing__dot" />
                  <span className="ai-typing__dot" />
                  <span className="ai-typing__dot" />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="ai-error" onClick={() => setError(null)}>{error}</div>
        )}

        {/* Imagen adjunta preview */}
        {imagePreview && (
          <div className="ai-img-preview">
            <img src={imagePreview} alt="preview" className="ai-img-preview__thumb" />
            <span className="ai-img-preview__name">{imageFile?.name ?? "imagen"}</span>
            <button className="ai-img-preview__remove" onClick={clearImage} aria-label="Quitar imagen">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}

        {/* Chips de sugerencia */}
        <div className="ai-chips-row">
          {SUGGESTIONS.map(s => (
            <button key={s} className="ai-chip" onClick={() => handleSend(s)} disabled={loading}>
              {s}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="ai-footer">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <button
            className="ai-footer__attach"
            onClick={() => fileInputRef.current?.click()}
            title="Adjuntar imagen"
            aria-label="Adjuntar imagen"
            disabled={loading}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </button>

          <div className="ai-footer__input-wrap">
            <textarea
              ref={textareaRef}
              className="ai-footer__textarea"
              placeholder="Escribe tu consulta..."
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={loading}
            />
          </div>

          <button
            className="ai-footer__send"
            onClick={() => handleSend()}
            disabled={loading || (!text.trim() && !imageBase64)}
            aria-label="Enviar"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>

      </aside>

      {confirmAction && (
        <div className="vx-confirm-overlay" onClick={() => setConfirmAction(null)} role="dialog" aria-modal="true">
          <div className="vx-confirm-box" onClick={e => e.stopPropagation()}>
            <div className="vx-confirm-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4h6v2" />
              </svg>
            </div>
            <h3 className="vx-confirm-title">{confirmAction.title}</h3>
            <p className="vx-confirm-msg">{confirmAction.message}</p>
            <div className="vx-confirm-actions">
              <button className="vx-confirm-cancel" onClick={() => setConfirmAction(null)}>Cancelar</button>
              <button className="vx-confirm-ok" onClick={() => { confirmAction.fn(); setConfirmAction(null); }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
