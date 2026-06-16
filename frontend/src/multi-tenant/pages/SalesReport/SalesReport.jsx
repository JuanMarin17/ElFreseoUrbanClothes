import { useEffect, useRef, useState } from "react";
import {
  TrendingUp, Users, DollarSign, Award,
  ArrowUpRight, ArrowDownRight, BarChart2, Download, AlertTriangle, RefreshCw
} from "lucide-react";
import { getPlanStats, getMonthlyRevenue, exportSalesCSV } from "../services/salesReportService";
import "./SalesReport.css";

// Configuración visual de planes (colores, precio, label) — estático
const PLAN_CONFIG = {
  gratuito: { label: "Gratuito", price: 0,     color: "#6b7280", accent: "#374151" },
  basico:   { label: "Básico",   price: 9.99,  color: "#3b82f6", accent: "#1e3a5f" },
  pro:      { label: "Pro",      price: 24.99, color: "#8b5cf6", accent: "#3b1f6e" },
  premium:  { label: "Premium",  price: 49.99, color: "#f59e0b", accent: "#5a3a00" },
};

// Datos mock mientras el backend implementa los endpoints
const MOCK_PLANS = [
  { id: "gratuito", label: "Gratuito", stores: 142, mrr: 0,       growthPercent: 12.4, churnPercent: 8.2, newThisMonth: 18 },
  { id: "basico",   label: "Básico",   stores: 87,  mrr: 869.13,  growthPercent: 7.1,  churnPercent: 3.4, newThisMonth: 12 },
  { id: "pro",      label: "Pro",      stores: 64,  mrr: 1599.36, growthPercent: 19.8, churnPercent: 2.1, newThisMonth: 22 },
  { id: "premium",  label: "Premium",  stores: 31,  mrr: 1549.69, growthPercent: 31.2, churnPercent: 1.0, newThisMonth: 9  },
];
const MOCK_MONTHLY = [
  { month: "Ene", basico: 640,  pro: 1150, premium: 1050 },
  { month: "Feb", basico: 700,  pro: 1225, premium: 1100 },
  { month: "Mar", basico: 740,  pro: 1300, premium: 1150 },
  { month: "Abr", basico: 790,  pro: 1375, premium: 1250 },
  { month: "May", basico: 830,  pro: 1450, premium: 1400 },
  { month: "Jun", basico: 869,  pro: 1599, premium: 1549 },
];

// ── Utilidades ────────────────────────────────────────────────────
const fmt = (v) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(v ?? 0);

// ── Donut Chart (canvas) ──────────────────────────────────────────
function DonutChart({ slices, size = 180 }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !slices?.length) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2, cy = size / 2;
    const R = size * 0.42, r = size * 0.27;
    const total = slices.reduce((s, x) => s + x.value, 0) || 1;
    const DURATION = 1300;
    let startTs = null, raf;

    const ease = (t) => 1 - Math.pow(1 - t, 4);

    const draw = (ts) => {
      if (!startTs) startTs = ts;
      const p = ease(Math.min((ts - startTs) / DURATION, 1));
      ctx.clearRect(0, 0, size, size);
      let angle = -Math.PI / 2;

      slices.forEach(({ value, color }) => {
        const arc = (value / total) * 2 * Math.PI * p;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, R, angle, angle + arc);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        angle += arc;
      });

      // Anillo central
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, 2 * Math.PI);
      ctx.fillStyle = "#0d111a";
      ctx.fill();

      // Separadores
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, 2 * Math.PI);
      ctx.strokeStyle = "#0d111a";
      ctx.lineWidth = 2;
      ctx.stroke();

      if (p < 1) raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [slices, size]);

  return (
    <canvas
      ref={ref}
      style={{ width: size, height: size, display: "block", margin: "0 auto" }}
      aria-label="Distribución de tiendas por plan"
    />
  );
}

