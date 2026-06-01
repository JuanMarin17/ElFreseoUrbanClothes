import { useState, useEffect, useRef } from "react";
import "./Report.css";

// ============================================================
//  CONFIGURACIÓN DE API
//  Cambia BASE_URL por la URL de tu backend
// ============================================================
const API_BASE_URL = "https://tu-api.com/api";

async function fetchAPI(endpoint) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      // "Authorization": `Bearer ${localStorage.getItem("token")}`
    },
  });
  if (!response.ok) throw new Error(`Error ${response.status}`);
  return response.json();
}

// ============================================================
//  DATOS MOCK — reemplaza con fetchAPI() cuando tengas backend
// ============================================================
const MOCK_KPIS = {
  ventas: 124830,
  pedidos: 1847,
  ticketPromedio: 67,
  usuariosActivos: 3290,
  ventasCambio: "+18.4%",
  pedidosCambio: "+9.2%",
  ticketCambio: "-2.1%",
  usuariosCambio: "+31.7%",
};

const MOCK_INGRESOS    = [42000,55000,48000,67000,72000,61000,83000,91000,78000,95000,102000,124000];
const MOCK_META        = [50000,55000,60000,65000,70000,75000,80000,85000,90000,95000,100000,110000];
const MOCK_PEDIDOS_DIA = [84, 127, 98, 142, 189, 234, 76];

const MOCK_CATEGORIAS = [
  { label: "Electrónica", valor: 38, color: "#4f8ef7" },
  { label: "Ropa",        valor: 24, color: "#27ae60" },
  { label: "Hogar",       valor: 21, color: "#f39c12" },
  { label: "Otros",       valor: 17, color: "#9b59b6" },
];

const MOCK_CANALES = [
  { label: "Web",         pct: 68, color: "#4f8ef7" },
  { label: "App móvil",   pct: 21, color: "#27ae60" },
  { label: "Marketplace", pct: 11, color: "#f39c12" },
];

const MOCK_CONVERSION = [
  { label: "Visitas", pct: 100, color: "#555" },
  { label: "Carrito", pct: 34,  color: "#9b59b6" },
  { label: "Compra",  pct: 12,  color: "#e74c3c" },
];

const MOCK_ACTIVIDAD = [
  { color: "#27ae60", texto: "Nuevo pedido #4821 — $342.00", tiempo: "hace 3 min" },
  { color: "#4f8ef7", texto: "Usuario nuevo registrado",      tiempo: "hace 12 min" },
  { color: "#f39c12", texto: "Stock bajo: Auriculares BT",   tiempo: "hace 28 min" },
  { color: "#e74c3c", texto: "Pedido #4817 cancelado",       tiempo: "hace 41 min" },
  { color: "#27ae60", texto: "Pago confirmado #4815",        tiempo: "hace 1h 02min" },
];

const MOCK_PRODUCTOS = [
  { nombre: "Auriculares BT Pro", unidades: 482, ingresos: "$38,560", estado: "Activo" },
  { nombre: "Smartwatch X2",      unidades: 319, ingresos: "$47,850", estado: "Activo" },
  { nombre: "Teclado Mecánico",   unidades: 274, ingresos: "$21,920", estado: "Stock bajo" },
  { nombre: 'Monitor 27" 4K',     unidades: 198, ingresos: "$79,200", estado: "Activo" },
  { nombre: "Cámara Web HD",      unidades: 155, ingresos: "$12,400", estado: "Sin stock" },
];

const MOCK_SATISFACCION = {
  porcentaje: 87,
  estrellas: [
    { label: "★★★★★", pct: 62, color: "#27ae60" },
    { label: "★★★★",  pct: 24, color: "#4f8ef7" },
    { label: "★★★",   pct: 9,  color: "#f39c12" },
    { label: "≤ ★★",  pct: 5,  color: "#e74c3c" },
  ],
};

