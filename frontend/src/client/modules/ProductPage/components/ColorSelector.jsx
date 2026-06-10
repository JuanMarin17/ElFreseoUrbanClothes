export default function ColorSelector({ colors = [], selected, onSelect }) {
  if (!colors || colors.length === 0) return null;

  return (
    <div className="vx-variants vx-anim vx-anim--d3">
      <div className="vx-variants__label">
        Color: <span>{selected?.name ?? "—"}</span>
      </div>
      <div
        className="vx-variants__row"
        role="radiogroup"
        aria-label="Seleccionar color"
      >
        {colors.map((c) => (
          <button
            key={c.id}
            className={`vx-color-swatch ${selected?.id === c.id ? "is-active" : ""}`}
            style={{ backgroundColor: c.hex }}
            onClick={() => onSelect && onSelect(c)}
            aria-label={c.name}
            aria-checked={selected?.id === c.id}
            role="radio"
            title={c.name}
          />
        ))}
      </div>
    </div>
  );
}
