/**
 * SizeSelector
 * Selector de tallas extraídas de las variantes del backend.
 * Muestra como deshabilitadas las tallas sin stock.
 *
 * Props:
 *  - sizes    {Array<{ id, name, available }>}
 *  - selected {{ id, name, available } | null}
 *  - onSelect {Function}
 */
export default function SizeSelector({ sizes = [], selected, onSelect }) {
  if (!sizes.length) return null;

  return (
    <div className="vx-variants vx-anim vx-anim--d3">
      <div className="vx-variants__label">
        Talla: <span>{selected?.name ?? "—"}</span>
      </div>

      <div
        className="vx-variants__row"
        role="radiogroup"
        aria-label="Seleccionar talla"
      >
        {sizes.map((size) => (
          <button
            key={size.id}
            className={[
              "vx-variant-btn",
              selected?.id === size.id ? "is-active" : "",
              !size.available ? "is-disabled" : "",
            ].join(" ")}
            onClick={() => onSelect(size)}
            role="radio"
            aria-checked={selected?.id === size.id}
            aria-disabled={!size.available}
            title={!size.available ? "Sin stock" : size.name}
          >
            {size.name}
          </button>
        ))}
      </div>
    </div>
  );
}
