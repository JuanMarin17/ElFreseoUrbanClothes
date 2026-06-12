import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getCart } from "../services/cartService";
import { createOrder, simulateOrder } from "../services/orderService";
import "./CheckoutPage.css";

const formatCOP = (n) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(n ?? 0);

const PAYMENT_METHODS = [
  { id: "CREDIT_CARD",    label: "Tarjeta de crédito / débito", desc: "Visa, Mastercard, Amex" },
  { id: "PSE",            label: "PSE",                          desc: "Débito bancario en línea" },
  { id: "EFECTY",         label: "Efecty / Baloto",              desc: "Pago en puntos físicos" },
  { id: "CONTRA_ENTREGA", label: "Contra entrega",               desc: "Paga cuando recibas tu pedido" },
];

const BANKS = [
  "Bancolombia", "Davivienda", "BBVA Colombia", "Banco de Bogotá",
  "Scotiabank Colpatria", "Banco Popular", "Banco Caja Social",
  "Nequi", "Daviplata",
];

const DEPARTMENTS = [
  "Amazonas","Antioquia","Arauca","Atlántico","Bogotá D.C.",
  "Bolívar","Boyacá","Caldas","Caquetá","Casanare","Cauca",
  "Cesar","Chocó","Córdoba","Cundinamarca","Guainía","Guaviare",
  "Huila","La Guajira","Magdalena","Meta","Nariño",
  "Norte de Santander","Putumayo","Quindío","Risaralda",
  "San Andrés y Providencia","Santander","Sucre","Tolima",
  "Valle del Cauca","Vaupés","Vichada",
];

/* ── Helpers ────────────────────────────────────────────── */

function Field({ label, error, children }) {
  return (
    <div className={`ck-field ${error ? "ck-field--error" : ""}`}>
      <label className="ck-field__label">{label}</label>
      {children}
      {error && <span className="ck-field__error">{error}</span>}
    </div>
  );
}

/* ── Step 1: Envío ─────────────────────────────────────── */

function ShippingStep({ values, onChange, errors }) {
  const set = (k) => (e) => onChange({ ...values, [k]: e.target.value });
  return (
    <div className="ck-step-content">
      <h2 className="ck-step-content__title">Información de envío</h2>
      <div className="ck-grid-2">
        <Field label="Nombre completo" error={errors.fullName}>
          <input className="ck-input" value={values.fullName} onChange={set("fullName")} placeholder="Ej. María García" />
        </Field>
        <Field label="Teléfono" error={errors.phone}>
          <input className="ck-input" value={values.phone} onChange={set("phone")} placeholder="3001234567" maxLength={10} />
        </Field>
      </div>
      <Field label="Correo electrónico" error={errors.email}>
        <input className="ck-input" type="email" value={values.email} onChange={set("email")} placeholder="correo@ejemplo.com" />
      </Field>
      <Field label="Dirección" error={errors.address}>
        <input className="ck-input" value={values.address} onChange={set("address")} placeholder="Calle 10 # 20-30, Apto 5" />
      </Field>
      <div className="ck-grid-2">
        <Field label="Ciudad" error={errors.city}>
          <input className="ck-input" value={values.city} onChange={set("city")} placeholder="Medellín" />
        </Field>
        <Field label="Departamento" error={errors.department}>
          <select className="ck-input ck-select" value={values.department} onChange={set("department")}>
            <option value="">Selecciona...</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </Field>
      </div>
    </div>
  );
}

/* ── Step 2: Pago ──────────────────────────────────────── */

