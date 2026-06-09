import StarRating from "./Starrating";
// import ReviewCard from "./ReviewCard";

/**
 * TabReviews
 * Panel de reseñas: resumen con distribución de rating y lista de reseñas paginadas.
 *
 * Props:
 *  - rating             {number}  Puntuación promedio
 *  - reviewCount        {number}  Total de reseñas
 *  - ratingDistribution {Array}   [{ stars, percentage }]
 *  - reviews            {Array}   Lista de reseñas cargadas
 *  - hasMoreReviews     {boolean} Si hay más páginas disponibles
 *  - onLoadMore         {Function} Callback para cargar más reseñas
 */
export default function TabReviews({
  rating,
  reviewCount,
  ratingDistribution = [],
  reviews = [],
  hasMoreReviews,
  onLoadMore,
}) {
  return (
    <div role="tabpanel" id="panel-reviews" aria-labelledby="tab-reviews">
      <div className="vx-reviews-grid">
        {/* Resumen */}
        <aside
          className="vx-reviews-summary"
          aria-label="Resumen de calificaciones"
        >
          <div
            className="vx-reviews-summary__avg"
            aria-label={`Calificación promedio: ${rating}`}
          >
            {rating}
          </div>

          <StarRating score={rating} />

          <p className="vx-reviews-summary__total">
            {reviewCount?.toLocaleString()} valoraciones
          </p>

          {/* Barras de distribución */}
          <div
            className="vx-rating-bars"
            aria-label="Distribución de calificaciones"
          >
            {ratingDistribution.map((item) => (
              <div key={item.stars} className="vx-rating-bar">
                <span className="vx-rating-bar__label" aria-hidden="true">
                  {item.stars}
                </span>
                <div
                  className="vx-rating-bar__track"
                  role="progressbar"
                  aria-valuenow={item.percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${item.stars} estrellas: ${item.percentage}%`}
                >
                  <div
                    className="vx-rating-bar__fill"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="vx-rating-bar__pct">{item.percentage}%</span>
              </div>
            ))}
          </div>

          <button
            className="vx-btn vx-btn--primary vx-btn--full"
            style={{ marginTop: 20 }}
          >
            <i className="fa-solid fa-pen" aria-hidden="true" /> Escribir reseña
          </button>
        </aside>

        {/* Lista de reseñas */}
        <div>
          <div className="vx-reviews-list">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>

          {hasMoreReviews && (
            <button
              className="vx-btn vx-btn--ghost"
              style={{ marginTop: 20 }}
              onClick={onLoadMore}
            >
              Cargar más reseñas
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