// ============================================================
//  HOOK: useAnimatedCount
// ============================================================
function useAnimatedCount(target, duration = 1200) {
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
//  SUBCOMPONENTE: KpiCard
// ============================================================
function KpiCard({ label, value, prefix = "", suffix = "", cambio, barColor, barWidth }) {
  const animado = useAnimatedCount(value);
  const esPositivo = cambio?.startsWith("+");
  return (
    <div className="rp-kpi-card">
      <div className="rp-kpi-label">{label}</div>
      <div className="rp-kpi-value">{prefix}{animado.toLocaleString()}{suffix}</div>
      <div className={`rp-kpi-change ${esPositivo ? "up" : "down"}`}>
        <span>{esPositivo ? "▲" : "▼"}</span> {cambio} vs mes anterior
      </div>
      <div className="rp-kpi-bar" style={{ background: barColor, "--bar-w": barWidth }} />
    </div>
  );
}

// ============================================================
//  SUBCOMPONENTE: SparkBar
// ============================================================
function SparkBar({ label, pct, color }) {
  return (
    <div className="rp-spark-item">
      <span className="rp-spark-label">{label}</span>
      <div className="rp-spark-bg">
        <div className="rp-spark-fill" style={{ background: color, "--bar-w": `${pct}%` }} />
      </div>
      <span className="rp-spark-val">{pct}%</span>
    </div>
  );
}

// ============================================================
//  SUBCOMPONENTE: GaugeSVG
// ============================================================
function GaugeSVG({ porcentaje }) {
  const animado = useAnimatedCount(porcentaje, 1500);
  const total  = 251;
  const filled = (animado / 100) * total;
  return (
    <svg viewBox="0 0 200 120" width="100%" style={{ maxWidth: 200 }}>
      <defs>
        <linearGradient id="rpGaugeFill" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#e74c3c" />
          <stop offset="50%"  stopColor="#f39c12" />
          <stop offset="100%" stopColor="#27ae60" />
        </linearGradient>
      </defs>
      <path d="M20,100 A80,80 0 0,1 180,100" fill="none" stroke="#1e1e1e" strokeWidth="14" strokeLinecap="round" />
      <path
        d="M20,100 A80,80 0 0,1 180,100"
        fill="none" stroke="url(#rpGaugeFill)"
        strokeWidth="14" strokeLinecap="round"
        strokeDasharray={`${filled} ${total}`}
      />
      <text x="100" y="88" textAnchor="middle" fontSize="28" fontWeight="700" fill="#fff" fontFamily="'Space Mono',monospace">
        {animado}%
      </text>
      <text x="100" y="105" textAnchor="middle" fontSize="10" fill="#555" letterSpacing="2">SATISFACCIÓN</text>
      <text x="22"  y="116" fontSize="9" fill="#666">0</text>
      <text x="172" y="116" fontSize="9" fill="#666">100</text>
    </svg>
  );
}

// ============================================================
//  SUBCOMPONENTE: DonutChart
// ============================================================
function DonutChart({ categorias }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const cx = canvas.width / 2, cy = canvas.height / 2;
    const R = 58, r = 38;
    let startAngle = -Math.PI / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    categorias.forEach(({ valor, color }) => {
      const slice = (valor / 100) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R, startAngle, startAngle + slice);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      startAngle += slice;
    });
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.fillStyle = "#141414";
    ctx.fill();
  }, [categorias]);
  return <canvas ref={canvasRef} width={140} height={140} style={{ display: "block", margin: "0 auto" }} />;
}

// ============================================================
//  SUBCOMPONENTE: BarChart — barras crecen desde abajo con RAF
// ============================================================
function BarChart({ datos, labels }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx      = canvas.getContext("2d");
    const W        = canvas.width;
    const H        = canvas.height;
    const pad      = { top: 10, bottom: 24, left: 10, right: 10 };
    const max      = Math.max(...datos) * 1.1;
    const barW     = (W - pad.left - pad.right) / datos.length - 6;
    const DURATION = 900;
    let startTime  = null;
    let rafId      = null;

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function draw(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed  = timestamp - startTime;
      const progress = Math.min(elapsed / DURATION, 1);
      const eased    = easeOutCubic(progress);

      ctx.clearRect(0, 0, W, H);

      datos.forEach((val, i) => {
        const x     = pad.left + i * ((W - pad.left - pad.right) / datos.length) + 3;
        const fullH = (val / max) * (H - pad.top - pad.bottom);
        const animH = fullH * eased;
        const y     = H - pad.bottom - animH;

        ctx.fillStyle = i === 5 ? "#4f8ef7" : "rgba(79,142,247,0.35)";
        ctx.beginPath();
        ctx.roundRect(x, y, barW, animH, 4);
        ctx.fill();

        ctx.fillStyle = "#555";
        ctx.font      = "10px 'Rajdhani',sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(labels[i], x + barW / 2, H - 6);
      });

      if (progress < 1) {
        rafId = requestAnimationFrame(draw);
      }
    }

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [datos, labels]);

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={140}
      style={{ width: "100%", height: 140 }}
    />
  );
}

