import { useState, useEffect, useRef } from "react";
import "./AIAdmin.css";

// ─── Datos Estáticos ─────────────────────────────────────────

const SALES_DATA = [
  { day: "Lun", value: 68 },
  { day: "Mar", value: 85 },
  { day: "Mié", value: 72 },
  { day: "Jue", value: 91 },
  { day: "Vie", value: 78 },
  { day: "Sáb", value: 95 },
  { day: "Hoy", value: 62 },
];

const TOP_PRODUCTS = [
  { name: "Zapatillas Pro X1",  sales: 148, pct: 100 },
  { name: "Mochila Urban 30L",  sales: 112, pct: 76  },
  { name: "Audífonos BT-500",   sales: 89,  pct: 60  },
  { name: "Reloj Smart V3",     sales: 67,  pct: 45  },
];

const INITIAL_ALERTS = [
  { id: 1, type: "warning", text: "7 productos con stock bajo requieren reposición urgente." },
  { id: 2, type: "info",    text: "Campaña de verano activa hasta el 15 de junio." },
];

const SUGGESTIONS = [
  "¿Cómo van las ventas hoy?",
  "¿Qué productos tienen bajo stock?",
  "¿Cuál es el ticket promedio?",
];

// ─── Base de Conocimiento del Chat ───────────────────────────

const KB = {
  ventas:       "Las ventas de hoy alcanzan $142,500, un 8 % por encima del promedio diario. El mejor horario fue entre las 14h–17h con $48,200 en transacciones. El canal más activo es la app móvil (62 %).",
  hoy:          "Hoy se han procesado 38 pedidos. Hora pico: 15:30 con 9 pedidos simultáneos. La tasa de abandono de carrito es del 22 %, por debajo del promedio mensual.",
  stock:        "Hay 7 productos con stock crítico: Zapatillas Pro X1 (3 uds.), Audífonos BT-500 (5), Mochila Urban 30L (2) y 4 SKUs adicionales. Recomiendo generar órdenes de compra automáticas.",
  ticket:       "El ticket promedio del mes es $36.00, un 4.2 % superior al mes anterior. Pedidos con más de 2 artículos tienen ticket de $54.80.",
  fallback:     "Puedo ayudarte con información sobre ventas, inventario, métricas de conversión y rendimiento de productos. ¿Qué aspecto te interesa analizar?",
};

function getResponse(text) {
  const t = text.toLowerCase();
  if (t.includes("ventas") && t.includes("hoy")) return KB.hoy;
  if (t.includes("ventas"))                        return KB.ventas;
  if (t.includes("hoy"))                           return KB.hoy;
  if (t.includes("stock") || t.includes("inventario")) return KB.stock;
  if (t.includes("ticket") || t.includes("promedio"))  return KB.ticket;
  return KB.fallback;
}

// ─── Subcomponentes Visuales ─────────────────────────────────

function MetricCard({ label, value, delta, deltaClass, warn }) {
  return (
    <div className={`ai__metric${warn ? " ai__metric--warn" : ""}`}>
      <p className="ai__metric-label">{label}</p>
      <p className="ai__metric-value">{value}</p>
      {delta && <p className={`ai__metric-delta ai__metric-delta--${deltaClass}`}>{delta}</p>}
    </div>
  );
}

const MAX_BAR = Math.max(...SALES_DATA.map((d) => d.value));

