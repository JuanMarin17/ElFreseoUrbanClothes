import { useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import "./CheckoutResult.css";

const formatCOP = (n) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", minimumFractionDigits: 0,
  }).format(n ?? 0);

const formatDate = (d) => {
  if (!d) return "—";
  return new Date(`${d}-05:00`).toLocaleDateString("es-CO", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

const PAYMENT_METHOD_LABELS = {
  CREDIT_CARD:      "Tarjeta de crédito",
  DEBIT_CARD:       "Tarjeta débito",
  TRANSFER:         "Transferencia bancaria",
  CASH_ON_DELIVERY: "Pago contra entrega",
  DIGITAL_WALLET:   "Billetera digital",
};

export default function CheckoutSuccess() {
  const navigate   = useNavigate();
  const { slug }   = useParams();
  const { state }  = useLocation();

  const order   = state?.order;
  const payment = state?.payment;

  useEffect(() => {
    if (!order) navigate(`/tienda/${slug ?? ""}`, { replace: true });
  }, [order, navigate, slug]);

  if (!order) return null;

  const isApproved = payment?.status === "APPROVED";

  return (
    <div className="cr-root">
      <div className="cr-brand">
        <span className="cr-brand__logo">VEXIO</span>
      </div>

      <div className="cr-card cr-card--wide">
        {/* Ícono de estado */}
        <div className={`cr-icon ${isApproved ? "cr-icon--green" : "cr-icon--amber"}`}>
          {isApproved ? (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
              stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
              stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
        </div>

        <h1 className="cr-title">
          {isApproved ? "¡Pedido confirmado!" : "Pedido creado"}
        </h1>
        <p className="cr-text">
          {isApproved
            ? "Tu pago fue aprobado y tu pedido está en camino. Recibirás actualizaciones por correo."
            : "Tu pedido fue creado. El pago será procesado al momento de la entrega."}
        </p>

        {/* Detalle del pedido */}
        <div className="cr-order-card">
          <div className="cr-order-row">
            <span className="cr-order-label">Número de orden</span>
            <code className="cr-order-value cr-order-number">{order.orderNumber}</code>
          </div>
          <div className="cr-order-row">
            <span className="cr-order-label">Estado</span>
            <span className="cr-status cr-status--confirmed">{order.status}</span>
          </div>
          {order.shippingAddress && (
            <div className="cr-order-row">
              <span className="cr-order-label">Dirección</span>
              <span className="cr-order-value">{order.shippingAddress}</span>
            </div>
          )}
          <div className="cr-order-row">
            <span className="cr-order-label">Total</span>
            <span className="cr-order-value cr-order-total">{formatCOP(order.total)}</span>
          </div>
          {payment && (
            <div className="cr-order-row">
              <span className="cr-order-label">Método de pago</span>
              <span className="cr-order-value">
                {PAYMENT_METHOD_LABELS[payment.method] ?? payment.method}
              </span>
            </div>
          )}
          {order.createdAt && (
            <div className="cr-order-row">
              <span className="cr-order-label">Fecha</span>
              <span className="cr-order-value">{formatDate(order.createdAt)}</span>
            </div>
          )}
        </div>

        {/* Ítems */}
        {order.items?.length > 0 && (
          <div className="cr-items">
            {order.items.map((item, i) => (
              <div key={i} className="cr-item">
                <span className="cr-item__name">{item.productName}</span>
                {item.variantName && <span className="cr-item__variant">{item.variantName}</span>}
                <span className="cr-item__qty">{item.quantity}×</span>
                <span className="cr-item__price">{formatCOP(item.subtotal)}</span>
              </div>
            ))}
          </div>
        )}

        <div className="cr-actions">
          <button className="cr-btn cr-btn--primary"
            onClick={() => navigate(`/tienda/${slug}/orders`)}>
            Ver mis pedidos
          </button>
          <button className="cr-btn cr-btn--outline"
            onClick={() => navigate(`/tienda/${slug}`)}>
            Seguir comprando
          </button>
        </div>
      </div>
    </div>
  );
}
