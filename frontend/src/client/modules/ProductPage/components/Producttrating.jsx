import StarRating from "./StarRating";

/**
 * ProductRating
 * Fila de puntuación: estrellas, score, total de reseñas y estadísticas de actividad.
 *
 * Props:
 *  - rating      {number} Puntuación promedio
 *  - reviewCount {number} Total de reseñas
 *  - soldCount   {number} Unidades vendidas
 *  - viewersNow  {number} Usuarios viendo el producto ahora
 */
export default function ProductRating({
  rating,
  reviewCount,
  soldCount,
  viewersNow,
}) {
  return (
    <div className="vx-rating vx-anim vx-anim--d2">
      <StarRating score={rating} />

      <span className="vx-rating__score">{rating}</span>

      <span className="vx-rating__count">
        ({reviewCount?.toLocaleString()} reseñas)
      </span>

      <div className="vx-rating__sep" aria-hidden="true" />

      <span className="vx-rating__stat">
        <i className="fa-solid fa-fire-flame-curved" aria-hidden="true" />+
        {soldCount?.toLocaleString()} vendidos
      </span>

      <div className="vx-rating__sep" aria-hidden="true" />

      <span className="vx-rating__stat">
        <i className="fa-solid fa-eye" aria-hidden="true" />
        {viewersNow} viendo ahora
      </span>
    </div>
  );
}