// ============================================================
//  SUBCOMPONENTE: LineChart — línea se traza de izq. a der. con RAF
// ============================================================
function LineChart({ datos, meta }) {
  const canvasRef = useRef(null);
  const meses = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx      = canvas.getContext("2d");
    const W        = canvas.width;
    const H        = canvas.height;
    const pad      = { top: 16, bottom: 28, left: 44, right: 16 };
    const max      = Math.max(...datos, ...meta) * 1.1;
    const DURATION = 1100;
    let startTime  = null;
    let rafId      = null;

    const xPos = (i) => pad.left + i * ((W - pad.left - pad.right) / (datos.length - 1));
    const yPos = (v)  => H - pad.bottom - (v / max) * (H - pad.top - pad.bottom);

    function easeInOutQuad(t) {
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    function draw(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed       = timestamp - startTime;
      const progress      = Math.min(elapsed / DURATION, 1);
      const eased         = easeInOutQuad(progress);
      const totalSegments = datos.length - 1;
      const revealed      = eased * totalSegments;
      const fullSegments  = Math.floor(revealed);
      const partial       = revealed - fullSegments;

      ctx.clearRect(0, 0, W, H);

      // ── Grid (visible desde el inicio) ─────────────────
      [0.25, 0.5, 0.75, 1].forEach((f) => {
        const y = yPos(max * f);
        ctx.strokeStyle = "#1a1a1a";
        ctx.lineWidth   = 1;
        ctx.beginPath();
        ctx.moveTo(pad.left, y);
        ctx.lineTo(W - pad.right, y);
        ctx.stroke();
        ctx.fillStyle  = "#555";
        ctx.font       = "10px 'Space Mono',monospace";
        ctx.textAlign  = "right";
        ctx.fillText("$" + Math.round((max * f) / 1000) + "k", pad.left - 4, y + 4);
      });

      // ── Meta dashed (visible desde el inicio) ──────────
      ctx.strokeStyle = "#333";
      ctx.lineWidth   = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      meta.forEach((v, i) =>
        i === 0 ? ctx.moveTo(xPos(i), yPos(v)) : ctx.lineTo(xPos(i), yPos(v))
      );
      ctx.stroke();
      ctx.setLineDash([]);

      // ── Puntos a dibujar según progreso ────────────────
      const drawPoints = datos.slice(0, fullSegments + 1).map((v, i) => ({
        x: xPos(i),
        y: yPos(v),
      }));

      if (fullSegments < totalSegments) {
        const x1 = xPos(fullSegments);
        const y1 = yPos(datos[fullSegments]);
        const x2 = xPos(fullSegments + 1);
        const y2 = yPos(datos[fullSegments + 1]);
        drawPoints.push({
          x: x1 + (x2 - x1) * partial,
          y: y1 + (y2 - y1) * partial,
        });
      }

      if (drawPoints.length >= 2) {
        const lastPt = drawPoints[drawPoints.length - 1];

        // ── Area fill ────────────────────────────────────
        ctx.beginPath();
        drawPoints.forEach((pt, i) =>
          i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)
        );
        ctx.lineTo(lastPt.x, H - pad.bottom);
        ctx.lineTo(xPos(0),  H - pad.bottom);
        ctx.closePath();
        ctx.fillStyle = "rgba(79,142,247,0.08)";
        ctx.fill();

        // ── Línea principal ───────────────────────────────
        ctx.strokeStyle = "#4f8ef7";
        ctx.lineWidth   = 2;
        ctx.lineJoin    = "round";
        ctx.beginPath();
        drawPoints.forEach((pt, i) =>
          i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)
        );
        ctx.stroke();
      }

      // ── Dots + labels eje X (segmentos ya completados) ─
      datos.slice(0, fullSegments + 1).forEach((v, i) => {
        ctx.beginPath();
        ctx.arc(xPos(i), yPos(v), 3, 0, 2 * Math.PI);
        ctx.fillStyle = "#4f8ef7";
        ctx.fill();

        ctx.fillStyle  = "#555";
        ctx.font       = "10px 'Rajdhani',sans-serif";
        ctx.textAlign  = "center";
        ctx.fillText(meses[i], xPos(i), H - 8);
      });

      if (progress < 1) {
        rafId = requestAnimationFrame(draw);
      }
    }

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [datos, meta]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={200}
      style={{ width: "100%", height: 200 }}
    />
  );
}

