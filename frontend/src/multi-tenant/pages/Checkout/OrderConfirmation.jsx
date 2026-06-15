import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./OrderConfirmation.css";

const formatCOP = (n) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(n ?? 0);

const formatDate = (iso) => {
  try {
    return new Date(iso).toLocaleDateString("es-CO", {
      year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return new Date().toLocaleDateString("es-CO", {
      year: "numeric", month: "long", day: "numeric",
    });
  }
};

export default function OrderConfirmation() {
  const { slug, orderId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(`order_${orderId}`);
    if (saved) {
      try { setData(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, [orderId]);

  if (!data) {
    return (
      <div className="oc-loading">
        <div className="oc-spinner" />
        <p>Cargando confirmación…</p>
      </div>
    );
  }

  const { order, items, subtotal, shippingCost, total, shipping, paymentMethodLabel } = data;
  const orderDate = formatDate(order?.createdAt);

  return (
    <div className="oc-page">

      {/* ── Top nav (oculto al imprimir) ── */}
      <nav className="oc-nav oc-no-print">
        <button className="oc-nav__back" onClick={() => navigate(`/tienda/${slug}`)}>
          ← Volver a la tienda
        </button>
      </nav>

      {/* ── Confirmación visual (oculta al imprimir) ── */}
      <div className="oc-hero oc-no-print">
        <div className="oc-check">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="oc-hero__title">¡Pedido recibido!</h1>
        <p className="oc-hero__sub">
          Número de orden: <strong>{orderId}</strong>
        </p>
        <p className="oc-hero__sub">
          Te enviaremos una confirmación a <strong>{shipping?.email}</strong>
        </p>
        {order?._simulated && (
          <div className="oc-sim-notice">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            El coordinador de la tienda se pondrá en contacto contigo para coordinar el pago.
          </div>
        )}
      </div>

      {/* ── Factura (visible en pantalla y al imprimir) ── */}
      <div className="oc-invoice" id="oc-invoice-content">

        <div className="oc-invoice__header">
          <div>
            <h2 className="oc-invoice__store">{slug?.toUpperCase()}</h2>
            <p className="oc-invoice__doc-label">FACTURA DE VENTA</p>
          </div>
          <div className="oc-invoice__meta">
            <p><span>Orden:</span> {orderId}</p>
            <p><span>Fecha:</span> {orderDate}</p>
            <p><span>Estado:</span> <span className="oc-badge">Pendiente</span></p>
          </div>
        </div>

        <div className="oc-invoice__customer">
          <h4>Datos del cliente</h4>
          <div className="oc-invoice__customer-grid">
            <div>
              <p className="oc-invoice__customer-name">{shipping?.fullName}</p>
              <p>{shipping?.email}</p>
              <p>{shipping?.phone}</p>
            </div>
            <div>
              <p>{shipping?.address}</p>
              <p>{shipping?.city}, {shipping?.department}</p>
            </div>
          </div>
        </div>

        <table className="oc-invoice__table">
          <thead>
            <tr>
              <th>Producto</th>
              <th className="oc-tc">Cant.</th>
              <th className="oc-tr">Precio unit.</th>
              <th className="oc-tr">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items?.map((item, i) => {
              const unit = item.unitPrice ?? (item.subtotal / Math.max(item.quantity, 1));
              return (
                <tr key={i}>
                  <td>
                    <span className="oc-item-name">{item.productName}</span>
                    {item.productSku && <span className="oc-item-sku">{item.productSku}</span>}
                  </td>
                  <td className="oc-tc">{item.quantity}</td>
                  <td className="oc-tr">{formatCOP(unit)}</td>
                  <td className="oc-tr">{formatCOP(item.subtotal)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="oc-invoice__totals">
          <div className="oc-invoice__row">
            <span>Subtotal</span><span>{formatCOP(subtotal)}</span>
          </div>
          <div className="oc-invoice__row">
            <span>Envío</span>
            <span>{shippingCost === 0 ? "Gratis" : formatCOP(shippingCost)}</span>
          </div>
          <div className="oc-invoice__row oc-invoice__row--total">
            <span>TOTAL</span><span>{formatCOP(total)}</span>
          </div>
        </div>

        <div className="oc-invoice__footer">
          <p>Método de pago: <strong>{paymentMethodLabel}</strong></p>
          {order?._simulated && (
            <p className="oc-invoice__sim-note">
              El pago se coordinará directamente con la tienda.
            </p>
          )}
        </div>
      </div>

      {/* ── Acciones (ocultas al imprimir) ── */}
      <div className="oc-actions oc-no-print">
        <button className="oc-btn-print" onClick={() => window.print()}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          Descargar / Imprimir factura
        </button>
        <button className="oc-btn-store" onClick={() => navigate(`/tienda/${slug}`)}>
          Seguir comprando
        </button>
      </div>

    </div>
  );
}