function PaymentStep({ values, onChange, errors }) {
  const set  = (k) => (v) => onChange({ ...values, [k]: v });
  const setE = (k) => (e) => set(k)(e.target.value);

  const fmtCard = (v) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const fmtExp  = (v) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  return (
    <div className="ck-step-content">
      <h2 className="ck-step-content__title">Método de pago</h2>

      <div className="ck-methods">
        {PAYMENT_METHODS.map((m) => (
          <button
            key={m.id}
            type="button"
            className={`ck-method ${values.method === m.id ? "ck-method--active" : ""}`}
            onClick={() => set("method")(m.id)}
          >
            <div className="ck-method__radio">
              {values.method === m.id && <div className="ck-method__radio-dot" />}
            </div>
            <div>
              <p className="ck-method__label">{m.label}</p>
              <p className="ck-method__desc">{m.desc}</p>
            </div>
          </button>
        ))}
      </div>
      {errors.method && <span className="ck-field__error ck-field__error--standalone">{errors.method}</span>}

      {values.method === "CREDIT_CARD" && (
        <div className="ck-card-form">
          <Field label="Número de tarjeta" error={errors.cardNumber}>
            <input className="ck-input" value={values.cardNumber}
              onChange={(e) => set("cardNumber")(fmtCard(e.target.value))}
              placeholder="1234 5678 9012 3456" maxLength={19}
            />
          </Field>
          <Field label="Nombre en la tarjeta" error={errors.cardName}>
            <input className="ck-input" value={values.cardName} onChange={setE("cardName")}
              placeholder="MARIA GARCIA" style={{ textTransform: "uppercase" }}
            />
          </Field>
          <div className="ck-grid-2">
            <Field label="Vencimiento (MM/AA)" error={errors.cardExpiry}>
              <input className="ck-input" value={values.cardExpiry}
                onChange={(e) => set("cardExpiry")(fmtExp(e.target.value))}
                placeholder="MM/AA" maxLength={5}
              />
            </Field>
            <Field label="CVV" error={errors.cardCvv}>
              <input className="ck-input" value={values.cardCvv} onChange={setE("cardCvv")}
                placeholder="123" maxLength={4} type="password"
              />
            </Field>
          </div>
          <div className="ck-info-box">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Tus datos están protegidos con encriptación SSL de 256 bits.
          </div>
        </div>
      )}

      {values.method === "PSE" && (
        <div className="ck-card-form">
          <Field label="Banco" error={errors.bank}>
            <select className="ck-input ck-select" value={values.bank} onChange={setE("bank")}>
              <option value="">Selecciona tu banco...</option>
              {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </Field>
          <div className="ck-info-box">
            Serás redirigido al portal de tu banco para completar el pago de forma segura.
          </div>
        </div>
      )}

      {values.method === "EFECTY" && (
        <div className="ck-info-box ck-card-form">
          Recibirás un correo con el número de referencia para pagar en cualquier punto Efecty o Baloto.
          Tu pedido se confirmará dentro de las 2 horas hábiles siguientes al pago.
        </div>
      )}

      {values.method === "CONTRA_ENTREGA" && (
        <div className="ck-info-box ck-card-form">
          Pagas en efectivo directamente al mensajero cuando recibas tu pedido.
          Sin recargos adicionales — el envío es <strong>gratis</strong> con esta opción.
        </div>
      )}
    </div>
  );
}

/* ── Step 3: Revisar ───────────────────────────────────── */

function ReviewStep({ shipping, payment, items, subtotal, shippingCost, total }) {
  const methodLabel = PAYMENT_METHODS.find((m) => m.id === payment.method)?.label ?? payment.method;
  return (
    <div className="ck-step-content">
      <h2 className="ck-step-content__title">Confirma tu pedido</h2>

      <div className="ck-review-section">
        <h4 className="ck-review-section__title">Dirección de envío</h4>
        <p className="ck-review-text">{shipping.fullName}</p>
        <p className="ck-review-text">{shipping.address}</p>
        <p className="ck-review-text">{shipping.city}, {shipping.department}</p>
        <p className="ck-review-text">{shipping.phone} · {shipping.email}</p>
      </div>

      <div className="ck-review-section">
        <h4 className="ck-review-section__title">Método de pago</h4>
        <p className="ck-review-text">{methodLabel}</p>
        {payment.method === "CREDIT_CARD" && payment.cardNumber && (
          <p className="ck-review-text">
            **** **** **** {payment.cardNumber.replace(/\s/g, "").slice(-4)}
          </p>
        )}
        {payment.method === "PSE" && payment.bank && (
          <p className="ck-review-text">{payment.bank}</p>
        )}
      </div>

      <div className="ck-review-section">
        <h4 className="ck-review-section__title">Productos</h4>
        {items.map((item) => (
          <div key={item.cartItemId} className="ck-review-item">
            <span>{item.productName} × {item.quantity}</span>
            <span>{formatCOP(item.subtotal)}</span>
          </div>
        ))}
        <div className="ck-review-divider" />
        <div className="ck-review-item">
          <span>Subtotal</span><span>{formatCOP(subtotal)}</span>
        </div>
        <div className="ck-review-item">
          <span>Envío</span>
          <span>{shippingCost === 0 ? <span className="ck-free">Gratis</span> : formatCOP(shippingCost)}</span>
        </div>
        <div className="ck-review-item ck-review-item--total">
          <span>Total</span><span>{formatCOP(total)}</span>
        </div>
      </div>
    </div>
  );
}

/* ── CheckoutPage ──────────────────────────────────────── */

export default function CheckoutPage() {
  const { slug }   = useParams();
  const navigate   = useNavigate();
  const location   = useLocation();

  const storeId     = localStorage.getItem("storeId");
  const cartFromNav = location.state?.cart ?? null;

  const [step,        setStep]        = useState(1);
  const [cart,        setCart]        = useState(cartFromNav);
  const [cartLoading, setCartLoading] = useState(!cartFromNav);
  const [processing,  setProcessing]  = useState(false);
  const [errors,      setErrors]      = useState({});

  const [shipping, setShipping] = useState({
    fullName: "", email: "", phone: "", address: "", city: "", department: "",
  });

  const [payment, setPayment] = useState({
    method: "", cardNumber: "", cardName: "", cardExpiry: "", cardCvv: "", bank: "",
  });

  useEffect(() => {
    if (cartFromNav) return;
    if (!storeId) { navigate(`/tienda/${slug}`); return; }

    getCart(storeId)
      .then((data) => setCart(data))
      .catch(() => {})
      .finally(() => setCartLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const items        = cart?.items ?? [];
  const subtotal     = cart?.subtotal ?? 0;
  const shippingCost = payment.method === "CONTRA_ENTREGA" ? 0 : 15000;
  const total        = subtotal + shippingCost;

  /* ── Validaciones ── */

  const validateShipping = () => {
    const e = {};
    if (!shipping.fullName.trim()) e.fullName = "Nombre requerido";
    if (!shipping.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "Email inválido";
    if (!shipping.phone.replace(/\D/g, "").match(/^\d{7,10}$/)) e.phone = "7-10 dígitos";
    if (!shipping.address.trim()) e.address = "Dirección requerida";
    if (!shipping.city.trim()) e.city = "Ciudad requerida";
    if (!shipping.department) e.department = "Selecciona un departamento";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const validatePayment = () => {
    const e = {};
    if (!payment.method) {
      e.method = "Selecciona un método de pago";
    } else if (payment.method === "CREDIT_CARD") {
      if (!payment.cardNumber.replace(/\s/g, "").match(/^\d{16}$/)) e.cardNumber = "Número inválido (16 dígitos)";
      if (!payment.cardName.trim()) e.cardName = "Nombre requerido";
      if (!payment.cardExpiry.match(/^\d{2}\/\d{2}$/)) e.cardExpiry = "Formato MM/AA";
      if (!payment.cardCvv.match(/^\d{3,4}$/)) e.cardCvv = "CVV inválido";
    } else if (payment.method === "PSE") {
      if (!payment.bank) e.bank = "Selecciona un banco";
    }
    setErrors(e);
    return !Object.keys(e).length;
  };

  const goNext = () => {
    setErrors({});
    if (step === 1 && !validateShipping()) return;
    if (step === 2 && !validatePayment())  return;
    setStep((s) => s + 1);
  };

  /* ── Pagar ── */

  const handlePay = async () => {
    setProcessing(true);

    const payload = {
      shippingAddress: shipping,
      paymentMethod:   payment.method,
      shippingCost,
      subtotal,
      total,
      items: items.map(({ productId, cartItemId, productName, quantity, subtotal: st, currentPrice }) => ({
        productId,
        cartItemId,
        productName,
        quantity,
        unitPrice: currentPrice,
        subtotal: st,
      })),
    };

    let order;
    try {
      order = await createOrder(storeId, payload);
    } catch {
      order = await simulateOrder(payload);
    }

    localStorage.setItem(
      `order_${order.orderId}`,
      JSON.stringify({
        order,
        items,
        subtotal,
        shippingCost,
        total,
        shipping,
        paymentMethod: payment.method,
        paymentMethodLabel: PAYMENT_METHODS.find((m) => m.id === payment.method)?.label,
      })
    );

    await new Promise((r) => setTimeout(r, 1800));
    navigate(`/tienda/${slug}/orden/${order.orderId}`);
  };

  /* ── Estados de carga / procesamiento ── */

  if (cartLoading) {
    return (
      <div className="ck-loading">
        <div className="ck-spinner" />
      </div>
    );
  }

  if (!cartLoading && (!items || items.length === 0)) {
    return (
      <div className="ck-loading" style={{ flexDirection: "column", gap: 16 }}>
        <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>Tu carrito está vacío.</p>
        <button
          style={{ background: "none", border: "1px solid #1e2a3d", color: "#64748b", padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}
          onClick={() => navigate(`/tienda/${slug}`)}
        >
          ← Volver a la tienda
        </button>
      </div>
    );
  }

  if (processing) {
    return (
      <div className="ck-processing">
        <div className="ck-processing__ring" />
        <div className="ck-processing__icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <p className="ck-processing__title">Procesando pago</p>
        <p className="ck-processing__sub">Verificando tu transacción de forma segura…</p>
        <div className="ck-processing__dots">
          <span /><span /><span />
        </div>
      </div>
    );
  }

  const STEPS = [{ n: 1, l: "Envío" }, { n: 2, l: "Pago" }, { n: 3, l: "Confirmar" }];

  return (
    <div className="ck-page">
      {/* Nav */}
      <nav className="ck-nav">
        <button className="ck-nav__back" onClick={() => navigate(`/tienda/${slug}`)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Volver a la tienda
        </button>
        <span className="ck-nav__store">{slug}</span>
        <div />
      </nav>

      {/* Step bar */}
      <div className="ck-steps-bar">
        {STEPS.map((s, i, arr) => (
          <div key={s.n} className="ck-steps-bar__item">
            <div className={`ck-dot ${step === s.n ? "ck-dot--active" : ""} ${step > s.n ? "ck-dot--done" : ""}`}>
              {step > s.n ? (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : s.n}
            </div>
            <span className={`ck-dot-label ${step >= s.n ? "ck-dot-label--active" : ""}`}>{s.l}</span>
            {i < arr.length - 1 && (
              <div className={`ck-connector ${step > s.n ? "ck-connector--done" : ""}`} />
            )}
          </div>
        ))}
      </div>

      {/* Layout */}
      <div className="ck-layout">
        {/* Form column */}
        <div className="ck-main">
          {step === 1 && (
            <ShippingStep values={shipping} onChange={setShipping} errors={errors} />
          )}
          {step === 2 && (
            <PaymentStep values={payment} onChange={setPayment} errors={errors} />
          )}
          {step === 3 && (
            <ReviewStep
              shipping={shipping}
              payment={payment}
              items={items}
              subtotal={subtotal}
              shippingCost={shippingCost}
              total={total}
            />
          )}

          <div className="ck-actions">
            {step > 1 && (
              <button className="ck-btn-secondary" onClick={() => setStep((s) => s - 1)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Atrás
              </button>
            )}
            {step < 3 ? (
              <button className="ck-btn-primary" onClick={goNext}>
                Continuar
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            ) : (
              <button className="ck-btn-pay" onClick={handlePay}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Pagar {formatCOP(total)}
              </button>
            )}
          </div>
        </div>

        {/* Order summary sidebar */}
        <aside className="ck-sidebar">
          <h3 className="ck-sidebar__title">Resumen del pedido</h3>

          <div className="ck-sidebar__items">
            {items.map((item) => (
              <div key={item.cartItemId} className="ck-sidebar__item">
                {item.productImageUrl ? (
                  <div className="ck-sidebar__img-wrap">
                    <img src={item.productImageUrl} alt={item.productName} />
                    <span className="ck-sidebar__qty">{item.quantity}</span>
                  </div>
                ) : (
                  <div className="ck-sidebar__img-placeholder">
                    <span className="ck-sidebar__qty">{item.quantity}</span>
                  </div>
                )}
                <div className="ck-sidebar__item-info">
                  <p className="ck-sidebar__item-name">{item.productName}</p>
                  {item.productSku && <p className="ck-sidebar__item-sku">{item.productSku}</p>}
                </div>
                <span className="ck-sidebar__item-price">{formatCOP(item.subtotal)}</span>
              </div>
            ))}
          </div>

          <div className="ck-sidebar__totals">
            <div className="ck-sidebar__row">
              <span>Subtotal</span><span>{formatCOP(subtotal)}</span>
            </div>
            <div className="ck-sidebar__row">
              <span>Envío</span>
              <span>
                {shippingCost === 0
                  ? <span className="ck-free">Gratis</span>
                  : formatCOP(shippingCost)}
              </span>
            </div>
            <div className="ck-sidebar__row ck-sidebar__row--total">
              <span>Total</span><span>{formatCOP(total)}</span>
            </div>
          </div>

          <div className="ck-sidebar__secure">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Transacción segura SSL
          </div>
        </aside>
      </div>
    </div>
  );
}
