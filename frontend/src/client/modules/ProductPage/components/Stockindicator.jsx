/**
 * StockIndicator
 * Indicador visual del estado de stock del producto.
 * Maneja tres estados: sin stock, stock bajo (≤5) y stock disponible.
 *
 * Props:
 *  - stock {number} Unidades disponibles
 */
export default function StockIndicator({ stock }) {
  if (stock === 0) {
    return (
      <span className="vx-stock vx-stock--out" role="status">
        Sin stock
      </span>
    );
  }

  if (stock <= 5) {
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
