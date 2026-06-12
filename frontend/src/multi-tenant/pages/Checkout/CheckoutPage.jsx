import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCart } from "../services/cartService.js";
import { createOrder, processPayment } from "../services/orderService.js";
import "./CheckoutPage.css";

const formatCOP = (n) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", minimumFractionDigits: 0,
  }).format(n ?? 0);

const METHODS = [
  { id: "CASH_ON_DELIVERY", label: "Pago contra entrega",      icon: "📦" },
  { id: "CREDIT_CARD",      label: "Tarjeta de crédito",       icon: "💳" },
  { id: "DEBIT_CARD",       label: "Tarjeta débito",           icon: "💳" },
  { id: "TRANSFER",         label: "Transferencia bancaria",   icon: "🏦" },
  { id: "DIGITAL_WALLET",   label: "Billetera digital (Nequi/Daviplata)", icon: "📱" },
];

export default function CheckoutPage() {
  const { slug } = useParams();
  const navigate  = useNavigate();
  const storeId   = localStorage.getItem("storeId");

  const [cart,        setCart]        = useState(null);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartError,   setCartError]   = useState(null);

  const [address,    setAddress]    = useState("");
  const [notes,      setNotes]      = useState("");
  const [coupon,     setCoupon]     = useState("");
  const [method,     setMethod]     = useState("CASH_ON_DELIVERY");
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!storeId) { setCartError("No se encontró la tienda."); setCartLoading(false); return; }
      setCartLoading(true);
      try {
        const data = await getCart(storeId);
        setCart(data);
      } catch (err) {
        setCartError(err.message ?? "No se pudo cargar el carrito.");
      } finally {
        setCartLoading(false);
      }
    };
    load();
  }, [storeId]);

  const items    = cart?.items ?? [];
  const subtotal = cart?.subtotal ?? 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!storeId)          { setError("No se encontró la tienda.");               return; }
    if (!address.trim())   { setError("La dirección de envío es obligatoria.");   return; }
    if (!items.length)     { setError("Tu carrito está vacío.");                  return; }

    setSubmitting(true);
    setError(null);

    try {
      // Paso 1 — Crear orden desde el carrito
      const orderBody = { shippingAddress: address.trim() };
      if (notes.trim())  orderBody.notes       = notes.trim();
      if (coupon.trim()) orderBody.couponCode   = coupon.trim().toUpperCase();

      const order = await createOrder(storeId, orderBody);

      // Paso 2 — Procesar pago
      const ref = `REF-${Date.now()}`;
      const selectedMethod = METHODS.find((m) => m.id === method);
      const payment = await processPayment(storeId, order.id, {
        method,
        transactionReference: ref,
        details: `Pago ${selectedMethod?.label ?? method}`,
      });

      navigate(`/tienda/${slug}/checkout/exitoso`, {
        state: { order, payment },
        replace: true,
      });
    } catch (err) {
      setError(err.message ?? "Error al procesar tu pedido. Intenta de nuevo.");
      setSubmitting(false);
    }
  };

  return (
    <div className="cp-root">
      <div className="cp-topbar">
        <span className="cp-brand">VEXIO</span>
        <button className="cp-back" type="button" onClick={() => navigate(-1)}>
          ← Volver
        </button>
      </div>

      <div className="cp-page">
        <h1 className="cp-page__title">Confirmar pedido</h1>

        {cartLoading ? (
          <div className="cp-state"><div className="cp-spinner" /><span>Cargando carrito...</span></div>
        ) : cartError ? (
          <div className="cp-state cp-state--error">{cartError}</div>
        ) : items.length === 0 ? (
          <div className="cp-state">Tu carrito está vacío. <button className="cp-link" onClick={() => navigate(`/tienda/${slug}`)}>Ver productos</button></div>
        ) : (
          <div className="cp-layout">

            {/* ── Resumen del pedido ── */}
            <div className="cp-summary">
              <h2 className="cp-section-title">Resumen</h2>
              <div className="cp-items">
                {items.map((item) => (
                  <div key={item.cartItemId} className="cp-item">
                    <div className="cp-item__img">
                      {item.productImageUrl
                        ? <img src={item.productImageUrl} alt={item.productName} />
                        : <div className="cp-item__img-placeholder" />}
                    </div>
                    <div className="cp-item__info">
                      <p className="cp-item__name">{item.productName}</p>
                      {item.productSku && <p className="cp-item__sku">{item.productSku}</p>}
                      <p className="cp-item__qty">{item.quantity} × {formatCOP(item.currentPrice ?? item.subtotal / item.quantity)}</p>
                    </div>
                    <span className="cp-item__subtotal">{formatCOP(item.subtotal)}</span>
                  </div>
                ))}
              </div>

              <div className="cp-totals">
                <div className="cp-total-row">
                  <span>Subtotal</span>
                  <span>{formatCOP(subtotal)}</span>
                </div>
                {cart?.discount > 0 && (
                  <div className="cp-total-row cp-total-row--discount">
                    <span>Descuento</span>
                    <span>−{formatCOP(cart.discount)}</span>
                  </div>
                )}
                <div className="cp-total-row cp-total-row--final">
                  <span>Total</span>
                  <span>{formatCOP(cart?.total ?? subtotal)}</span>
                </div>
              </div>
            </div>

            {/* ── Formulario ── */}
            <form className="cp-form" onSubmit={handleSubmit}>

              <div className="cp-field">
                <label className="cp-label">Dirección de envío *</label>
                <input
                  className="cp-input"
                  type="text"
                  placeholder="Calle 123 # 45-67, Bogotá"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>

              <div className="cp-field">
                <label className="cp-label">Notas (opcional)</label>
                <textarea
                  className="cp-input cp-textarea"
                  placeholder="Entregar en portería, timbre 3B..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="cp-field">
                <label className="cp-label">Cupón de descuento</label>
                <input
                  className="cp-input cp-input--upper"
                  type="text"
                  placeholder="DESCUENTO10"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                />
              </div>

              <div className="cp-field">
                <label className="cp-label">Método de pago</label>
                <div className="cp-methods">
                  {METHODS.map((m) => (
                    <label
                      key={m.id}
                      className={`cp-method ${method === m.id ? "cp-method--selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="method"
                        value={m.id}
                        checked={method === m.id}
                        onChange={() => setMethod(m.id)}
                      />
                      <span className="cp-method__icon">{m.icon}</span>
                      <span className="cp-method__label">{m.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {error && <div className="cp-error">{error}</div>}

              <button className="cp-btn-submit" type="submit" disabled={submitting}>
                {submitting
                  ? <><span className="cp-spinner cp-spinner--sm" /> Procesando pedido...</>
                  : `Confirmar pedido · ${formatCOP(cart?.total ?? subtotal)}`}
              </button>

              <p className="cp-secure">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                Compra segura · Tus datos están protegidos
              </p>
            </form>

          </div>
        )}
      </div>
    </div>
  );
}
