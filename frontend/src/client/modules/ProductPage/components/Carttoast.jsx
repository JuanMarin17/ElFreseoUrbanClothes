/**
 * CartToast
 * Notificación tipo toast que confirma que un producto fue añadido al carrito.
 *
 * Props:
 *  - visible {boolean} Controla si el toast es visible
 */
export function CartToast({ visible }) {
  return (
    <div
      className={`vx-toast ${visible ? "is-visible" : ""}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <i className="fa-solid fa-circle-check" aria-hidden="true" />
      ¡Producto añadido al carrito!
    </div>
  );
}

/**
 * StickyCTA
 * Barra de acción fija en la parte inferior para pantallas móviles.
 *
 * Props:
 *  - priceFormatted   {string}   Precio formateado para mostrar en el botón
 *  - stock            {number}   Stock disponible
 *  - cartLoading      {boolean}  Estado de carga del carrito
 *  - wishlisted       {boolean}  Estado del wishlist
 *  - onAddToCart      {Function} Callback para añadir al carrito
 *  - onToggleWishlist {Function} Callback para alternar wishlist
 */
export function StickyCTA({
  priceFormatted,
  stock,
  cartLoading,
  wishlisted,
  onAddToCart,
  onToggleWishlist,
}) {
  return (
    <div className="vx-sticky-cta" aria-label="Acciones rápidas">
      <button
        className="vx-btn vx-btn--primary"
        style={{ flex: 1 }}
        onClick={onAddToCart}
        disabled={cartLoading || stock === 0}
        aria-busy={cartLoading}
      >
        {cartLoading ? (
          <>
            <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" />
            Agregando…
          </>
        ) : (
          <>
            <i className="fa-solid fa-bag-shopping" aria-hidden="true" />
            {priceFormatted}
          </>
        )}
      </button>

      <button
        className={`vx-btn vx-btn--icon ${wishlisted ? "is-active" : ""}`}
        onClick={onToggleWishlist}
        aria-label={wishlisted ? "Quitar de favoritos" : "Agregar a favoritos"}
        aria-pressed={wishlisted}
      >
        <i
          className={wishlisted ? "fa-solid fa-heart" : "fa-regular fa-heart"}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
