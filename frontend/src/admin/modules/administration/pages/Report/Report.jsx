import { useState, useEffect, useRef, useCallback } from "react";
import "./Report.css";

// ============================================================
//  CONFIGURACIÓN DE API
// ============================================================
const BASE = "http://localhost:8080/api/v1";

const buildHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("jwt")}`,
  "X-Store-Id": localStorage.getItem("storeId"),
});

async function apiFetch(path) {
  const res = await fetch(`${BASE}${path}`, { headers: buildHeaders() });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (res.status === 400) throw new Error("STORE_ID_MISSING");
  if (!res.ok) throw new Error(`HTTP_${res.status}`);
  return res.json();
}

const getDashboard    = ()           => apiFetch("/reports/dashboard");
const getStockReport  = ()           => apiFetch("/reports/stock");
const getOrdersReport = (days = 30)  => apiFetch(`/reports/orders?days=${days}`);
const getSalesReport  = (days = 30)  => apiFetch(`/reports/sales?days=${days}`);

// ============================================================
//  UTILIDADES
// ============================================================
const formatCOP = (v) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP",
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(v ?? 0);

const periodToDays = (p) => ({ "7D": 7, "30D": 30, "90D": 90, "ALL": 0 }[p] ?? 30);

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
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      setValue(Math.round(start));
      if (start >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

// ============================================================
//  SUBCOMPONENTE: StatCard
// ============================================================
function StatCard({ label, value, prefix = "", suffix = "", color = "#4f8ef7", icon }) {
  const anim = useAnimatedCount(typeof value === "number" ? value : 0);
  return (
    <div className="rp-stat-card">
      {icon && <i className={`ti ti-${icon} rp-stat-icon`} style={{ color }} aria-hidden="true" />}
      <div className="rp-stat-label">{label}</div>
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
    error:   { bg: "#fef2f2", border: "#fca5a5", color: "#991b1b", icon: "alert-circle" },
    warning: { bg: "#fffbeb", border: "#fcd34d", color: "#92400e", icon: "alert-triangle" },
    info:    { bg: "#eff6ff", border: "#93c5fd", color: "#1e40af", icon: "info-circle" },
  };
  const s = styles[type] || styles.info;
  return (
    <div className="rp-alert" style={{ background: s.bg, borderColor: s.border, color: s.color }}>
      <i className={`ti ti-${s.icon}`} aria-hidden="true" />
      {message}
    </div>
  );
}

// ============================================================
//  SUBCOMPONENTE: DonutChart
// ============================================================
function DonutChart({ slices, size = 140 }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !slices?.length) return;
    const ctx = canvas.getContext("2d");
    const cx = canvas.width / 2, cy = canvas.height / 2;
    const R = 54, r = 36;
    let angle = -Math.PI / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const total = slices.reduce((s, x) => s + (x.value || 0), 0) || 1;
    slices.forEach(({ value, color }) => {
      const slice = (value / total) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R, angle, angle + slice);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      angle += slice;
    });
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.fillStyle = "var(--rp-card-bg, #1a1a2e)";
    ctx.fill();
  }, [slices]);
  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ display: "block", margin: "0 auto" }}
      role="img"
      aria-label="Gráfico de dona"
    />
  );
}

// ============================================================
//  SUBCOMPONENTE: BarChart — pedidos / ventas por día
// ============================================================
function MiniBarChart({ data, labelKey = "date", valueKey = "orderCount", color = "#4f8ef7" }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data?.length) return;
    const ctx  = canvas.getContext("2d");
    const W    = canvas.width, H = canvas.height;
    const padB = 24, padT = 8, padL = 8, padR = 8;
    const max  = Math.max(...data.map((d) => d[valueKey])) * 1.1 || 1;
    const bw   = (W - padL - padR) / data.length - 4;
    const DURATION = 800;
    let start = null, raf;

    const ease = (t) => 1 - Math.pow(1 - t, 3);

    function draw(ts) {
      if (!start) start = ts;
      const p = Math.min((ts - start) / DURATION, 1);
      const e = ease(p);
      ctx.clearRect(0, 0, W, H);
      data.forEach((d, i) => {
        const x    = padL + i * ((W - padL - padR) / data.length) + 2;
        const fullH = (d[valueKey] / max) * (H - padT - padB);
        const h    = fullH * e;
        const y    = H - padB - h;
        ctx.fillStyle = color + "55";
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x, y, bw, h, 3);
        else ctx.rect(x, y, bw, h);
        ctx.fill();
        // label
        ctx.fillStyle = "#666";
        ctx.font = "9px sans-serif";
        ctx.textAlign = "center";
        const lbl = String(d[labelKey]).slice(8) || String(d[labelKey]).slice(-2);
        ctx.fillText(lbl, x + bw / 2, H - 6);
      });
      if (p < 1) raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [data, valueKey, color]);

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={140}
      style={{ width: "100%", height: 140 }}
      role="img"
      aria-label="Gráfico de barras"
    />
  );
}

// ============================================================
//  SUBCOMPONENTE: LineAreaChart — ingresos por día
// ============================================================
function LineAreaChart({ data, dateKey = "date", valueKey = "revenue", color = "#22c55e" }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data?.length) return;
    const ctx = canvas.getContext("2d");
    const W   = canvas.width, H = canvas.height;
    const pad = { t: 12, b: 28, l: 8, r: 8 };
    const max = Math.max(...data.map((d) => d[valueKey])) * 1.1 || 1;
    const DURATION = 1000;
    let start = null, raf;

    const xP = (i) => pad.l + i * ((W - pad.l - pad.r) / Math.max(data.length - 1, 1));
    const yP = (v) => H - pad.b - (v / max) * (H - pad.t - pad.b);
    const ease = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    function draw(ts) {
      if (!start) start = ts;
      const p    = Math.min((ts - start) / DURATION, 1);
      const ep   = ease(p);
      const seg  = (data.length - 1) * ep;
      const full = Math.floor(seg);
      const frac = seg - full;

      ctx.clearRect(0, 0, W, H);

      const pts = data.slice(0, full + 1).map((d, i) => ({ x: xP(i), y: yP(d[valueKey]) }));
      if (full < data.length - 1) {
        pts.push({
          x: xP(full) + (xP(full + 1) - xP(full)) * frac,
          y: yP(data[full][valueKey]) + (yP(data[full + 1][valueKey]) - yP(data[full][valueKey])) * frac,
        });
      }

      if (pts.length >= 2) {
        const last = pts[pts.length - 1];
        ctx.beginPath();
        pts.forEach((pt, i) => i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y));
        ctx.lineTo(last.x, H - pad.b);
        ctx.lineTo(xP(0), H - pad.b);
        ctx.closePath();
        ctx.fillStyle = color + "22";
        ctx.fill();

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.lineJoin = "round";
        ctx.beginPath();
        pts.forEach((pt, i) => i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y));
        ctx.stroke();
      }

      data.slice(0, full + 1).forEach((d, i) => {
        ctx.fillStyle = "#666";
        ctx.font = "9px sans-serif";
        ctx.textAlign = "center";
        const lbl = String(d[dateKey]).slice(8);
        ctx.fillText(lbl, xP(i), H - 6);
      });

      if (p < 1) raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [data, valueKey, dateKey, color]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={160}
      style={{ width: "100%", height: 160 }}
      role="img"
      aria-label="Gráfico de área de ingresos"
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
      <div className="rp-progress-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

// ============================================================
//  SUBCOMPONENTE: OrderStatusBadge
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
    <span className="rp-badge" style={{ background: s.color + "22", color: s.color, borderColor: s.color + "44" }}>
      {s.label}
    </span>
  );
}

// ============================================================
//  SUBCOMPONENTE: PeriodSelector
// ============================================================
function PeriodSelector({ value, onChange }) {
  return (
    <div className="rp-period-btns">
      {[["7D", "7 días"], ["30D", "30 días"], ["90D", "90 días"], ["ALL", "Todo"]].map(([k, lbl]) => (
        <button
          key={k}
          className={`rp-period-btn ${value === k ? "active" : ""}`}
          onClick={() => onChange(k)}
        >
          {lbl}
        </button>
      ))}
    </div>
  );
}

// ============================================================
//  SUBCOMPONENTE: LoadingSpinner
// ============================================================
function Loader({ text = "Cargando..." }) {
  return (
    <div className="rp-loader">
      <div className="rp-spinner" />
      <span>{text}</span>
    </div>
  );
}

// ============================================================
//  SECCIÓN: Dashboard Principal
// ============================================================
function DashboardSection({ data, loading, error }) {
  if (loading) return <Loader text="Cargando panel principal..." />;
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
    <div className="rp-section">
      {/* Alertas de stock */}
      {data.outOfStockVariants > 0 && (
        <AlertBanner type="error"
          message={`⚠️ ${data.outOfStockVariants} variante(s) sin stock. Revisa el inventario.`} />
      )}
      {data.lowStockVariants > 0 && (
        <AlertBanner type="warning"
          message={`${data.lowStockVariants} variante(s) con stock bajo.`} />
      )}

      {/* KPI Cards — Ingresos */}
      <div className="rp-section-title">Ingresos</div>
      <div className="rp-kpi-row">
        <StatCard label="Hoy"         value={data.todayRevenue}  prefix="$" color="#22c55e" icon="currency-dollar" />
        <StatCard label="Esta semana" value={data.weekRevenue}   prefix="$" color="#3b82f6" icon="trending-up" />
        <StatCard label="Este mes"    value={data.monthRevenue}  prefix="$" color="#8b5cf6" icon="chart-bar" />
        <StatCard label="Total"       value={data.totalRevenue}  prefix="$" color="#f59e0b" icon="coins" />
      </div>

      {/* KPI Cards — Productos */}
      <div className="rp-section-title">Productos</div>
      <div className="rp-kpi-row">
        <StatCard label="Activos"      value={data.activeProducts}    color="#22c55e" icon="package" />
        <StatCard label="Inactivos"    value={data.inactiveProducts}  color="#6b7280" icon="package-off" />
        <StatCard label="Stock bajo"   value={data.lowStockVariants}  color="#f59e0b" icon="alert-triangle" />
        <StatCard label="Sin stock"    value={data.outOfStockVariants} color="#ef4444" icon="package-import" />
      </div>

      {/* KPI Cards — Órdenes */}
      <div className="rp-section-title">Órdenes</div>
      <div className="rp-kpi-row">
        <StatCard label="Pendientes"  value={data.pendingOrders}   color="#f59e0b" icon="clock" />
        <StatCard label="Entregadas"  value={data.deliveredOrders} color="#22c55e" icon="check" />
        <StatCard label="Total"       value={data.totalOrders}     color="#3b82f6" icon="shopping-cart" />
        <StatCard label="Canceladas"  value={data.cancelledOrders} color="#ef4444" icon="x" />
      </div>

      {/* Distribución de órdenes + Top productos */}
      <div className="rp-charts-row">
        <div className="rp-card">
          <div className="rp-card-title">Distribución de órdenes</div>
          <DonutChart slices={donutSlices} size={130} />
          <div className="rp-donut-legend">
            {donutSlices.map((s) => (
              <div key={s.label} className="rp-legend-item">
                <span className="rp-legend-dot" style={{ background: s.color }} />
                <span className="rp-legend-label">{s.label}</span>
                <span className="rp-legend-val">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rp-card">
          <div className="rp-card-title">Top productos más vendidos</div>
          <div className="rp-table-wrap">
            <table className="rp-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Producto</th>
                  <th>Unidades</th>
                  <th>Ingresos</th>
                </tr>
              </thead>
              <tbody>
                {(data.topProducts || []).slice(0, 5).map((p, i) => (
                  <tr key={p.productId || i}>
                    <td className="rp-rank">#{i + 1}</td>
                    <td>{p.productName}</td>
                    <td>{p.unitsSold.toLocaleString("es-CO")}</td>
                    <td>{formatCOP(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
  if (loading) return <Loader text="Cargando inventario..." />;
  if (error)   return <AlertBanner type="error" message={`Error al cargar inventario: ${error}`} />;
  if (!data)   return null;

  const { summary, lowStockItems, outOfStockItems, byCategory } = data;

  return (
    <div className="rp-section">
      {/* Resumen */}
      <div className="rp-kpi-row">
        <StatCard label="Variantes sanas"  value={summary.healthyStockVariants} color="#22c55e" icon="circle-check" />
        <StatCard label="Stock bajo"       value={summary.lowStockVariants}     color="#f59e0b" icon="alert-triangle" />
        <StatCard label="Sin stock"        value={summary.outOfStockVariants}   color="#ef4444" icon="circle-x" />
        <StatCard label="Valor del stock"  value={summary.totalStockValue}      prefix="$" color="#3b82f6" icon="coins" />
      </div>

      {/* Sin stock */}
      {outOfStockItems?.length > 0 && (
        <div className="rp-card">
          <div className="rp-card-title" style={{ color: "#ef4444" }}>
            <i className="ti ti-circle-x" aria-hidden="true" /> Sin stock ({outOfStockItems.length})
          </div>
          <div className="rp-table-wrap">
            <table className="rp-table">
              <thead>
                <tr><th>Producto</th><th>SKU</th><th>Precio</th><th>Stock mín.</th></tr>
              </thead>
              <tbody>
                {outOfStockItems.map((item) => (
                  <tr key={item.sku}>
                    <td>{item.productName}</td>
                    <td><code className="rp-sku">{item.sku}</code></td>
                    <td>{formatCOP(item.price)}</td>
                    <td>{item.minStock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock bajo */}
      {lowStockItems?.length > 0 && (
        <div className="rp-card">
          <div className="rp-card-title" style={{ color: "#f59e0b" }}>
            <i className="ti ti-alert-triangle" aria-hidden="true" /> Stock bajo ({lowStockItems.length})
          </div>
          <div className="rp-table-wrap">
            <table className="rp-table">
              <thead>
                <tr><th>Producto</th><th>SKU</th><th>Actual / Mín.</th><th>Nivel</th></tr>
              </thead>
              <tbody>
                {lowStockItems.map((item) => (
                  <tr key={item.sku}>
                    <td>{item.productName}</td>
                    <td><code className="rp-sku">{item.sku}</code></td>
                    <td>{item.currentStock} / {item.minStock}</td>
                    <td style={{ minWidth: 120 }}>
                      <ProgressBar current={item.currentStock} max={item.minStock} color="#f59e0b" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Por categoría */}
      {byCategory?.length > 0 && (
        <div className="rp-card">
          <div className="rp-card-title">Por categoría</div>
          <div className="rp-table-wrap">
            <table className="rp-table">
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Productos</th>
                  <th>Stock total</th>
                  <th>Stock bajo</th>
                  <th>Sin stock</th>
                </tr>
              </thead>
              <tbody>
                {byCategory.map((cat) => (
                  <tr key={cat.categoryName}>
                    <td>{cat.categoryName}</td>
                    <td>{cat.productCount}</td>
                    <td>{cat.totalStock.toLocaleString("es-CO")}</td>
                    <td>
                      {cat.lowStockCount > 0
                        ? <span style={{ color: "#f59e0b" }}>{cat.lowStockCount}</span>
                        : <span style={{ color: "#22c55e" }}>0</span>}
                    </td>
                    <td>
                      {cat.outOfStockCount > 0
                        ? <span style={{ color: "#ef4444" }}>{cat.outOfStockCount}</span>
                        : <span style={{ color: "#22c55e" }}>0</span>}
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
  if (loading) return <Loader text="Cargando órdenes..." />;
  if (error)   return <AlertBanner type="error" message={`Error al cargar órdenes: ${error}`} />;

  return (
    <div className="rp-section">
      <div className="rp-section-header">
        <span className="rp-section-title">Órdenes</span>
        <PeriodSelector value={period} onChange={onPeriodChange} />
      </div>

      {!data ? <Loader text="Selecciona un período..." /> : (
        <>
          <div className="rp-kpi-row">
            <StatCard label="Total"       value={data.summary.total}             color="#3b82f6" icon="shopping-cart" />
            <StatCard label="Pendientes"  value={data.summary.pending}           color="#f59e0b" icon="clock" />
            <StatCard label="Entregadas"  value={data.summary.delivered}         color="#22c55e" icon="check" />
            <StatCard label="Ticket prom." value={data.summary.averageOrderValue} prefix="$" color="#8b5cf6" icon="receipt" />
          </div>

          {/* Conteos por estado */}
          <div className="rp-status-grid">
            {[
              { key: "confirmed",  label: "Confirmadas",  color: "#3b82f6" },
              { key: "processing", label: "En proceso",   color: "#6366f1" },
              { key: "shipped",    label: "Enviadas",     color: "#0ea5e9" },
              { key: "cancelled",  label: "Canceladas",   color: "#ef4444" },
              { key: "refunded",   label: "Reembolsadas", color: "#f43f5e" },
            ].map(({ key, label, color }) => (
              <div key={key} className="rp-status-chip" style={{ borderColor: color + "44", color }}>
                <span className="rp-status-count">{data.summary[key]}</span>
                <span className="rp-status-lbl">{label}</span>
              </div>
            ))}
          </div>

          {/* Gráfico órdenes por día */}
          {data.dailyBreakdown?.length > 0 && (
            <div className="rp-card">
              <div className="rp-card-title">Órdenes por día</div>
              <MiniBarChart data={data.dailyBreakdown} labelKey="date" valueKey="orderCount" color="#3b82f6" />
            </div>
          )}

          {/* Top productos */}
          {data.topProducts?.length > 0 && (
            <div className="rp-card">
              <div className="rp-card-title">Productos más pedidos</div>
              <div className="rp-table-wrap">
                <table className="rp-table">
                  <thead>
                    <tr><th>#</th><th>Producto</th><th>Unidades</th><th>Ingresos</th></tr>
                  </thead>
                  <tbody>
                    {data.topProducts.slice(0, 5).map((p, i) => (
                      <tr key={i}>
                        <td className="rp-rank">#{i + 1}</td>
                        <td>{p.productName}</td>
                        <td>{p.unitsSold}</td>
                        <td>{formatCOP(p.revenue)}</td>
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
  if (loading) return <Loader text="Cargando ventas..." />;
  if (error)   return <AlertBanner type="error" message={`Error al cargar ventas: ${error}`} />;

  return (
    <div className="rp-section">
      <div className="rp-section-header">
        <span className="rp-section-title">Ventas</span>
        <PeriodSelector value={period} onChange={onPeriodChange} />
      </div>

      {!data ? <Loader text="Selecciona un período..." /> : (
        <>
          <div className="rp-kpi-row">
            <StatCard label="Hoy"          value={data.summary.todayRevenue}   prefix="$" color="#22c55e" icon="currency-dollar" />
            <StatCard label="Esta semana"  value={data.summary.weekRevenue}    prefix="$" color="#3b82f6" icon="trending-up" />
            <StatCard label="Este mes"     value={data.summary.monthRevenue}   prefix="$" color="#8b5cf6" icon="chart-bar" />
            <StatCard label="Ticket prom." value={data.summary.averageTicket}  prefix="$" color="#f59e0b" icon="receipt" />
          </div>

          {/* Gráfico de ingresos por día */}
          {data.dailyBreakdown?.length > 0 && (
            <div className="rp-card">
              <div className="rp-card-title">Ingresos por día</div>
              <LineAreaChart data={data.dailyBreakdown} dateKey="date" valueKey="revenue" color="#22c55e" />
            </div>
          )}

          <div className="rp-charts-row">
            {/* Métodos de pago */}
            {data.byPaymentMethod?.length > 0 && (
              <div className="rp-card">
                <div className="rp-card-title">Por método de pago</div>
                <DonutChart
                  slices={data.byPaymentMethod.map((m, i) => ({
                    label: m.method,
                    value: m.count,
                    color: ["#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6", "#ef4444"][i % 5],
                  }))}
                  size={130}
                />
                <div className="rp-donut-legend" style={{ marginTop: "0.75rem" }}>
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

            {/* Top productos por revenue */}
            {data.topProductsByRevenue?.length > 0 && (
              <div className="rp-card">
                <div className="rp-card-title">Top productos por ingreso</div>
                <div className="rp-table-wrap">
                  <table className="rp-table">
                    <thead>
                      <tr><th>#</th><th>Producto</th><th>Uds.</th><th>Ingresos</th></tr>
                    </thead>
                    <tbody>
                      {data.topProductsByRevenue.slice(0, 5).map((p, i) => (
                        <tr key={i}>
                          <td className="rp-rank">#{i + 1}</td>
                          <td>{p.productName}</td>
                          <td>{p.unitsSold}</td>
                          <td>{formatCOP(p.revenue)}</td>
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
  // Tab activo: "dashboard" | "stock" | "orders" | "sales"
  const [activeTab, setActiveTab] = useState("dashboard");

  // Períodos independientes por sección
  const [ordersPeriod, setOrdersPeriod] = useState("30D");
  const [salesPeriod,  setSalesPeriod]  = useState("30D");

  // Datos y estados por sección
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

  // ── Carga de datos por sección ──────────────────────────────
  useEffect(() => {
    if (activeTab === "dashboard" && !dashboardData) {
      setLoad("dashboard", true);
      getDashboard()
        .then(setDashboardData)
        .catch((e) => { handleAuthError(e); setError("dashboard", e.message); })
        .finally(() => setLoad("dashboard", false));
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "stock" && !stockData) {
      setLoad("stock", true);
      getStockReport()
        .then(setStockData)
        .catch((e) => { handleAuthError(e); setError("stock", e.message); })
        .finally(() => setLoad("stock", false));
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "orders") return;
    setLoad("orders", true);
    setOrdersData(null);
    getOrdersReport(periodToDays(ordersPeriod))
      .then(setOrdersData)
      .catch((e) => { handleAuthError(e); setError("orders", e.message); })
      .finally(() => setLoad("orders", false));
  }, [activeTab, ordersPeriod]);

  useEffect(() => {
    if (activeTab !== "sales") return;
    setLoad("sales", true);
    setSalesData(null);
    getSalesReport(periodToDays(salesPeriod))
      .then(setSalesData)
      .catch((e) => { handleAuthError(e); setError("sales", e.message); })
      .finally(() => setLoad("sales", false));
  }, [activeTab, salesPeriod]);

  const tabs = [
    { key: "dashboard", label: "Panel",       icon: "layout-dashboard" },
    { key: "stock",     label: "Inventario",  icon: "package" },
    { key: "orders",    label: "Órdenes",     icon: "shopping-cart" },
    { key: "sales",     label: "Ventas",      icon: "chart-line" },
  ];

  return (
    <div className="rp-page">

      {/* TOPBAR */}
      <div className="rp-topbar">
        <h1 className="rp-title">Reportes</h1>
        {/* <div className="rp-topbar-right">
          <i className="ti ti-bell"     style={{ fontSize: 18 }} aria-hidden="true" />
          <i className="ti ti-settings" style={{ fontSize: 18 }} aria-hidden="true" />
        </div> */}
      </div>

      {/* TABS */}
      <div className="rp-tabs">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`rp-tab ${activeTab === t.key ? "active" : ""}`}
            onClick={() => setActiveTab(t.key)}
          >
            <i className={`ti ti-${t.icon}`} aria-hidden="true" />
            {t.label}
          </button>
        ))}
      </div>

      {/* CONTENIDO */}
      <div className="rp-content">
        {activeTab === "dashboard" && (
          <DashboardSection
            data={dashboardData}
            loading={loading.dashboard}
            error={errors.dashboard}
          />
        )}
        {activeTab === "stock" && (
          <StockSection
            data={stockData}
            loading={loading.stock}
            error={errors.stock}
          />
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