// ── Grouped Bar Chart (canvas) ────────────────────────────────────
function GroupedBarChart({ data }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !data?.length) return;
    const ctx = canvas.getContext("2d");

    const W = 700, H = 240;
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const pad = { t: 24, b: 36, l: 52, r: 16 };
    const keys   = ["basico", "pro", "premium"];
    const colors = ["#3b82f6", "#8b5cf6", "#f59e0b"];
    const labels = ["Básico", "Pro", "Premium"];

    const allVals = data.flatMap((d) => keys.map((k) => d[k] ?? 0));
    const max = Math.max(...allVals) * 1.18 || 1;

    const chartW = W - pad.l - pad.r;
    const chartH = H - pad.t - pad.b;
    const groupW = chartW / data.length;
    const bw = (groupW * 0.7) / keys.length;
    const gapGroup = groupW * 0.15;

    const DURATION = 1000;
    let startTs = null, raf;
    const ease = (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

    const draw = (ts) => {
      if (!startTs) startTs = ts;
      const p = ease(Math.min((ts - startTs) / DURATION, 1));
      ctx.clearRect(0, 0, W, H);

      // Grid lines
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = pad.t + (chartH / 4) * i;
        ctx.beginPath();
        ctx.moveTo(pad.l, y);
        ctx.lineTo(W - pad.r, y);
        ctx.stroke();
      }

      // Y-axis labels
      ctx.fillStyle = "#6b7280";
      ctx.font = "9px Inter, sans-serif";
      ctx.textAlign = "right";
      for (let i = 0; i <= 4; i++) {
        const val = Math.round((max * (4 - i)) / 4);
        const y = pad.t + (chartH / 4) * i + 4;
        ctx.fillText(val >= 1000 ? `$${(val / 1000).toFixed(1)}k` : `$${val}`, pad.l - 6, y);
      }

      data.forEach((d, gi) => {
        const groupX = pad.l + gi * groupW + gapGroup;

        keys.forEach((k, ki) => {
          const val = d[k] ?? 0;
          const fullH = (val / max) * chartH;
          const h = fullH * p;
          const x = groupX + ki * (bw + 2);
          const y = H - pad.b - h;

          const grad = ctx.createLinearGradient(x, y, x, H - pad.b);
          grad.addColorStop(0, colors[ki]);
          grad.addColorStop(1, `${colors[ki]}22`);
          ctx.fillStyle = grad;
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(x, y, bw, h, [3, 3, 0, 0]);
          else ctx.rect(x, y, bw, h);
          ctx.fill();
        });

        // Month label
        ctx.fillStyle = "#9ca3af";
        ctx.font = "10px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(d.month, pad.l + gi * groupW + groupW / 2, H - 10);
      });

      if (p < 1) raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [data]);

  return (
    <div className="sr-bar-wrap">
      <canvas
        ref={ref}
        style={{ width: "100%", height: 240, display: "block" }}
        aria-label="Ingresos mensuales por plan"
      />
      <div className="sr-bar-legend">
        {[
          { label: "Básico",   color: "#3b82f6" },
          { label: "Pro",      color: "#8b5cf6" },
          { label: "Premium",  color: "#f59e0b" },
        ].map((l) => (
          <span key={l.label} className="sr-legend-item">
            <span className="sr-legend-dot" style={{ background: l.color }} />
            {l.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────
export default function SalesReport() {
  const [planStats,      setPlanStats]      = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);

  const [usingMock, setUsingMock] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [plans, monthly] = await Promise.all([getPlanStats(), getMonthlyRevenue(6)]);
      setPlanStats(Array.isArray(plans) ? plans : []);
      setMonthlyRevenue(Array.isArray(monthly) ? monthly : []);
      setUsingMock(false);
    } catch (err) {
      if (err.status === 404 || err.status === 501) {
        // Backend aún no implementa el endpoint — usar mock
        setPlanStats(MOCK_PLANS);
        setMonthlyRevenue(MOCK_MONTHLY);
        setUsingMock(true);
      } else {
        setError(err.message || "No se pudo cargar el informe.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const TOTAL_MRR    = planStats.reduce((s, p) => s + (p.mrr ?? 0), 0);
  const TOTAL_STORES = planStats.reduce((s, p) => s + (p.stores ?? 0), 0);
  const TOTAL_NEW    = planStats.reduce((s, p) => s + (p.newThisMonth ?? 0), 0);
  const AVG_GROWTH   = planStats.length
    ? (planStats.reduce((s, p) => s + (p.growthPercent ?? 0), 0) / planStats.length).toFixed(1)
    : "0.0";
  const AVG_CHURN    = planStats.length
    ? (planStats.reduce((s, p) => s + (p.churnPercent ?? 0), 0) / planStats.length).toFixed(1)
    : "0.0";
  const leaderPlan   = [...planStats].sort((a, b) => (b.mrr ?? 0) - (a.mrr ?? 0))[0];

  const donutSlices = planStats.map((ps) => {
    const cfg = PLAN_CONFIG[ps.id] ?? { color: "#6b7280", label: ps.label ?? ps.id };
    return { value: ps.stores, color: cfg.color, label: cfg.label };
  });

  if (loading) {
    return (
      <div className="sr-root">
        <div className="sr-page-header">
          <div>
            <h1 className="sr-title">Informe de Ventas por Plan</h1>
            <p className="sr-subtitle">Cargando datos...</p>
          </div>
        </div>
        <div className="sr-kpi-row">
          {[0,1,2,3].map(i => <div key={i} className="sr-kpi-card sr-kpi-skeleton" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sr-root">
        <div className="sr-page-header">
          <div>
            <h1 className="sr-title">Informe de Ventas por Plan</h1>
          </div>
        </div>
        <div className="sr-error">
          <AlertTriangle size={20} />
          <span>{error}</span>
          <button className="sr-retry-btn" onClick={load}><RefreshCw size={14}/> Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="sr-root">

      {/* Encabezado */}
      <div className="sr-page-header">
        <div>
          <h1 className="sr-title">Informe de Ventas por Plan</h1>
          <p className="sr-subtitle">Rendimiento de suscripciones y distribución de ingresos recurrentes.</p>
        </div>
        <button className="sr-export-btn" onClick={exportSalesCSV}>
          <Download size={13} /> Exportar CSV
        </button>
      </div>

      {usingMock && (
        <div className="sr-mock-banner">
          ⚠ Mostrando datos de ejemplo — el backend aún no tiene implementado <code>/admin/reports/plans</code>
        </div>
      )}

      {/* KPIs globales */}
      <div className="sr-kpi-row">
        <div className="sr-kpi-card sr-kpi-green">
          <div className="sr-kpi-icon"><DollarSign size={18} /></div>
          <div className="sr-kpi-body">
            <span className="sr-kpi-label">MRR Total</span>
            <strong className="sr-kpi-val">{fmt(TOTAL_MRR)}</strong>
            <span className="sr-kpi-trend sr-up"><ArrowUpRight size={12} /> +{AVG_GROWTH}% crecimiento prom.</span>
          </div>
        </div>

        <div className="sr-kpi-card sr-kpi-blue">
          <div className="sr-kpi-icon"><Users size={18} /></div>
          <div className="sr-kpi-body">
            <span className="sr-kpi-label">Tiendas Activas</span>
            <strong className="sr-kpi-val">{TOTAL_STORES}</strong>
            <span className="sr-kpi-trend sr-up"><ArrowUpRight size={12} /> +{TOTAL_NEW} este mes</span>
          </div>
        </div>

        <div className="sr-kpi-card sr-kpi-purple">
          <div className="sr-kpi-icon"><Award size={18} /></div>
          <div className="sr-kpi-body">
            <span className="sr-kpi-label">Plan Líder (MRR)</span>
            <strong className="sr-kpi-val">
              {leaderPlan ? (PLAN_CONFIG[leaderPlan.id]?.label ?? leaderPlan.id) : "—"}
            </strong>
            <span className="sr-kpi-trend sr-up">
              <ArrowUpRight size={12} />
              {TOTAL_MRR > 0 ? (((leaderPlan?.mrr ?? 0) / TOTAL_MRR) * 100).toFixed(1) : "0"}% del MRR
            </span>
          </div>
        </div>

        <div className="sr-kpi-card sr-kpi-amber">
          <div className="sr-kpi-icon"><TrendingUp size={18} /></div>
          <div className="sr-kpi-body">
            <span className="sr-kpi-label">Crecimiento Prom.</span>
            <strong className="sr-kpi-val">+{AVG_GROWTH}%</strong>
            <span className="sr-kpi-trend sr-down"><ArrowDownRight size={12} /> Churn {AVG_CHURN}% global</span>
          </div>
        </div>
      </div>

      {/* Tarjetas por plan */}
      <div className="sr-plans-row">
        {planStats.map((stats) => {
          const cfg    = PLAN_CONFIG[stats.id] ?? { label: stats.label ?? stats.id, price: 0, color: "#6b7280", accent: "#374151" };
          const pct    = TOTAL_STORES > 0 ? ((stats.stores / TOTAL_STORES) * 100).toFixed(1) : "0";
          const mrrPct = TOTAL_MRR    > 0 ? ((stats.mrr    / TOTAL_MRR)    * 100).toFixed(1) : "0";
          return (
            <div key={stats.id} className="sr-plan-card" style={{ "--plan-color": cfg.color, "--plan-accent": cfg.accent }}>
              <div className="sr-plan-header">
                <span className="sr-plan-badge" style={{ background: cfg.color }}>{cfg.label}</span>
                <span className="sr-plan-price">{cfg.price === 0 ? "Gratis" : `$${cfg.price}/mo`}</span>
              </div>
              <div className="sr-plan-stores">
                <span className="sr-plan-num">{stats.stores}</span>
                <span className="sr-plan-sub">tiendas · {pct}% del total</span>
              </div>
              <div className="sr-plan-mrr">
                <span className="sr-plan-mrr-val">{fmt(stats.mrr)}</span>
                <span className="sr-plan-mrr-label">MRR · {mrrPct}%</span>
              </div>
              <div className="sr-plan-bar-track">
                <div className="sr-plan-bar-fill" style={{ width: `${pct}%`, background: cfg.color }} />
              </div>
              <div className="sr-plan-footer">
                <span className="sr-plan-growth sr-up"><ArrowUpRight size={11} /> +{stats.growthPercent ?? 0}% crecimiento</span>
                <span className="sr-plan-new">+{stats.newThisMonth ?? 0} este mes</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gráficos */}
      <div className="sr-charts-row">
        <div className="sr-chart-card">
          <div className="sr-chart-header"><BarChart2 size={14} /><span>Distribución de Tiendas por Plan</span></div>
          <div className="sr-donut-wrap">
            <DonutChart slices={donutSlices} size={180} />
            <div className="sr-donut-legend">
              {donutSlices.map((s) => (
                <div key={s.label} className="sr-donut-legend-item">
                  <span className="sr-donut-dot" style={{ background: s.color }} />
                  <span className="sr-donut-lbl">{s.label}</span>
                  <span className="sr-donut-pct">{TOTAL_STORES > 0 ? ((s.value / TOTAL_STORES) * 100).toFixed(1) : "0"}%</span>
                  <span className="sr-donut-num">{s.value} tiendas</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="sr-chart-card sr-chart-card--wide">
          <div className="sr-chart-header"><TrendingUp size={14} /><span>Ingresos Mensuales por Plan (USD)</span></div>
          <GroupedBarChart data={monthlyRevenue} />
        </div>
      </div>

      {/* Tabla detallada */}
      <div className="sr-table-card">
        <div className="sr-table-header">
          <span className="sr-table-title">Desglose por Plan</span>
          <span className="sr-table-period">{new Date().toLocaleDateString("es-CO", { month: "long", year: "numeric" })}</span>
        </div>
        <div className="sr-table-wrap">
          <table className="sr-table">
            <thead>
              <tr>
                <th>Plan</th><th>Precio/mo</th><th>Tiendas</th><th>% Total</th>
                <th>MRR</th><th>% MRR</th><th>Nuevas (mes)</th>
                <th>Crecimiento</th><th>Churn</th><th>ARR Proyectado</th>
              </tr>
            </thead>
            <tbody>
              {planStats.map((stats) => {
                const cfg    = PLAN_CONFIG[stats.id] ?? { label: stats.id, price: 0, color: "#6b7280" };
                const pct    = TOTAL_STORES > 0 ? ((stats.stores / TOTAL_STORES) * 100).toFixed(1) : "0.0";
                const mrrPct = TOTAL_MRR    > 0 ? ((stats.mrr    / TOTAL_MRR)    * 100).toFixed(1) : "0.0";
                return (
                  <tr key={stats.id}>
                    <td><span className="sr-tbl-badge" style={{ background: `${cfg.color}22`, color: cfg.color, border: `1px solid ${cfg.color}44` }}>{cfg.label}</span></td>
                    <td className="sr-tbl-mono">{cfg.price === 0 ? <span className="sr-tbl-free">Gratis</span> : `$${cfg.price}`}</td>
                    <td className="sr-tbl-num">{stats.stores}</td>
                    <td><div className="sr-tbl-bar-wrap"><div className="sr-tbl-bar" style={{ width: `${pct}%`, background: cfg.color }} /><span className="sr-tbl-pct">{pct}%</span></div></td>
                    <td className="sr-tbl-mrr">{fmt(stats.mrr)}</td>
                    <td><div className="sr-tbl-bar-wrap"><div className="sr-tbl-bar" style={{ width: `${mrrPct}%`, background: cfg.color }} /><span className="sr-tbl-pct">{mrrPct}%</span></div></td>
                    <td className="sr-tbl-new">+{stats.newThisMonth ?? 0}</td>
                    <td><span className="sr-tbl-growth"><ArrowUpRight size={11} /> {stats.growthPercent ?? 0}%</span></td>
                    <td><span className="sr-tbl-churn">{stats.churnPercent ?? 0}%</span></td>
                    <td className="sr-tbl-arr">{fmt((stats.mrr ?? 0) * 12)}</td>
                  </tr>
                );
              })}
              <tr className="sr-tbl-total">
                <td colSpan={2}><strong>TOTALES</strong></td>
                <td><strong>{TOTAL_STORES}</strong></td>
                <td><strong>100%</strong></td>
                <td><strong>{fmt(TOTAL_MRR)}</strong></td>
                <td><strong>100%</strong></td>
                <td><strong>+{TOTAL_NEW}</strong></td>
                <td><span className="sr-tbl-growth"><ArrowUpRight size={11} /> {AVG_GROWTH}%</span></td>
                <td><span className="sr-tbl-churn">{AVG_CHURN}%</span></td>
                <td><strong>{fmt(TOTAL_MRR * 12)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
