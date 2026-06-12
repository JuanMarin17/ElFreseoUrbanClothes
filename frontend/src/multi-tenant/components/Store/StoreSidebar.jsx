import { ChevronRight } from './storeUtils.jsx';

export default function StoreSidebar({
  cfg, theme,
  activeCategory, setActiveCategory,
  activePrices, togglePrice,
  activeSizes, toggleSize,
  clearFilters, hasActiveFilters,
}) {
  if (!cfg.visible) return null;

  const { accent, btnR, isUrb } = theme;
  const { bg, color, borderColor, borderWidth, width, font, items } = cfg;

  const PRICE_LABELS = [
    "Menos de $50.000",
    "$50.000 – $100.000",
    "$100.000 – $200.000",
    "Más de $200.000",
  ];

  return (
    <aside style={{
      width,
      flexShrink: 0,
      background: bg,
      borderRight: `${borderWidth}px solid ${borderColor}`,
      fontFamily: `"${font}",sans-serif`,
      position: "sticky",
      top: 64,
      height: "calc(100vh - 64px)",
      overflowY: "auto",
      scrollbarWidth: "thin",
      scrollbarColor: `${borderColor} transparent`,
    }}>

      {/* Cabecera categorías */}
      <div style={{
        padding: "9px 14px 8px",
        borderBottom: `1px solid ${borderColor}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color, opacity: 0.55 }}>
          Categorías
        </span>
        {hasActiveFilters && (
          <button onClick={clearFilters} style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 10, color: accent, letterSpacing: 0.5, padding: 0,
          }}>
            Limpiar ×
          </button>
        )}
      </div>

      {/* Ítems de categoría */}
      <div style={{ padding: "2px 0" }}>
        {items.map((item, i) => (
          <div key={i} onClick={() => setActiveCategory(i)} style={{
            padding: "7px 14px 7px 12px",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6,
            fontSize: 12,
            color: i === activeCategory ? accent : color,
            fontWeight: i === activeCategory ? 600 : 400,
            borderLeft: `3px solid ${i === activeCategory ? accent : "transparent"}`,
            background: i === activeCategory ? `${accent}12` : "transparent",
            cursor: "pointer", letterSpacing: 0.2, userSelect: "none",
            transition: "background 0.15s, color 0.15s",
          }}>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
              {item}
            </span>
            <ChevronRight color={i === activeCategory ? accent : color} size={9} />
          </div>
        ))}
      </div>

      {/* Filtro precio */}
      <div style={{ padding: "8px 14px 10px", borderTop: `1px solid ${borderColor}` }}>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: 2,
          textTransform: "uppercase", color, opacity: 0.55,
          display: "block", marginBottom: 7,
        }}>
          Precio
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {PRICE_LABELS.map((label, i) => {
            const checked = activePrices.includes(i);
            return (
              <label key={i} onClick={() => togglePrice(i)} style={{
                display: "flex", alignItems: "center", gap: 7,
                fontSize: 11.5, color: checked ? accent : color,
                cursor: "pointer", userSelect: "none",
                fontWeight: checked ? 600 : 400,
              }}>
                <span style={{
                  width: 13, height: 13, flexShrink: 0, borderRadius: 3,
                  border: `1.5px solid ${checked ? accent : borderColor}`,
                  background: checked ? accent : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.15s, border-color 0.15s",
                }}>
                  {checked && <span style={{ fontSize: 8, color: "#fff", lineHeight: 1 }}>✓</span>}
                </span>
                {label}
              </label>
            );
          })}
        </div>
      </div>

      {/* Filtro talla */}
      <div style={{ padding: "8px 14px 12px", borderTop: `1px solid ${borderColor}` }}>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: 2,
          textTransform: "uppercase", color, opacity: 0.55,
          display: "block", marginBottom: 7,
        }}>
          Talla
        </span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {["XS", "S", "M", "L", "XL"].map((size) => {
            const sel = activeSizes.includes(size);
            return (
              <span key={size} onClick={() => toggleSize(size)} style={{
                padding: "4px 8px", fontSize: 10, fontWeight: 600,
                border: `1.5px solid ${sel ? accent : borderColor}`,
                borderRadius: 5, color: sel ? accent : color,
                background: sel ? `${accent}14` : "transparent",
                cursor: "pointer", letterSpacing: 0.5, userSelect: "none",
                transition: "background 0.15s, border-color 0.15s, color 0.15s",
              }}>
                {size}
              </span>
            );
          })}
        </div>
      </div>

      {/* Limpiar filtros */}
      {hasActiveFilters && (
        <div style={{ padding: "0 14px 12px" }}>
          <button onClick={clearFilters} style={{
            width: "100%", padding: "7px 0",
            background: "transparent", border: `1px solid ${borderColor}`,
            borderRadius: btnR, color, fontSize: 10,
            fontWeight: 600, letterSpacing: 1, textTransform: "uppercase",
            cursor: "pointer", opacity: 0.7,
          }}>
            Limpiar filtros ×
          </button>
        </div>
      )}

    </aside>
  );
}
