/**
 * VariantSelector
 * Selector de variantes del producto (edición, talla, capacidad, etc.)
 * mediante botones de texto.
 *
 * Props:
 *  - label    {string}   Nombre del tipo de variante (ej: "Edición", "Talla")
 *  - variants {Array}    Lista: [{ id, name, available }]
 *  - selected {object}   Variante actualmente seleccionada
 *  - onSelect {Function} Callback al seleccionar una variante disponible
 */
export default function VariantSelector({
  label,
  variants = [],
  selected,
  onSelect,
}) {
  if (!variants.length) return null;

  return (
    <div className="vx-variants vx-anim vx-anim--d3">
      <div className="vx-variants__label">
        {label}: <span>{selected?.name ?? "—"}</span>
      </div>

      <div
        className="vx-variants__row"
        role="radiogroup"
        aria-label={`Seleccionar ${label}`}
      >
        {variants.map((variant) => (
          <button
            key={variant.id}
            className={[
              "vx-variant-btn",
              selected?.id === variant.id ? "is-active" : "",
              !variant.available ? "is-disabled" : "",
            ].join(" ")}
            onClick={() => variant.available && onSelect(variant)}
            aria-checked={selected?.id === variant.id}
            aria-disabled={!variant.available}
            role="radio"
          >
            {variant.name}
            {!variant.available && " (Agotado)"}
          </button>
        ))}
      </div>
    </div>
  );
}
