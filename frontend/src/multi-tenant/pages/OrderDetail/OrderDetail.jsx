import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getOrder, getOrderPayment, cancelOrder } from "../services/orderService.js";
import "./OrderDetail.css";

const formatCOP = (n) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", minimumFractionDigits: 0,
  }).format(n ?? 0);

const formatDate = (d) => {
  if (!d) return "—";
  try {
    return new Date(`${d}-05:00`).toLocaleString("es-CO", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return d; }
};

const STATUS_INFO = {
  PENDING:    { label: "Pendiente",    cls: "od-badge--warning" },
  CONFIRMED:  { label: "Confirmada",   cls: "od-badge--info" },
  PROCESSING: { label: "En proceso",   cls: "od-badge--info" },
  SHIPPED:    { label: "Enviada",      cls: "od-badge--info" },
  DELIVERED:  { label: "Entregada",    cls: "od-badge--success" },
  CANCELLED:  { label: "Cancelada",    cls: "od-badge--danger" },
  REFUNDED:   { label: "Reembolsada",  cls: "od-badge--danger" },
};

const PAYMENT_STATUS_INFO = {
  APPROVED: { label: "Aprobado",    cls: "od-badge--success" },
  PENDING:  { label: "Pendiente",   cls: "od-badge--warning" },
  REJECTED: { label: "Rechazado",   cls: "od-badge--danger" },
  REFUNDED: { label: "Reembolsado", cls: "od-badge--danger" },
};

const PAYMENT_METHOD_LABELS = {
  CREDIT_CARD:      "Tarjeta de crédito",
  DEBIT_CARD:       "Tarjeta débito",
  TRANSFER:         "Transferencia bancaria",
  CASH_ON_DELIVERY: "Pago contra entrega",
  DIGITAL_WALLET:   "Billetera digital",
};

const STATUS_STEPS = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

export default function OrderDetail() {
  const { slug, orderId } = useParams();
  const navigate          = useNavigate();
  const storeId           = localStorage.getItem("storeId");

  const [order,     setOrder]     = useState(null);
  const [payment,   setPayment]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [toast,     setToast]     = useState(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const getLocalOrder = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(`order_${orderId}`));
      if (!saved?.order) return null;

      // Normalize shipping to a flat string regardless of how it was saved
      const raw = saved.shipping;
      let shippingAddress = null;
      if (typeof raw === "string") {
        shippingAddress = raw || null;
      } else if (raw && typeof raw === "object") {
        const parts = [
          raw.address ?? raw.street,
          raw.city,
          raw.department ?? raw.state,
        ].filter(Boolean);
        shippingAddress = parts.length ? parts.join(", ") : (raw.fullName ?? null);
      }

      return {
        ...saved.order,
        id:             saved.order.orderId ?? orderId,
        orderId:        saved.order.orderId ?? orderId,
        orderNumber:    saved.order.orderNumber ?? saved.order.orderId ?? orderId,
        total:          saved.total,
        items:          saved.items ?? [],
        shippingAddress,
        _local:         true,
      };
    } catch { return null; }
  };

  // Local orders (QB-* simulated quick-buy, PED-* simulated checkout) only exist in localStorage
  const isLocalId = /^(QB|PED)-/.test(orderId ?? "");

  useEffect(() => {
    const load = async () => {
      if (!storeId || !orderId) { setError("Datos insuficientes."); setLoading(false); return; }
      setLoading(true);
      setError(null);

      // Skip API calls entirely for locally-generated order IDs
      if (isLocalId) {
        const local = getLocalOrder();
        if (local) setOrder(local);
        else setError("No se encontró el pedido.");
        setLoading(false);
        return;
      }

      try {
        const [orderData, paymentData] = await Promise.allSettled([
          getOrder(storeId, orderId),
          getOrderPayment(storeId, orderId),
        ]);
        if (orderData.status === "fulfilled") {
          setOrder(orderData.value);
        } else {
          // Fallback a localStorage si el API no tiene el pedido
          const local = getLocalOrder();
          if (local) setOrder(local);
          else throw orderData.reason;
        }
        if (paymentData.status === "fulfilled") setPayment(paymentData.value);
      } catch (err) {
        setError(err.message ?? "No se pudo cargar el pedido.");
      } finally {
        setLoading(false);
      }
    };
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId, orderId]);

  const handleCancel = async () => {
    if (!window.confirm("¿Seguro que deseas cancelar este pedido?")) return;
    setCancelling(true);
    try {
      await cancelOrder(storeId, orderId);
      setOrder((prev) => ({ ...prev, status: "CANCELLED" }));
      showToast("success", "Pedido cancelado.");
    } catch (err) {
      showToast("error", err.message ?? "No se pudo cancelar el pedido.");
    } finally {
      setCancelling(false);
    }
  };

  const canCancel = order?.status === "PENDING" || order?.status === "CONFIRMED";
  const activeStep = STATUS_STEPS.indexOf(order?.status);

  return (
    <div className="od-root">
      {toast && <div className={`od-toast od-toast--${toast.type}`}>{toast.msg}</div>}

      <div className="od-topbar">
        <button className="od-back" onClick={() => navigate(`/tienda/${slug}/orders`)}>
          ← Mis pedidos
        </button>
        <span className="od-brand">VEXIO</span>
      </div>

      <div className="od-page">
        {loading ? (
          <div className="od-state"><div className="od-spinner" /><span>Cargando pedido...</span></div>
        ) : error ? (
          <div className="od-state od-state--error">{error}</div>
        ) : !order ? null : (
          <>
            {/* Header */}
            <div className="od-header">
              <div>
                <h1 className="od-order-number">{order.orderNumber}</h1>
                <p className="od-date">{formatDate(order.createdAt)}</p>
              </div>
              <span className={`od-badge ${(STATUS_INFO[order.status] ?? {}).cls}`}>
                {STATUS_INFO[order.status]?.label ?? order.status}
              </span>
            </div>

            {/* Progress bar (solo órdenes no canceladas) */}
            {!["CANCELLED", "REFUNDED"].includes(order.status) && (
              <div className="od-progress">
                {STATUS_STEPS.map((s, i) => (
                  <div key={s} className={`od-step ${i <= activeStep ? "od-step--done" : ""} ${i === activeStep ? "od-step--active" : ""}`}>
                    <div className="od-step__dot" />
                    {i < STATUS_STEPS.length - 1 && <div className="od-step__line" />}
                    <p className="od-step__label">{STATUS_INFO[s]?.label ?? s}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="od-layout">
              {/* Ítems */}
              <div className="od-card">
                <p className="od-card__title">Productos</p>
                <div className="od-items">
                  {(order.items ?? []).map((item, i) => (
                    <div key={i} className="od-item">
                      <div className="od-item__info">
                        <p className="od-item__name">{item.productName}</p>
                        {item.variantName && (
                          <p className="od-item__variant">{item.variantName}</p>
                        )}
                      </div>
                      <span className="od-item__qty">{item.quantity}×</span>
                      <span className="od-item__price">{formatCOP(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
                <div className="od-totals">
                  <div className="od-total-row">
                    <span>Subtotal</span><span>{formatCOP(order.subtotal)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="od-total-row od-total-row--discount">
                      <span>Descuento</span><span>−{formatCOP(order.discount)}</span>
                    </div>
                  )}
                  {order.tax > 0 && (
                    <div className="od-total-row">
                      <span>Impuestos</span><span>{formatCOP(order.tax)}</span>
                    </div>
                  )}
                  <div className="od-total-row od-total-row--final">
                    <span>Total</span><span>{formatCOP(order.total)}</span>
                  </div>
                </div>
              </div>

              {/* Info lateral */}
              <div>
                {/* Envío */}
                <div className="od-card od-card--sm">
                  <p className="od-card__title">Envío</p>
                  <p className="od-info-row">{order.shippingAddress ?? "No especificada"}</p>
                  {order.notes && <p className="od-info-note">{order.notes}</p>}
                </div>

                {/* Pago */}
                {payment && (
                  <div className="od-card od-card--sm">
                    <p className="od-card__title">Pago</p>
                    <div className="od-info-grid">
                      <span className="od-info-label">Método</span>
                      <span className="od-info-val">
                        {PAYMENT_METHOD_LABELS[payment.method] ?? payment.method}
                      </span>
                      <span className="od-info-label">Estado</span>
                      <span className={`od-badge od-badge--sm ${(PAYMENT_STATUS_INFO[payment.status] ?? {}).cls}`}>
                        {PAYMENT_STATUS_INFO[payment.status]?.label ?? payment.status}
                      </span>
                      {payment.transactionReference && (
                        <>
                          <span className="od-info-label">Referencia</span>
                          <code className="od-info-ref">{payment.transactionReference}</code>
                        </>
                      )}
                      {payment.paidAt && (
                        <>
                          <span className="od-info-label">Fecha pago</span>
                          <span className="od-info-val">{formatDate(payment.paidAt)}</span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Acciones */}
                {canCancel && (
                  <button
                    className="od-btn-cancel"
                    onClick={handleCancel}
                    disabled={cancelling}
                  >
                    {cancelling ? "Cancelando..." : "Cancelar pedido"}
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
