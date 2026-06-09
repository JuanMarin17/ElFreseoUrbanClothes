/**
 * ProductPrice
 * Muestra el precio dinámico según la variante activa.
 * El precio formateado ya viene calculado por el hook (Intl.NumberFormat COP).
 *
 * Props:
 *  - priceFormatted  {string}  Precio actual formateado (ej: "$ 89.990")
 *  - brand           {string}  Nombre de la marca (ej: "Hugo Boss")
 *  - categories      {string[]} Categorías del producto
 */
export default function ProductPrice({
  priceFormatted,
  brand,
  categories = [],
}) {
  return (
    <div className="vx-price-block vx-anim vx-anim--d2">
      {/* Marca */}
      {brand && <p className="vx-price-block__brand">{brand}</p>}

      {/* Precio */}
      <div className="vx-price-block__row">
        <span className="vx-price-block__main">{priceFormatted}</span>
      </div>

      {/* Categorías como pills */}
      {categories.length > 0 && (
        <div className="vx-price-block__cats">
          {categories.map((cat) => (
            <span key={cat} className="vx-price-block__cat-pill">
              {cat}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