function BarChart() {
  return (
    <div className="ai__card">
      <p className="ai__section-title">Ventas semanales</p>
      <div className="ai__bars">
        {SALES_DATA.map(({ day, value }) => {
          const h = Math.round((value / MAX_BAR) * 45);
          const today = day === "Hoy";
          return (
            <div key={day} className="ai__bar-col">
              <span className="ai__bar-val">{value}</span>
              <div className={`ai__bar-fill${today ? " ai__bar-fill--today" : ""}`} style={{ height: h }} />
              <span className={`ai__bar-day${today ? " ai__bar-day--today" : ""}`}>{day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TopProducts() {
  return (
    <div className="ai__card">
      <p className="ai__section-title">Top productos</p>
      {TOP_PRODUCTS.map(({ name, sales, pct }) => (
        <div key={name} className="ai__prog-row">
          <div className="ai__prog-meta">
            <span className="ai__prog-name">{name}</span>
            <span className="ai__prog-sales">{sales} u.</span>
          </div>
          <div className="ai__prog-track">
            <div className="ai__prog-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Alerts({ alerts, onDismiss }) {
  if (!alerts.length) return null;
  return (
    <div className="ai__alerts-container">
      {alerts.map(({ id, type, text }) => (
        <div key={id} className={`ai__alert ai__alert--${type}`}>
          <span>{text}</span>
          <button className="ai__alert-dismiss" onClick={() => onDismiss(id)}>✕</button>
        </div>
      ))}
    </div>
  );
}

// ─── Componente Principal (Sidebar de Layout) ─────────────────

export default function AIAdmin({ isOpen, setIsOpen }) {
  const [darkMode, setDarkMode] = useState(false);
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [messages, setMessages] = useState([
    { id: 0, role: "bot", text: "¡Hola! Soy tu asistente VX AI integrado. ¿Qué métricas de la plataforma deseas auditar hoy?" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const logRef = useRef(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const sendMessage = (text) => {
    const txt = (text ?? input).trim();
    if (!txt || typing) return;
    setInput("");
    setMessages((prev) => [...prev, { id: Date.now(), role: "user", text: txt }]);
    setTyping(true);
    
    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: "bot", text: getResponse(txt) }]);
    }, 850);
  };

  const dismiss = (id) => setAlerts((prev) => prev.filter((a) => a.id !== id));

  return (
    <div className={`ai-layout-sidebar ${isOpen ? "is-open" : "is-closed"} ${darkMode ? "ai--dark" : "ai--light"}`}>
      <div className="ai-sidebar-inner">
        {/* Cabecera */}
        <header className="ai__header">
          <div className="ai__header-info">
            <div className="ai__status-dot" />
            <div>
              <h1 className="ai__header-title">VX AI Workspace</h1>
              <p className="ai__header-sub">Análisis Operativo</p>
            </div>
          </div>
          
          <div className="ai__header-actions">
            {/* Toggle de modo claro/oscuro */}
            <button className="ai__theme-toggle" onClick={() => setDarkMode(!darkMode)} title="Cambiar tema">
              {darkMode ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.22" x2="5.64" y2="17.78"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              )}
            </button>
            <button className="ai__close-btn" onClick={() => setIsOpen(false)} title="Colapsar panel">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </header>

        {/* Panel de Contenidos Scrolleable */}
        <div className="ai-sidebar__body">
          
          {/* Tarjetas métricas */}
          <div className="ai__metrics">
            <MetricCard label="Ventas" value="$4.5M" delta="+18%" deltaClass="pos" />
            <MetricCard label="Pedidos" value="125" delta="+6 hoy" deltaClass="pos" />
            <MetricCard label="Stock Bajo" value="7" delta="Acción" deltaClass="warn" warn />
          </div>

          {/* Reportes Visuales */}
          <div className="ai__visual-row">
            <BarChart />
            <TopProducts />
          </div>

          {/* Alertas */}
          <Alerts alerts={alerts} onDismiss={dismiss} />

          {/* Sección de Chat */}
          <div className="ai__chat-container">
            <div className="ai__suggestions">
              {SUGGESTIONS.map((q) => (
                <button key={q} className="ai__sugg-btn" onClick={() => sendMessage(q)}>{q}</button>
              ))}
            </div>

            <div className="ai__chat-log" ref={logRef}>
              {messages.map(({ id, role, text }) => (
                <div key={id} className={`ai__bubble ai__bubble--${role}`}>{text}</div>
              ))}
              {typing && (
                <div className="ai__bubble ai__bubble--bot ai__typing">
                  <span className="ai__dot" /><span className="ai__dot" /><span className="ai__dot" />
                </div>
              )}
            </div>

            <div className="ai__input-row">
              <input
                className="ai__input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Pregúntame algo..."
              />
              <button className="ai__send-btn" onClick={() => sendMessage()} disabled={typing}>
                Enviar
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}