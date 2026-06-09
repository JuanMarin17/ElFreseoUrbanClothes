/**
 * ProductActions
 * Botonera principal de acción: Añadir al carrito, Comprar ahora y Wishlist.
 *
 * Props:
 *  - stock              {number}   Unidades disponibles
 *  - cartLoading        {boolean}  Indica si el carrito está procesando
 *  - wishlisted         {boolean}  Indica si el producto está en wishlist
 *  - onAddToCart        {Function} Callback para añadir al carrito
 *  - onBuyNow           {Function} Callback para compra inmediata
 *  - onToggleWishlist   {Function} Callback para alternar wishlist
 */
export default function ProductActions({
  stock,
  cartLoading,
  wishlisted,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
}) {
  const outOfStock = stock === 0;

  return (
    <div className="vx-cta vx-anim vx-anim--d4">
      {/* Añadir al carrito */}
      <button
        className="vx-btn vx-btn--primary"
        onClick={onAddToCart}
        disabled={cartLoading || outOfStock}
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
            {outOfStock ? "Sin stock" : "Añadir al carrito"}
          </>
        )}
      </button>

      {/* Comprar ahora */}
      <button
        className="vx-btn vx-btn--ghost"
        onClick={onBuyNow}
        disabled={outOfStock}
      >
        <i className="fa-solid fa-bolt" aria-hidden="true" />
        Comprar ahora
      </button>

      {/* Wishlist */}
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
