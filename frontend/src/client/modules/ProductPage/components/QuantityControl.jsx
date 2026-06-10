/**
 * QuantityControl
 * Control de cantidad con botones de incremento/decremento y límites.
 *
 * Props:
 *  - value       {number}   Cantidad actual
 *  - onIncrement {Function} Callback para aumentar
 *  - onDecrement {Function} Callback para disminuir
 *  - max         {number}   Cantidad máxima permitida (stock disponible)
 */
export default function QuantityControl({
  value,
  onIncrement,
  onDecrement,
  max,
}) {
  return (
    <div className="vx-qty vx-anim vx-anim--d3">
      <span className="vx-qty__label">Cantidad</span>

      <div
        className="vx-qty__ctrl"
        role="group"
        aria-label="Control de cantidad"
      >
        <button
          className="vx-qty__btn"
          onClick={onDecrement}
          aria-label="Disminuir cantidad"
          disabled={value <= 1}
        >
          −
        </button>

        <div className="vx-qty__value" aria-live="polite" aria-atomic="true">
          {value}
        </div>

        <button
          className="vx-qty__btn"
          onClick={onIncrement}
          aria-label="Aumentar cantidad"
          disabled={value >= max}
        >
          +
        </button>
      </div>
    </div>
  );
}
