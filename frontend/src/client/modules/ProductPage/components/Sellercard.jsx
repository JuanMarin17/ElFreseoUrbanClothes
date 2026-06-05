/**
 * SellerCard
 * Tarjeta con información del vendedor y botón de seguimiento.
 *
 * Props:
 *  - seller {object} Datos del vendedor:
 *    { name, initials, rating, positivePercent }
 */
export default function SellerCard({ seller }) {
  if (!seller) return null;

  return (
    <div className="vx-seller vx-anim vx-anim--d4">
      <div className="vx-seller__avatar" aria-hidden="true">
        {seller.initials}
      </div>

      <div className="vx-seller__info">
        <div className="vx-seller__name">{seller.name}</div>
        <div className="vx-seller__meta">
          <i
            className="fa-solid fa-star"
            style={{ color: "var(--vx-amber)", fontSize: "0.72rem" }}
            aria-hidden="true"
          />
          {seller.rating}
          <span className="vx-seller__meta-dot">·</span>
          {seller.positivePercent}% valoraciones positivas
        </div>
      </div>

      <button className="vx-btn vx-btn--ghost vx-btn--sm">Seguir</button>
    </div>
  );
}