// ============================================================
//  COMPONENTE PRINCIPAL: Report
//  ⚠️  NO tiene sidebar propio — lo hereda de AdminLayout
// ============================================================
export default function Report() {
  const [periodo,      setPeriodo]      = useState("30D");
  const [kpis,         setKpis]         = useState(MOCK_KPIS);
  const [ingresos,     setIngresos]     = useState(MOCK_INGRESOS);
  const [metaIngresos, setMetaIngresos] = useState(MOCK_META);
  const [pedidosDia,   setPedidosDia]   = useState(MOCK_PEDIDOS_DIA);
  const [categorias,   setCategorias]   = useState(MOCK_CATEGORIAS);
  const [canales,      setCanales]      = useState(MOCK_CANALES);
  const [conversion,   setConversion]   = useState(MOCK_CONVERSION);
  const [actividad,    setActividad]    = useState(MOCK_ACTIVIDAD);
  const [productos,    setProductos]    = useState(MOCK_PRODUCTOS);
  const [satisfaccion, setSatisfaccion] = useState(MOCK_SATISFACCION);
  const [cargando,     setCargando]     = useState(false);

  // ── Conectar API — descomenta cuando tengas backend ────────
  // useEffect(() => {
  //   async function cargarDatos() {
  //     setCargando(true);
  //     try {
  //       const [
  //         kpisData, ingresosData, pedidosData, categoriasData,
  //         canalesData, conversionData, actividadData, productosData, satisfaccionData
  //       ] = await Promise.all([
  //         fetchAPI(`/kpis?periodo=${periodo}`),
  //         fetchAPI(`/ingresos?periodo=${periodo}`),
  //         fetchAPI(`/pedidos-por-dia?periodo=${periodo}`),
  //         fetchAPI(`/categorias?periodo=${periodo}`),
  //         fetchAPI(`/canales?periodo=${periodo}`),
  //         fetchAPI(`/conversion?periodo=${periodo}`),
  //         fetchAPI(`/actividad-reciente`),
  //         fetchAPI(`/productos-top?periodo=${periodo}`),
  //         fetchAPI(`/satisfaccion?periodo=${periodo}`),
  //       ]);
  //       setKpis(kpisData);
  //       setIngresos(ingresosData.valores);
  //       setMetaIngresos(ingresosData.meta);
  //       setPedidosDia(pedidosData);
  //       setCategorias(categoriasData);
  //       setCanales(canalesData);
  //       setConversion(conversionData);
  //       setActividad(actividadData);
  //       setProductos(productosData);
  //       setSatisfaccion(satisfaccionData);
  //     } catch (err) {
  //       console.error("Error cargando datos:", err);
  //     } finally {
  //       setCargando(false);
  //     }
  //   }
  //   cargarDatos();
  // }, [periodo]);

  const badgeClass = (estado) => {
    if (estado === "Activo")    return "rp-badge-green";
    if (estado === "Sin stock") return "rp-badge-red";
    return "rp-badge-yellow";
  };

  return (
    <div className="rp-page">

      {/* TOPBAR */}
      <div className="rp-topbar">
        <input className="rp-search" placeholder="Buscar informes..." />
        <div className="rp-topbar-right">
          <i className="ti ti-bell"     style={{ fontSize: 18, color: "#555" }} aria-hidden="true" />
          <i className="ti ti-settings" style={{ fontSize: 18, color: "#555" }} aria-hidden="true" />
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="rp-content">

        {/* Cabecera */}
        <div className="rp-header-row">
          <div>
            <h1 className="rp-title">Informes &amp; Estadísticas</h1>
            <p className="rp-subtitle">
              Panel de rendimiento · {cargando ? "Cargando..." : "Actualizado hace 5 min"}
            </p>
          </div>
          <div className="rp-period-btns">
            {["7D","30D","90D","12M"].map((p) => (
              <button
                key={p}
                className={`rp-period-btn ${periodo === p ? "active" : ""}`}
                onClick={() => setPeriodo(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* KPIs */}
        <div className="rp-kpi-row">
          <KpiCard label="Ventas Totales"   value={kpis.ventas}          prefix="$" cambio={kpis.ventasCambio}   barColor="#4f8ef7" barWidth="72%" />
          <KpiCard label="Pedidos"          value={kpis.pedidos}                    cambio={kpis.pedidosCambio}  barColor="#27ae60" barWidth="55%" />
          <KpiCard label="Ticket Promedio"  value={kpis.ticketPromedio}  prefix="$" cambio={kpis.ticketCambio}   barColor="#f39c12" barWidth="42%" />
          <KpiCard label="Usuarios Activos" value={kpis.usuariosActivos}            cambio={kpis.usuariosCambio} barColor="#9b59b6" barWidth="88%" />
        </div>

        {/* Gráficas principales */}
        <div className="rp-charts-row">
          <div className="rp-card">
            <div className="rp-card-title">Ingresos Mensuales</div>
            <LineChart datos={ingresos} meta={metaIngresos} />
          </div>
          <div className="rp-card">
            <div className="rp-card-title">Ventas por Categoría</div>
            <DonutChart categorias={categorias} />
            <div className="rp-donut-legend">
              {categorias.map((c) => (
                <div key={c.label} className="rp-legend-item">
                  <div className="rp-legend-left">
                    <span className="rp-legend-dot" style={{ background: c.color }} />
                    {c.label}
                  </div>
                  <span className="rp-legend-right">{c.valor}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gráficas secundarias */}
        <div className="rp-charts-row2">
          <div className="rp-card">
            <div className="rp-card-title">Pedidos por Día</div>
            <BarChart datos={pedidosDia} labels={["L","M","X","J","V","S","D"]} />
          </div>
          <div className="rp-card">
            <div className="rp-card-title">Canales de Venta</div>
            {canales.map((c) => <SparkBar key={c.label} {...c} />)}
            <div className="rp-card-title" style={{ marginTop: "1rem" }}>Tasa de Conversión</div>
            {conversion.map((c) => <SparkBar key={c.label} {...c} />)}
          </div>
          <div className="rp-card">
            <div className="rp-card-title">Actividad Reciente</div>
            <div className="rp-activity-list">
              {actividad.map((a, i) => (
                <div key={i} className="rp-activity-item">
                  <span className="rp-activity-dot" style={{ background: a.color }} />
                  <div>
                    <div className="rp-activity-text">{a.texto}</div>
                    <div className="rp-activity-time">{a.tiempo}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabla + Gauge */}
        <div className="rp-bottom-row">
          <div className="rp-card">
            <div className="rp-card-title">Productos más vendidos</div>
            <div className="rp-table-wrap">
              <table className="rp-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Unidades</th>
                    <th>Ingresos</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((p) => (
                    <tr key={p.nombre}>
                      <td>{p.nombre}</td>
                      <td>{p.unidades}</td>
                      <td>{p.ingresos}</td>
                      <td><span className={`rp-badge ${badgeClass(p.estado)}`}>{p.estado}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="rp-card">
            <div className="rp-card-title">Satisfacción del Cliente</div>
            <div className="rp-gauge-wrap">
              <GaugeSVG porcentaje={satisfaccion.porcentaje} />
            </div>
            {satisfaccion.estrellas.map((e) => (
              <SparkBar key={e.label} label={e.label} pct={e.pct} color={e.color} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}