import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CartDrawer.css";

const formatCOP = (n) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(n ?? 0);

/* ── CartItem ─────────────────────────────────────────────── */
function CartItem({ item, onIncrease, onDecrease, onRemove, busy }) {
  const isLoading = busy === item.cartItemId;
  return (
    <div className={`cd-item ${isLoading ? "cd-item--loading" : ""}`}>
      <div className="cd-item__img">
        {item.productImageUrl ? (
          <img src={item.productImageUrl} alt={item.productName} />
        ) : (
          <div className="cd-item__img-placeholder">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}
      </div>

      <div className="cd-item__info">
        <p className="cd-item__name">{item.productName}</p>
        {item.productSku && <p className="cd-item__sku">{item.productSku}</p>}

        {/* Alerta de cambio de precio */}
        {item.priceChanged && item.currentPrice != null && (
          <p className="cd-item__price-alert">
            Precio actualizado: {formatCOP(item.currentPrice)}
          </p>
        )}

        <div className="cd-item__bottom">
          {/* Controles de cantidad */}
          <div className="cd-qty">
            <button
              className="cd-qty__btn"
              onClick={() => onDecrease(item.cartItemId, item.quantity - 1)}
              disabled={isLoading}
              aria-label="Reducir cantidad"
            >
              −
            </button>
            <span className="cd-qty__val">{item.quantity}</span>
            <button
              className="cd-qty__btn"
              onClick={() => onIncrease(item.cartItemId, item.quantity + 1)}
              disabled={isLoading}
              aria-label="Aumentar cantidad"
            >
              +
            </button>
          </div>

          <span className="cd-item__subtotal">{formatCOP(item.subtotal)}</span>
        </div>
      </div>

      <button
        className="cd-item__remove"
        onClick={() => onRemove(item.cartItemId)}
        disabled={isLoading}
        aria-label="Eliminar producto"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

/* ── CartDrawer ───────────────────────────────────────────── */
export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  loading,
  itemLoading,
  error,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onClearError,
  storeSlug,
}) {
  const navigate = useNavigate();
<<<<<<< HEAD

  const handleCheckout = () => {
    onClose();
    navigate(`/tienda/${storeSlug}/checkout`, { state: { cart } });
  };
=======
  const slug = window.location.pathname.match(/\/tienda\/([^/]+)/)?.[1];
>>>>>>> d722bcdf12418f9ef4a313bbf32b00bb59171a8d

  // Bloquear scroll del body mientras está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const items = cart?.items ?? [];
  const subtotal = cart?.subtotal ?? 0;
  const hasPriceChanges = cart?.hasPriceChanges ?? false;
  const isLoggedIn =
    !!localStorage.getItem("jwt") && localStorage.getItem("jwt") !== "null";

  return (
    <>
      {/* Backdrop */}
      <div
        className={`cd-backdrop ${isOpen ? "cd-backdrop--visible" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className={`cd-panel ${isOpen ? "cd-panel--open" : ""}`}
        aria-label="Carrito de compras"
      >
        {/* Header */}
        <div className="cd-header">
          <div className="cd-header__left">
            <span className="cd-header__title">Carrito</span>
            {items.length > 0 && (
              <span className="cd-header__count">{cart?.totalItems ?? 0}</span>
            )}
          </div>
          <button
            className="cd-close"
            onClick={onClose}
            aria-label="Cerrar carrito"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Alerta cambio de precios */}
        {hasPriceChanges && (
          <div className="cd-price-alert">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Algunos precios han cambiado desde que agregaste estos productos.
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="cd-error" onClick={onClearError}>
            <span>{error}</span>
            <button aria-label="Cerrar error">✕</button>
          </div>
        )}

        {/* Body */}
        <div className="cd-body">
          {!isLoggedIn ? (
            <div className="cd-empty">
              <div className="cd-empty__icon">
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <p className="cd-empty__title">
                Inicia sesión para usar el carrito
              </p>
              <p className="cd-empty__sub">
                Tu carrito se guarda por tienda en tu cuenta.
              </p>
            </div>
          ) : loading && items.length === 0 ? (
            <div className="cd-loading">
              <div className="cd-spinner" />
              <span>Cargando carrito…</span>
            </div>
          ) : items.length === 0 ? (
            <div className="cd-empty">
              <div className="cd-empty__icon">
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                >
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
              </div>
              <p className="cd-empty__title">Tu carrito está vacío</p>
              <p className="cd-empty__sub">Agrega productos para continuar.</p>
            </div>
          ) : (
            <div className="cd-items">
              {items.map((item) => (
                <CartItem
                  key={item.cartItemId}
                  item={item}
                  busy={itemLoading}
                  onIncrease={(id, qty) => onUpdateQuantity(id, qty)}
                  onDecrease={(id, qty) =>
                    qty === 0 ? onRemoveItem(id) : onUpdateQuantity(id, qty)
                  }
                  onRemove={onRemoveItem}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="cd-footer">
            <div className="cd-total">
              <span className="cd-total__label">Subtotal</span>
              <span className="cd-total__value">{formatCOP(subtotal)}</span>
            </div>
            <p className="cd-total__note">
              Envío e impuestos calculados al finalizar
            </p>

<<<<<<< HEAD
            <button className="cd-btn-checkout" onClick={handleCheckout}>
=======
            <button
              className="cd-btn-checkout"
              onClick={() => { onClose(); navigate(`/tienda/${slug}/checkout`); }}
            >
>>>>>>> d722bcdf12418f9ef4a313bbf32b00bb59171a8d
              Proceder al pago
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>

            <button
              className="cd-btn-clear"
              onClick={onClearCart}
              disabled={loading}
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
