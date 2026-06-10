/**
 * StarRating
 * Renderiza estrellas llenas, media estrella y vacías a partir de un score numérico.
 *
 * Props:
 *  - score   {number}  Puntuación (ej: 4.5)
 *  - size    {string}  'sm' | 'md' (default 'md')
 */
export default function StarRating({ score, size = "md" }) {
  const full = Math.floor(score);
  const half = score % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <span
      className={`vx-rating__stars vx-rating__stars--${size}`}
      aria-label={`${score} de 5 estrellas`}
    >
      {Array.from({ length: full }).map((_, i) => (
        <i key={`f${i}`} className="fa-solid fa-star" aria-hidden="true" />
      ))}
      {half && (
        <i className="fa-solid fa-star-half-stroke" aria-hidden="true" />
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <i key={`e${i}`} className="fa-regular fa-star" aria-hidden="true" />
      ))}
    </span>
  );
}
