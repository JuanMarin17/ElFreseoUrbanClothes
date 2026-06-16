import { useState, useEffect, useRef, useCallback, startTransition } from "react";
import "./Report.css";

// ============================================================
//  CONFIGURACIÓN DE API
// ============================================================
const BASE = import.meta.env.VITE_API_URL;

const buildHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("jwt")}`,
  "X-Store-Id": localStorage.getItem("storeId"),
});

async function apiFetch(path) {
  try {
    const res = await fetch(`${BASE}${path}`, { headers: buildHeaders() });
    if (res.status === 401) throw new Error("UNAUTHORIZED");
    if (res.status === 400) throw new Error("STORE_ID_MISSING");
    if (!res.ok) throw new Error(`HTTP_${res.status}`);
    const text = await res.text();
    if (!text) throw new Error("EMPTY_RESPONSE");
    return JSON.parse(text);
  } catch (e) {
    if (e.message === "UNAUTHORIZED" || e.message === "STORE_ID_MISSING") throw e;
    if (e.name === "TypeError" || e.message?.includes("Failed to fetch") || e.message?.includes("NetworkError")) {
      throw new Error("EMPTY_RESPONSE");
    }
    throw e;
  }
}

const getDashboard    = ()           => apiFetch("/reports/dashboard");
const getStockReport  = ()           => apiFetch("/reports/stock");
const getOrdersReport = (days = 30)  => apiFetch(`/reports/orders?days=${days}`);
const getSalesReport  = (days = 30)  => apiFetch(`/reports/sales?days=${days}`);

// ============================================================
//  DATOS POR DEFECTO (cuando el servidor no responde)
// ============================================================
const FALLBACK_DASHBOARD = {
  todayRevenue: 0, weekRevenue: 0, monthRevenue: 0, totalRevenue: 0,
  activeProducts: 0, inactiveProducts: 0, lowStockVariants: 0, outOfStockVariants: 0,
  pendingOrders: 0, confirmedOrders: 0, processingOrders: 0, shippedOrders: 0,
  deliveredOrders: 0, cancelledOrders: 0, refundedOrders: 0, totalOrders: 0,
  topProducts: [],
};
const FALLBACK_STOCK = {
  summary: { healthyStockVariants: 0, lowStockVariants: 0, outOfStockVariants: 0, totalStockValue: 0 },
  lowStockItems: [], outOfStockItems: [], byCategory: [],
};
const FALLBACK_ORDERS = {
  summary: { total: 0, pending: 0, delivered: 0, averageOrderValue: 0, confirmed: 0, processing: 0, shipped: 0, cancelled: 0, refunded: 0 },
  dailyBreakdown: [], topProducts: [],
};
const FALLBACK_SALES = {
  summary: { todayRevenue: 0, weekRevenue: 0, monthRevenue: 0, averageTicket: 0 },
  dailyBreakdown: [], byPaymentMethod: [], topProductsByRevenue: [],
};

// ============================================================
//  UTILIDADES
// ============================================================
const formatCOP = (v) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP",
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(v ?? 0);

const QUICK_PERIODS = [
  { key: "1D",  label: "Hoy",       days: 1  },
  { key: "7D",  label: "Semana",    days: 7  },
  { key: "30D", label: "Mes",       days: 30 },
  { key: "90D", label: "Trimestre", days: 90 },
  { key: "ALL", label: "Todo",      days: 0  },
];

const ORDER_STATUS_COLORS = {
  pendingOrders:    "#f59e0b",
  confirmedOrders:  "#3b82f6",
  processingOrders: "#6366f1",
  shippedOrders:    "#0ea5e9",
  deliveredOrders:  "#22c55e",
  cancelledOrders:  "#ef4444",
  refundedOrders:   "#f43f5e",
};
const ORDER_STATUS_LABELS = {
  pendingOrders:    "Pendiente",
  confirmedOrders:  "Confirmada",
  processingOrders: "En proceso",
  shippedOrders:    "Enviada",
  deliveredOrders:  "Entregada",
  cancelledOrders:  "Cancelada",
  refundedOrders:   "Reembolsada",
};

// ============================================================
//  HOOK: useAnimatedCount
// ============================================================
function useAnimatedCount(target, duration = 1000) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(easeProgress * target));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [target, duration]);
  return value;
}

// ============================================================
//  SUBCOMPONENTE: StatCard
// ============================================================
function StatCard({ label, value, prefix = "", suffix = "", color = "#4f8ef7", icon }) {
  const anim = useAnimatedCount(typeof value === "number" ? value : 0);
  return (
    <div className="rp-stat-card" style={{ "--rp-accent": color }}>
      <div className="rp-stat-header">
        <span className="rp-stat-label">{label}</span>
        {icon && (
          <div className="rp-stat-icon-wrap" style={{ background: `${color}18` }}>
            <i className={`ti ti-${icon} rp-stat-icon`} style={{ color }} aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="rp-stat-value" style={{ color }}>
        {prefix}{anim.toLocaleString("es-CO")}{suffix}
      </div>
    </div>
  );
}

// ============================================================
//  SUBCOMPONENTE: AlertBanner
// ============================================================
function AlertBanner({ type, message }) {
  if (!message) return null;
  const styles = {
    error:   { className: "rp-alert-error", icon: "alert-circle" },
    warning: { className: "rp-alert-warning", icon: "alert-triangle" },
    info:    { className: "rp-alert-info", icon: "info-circle" },
  };
  const s = styles[type] || styles.info;
  return (
    <div className={`rp-alert ${s.className}`}>
      <i className={`ti ti-${s.icon}`} aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}

// ============================================================
//  SUBCOMPONENTE: DonutChart (Animado)
// ============================================================
function DonutChart({ slices, size = 160 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !slices?.length) return;
    const ctx = canvas.getContext("2d");

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const R = size * 0.4;
    const r = size * 0.26;

    const total = slices.reduce((s, x) => s + (x.value || 0), 0) || 1;
    const DURATION = 1200;
    let start = null, raf;

    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

    function draw(ts) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / DURATION, 1);
      const ease = easeOutQuart(progress);

      ctx.clearRect(0, 0, size, size);
      let angle = -Math.PI / 2;

      slices.forEach(({ value, color }) => {
        const sliceAngle = (value / total) * 2 * Math.PI * ease;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, R, angle, angle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();

        angle += sliceAngle;
      });

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, 2 * Math.PI);
      ctx.fillStyle = "#121217";
      ctx.fill();

      if (progress < 1) raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [slices, size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size, display: "block", margin: "0 auto" }}
      role="img"
      aria-label="Gráfico circular de distribución"
    />
  );
}

// ============================================================
//  SUBCOMPONENTE: MiniBarChart (Animado)
// ============================================================
function MiniBarChart({ data, labelKey = "date", valueKey = "orderCount", color = "#4f8ef7" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data?.length) return;
    const ctx = canvas.getContext("2d");

    const W = 600, H = 220;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const padB = 32, padT = 20, padL = 40, padR = 20;
    const max = Math.max(...data.map((d) => d[valueKey])) * 1.15 || 1;

    const chartW = W - padL - padR;
    const chartH = H - padT - padB;
    const bw = (chartW / data.length) * 0.65;
    const gap = (chartW / data.length) * 0.35;

    const DURATION = 1000;
    let start = null, raf;

    const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

    function draw(ts) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / DURATION, 1);
      const ease = easeOutExpo(progress);

      ctx.clearRect(0, 0, W, H);

      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const yLine = padT + (chartH / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padL, yLine);
        ctx.lineTo(W - padR, yLine);
        ctx.stroke();
      }

      data.forEach((d, i) => {
        const x = padL + i * (bw + gap) + gap / 2;
        const fullH = (d[valueKey] / max) * chartH;
        const h = fullH * ease;
        const y = H - padB - h;

        const gradient = ctx.createLinearGradient(x, y, x, H - padB);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, `${color}22`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, bw, h, [4, 4, 0, 0]);
        } else {
          ctx.rect(x, y, bw, h);
        }
        ctx.fill();

        ctx.fillStyle = "#8a8a98";
        ctx.font = "10px Inter, sans-serif";
        ctx.textAlign = "center";
        const rawLbl = String(d[labelKey]);
        const lbl = rawLbl.includes("-") ? rawLbl.split("-")[2] : rawLbl.slice(-2);
        ctx.fillText(lbl, x + bw / 2, H - 12);
      });

      ctx.fillStyle = "#6b6b76";
      ctx.font = "10px Inter, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(Math.round(max).toLocaleString(), padL - 8, padT + 4);
      ctx.fillText(Math.round(max / 2).toLocaleString(), padL - 8, padT + (chartH / 2) + 4);
      ctx.fillText("0", padL - 8, H - padB);

      if (progress < 1) raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [data, valueKey, color]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: 220, display: "block" }}
      role="img"
      aria-label="Gráfico de barras dinámico"
    />
  );
}

// ============================================================
//  SUBCOMPONENTE: LineAreaChart (Animado)
// ============================================================
function LineAreaChart({ data, dateKey = "date", valueKey = "revenue", color = "#22c55e" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data?.length) return;
    const ctx = canvas.getContext("2d");

    const W = 800, H = 260;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const pad = { t: 24, b: 36, l: 54, r: 24 };
    const max = Math.max(...data.map((d) => d[valueKey])) * 1.15 || 1;
    const DURATION = 1200;
    let start = null, raf;

    const xP = (i) => pad.l + i * ((W - pad.l - pad.r) / Math.max(data.length - 1, 1));
    const yP = (v) => H - pad.b - (v / max) * (H - pad.t - pad.b);
    const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    function draw(ts) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / DURATION, 1);
      const ease = easeInOutCubic(progress);

      ctx.clearRect(0, 0, W, H);

      ctx.strokeStyle = "rgba(255,255,255,0.03)";
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const yY = pad.t + ((H - pad.t - pad.b) / 4) * i;
        ctx.beginPath();
        ctx.moveTo(pad.l, yY);
        ctx.lineTo(W - pad.r, yY);
        ctx.stroke();
      }

      const pts = data.map((d, i) => ({ x: xP(i), y: yP(d[valueKey] * ease) }));

      if (pts.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(pts[0].x, H - pad.b);
        pts.forEach((pt) => ctx.lineTo(pt.x, pt.y));
        ctx.lineTo(pts[pts.length - 1].x, H - pad.b);
        ctx.closePath();

        const areaGrad = ctx.createLinearGradient(0, pad.t, 0, H - pad.b);
        areaGrad.addColorStop(0, `${color}25`);
        areaGrad.addColorStop(1, `${color}00`);
        ctx.fillStyle = areaGrad;
        ctx.fill();

        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.beginPath();
        pts.forEach((pt, i) => i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y));
        ctx.stroke();
      }

      data.forEach((d, i) => {
        if (i % Math.ceil(data.length / 10) === 0) {
          ctx.fillStyle = "#8a8a98";
          ctx.font = "10px Inter, sans-serif";
          ctx.textAlign = "center";
          const rawLbl = String(d[dateKey]);
          const lbl = rawLbl.includes("-") ? rawLbl.split("-")[2] : rawLbl.slice(-2);
          ctx.fillText(lbl, xP(i), H - 14);
        }
      });

      ctx.fillStyle = "#6b6b76";
      ctx.font = "10px Inter, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(`$${Math.round(max/1000)}k`, pad.l - 10, pad.t + 4);
      ctx.fillText(`$${Math.round(max/2000)}k`, pad.l - 10, pad.t + ((H - pad.t - pad.b)/2) + 4);
      ctx.fillText("$0", pad.l - 10, H - pad.b);

      if (progress < 1) raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [data, valueKey, dateKey, color]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: 260, display: "block" }}
      role="img"
      aria-label="Gráfico lineal interactivo de ingresos"
    />
  );
}

// ============================================================
//  SUBCOMPONENTE: ProgressBar
// ============================================================
function ProgressBar({ current, max, color = "#f59e0b" }) {
  const pct = Math.min((current / max) * 100, 100);
  return (
    <div className="rp-progress-bg">
      <div className="rp-progress-fill" style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}60` }} />
    </div>
  );
}

