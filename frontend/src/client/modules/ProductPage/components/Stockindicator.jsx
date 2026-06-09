/**
 * StockIndicator
 * Indicador de stock dinámico según la variante activa.
 *
 * Props:
 *  - stock         {number}       Unidades de la variante activa
 *  - minStock      {number}       Mínimo de stock definido (viene del backend)
 *  - activeVariant {object|null}  Si es null, no hay combinación disponible
 */
export default function StockIndicator({ stock, minStock = 5, activeVariant }) {
  // No se encontró variante para la combinación seleccionada
  if (!activeVariant) {
    return (
      <span className="vx-stock vx-stock--out" role="status">
        Combinación no disponible
      </span>
    );
  }

  if (stock === 0) {
    return (
      <span className="vx-stock vx-stock--out" role="status">
        Sin stock
      </span>
    );
  }

  // Stock bajo: igual o menor al minStock del backend
  if (stock <= minStock) {
    return (
      <span className="vx-stock vx-stock--low" role="status">
        ¡Solo {stock} {stock === 1 ? "unidad disponible" : "disponibles"}!
      </span>
    );
  }

  return (
    <span className="vx-stock" role="status">
      En stock ({stock} unidades)
    </span>
  );
}
