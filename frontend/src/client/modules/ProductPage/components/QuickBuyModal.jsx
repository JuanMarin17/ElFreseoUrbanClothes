import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { placeQuickBuy, fetchUserProfile } from "../service/quickBuyService";
import "./QuickBuyModal.css";

const PAYMENT_METHODS = [
  { id: "CASH",        label: "Efectivo" },
  { id: "MERCADOPAGO", label: "MercadoPago" },
  { id: "CARD",        label: "Tarjeta" },
];

// Mapeo de la selección de UI al enum PaymentMethod que espera el backend.
const PAYMENT_METHOD_ENUM = {
  CASH:        "CASH_ON_DELIVERY",
  MERCADOPAGO: "DIGITAL_WALLET",
  CARD:        "CREDIT_CARD",
};

const fmt = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export default function QuickBuyModal({
  open,
  onClose,
  product,
  activeVariant,
  selectedColor,
  selectedSize,
  currentPrice,
  currentStock,
  storeId,
  storeSlug,
  returnUrl,
}) {
  const navigate = useNavigate();

  const [quantity, setQuantity]             = useState(1);
  const [address, setAddress]               = useState({ street: "", city: "", state: "", country: "Colombia", zipCode: "" });
  const [paymentMethod, setPaymentMethod]   = useState("CASH");
  const [couponCode, setCouponCode]         = useState("");
  const [couponApplied, setCouponApplied]   = useState(false);
  const [couponError, setCouponError]       = useState("");
  const [notes, setNotes]                   = useState("");
  const [loading, setLoading]               = useState(false);
  const [success, setSuccess]               = useState(null);
  const [error, setError]                   = useState("");

  useEffect(() => {
    if (!open) return;
    setSuccess(null);
    setError("");
    setCouponError("");
    setCouponApplied(false);
    setCouponCode("");
    setNotes("");
    setQuantity(1);
    fetchUserProfile().then((profile) => {
      if (!profile) return;
      const addr = profile.address ?? profile.shippingAddress ?? {};
      setAddress({
        street:  addr.street   ?? "",
        city:    addr.city     ?? "",
        state:   addr.state    ?? addr.department ?? "",
        country: addr.country  ?? "Colombia",
        zipCode: addr.zipCode  ?? addr.zip_code ?? "",
      });
    });
  }, [open]);

  if (!open || !product) return null;

  const variantLabel = [selectedColor?.name, selectedSize?.name].filter(Boolean).join(" / ");
  const subtotal     = quantity * currentPrice;

  const patchAddress = (key, val) => setAddress((a) => ({ ...a, [key]: val }));

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    setCouponApplied(true);
    setCouponError("");
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError("");
    setCouponError("");
    try {
      const itemSubtotal = quantity * currentPrice;

      const hasAddress = [address.street, address.city, address.state].some((v) => v?.trim());
      const shippingAddress = hasAddress
        ? {
            address:    address.street.trim()  || undefined,
            city:       address.city.trim()    || undefined,
            department: address.state.trim()   || undefined,
          }
        : undefined;

      const payload = {
        productId:    product.id,
        productName:  product.name,
        quantity,
        unitPrice:    currentPrice,
        paymentMethod: PAYMENT_METHOD_ENUM[paymentMethod] ?? paymentMethod,
        shippingCost: 0,
        ...(variantLabel                       ? { variantName: variantLabel }            : {}),
        ...(shippingAddress                    ? { shippingAddress }                      : {}),
        ...(notes.trim()                       ? { notes:           notes.trim() }        : {}),
        ...(couponApplied && couponCode.trim() ? { couponCode:      couponCode.trim() }   : {}),
      };

      const order = await placeQuickBuy(storeId, payload);
      setSuccess({ ...order, total: order.total ?? itemSubtotal });
    } catch (err) {
      if (err.status === 400 && /cup[oó]n/i.test(err.message ?? "")) {
        setCouponApplied(false);
        setCouponError(err.message);
      } else {
        setError(err.message || "Error al procesar el pedido. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ── Success screen ── */
  if (success) {
    const orderId     = success.orderId ?? success.id;
    const orderNumber = success.orderNumber ?? orderId;
    return (
      <div className="qb-overlay" onClick={onClose}>
        <div className="qb-modal" onClick={(e) => e.stopPropagation()}>
          <div className="qb-success">
            <div className="qb-success__icon">✓</div>
            <h2 className="qb-success__title">¡Pedido realizado!</h2>
            {orderNumber && (
              <p className="qb-success__num">Orden <strong>{orderNumber}</strong></p>
            )}
            <div className="qb-success__row">
              <span>{product.name}</span>
              {variantLabel && <span className="qb-chip">{variantLabel}</span>}
              <span>×{quantity}</span>
              <span>{fmt.format(success.total ?? subtotal)}</span>
            </div>
            <p className="qb-success__status">Estado: <strong>Pendiente</strong></p>
            <div className="qb-success__actions">
              <button
                className="qb-btn qb-btn--primary qb-btn--full"
                onClick={() =>
                  navigate(`/tienda/${storeSlug}/orders/${orderId}`, { replace: true })
                }
              >
                Ver mi pedido
              </button>
              <button
                className="qb-btn qb-btn--ghost qb-btn--full"
                onClick={() => navigate(returnUrl, { replace: true })}
              >
                Volver a la tienda
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Form screen ── */
  return (
    <div className="qb-overlay" onClick={onClose}>
      <div className="qb-modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="qb-header">
          <h2 className="qb-header__title">Completar compra</h2>
          <button className="qb-close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <div className="qb-body">
          {/* Product summary */}
          <div className="qb-product">
            {product.images?.[0]?.url && (
              <img
                src={product.images[0].url}
                alt={product.name}
                className="qb-product__img"
              />
            )}
            <div className="qb-product__info">
              <p className="qb-product__name">{product.name}</p>
              {variantLabel && <p className="qb-product__variant">{variantLabel}</p>}
              <p className="qb-product__price">{fmt.format(currentPrice)} c/u</p>
            </div>
          </div>

          {/* Quantity */}
          <div className="qb-field">
            <label className="qb-label">Cantidad</label>
            <div className="qb-qty-row">
              <div className="qb-qty">
                <button
                  className="qb-qty__btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <span className="qb-qty__val">{quantity}</span>
                <button
                  className="qb-qty__btn"
                  onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                  disabled={quantity >= currentStock}
                >
                  +
                </button>
              </div>
              <span className="qb-qty-stock">{currentStock} disponibles</span>
            </div>
          </div>

          {/* Shipping address */}
          <fieldset className="qb-fieldset">
            <legend className="qb-legend">
              Dirección de envío <span className="qb-optional">(opcional)</span>
            </legend>
            <div className="qb-grid-2">
              <div className="qb-field">
                <label className="qb-label">Calle</label>
                <input
                  className="qb-input"
                  value={address.street}
                  onChange={(e) => patchAddress("street", e.target.value)}
                  placeholder="Ej: Calle 123 #45-67"
                />
              </div>
              <div className="qb-field">
                <label className="qb-label">Ciudad</label>
                <input
                  className="qb-input"
                  value={address.city}
                  onChange={(e) => patchAddress("city", e.target.value)}
                  placeholder="Bogotá"
                />
              </div>
              <div className="qb-field">
                <label className="qb-label">Departamento</label>
                <input
                  className="qb-input"
                  value={address.state}
                  onChange={(e) => patchAddress("state", e.target.value)}
                  placeholder="Cundinamarca"
                />
              </div>
              <div className="qb-field">
                <label className="qb-label">Código postal</label>
                <input
                  className="qb-input"
                  value={address.zipCode}
                  onChange={(e) => patchAddress("zipCode", e.target.value)}
                  placeholder="110111"
                />
              </div>
            </div>
          </fieldset>

          {/* Payment method */}
          <div className="qb-field">
            <label className="qb-label">Método de pago</label>
            <div className="qb-payment-methods">
              {PAYMENT_METHODS.map((m) => (
                <label
                  key={m.id}
                  className={`qb-method${paymentMethod === m.id ? " is-active" : ""}`}
                >
                  <input
                    type="radio"
                    name="qb-payment"
                    value={m.id}
                    checked={paymentMethod === m.id}
                    onChange={() => setPaymentMethod(m.id)}
                  />
                  {m.label}
                </label>
              ))}
            </div>
          </div>

          {/* Coupon */}
          <div className="qb-field">
            <label className="qb-label">
              Cupón <span className="qb-optional">(opcional)</span>
            </label>
            <div className="qb-coupon">
              <input
                className={`qb-input${couponError ? " qb-input--error" : couponApplied ? " qb-input--ok" : ""}`}
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value);
                  setCouponApplied(false);
                  setCouponError("");
                }}
                placeholder="Ej: DESC10"
              />
              <button
                className="qb-btn qb-btn--sm"
                onClick={handleApplyCoupon}
                disabled={!couponCode.trim() || couponApplied}
              >
                {couponApplied ? "✓" : "Aplicar"}
              </button>
            </div>
            {couponError && (
              <p className="qb-inline-msg qb-inline-msg--error">{couponError}</p>
            )}
            {couponApplied && !couponError && (
              <p className="qb-inline-msg qb-inline-msg--ok">
                Cupón aplicado · el descuento se calcula al confirmar
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="qb-field">
            <label className="qb-label">
              Notas <span className="qb-optional">(opcional)</span>
            </label>
            <textarea
              className="qb-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value.slice(0, 500))}
              placeholder="Instrucciones especiales de entrega..."
              rows={3}
            />
          </div>
        </div>

        {/* Footer: price summary + confirm */}
        <div className="qb-footer">
          <div className="qb-summary">
            <div className="qb-summary__row">
              <span>Subtotal ({quantity} unid.)</span>
              <span>{fmt.format(subtotal)}</span>
            </div>
            {couponApplied && (
              <div className="qb-summary__row">
                <span>Cupón: {couponCode}</span>
                <span style={{ color: "#4ade80" }}>Al confirmar</span>
              </div>
            )}
            <div className="qb-summary__row qb-summary__row--total">
              <span>Total estimado</span>
              <span>{fmt.format(subtotal)}</span>
            </div>
          </div>

          {error && <p className="qb-error-banner">{error}</p>}

          <button
            className="qb-btn qb-btn--primary qb-btn--full"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Procesando..." : "Confirmar compra"}
          </button>
        </div>
      </div>
    </div>
  );
}