// ============================================================
//  SUBCOMPONENTE: StatusBadge
// ============================================================
function StatusBadge({ status }) {
  const map = {
    PENDING:    { label: "Pendiente",  color: "#f59e0b" },
    CONFIRMED:  { label: "Confirmada", color: "#3b82f6" },
    PROCESSING: { label: "En proceso", color: "#6366f1" },
    SHIPPED:    { label: "Enviada",    color: "#0ea5e9" },
    DELIVERED:  { label: "Entregada",  color: "#22c55e" },
    CANCELLED:  { label: "Cancelada",  color: "#ef4444" },
    REFUNDED:   { label: "Reembolso",  color: "#f43f5e" },
  };
  const s = map[status] || { label: status, color: "#888" };
  return (
    <span className="rp-badge" style={{ background: `${s.color}15`, color: s.color, borderColor: `${s.color}35` }}>
      {s.label}
    </span>
  );
}

// ============================================================
//  SUBCOMPONENTE: DateFilter (período / mes / año)
// ============================================================
const MONTH_NAMES = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];

function DateFilter({ value, onChange }) {
  const [mode, setMode] = useState("quick");
  const today = new Date();
  const currentYear  = today.getFullYear();
  const currentMonth = today.getMonth();

  const [pickerYear,  setPickerYear]  = useState(currentYear);
  const [pickerMonth, setPickerMonth] = useState(currentMonth);

  const availableYears = Array.from({ length: 4 }, (_, i) => currentYear - i);

  const calcMonthDays = (year, month) =>
    Math.ceil((today - new Date(year, month, 1)) / 86400000) + 1;

  const calcYearDays = (year) =>
    Math.ceil((today - new Date(year, 0, 1)) / 86400000) + 1;

  const handlePickerYearChange = (y) => {
    setPickerYear(y);
    if (y === currentYear && pickerMonth > currentMonth) setPickerMonth(currentMonth);
  };

  return (
    <div className="rp-date-filter">
      <div className="rp-df-modes">
        {[
          { k: "quick", label: "Período", icon: "clock"         },
          { k: "month", label: "Mes",     icon: "calendar-month" },
          { k: "year",  label: "Año",     icon: "calendar"       },
        ].map(({ k, label, icon }) => (
          <button
            key={k}
            className={`rp-df-mode-btn ${mode === k ? "active" : ""}`}
            onClick={() => setMode(k)}
          >
            <i className={`ti ti-${icon}`} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {mode === "quick" && (
        <div className="rp-period-btns">
          {QUICK_PERIODS.map(({ key, label, days }) => (
            <button
              key={key}
              className={`rp-period-btn ${value === days ? "active" : ""}`}
              onClick={() => onChange(days)}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {mode === "month" && (
        <div className="rp-df-picker">
          <select
            className="rp-df-select"
            value={pickerMonth}
            onChange={e => setPickerMonth(Number(e.target.value))}
          >
            {MONTH_NAMES.map((name, i) =>
              !(pickerYear === currentYear && i > currentMonth) ? (
                <option key={i} value={i}>{name}</option>
              ) : null
            )}
          </select>
          <select
            className="rp-df-select"
            value={pickerYear}
            onChange={e => handlePickerYearChange(Number(e.target.value))}
          >
            {availableYears.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button
            className="rp-df-apply-btn"
            onClick={() => onChange(calcMonthDays(pickerYear, pickerMonth))}
          >
            <i className="ti ti-search" aria-hidden="true" />
            Ver
          </button>
        </div>
      )}

      {mode === "year" && (
        <div className="rp-period-btns">
          {availableYears.map(year => (
            <button
              key={year}
              className={`rp-period-btn ${value === calcYearDays(year) ? "active" : ""}`}
              onClick={() => onChange(calcYearDays(year))}
            >
              {year}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
//  SUBCOMPONENTE: EmptyState
// ============================================================
function EmptyState({ icon = "inbox", message = "Sin datos disponibles" }) {
  return (
    <div className="rp-empty">
      <div className="rp-empty-icon">
        <i className={`ti ti-${icon}`} aria-hidden="true" />
      </div>
      <p className="rp-empty-text">{message}</p>
    </div>
  );
}

// ============================================================
//  SUBCOMPONENTE: Skeleton Loading
// ============================================================
function SkeletonLoader() {
  return (
    <div className="rp-skeleton-wrapper">
      <div className="rp-skeleton-grid">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rp-skeleton-card card-sm" />
        ))}
      </div>
      <div className="rp-skeleton-split">
        <div className="rp-skeleton-card card-lg" />
        <div className="rp-skeleton-card card-md" />
      </div>
    </div>
  );
}

// ============================================================
//  SECCIÓN: Dashboard Principal
// ============================================================
function DashboardSection({ data, loading, error }) {
  if (loading) return <SkeletonLoader />;
  if (error)   return <AlertBanner type="error" message={`Error al cargar el panel: ${error}`} />;
  if (!data)   return null;

  const orderStatusKeys = [
    "pendingOrders", "confirmedOrders", "processingOrders",
    "shippedOrders", "deliveredOrders", "cancelledOrders", "refundedOrders",
  ];

  const donutSlices = orderStatusKeys
    .filter((k) => data[k] > 0)
    .map((k) => ({ label: ORDER_STATUS_LABELS[k], value: data[k], color: ORDER_STATUS_COLORS[k] }));

  return (
    <div className="rp-section animate-fade-in">
      {data.outOfStockVariants > 0 && (
        <AlertBanner type="error" message={`${data.outOfStockVariants} variante(s) sin stock en almacén. Revisa el inventario.`} />
      )}
      {data.lowStockVariants > 0 && (
        <AlertBanner type="warning" message={`Alerta: ${data.lowStockVariants} variante(s) con stock por debajo del límite mínimo.`} />
      )}

      <div className="rp-group">
        <div className="rp-section-title">
          <i className="ti ti-trending-up" aria-hidden="true" />
          Finanzas e Ingresos
        </div>
        <div className="rp-kpi-row">
          <StatCard label="Hoy"         value={data.todayRevenue}  prefix="$" color="#22c55e" icon="currency-dollar" />
          <StatCard label="Esta semana" value={data.weekRevenue}   prefix="$" color="#3b82f6" icon="trending-up" />
          <StatCard label="Este mes"    value={data.monthRevenue}  prefix="$" color="#8b5cf6" icon="chart-bar" />
          <StatCard label="Total"       value={data.totalRevenue}  prefix="$" color="#f59e0b" icon="coins" />
        </div>
      </div>

      <div className="rp-group">
        <div className="rp-section-title">
          <i className="ti ti-package" aria-hidden="true" />
          Estado del Catálogo
        </div>
        <div className="rp-kpi-row">
          <StatCard label="Activos"    value={data.activeProducts}     color="#22c55e" icon="package" />
          <StatCard label="Inactivos"  value={data.inactiveProducts}   color="#6b7280" icon="package-off" />
          <StatCard label="Stock bajo" value={data.lowStockVariants}   color="#f59e0b" icon="alert-triangle" />
          <StatCard label="Sin stock"  value={data.outOfStockVariants} color="#ef4444" icon="package-import" />
        </div>
      </div>

      <div className="rp-group">
        <div className="rp-section-title">
          <i className="ti ti-shopping-cart" aria-hidden="true" />
          Operaciones
        </div>
        <div className="rp-kpi-row">
          <StatCard label="Pendientes" value={data.pendingOrders}  color="#f59e0b" icon="clock" />
          <StatCard label="Entregadas" value={data.deliveredOrders} color="#22c55e" icon="check" />
          <StatCard label="Total"      value={data.totalOrders}     color="#3b82f6" icon="shopping-cart" />
          <StatCard label="Canceladas" value={data.cancelledOrders} color="#ef4444" icon="x" />
        </div>
      </div>

      <div className="rp-charts-row">
        <div className="rp-card">
          <div className="rp-card-title">
            <i className="ti ti-chart-donut" aria-hidden="true" />
            Distribución de órdenes
          </div>
          <div className="rp-chart-container-donut">
            <DonutChart slices={donutSlices} size={150} />
          </div>
          <div className="rp-donut-legend">
            {donutSlices.length > 0 ? donutSlices.map((s) => (
              <div key={s.label} className="rp-legend-item">
                <span className="rp-legend-dot" style={{ background: s.color }} />
                <span className="rp-legend-label">{s.label}</span>
                <span className="rp-legend-val">{s.value}</span>
              </div>
            )) : <EmptyState icon="chart-donut" message="Sin órdenes registradas" />}
          </div>
        </div>

        <div className="rp-card">
          <div className="rp-card-title">
            <i className="ti ti-trophy" aria-hidden="true" />
            Top 5 productos más vendidos
          </div>
          <div className="rp-table-wrap">
            {(data.topProducts || []).length > 0 ? (
              <table className="rp-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Producto</th>
                    <th className="text-right">Unidades</th>
                    <th className="text-right">Ingresos</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.topProducts || []).slice(0, 5).map((p, i) => (
                    <tr key={p.productId || i}>
                      <td className="rp-rank"><span>#{i + 1}</span></td>
                      <td className="font-medium text-white">{p.productName}</td>
                      <td className="text-right font-mono">{p.unitsSold.toLocaleString("es-CO")}</td>
                      <td className="text-right font-mono text-green">{formatCOP(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <EmptyState icon="trophy" message="Sin datos de productos aún" />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
//  SECCIÓN: Inventario
// ============================================================
function StockSection({ data, loading, error }) {
  if (loading) return <SkeletonLoader />;
  if (error)   return <AlertBanner type="error" message={`Error al cargar inventario: ${error}`} />;
  if (!data)   return null;

  const { summary, lowStockItems, outOfStockItems, byCategory } = data;

  return (
    <div className="rp-section animate-fade-in">
      <div className="rp-kpi-row">
        <StatCard label="Variantes sanas" value={summary.healthyStockVariants} color="#22c55e" icon="circle-check" />
        <StatCard label="Stock bajo"      value={summary.lowStockVariants}     color="#f59e0b" icon="alert-triangle" />
        <StatCard label="Sin stock"       value={summary.outOfStockVariants}   color="#ef4444" icon="circle-x" />
        <StatCard label="Valor del stock" value={summary.totalStockValue}      prefix="$" color="#3b82f6" icon="coins" />
      </div>

      {outOfStockItems?.length > 0 && (
        <div className="rp-card border-red-dim">
          <div className="rp-card-title text-red">
            <i className="ti ti-circle-x" aria-hidden="true" />
            Variantes Críticas Sin Stock
            <span className="rp-card-badge rp-card-badge--red">{outOfStockItems.length}</span>
          </div>
          <div className="rp-table-wrap">
            <table className="rp-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>SKU</th>
                  <th>Precio Base</th>
                  <th className="text-right">Stock Mín.</th>
                </tr>
              </thead>
              <tbody>
                {outOfStockItems.map((item) => (
                  <tr key={item.sku}>
                    <td className="text-white font-medium">{item.productName}</td>
                    <td><code className="rp-sku">{item.sku}</code></td>
                    <td className="font-mono">{formatCOP(item.price)}</td>
                    <td className="text-right font-mono text-red">{item.minStock} uds.</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {lowStockItems?.length > 0 && (
        <div className="rp-card border-orange-dim">
          <div className="rp-card-title text-orange">
            <i className="ti ti-alert-triangle" aria-hidden="true" />
            Reposición Necesaria — Stock Bajo
            <span className="rp-card-badge rp-card-badge--orange">{lowStockItems.length}</span>
          </div>
          <div className="rp-table-wrap">
            <table className="rp-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>SKU</th>
                  <th>Actual / Mínimo</th>
                  <th style={{ width: "30%" }}>Nivel Crítico</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.map((item) => (
                  <tr key={item.sku}>
                    <td className="text-white font-medium">{item.productName}</td>
                    <td><code className="rp-sku">{item.sku}</code></td>
                    <td className="font-mono">{item.currentStock} / {item.minStock}</td>
                    <td>
                      <ProgressBar current={item.currentStock} max={item.minStock} color="#f59e0b" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {byCategory?.length > 0 && (
        <div className="rp-card">
          <div className="rp-card-title">
            <i className="ti ti-layout-grid" aria-hidden="true" />
            Análisis de Almacén por Categoría
          </div>
          <div className="rp-table-wrap">
            <table className="rp-table">
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th className="text-right">Productos</th>
                  <th className="text-right">Stock Total</th>
                  <th className="text-right">Stock Bajo</th>
                  <th className="text-right">Agotado</th>
                </tr>
              </thead>
              <tbody>
                {byCategory.map((cat) => (
                  <tr key={cat.categoryName}>
                    <td className="text-white font-medium">{cat.categoryName}</td>
                    <td className="text-right font-mono">{cat.productCount}</td>
                    <td className="text-right font-mono">{cat.totalStock.toLocaleString("es-CO")}</td>
                    <td className="text-right font-mono">
                      {cat.lowStockCount > 0
                        ? <span className="rp-badge-inline rp-badge-orange">{cat.lowStockCount}</span>
                        : <span className="text-green">—</span>}
                    </td>
                    <td className="text-right font-mono">
                      {cat.outOfStockCount > 0
                        ? <span className="rp-badge-inline rp-badge-red">{cat.outOfStockCount}</span>
                        : <span className="text-green">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
//  SECCIÓN: Órdenes
// ============================================================
function OrdersSection({ data, loading, error, period, onPeriodChange }) {
  if (loading) return <SkeletonLoader />;
  if (error)   return <AlertBanner type="error" message={`Error al cargar órdenes: ${error}`} />;

  return (
    <div className="rp-section animate-fade-in">
      <div className="rp-section-header">
        <div className="rp-section-title" style={{ margin: 0 }}>
          <i className="ti ti-shopping-cart" aria-hidden="true" />
          Auditoría de Órdenes
        </div>
        <DateFilter value={period} onChange={onPeriodChange} />
      </div>

      {!data ? (
        <div className="rp-card"><EmptyState icon="clock" message="Seleccionando período temporal..." /></div>
      ) : (
        <>
          <div className="rp-kpi-row">
            <StatCard label="Total Recibidas"      value={data.summary.total}             color="#3b82f6" icon="shopping-cart" />
            <StatCard label="Pendientes"           value={data.summary.pending}           color="#f59e0b" icon="clock" />
            <StatCard label="Entregadas con Éxito" value={data.summary.delivered}         color="#22c55e" icon="check" />
            <StatCard label="Ticket Promedio"      value={data.summary.averageOrderValue} prefix="$" color="#8b5cf6" icon="receipt" />
          </div>

          <div className="rp-status-grid">
            {[
              { key: "confirmed",  label: "Confirmadas",  color: "#3b82f6", icon: "circle-check" },
              { key: "processing", label: "En Proceso",   color: "#6366f1", icon: "loader" },
              { key: "shipped",    label: "Enviadas",     color: "#0ea5e9", icon: "truck" },
              { key: "cancelled",  label: "Canceladas",   color: "#ef4444", icon: "circle-x" },
              { key: "refunded",   label: "Reembolsadas", color: "#f43f5e", icon: "receipt-refund" },
            ].map(({ key, label, color, icon }) => (
              <div key={key} className="rp-status-chip" style={{ "--chip-color": color }}>
                <div className="rp-status-chip-icon" style={{ background: `${color}15`, color }}>
                  <i className={`ti ti-${icon}`} aria-hidden="true" />
                </div>
                <div className="rp-status-chip-body">
                  <span className="rp-status-count" style={{ color }}>{data.summary[key] || 0}</span>
                  <span className="rp-status-lbl">{label}</span>
                </div>
              </div>
            ))}
          </div>

          {data.dailyBreakdown?.length > 0 ? (
            <div className="rp-card">
              <div className="rp-card-title">
                <i className="ti ti-chart-bar" aria-hidden="true" />
                Volumen de Órdenes Diarias
              </div>
              <div className="rp-canvas-wrapper">
                <MiniBarChart data={data.dailyBreakdown} labelKey="date" valueKey="orderCount" color="#3b82f6" />
              </div>
            </div>
          ) : null}

          {data.topProducts?.length > 0 && (
            <div className="rp-card">
              <div className="rp-card-title">
                <i className="ti ti-star" aria-hidden="true" />
                Productos Más Solicitados
              </div>
              <div className="rp-table-wrap">
                <table className="rp-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Nombre del Producto</th>
                      <th className="text-right">Unidades</th>
                      <th className="text-right">Bruto Generado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topProducts.slice(0, 5).map((p, i) => (
                      <tr key={i}>
                        <td className="rp-rank"><span>#{i + 1}</span></td>
                        <td className="text-white font-medium">{p.productName}</td>
                        <td className="text-right font-mono">{p.unitsSold}</td>
                        <td className="text-right font-mono text-green">{formatCOP(p.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ============================================================
//  SECCIÓN: Ventas
// ============================================================
function SalesSection({ data, loading, error, period, onPeriodChange }) {
  if (loading) return <SkeletonLoader />;
  if (error)   return <AlertBanner type="error" message={`Error al cargar ventas: ${error}`} />;

  return (
    <div className="rp-section animate-fade-in">
      <div className="rp-section-header">
        <div className="rp-section-title" style={{ margin: 0 }}>
          <i className="ti ti-chart-line" aria-hidden="true" />
          Informe Estadístico de Ventas
        </div>
        <DateFilter value={period} onChange={onPeriodChange} />
      </div>

      {!data ? (
        <div className="rp-card"><EmptyState icon="clock" message="Cargando desglose de caja..." /></div>
      ) : (
        <>
          <div className="rp-kpi-row">
            <StatCard label="Caja Hoy"            value={data.summary.todayRevenue}   prefix="$" color="#22c55e" icon="currency-dollar" />
            <StatCard label="Canal Semanal"        value={data.summary.weekRevenue}    prefix="$" color="#3b82f6" icon="trending-up" />
            <StatCard label="Consolidado Mensual"  value={data.summary.monthRevenue}   prefix="$" color="#8b5cf6" icon="chart-bar" />
            <StatCard label="Ticket Medio"         value={data.summary.averageTicket}  prefix="$" color="#f59e0b" icon="receipt" />
          </div>

          {data.dailyBreakdown?.length > 0 && (
            <div className="rp-card">
              <div className="rp-card-title">
                <i className="ti ti-activity" aria-hidden="true" />
                Flujo Continuo de Ingresos
              </div>
              <div className="rp-canvas-wrapper">
                <LineAreaChart data={data.dailyBreakdown} dateKey="date" valueKey="revenue" color="#22c55e" />
              </div>
            </div>
          )}

          <div className="rp-charts-row">
            {data.byPaymentMethod?.length > 0 && (
              <div className="rp-card">
                <div className="rp-card-title">
                  <i className="ti ti-credit-card" aria-hidden="true" />
                  Métodos de Pago
                </div>
                <div className="rp-chart-container-donut">
                  <DonutChart
                    slices={data.byPaymentMethod.map((m, i) => ({
                      label: m.method,
                      value: m.count,
                      color: ["#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6", "#ef4444"][i % 5],
                    }))}
                    size={140}
                  />
                </div>
                <div className="rp-donut-legend">
                  {data.byPaymentMethod.map((m, i) => (
                    <div key={m.method} className="rp-legend-item">
                      <span className="rp-legend-dot"
                        style={{ background: ["#3b82f6","#22c55e","#f59e0b","#8b5cf6","#ef4444"][i % 5] }} />
                      <span className="rp-legend-label">{m.method}</span>
                      <span className="rp-legend-val">{m.percentage.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.topProductsByRevenue?.length > 0 && (
              <div className="rp-card">
                <div className="rp-card-title">
                  <i className="ti ti-flame" aria-hidden="true" />
                  Productos Líderes en Facturación
                </div>
                <div className="rp-table-wrap">
                  <table className="rp-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Producto</th>
                        <th className="text-right">Uds.</th>
                        <th className="text-right">Ingreso Bruto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topProductsByRevenue.slice(0, 5).map((p, i) => (
                        <tr key={i}>
                          <td className="rp-rank"><span>#{i + 1}</span></td>
                          <td className="text-white font-medium">{p.productName}</td>
                          <td className="text-right font-mono">{p.unitsSold}</td>
                          <td className="text-right font-mono text-green">{formatCOP(p.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================
//  COMPONENTE PRINCIPAL: Report
// ============================================================
export default function Report() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [ordersPeriod, setOrdersPeriod] = useState(30);
  const [salesPeriod,  setSalesPeriod]  = useState(30);

  const [dashboardData, setDashboardData] = useState(null);
  const [stockData,     setStockData]     = useState(null);
  const [ordersData,    setOrdersData]    = useState(null);
  const [salesData,     setSalesData]     = useState(null);

  const [loading, setLoading] = useState({});
  const [errors,  setErrors]  = useState({});

  const setLoad  = (key, val) => setLoading((p) => ({ ...p, [key]: val }));
  const setError = (key, val) => setErrors((p)  => ({ ...p, [key]: val }));

  const handleAuthError = useCallback((err) => {
    if (err.message === "UNAUTHORIZED") {
      window.location.href = "/login";
    }
  }, []);

  useEffect(() => {
    if (activeTab !== "dashboard" || dashboardData) return;
    const t = setTimeout(() => {
      startTransition(() => setLoad("dashboard", true));
      getDashboard()
        .then(d => startTransition(() => setDashboardData(d ?? FALLBACK_DASHBOARD)))
        .catch(e => startTransition(() => {
          if (e.message === "EMPTY_RESPONSE") { setDashboardData(FALLBACK_DASHBOARD); return; }
          handleAuthError(e); setError("dashboard", e.message);
        }))
        .finally(() => startTransition(() => setLoad("dashboard", false)));
    }, 0);
    return () => clearTimeout(t);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "stock" || stockData) return;
    const t = setTimeout(() => {
      startTransition(() => setLoad("stock", true));
      getStockReport()
        .then(d => startTransition(() => setStockData(d ?? FALLBACK_STOCK)))
        .catch(e => startTransition(() => {
          if (e.message === "EMPTY_RESPONSE") { setStockData(FALLBACK_STOCK); return; }
          handleAuthError(e); setError("stock", e.message);
        }))
        .finally(() => startTransition(() => setLoad("stock", false)));
    }, 0);
    return () => clearTimeout(t);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "orders") return;
    const t = setTimeout(() => {
      startTransition(() => { setLoad("orders", true); setOrdersData(null); });
      getOrdersReport(ordersPeriod)
        .then(d => startTransition(() => setOrdersData(d ?? FALLBACK_ORDERS)))
        .catch(e => startTransition(() => {
          if (e.message === "EMPTY_RESPONSE") { setOrdersData(FALLBACK_ORDERS); return; }
          handleAuthError(e); setError("orders", e.message);
        }))
        .finally(() => startTransition(() => setLoad("orders", false)));
    }, 0);
    return () => clearTimeout(t);
  }, [activeTab, ordersPeriod]);

  useEffect(() => {
    if (activeTab !== "sales") return;
    const t = setTimeout(() => {
      startTransition(() => { setLoad("sales", true); setSalesData(null); });
      getSalesReport(salesPeriod)
        .then(d => startTransition(() => setSalesData(d ?? FALLBACK_SALES)))
        .catch(e => startTransition(() => {
          if (e.message === "EMPTY_RESPONSE") { setSalesData(FALLBACK_SALES); return; }
          handleAuthError(e); setError("sales", e.message);
        }))
        .finally(() => startTransition(() => setLoad("sales", false)));
    }, 0);
    return () => clearTimeout(t);
  }, [activeTab, salesPeriod]);

  const tabs = [
    { key: "dashboard", label: "Panel Principal", icon: "layout-dashboard" },
    { key: "stock",     label: "Inventario",      icon: "package" },
    { key: "orders",    label: "Órdenes",         icon: "shopping-cart" },
    { key: "sales",     label: "Análisis Caja",   icon: "chart-line" },
  ];

  return (
    <div className="rp-page">

      {/* ── Header Banner Premium ──────────────────────────── */}
      <header className="rp-header">
        <div className="rp-header-glow rp-header-glow--blue" />
        <div className="rp-header-glow rp-header-glow--purple" />
        <div className="rp-header-content">
          <div className="rp-header-text">
            <div className="rp-header-eyebrow">
              <i className="ti ti-chart-dots" aria-hidden="true" />
              Analytics
            </div>
            <h1 className="rp-title">Centro de Reportes</h1>
            <p className="rp-subtitle">Analítica en tiempo real de tu tienda</p>
          </div>
          <div className="rp-header-actions">
            <div className="rp-live-badge">
              <span className="rp-live-dot" />
              En vivo
            </div>
          
          </div>
        </div>
      </header>

      {/* ── Navegación por tabs ────────────────────────────── */}
      <div className="rp-tabs-wrap">
        <div className="rp-tabs">
          {tabs.map((t) => (
            <button
              key={t.key}
              className={`rp-tab ${activeTab === t.key ? "active" : ""}`}
              onClick={() => setActiveTab(t.key)}
            >
              <i className={`ti ti-${t.icon}`} aria-hidden="true" />
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Contenido ─────────────────────────────────────── */}
      <div className="rp-content">
        {activeTab === "dashboard" && (
          <DashboardSection data={dashboardData} loading={loading.dashboard} error={errors.dashboard} />
        )}
        {activeTab === "stock" && (
          <StockSection data={stockData} loading={loading.stock} error={errors.stock} />
        )}
        {activeTab === "orders" && (
          <OrdersSection
            data={ordersData}
            loading={loading.orders}
            error={errors.orders}
            period={ordersPeriod}
            onPeriodChange={setOrdersPeriod}
          />
        )}
        {activeTab === "sales" && (
          <SalesSection
            data={salesData}
            loading={loading.sales}
            error={errors.sales}
            period={salesPeriod}
            onPeriodChange={setSalesPeriod}
          />
        )}
      </div>
    </div>
  );
}
