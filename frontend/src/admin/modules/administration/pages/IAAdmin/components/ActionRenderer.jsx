import { useState } from "react";

const cop = (n) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n ?? 0);

// ─── REPORT_DASHBOARD ────────────────────────────────────────────────────────
function ReportDashboard({ data }) {
  if (!data) return null;
  return (
    <div className="ia-action ia-action--dashboard">
      <div className="ia-kpi-grid">
        {data.total_sales !== undefined && (
          <div className="ia-kpi-card">
            <p className="ia-kpi-label">Ventas Totales</p>
            <p className="ia-kpi-value">{cop(data.total_sales)}</p>
          </div>
        )}
        {data.total_orders !== undefined && (
          <div className="ia-kpi-card">
            <p className="ia-kpi-label">Pedidos</p>
            <p className="ia-kpi-value">{data.total_orders}</p>
          </div>
        )}
        {data.total_revenue !== undefined && (
          <div className="ia-kpi-card">
            <p className="ia-kpi-label">Ingresos</p>
            <p className="ia-kpi-value">{cop(data.total_revenue)}</p>
          </div>
        )}
        {data.average_ticket !== undefined && (
          <div className="ia-kpi-card">
            <p className="ia-kpi-label">Ticket Promedio</p>
            <p className="ia-kpi-value">{cop(data.average_ticket)}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── REPORT_SALES ─────────────────────────────────────────────────────────────
function ReportSales({ data }) {
  if (!data) return null;
  const products = data.top_products || [];
  return (
    <div className="ia-action ia-action--sales">
      {data.period && (
        <p className="ia-action-meta">Período: <strong>{data.period}</strong></p>
      )}
      {data.total_revenue !== undefined && (
        <p className="ia-action-meta">Ingresos: <strong>{cop(data.total_revenue)}</strong></p>
      )}
      {products.length > 0 && (
        <>
          <p className="ia-action-subtitle">Top Productos</p>
          <table className="ia-table">
            <thead>
              <tr><th>Producto</th><th>Unidades</th><th>Ingresos</th></tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={i}>
                  <td>{p.name || p.product_name || "—"}</td>
                  <td>{p.units_sold ?? p.sales ?? "—"}</td>
                  <td>{p.revenue !== undefined ? cop(p.revenue) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

// ─── REPORT_STOCK ────────────────────────────────────────────────────────────
function ReportStock({ data }) {
  if (!data) return null;
  const outOfStock = data.out_of_stock || data.agotados || [];
  const critical   = data.critical_stock || data.criticos || [];
  return (
    <div className="ia-action ia-action--stock">
      {outOfStock.length > 0 && (
        <>
          <p className="ia-action-subtitle ia-action-subtitle--danger">
            Sin Stock ({outOfStock.length})
          </p>
          <ul className="ia-list">
            {outOfStock.map((p, i) => (
              <li key={i} className="ia-list-item ia-list-item--danger">
                {p.name || p.product_name || p}
              </li>
            ))}
          </ul>
        </>
      )}
      {critical.length > 0 && (
        <>
          <p className="ia-action-subtitle ia-action-subtitle--warn">
            Stock Crítico ({critical.length})
          </p>
          <ul className="ia-list">
            {critical.map((p, i) => (
              <li key={i} className="ia-list-item ia-list-item--warn">
                {p.name || p.product_name || p}
                {p.stock !== undefined ? ` — ${p.stock} uds.` : ""}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

// ─── REPORT_ORDERS ───────────────────────────────────────────────────────────
function ReportOrders({ data }) {
  if (!data) return null;
  const groups = data.by_status || data.groups || {};
  return (
    <div className="ia-action ia-action--orders">
      {Object.entries(groups).map(([status, info]) => (
        <div key={status} className="ia-order-row">
          <span className={`ia-order-badge ia-order-badge--${status.toLowerCase()}`}>
            {status}
          </span>
          <span className="ia-order-count">
            {typeof info === "object"
              ? (info.count ?? info.total ?? JSON.stringify(info))
              : info}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── PRICE_SUGGESTION ────────────────────────────────────────────────────────
function PriceSuggestion({ data }) {
  if (!data) return null;
  return (
    <div className="ia-action ia-action--price">
      <div className="ia-price-badge">
        <span className="ia-price-label">Precio Sugerido</span>
        <span className="ia-price-value">
          {cop(data.suggested_price ?? data.price)}
        </span>
      </div>
      {data.current_price !== undefined && (
        <p className="ia-price-current">
          Precio actual: {cop(data.current_price)}
        </p>
      )}
      {data.reason && <p className="ia-price-reason">{data.reason}</p>}
    </div>
  );
}

// ─── STORE_SUGGESTION_COLORS ─────────────────────────────────────────────────
function SuggestionColors({ data }) {
  if (!data) return null;
  const colors = data.colors || data.palette || [];
  return (
    <div className="ia-action ia-action--colors">
      <p className="ia-action-subtitle">Paleta de Colores</p>
      <div className="ia-color-swatches">
        {colors.map((c, i) => {
          const hex  = typeof c === "string" ? c : (c.hex || c.color || "#ccc");
          const name = typeof c === "object" ? (c.name || c.label) : null;
          return (
            <div key={i} className="ia-swatch">
              <div
                className="ia-swatch-color"
                style={{ background: hex }}
                title={hex}
              />
              <span className="ia-swatch-hex">{hex}</span>
              {name && <span className="ia-swatch-name">{name}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── STORE_SUGGESTION_TYPOGRAPHY ─────────────────────────────────────────────
function SuggestionTypography({ data }) {
  if (!data) return null;
  const entries = data.fonts
    ? data.fonts
    : [
        data.heading && { role: "Heading", name: data.heading },
        data.body    && { role: "Body",    name: data.body    },
      ].filter(Boolean);

  return (
    <div className="ia-action ia-action--typography">
      {entries.map((f, i) => (
        <div key={i} className="ia-typo-preview">
          <p className="ia-typo-label">{f.role || f.type || `Fuente ${i + 1}`}</p>
          <p
            className="ia-typo-sample"
            style={{ fontFamily: f.name || f.font }}
          >
            {f.name || f.font} — Aa Bb Cc 123
          </p>
        </div>
      ))}
    </div>
  );
}

// ─── STORE_SUGGESTION_LAYOUT ─────────────────────────────────────────────────
function SuggestionLayout({ data }) {
  if (!data) return null;
  return (
    <div className="ia-action ia-action--layout">
      {data.description && (
        <p className="ia-action-desc">{data.description}</p>
      )}
      {Array.isArray(data.recommendations) && (
        <ul className="ia-list">
          {data.recommendations.map((r, i) => (
            <li key={i} className="ia-list-item">{r}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── STORE_SUGGESTION_BRANDING ───────────────────────────────────────────────
function SuggestionBranding({ data }) {
  if (!data) return null;
  return (
    <div className="ia-action ia-action--branding">
      {data.slogan && (
        <p className="ia-branding-slogan">"{data.slogan}"</p>
      )}
      {data.short_description && (
        <p className="ia-action-desc">{data.short_description}</p>
      )}
      {data.long_description && (
        <p className="ia-action-desc ia-action-desc--muted">
          {data.long_description}
        </p>
      )}
    </div>
  );
}

// ─── SUGGEST_PRODUCT ─────────────────────────────────────────────────────────
function SuggestProduct({ data }) {
  if (!data) return null;
  return (
    <div className="ia-action ia-action--product">
      <p className="ia-product-name">{data.name || data.product_name}</p>
      {data.price !== undefined && (
        <p className="ia-product-price">{cop(data.price)}</p>
      )}
      {data.description && (
        <p className="ia-product-desc">{data.description}</p>
      )}
      {data.category && (
        <span className="ia-product-tag">{data.category}</span>
      )}
    </div>
  );
}

// ─── ANALYZE_IMAGE ───────────────────────────────────────────────────────────
function AnalyzeImage({ enhanced_image_base64, enhanced_image_mime_type, originalImageSrc }) {
  if (!enhanced_image_base64) return null;
  const enhancedSrc = `data:${enhanced_image_mime_type || "image/jpeg"};base64,${enhanced_image_base64}`;
  return (
    <div className="ia-action ia-action--image">
      <div className="ia-image-compare">
        {originalImageSrc && (
          <div className="ia-image-side">
            <p className="ia-image-label">Original</p>
            <img src={originalImageSrc} alt="Original" className="ia-image-preview" />
          </div>
        )}
        <div className="ia-image-side">
          <p className="ia-image-label">Mejorada por IA</p>
          <img src={enhancedSrc} alt="Imagen mejorada por IA" className="ia-image-preview" />
        </div>
      </div>
    </div>
  );
}

// ─── INVENTORY_ALERT ─────────────────────────────────────────────────────────
function InventoryAlert({ data }) {
  if (!data) return null;
  const items = data.items || data.products || (Array.isArray(data) ? data : []);
  return (
    <div className="ia-action ia-action--inventory-alert">
      <p className="ia-action-subtitle ia-action-subtitle--danger">
        Alerta de Inventario
      </p>
      <ul className="ia-list">
        {items.map((item, i) => (
          <li key={i} className="ia-list-item ia-list-item--danger">
            {item.name || item.product_name || item}
            {item.stock !== undefined ? ` — ${item.stock} uds.` : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── LOYALTY_SUMMARY ─────────────────────────────────────────────────────────
function LoyaltySummary({ data }) {
  if (!data) return null;
  return (
    <div className="ia-action ia-action--loyalty">
      <div className="ia-kpi-grid ia-kpi-grid--3">
        {data.earned !== undefined && (
          <div className="ia-kpi-card">
            <p className="ia-kpi-label">Ganados</p>
            <p className="ia-kpi-value ia-kpi-value--sm">{data.earned}</p>
          </div>
        )}
        {data.redeemed !== undefined && (
          <div className="ia-kpi-card">
            <p className="ia-kpi-label">Canjeados</p>
            <p className="ia-kpi-value ia-kpi-value--sm">{data.redeemed}</p>
          </div>
        )}
        {data.expired !== undefined && (
          <div className="ia-kpi-card ia-kpi-card--warn">
            <p className="ia-kpi-label">Vencidos</p>
            <p className="ia-kpi-value ia-kpi-value--sm">{data.expired}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SUPPORT_SUMMARY ─────────────────────────────────────────────────────────
function SupportSummary({ data }) {
  if (!data) return null;
  const tickets = data.tickets || data.open_tickets || (Array.isArray(data) ? data : []);
  return (
    <div className="ia-action ia-action--support">
      <p className="ia-action-subtitle">Tickets Abiertos ({tickets.length})</p>
      <ul className="ia-list">
        {tickets.map((t, i) => (
          <li key={i} className="ia-list-item ia-list-item--ticket">
            <span
              className={`ia-ticket-priority ia-ticket-priority--${(t.priority || "normal").toLowerCase()}`}
            >
              {t.priority || "NORMAL"}
            </span>
            {t.subject || t.title || t.description || `Ticket #${t.id || i + 1}`}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── REPLY_TICKET / CLOSE_TICKET ─────────────────────────────────────────────
function TicketConfirmation({ action, data }) {
  const ticketId = data?.ticket_id || data?.id || "—";
  const isClosed = action === "CLOSE_TICKET";
  return (
    <div className={`ia-action ia-action--ticket-confirm${isClosed ? " ia-action--ticket-closed" : ""}`}>
      <span className="ia-confirm-icon">{isClosed ? "✓" : "↩"}</span>
      <span>
        {isClosed
          ? `Ticket #${ticketId} cerrado`
          : `Respondiste al ticket #${ticketId}`}
      </span>
    </div>
  );
}

// ─── SUGGEST_PROMOTION ───────────────────────────────────────────────────────
function SuggestPromotion({ data }) {
  if (!data) return null;
  return (
    <div className="ia-action ia-action--promotion">
      {data.type && (
        <span className="ia-promo-type">{data.type}</span>
      )}
      {data.discount !== undefined && (
        <p className="ia-promo-discount">{data.discount}% de descuento</p>
      )}
      {data.duration && (
        <p className="ia-promo-meta">Duración: {data.duration}</p>
      )}
      {data.target_audience && (
        <p className="ia-promo-meta">Público objetivo: {data.target_audience}</p>
      )}
      {data.description && (
        <p className="ia-action-desc">{data.description}</p>
      )}
    </div>
  );
}

// ─── Fallback: collapsible JSON ───────────────────────────────────────────────
function JsonFallback({ action, data }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="ia-action ia-action--json">
      <button className="ia-json-toggle" onClick={() => setOpen(!open)}>
        {open ? "▲" : "▼"} Acción: <code>{action}</code>
      </button>
      {open && (
        <pre className="ia-json-pre">{JSON.stringify(data, null, 2)}</pre>
      )}
    </div>
  );
}

// ─── Root Export ──────────────────────────────────────────────────────────────
export default function ActionRenderer({
  action,
  action_data,
  enhanced_image_base64,
  enhanced_image_mime_type,
  originalImageSrc,
}) {
  if (!action) return null;

  switch (action) {
    case "REPORT_DASHBOARD":
      return <ReportDashboard data={action_data} />;
    case "REPORT_SALES":
      return <ReportSales data={action_data} />;
    case "REPORT_STOCK":
      return <ReportStock data={action_data} />;
    case "REPORT_ORDERS":
      return <ReportOrders data={action_data} />;
    case "PRICE_SUGGESTION":
      return <PriceSuggestion data={action_data} />;
    case "STORE_SUGGESTION_COLORS":
      return <SuggestionColors data={action_data} />;
    case "STORE_SUGGESTION_TYPOGRAPHY":
      return <SuggestionTypography data={action_data} />;
    case "STORE_SUGGESTION_LAYOUT":
      return <SuggestionLayout data={action_data} />;
    case "STORE_SUGGESTION_BRANDING":
      return <SuggestionBranding data={action_data} />;
    case "SUGGEST_PRODUCT":
      return <SuggestProduct data={action_data} />;
    case "ANALYZE_IMAGE":
      return (
        <AnalyzeImage
          enhanced_image_base64={enhanced_image_base64}
          enhanced_image_mime_type={enhanced_image_mime_type}
          originalImageSrc={originalImageSrc}
        />
      );
    case "INVENTORY_ALERT":
      return <InventoryAlert data={action_data} />;
    case "LOYALTY_SUMMARY":
      return <LoyaltySummary data={action_data} />;
    case "SUPPORT_SUMMARY":
      return <SupportSummary data={action_data} />;
    case "REPLY_TICKET":
    case "CLOSE_TICKET":
      return <TicketConfirmation action={action} data={action_data} />;
    case "SUGGEST_PROMOTION":
      return <SuggestPromotion data={action_data} />;
    default:
      return <JsonFallback action={action} data={action_data} />;
  }
}
