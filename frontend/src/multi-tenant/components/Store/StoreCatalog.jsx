import StoreProductCard from './StoreProductCard.jsx';
import StoreSearchBar from './StoreSearchBar.jsx';

export default function StoreCatalog({
  layoutType, theme,
  filteredProducts, totalProducts,
  searchQuery, clearFilters,
  addToCart, justAdded,
  searchCfg, onSearchChange,
}) {
  const { accent, btnR, fT, catalogBg, isDark, isMin, isUrb, isCls } = theme;
  const sectionTitle = isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)";
  const sectionCount = isDark ? "rgba(255,255,255,0.2)"  : "rgba(0,0,0,0.25)";

  return (
    <section style={{ padding: "20px 24px 28px", background: catalogBg }}>

      {/* Buscador debajo del header — solo minimalista */}
      {isMin && searchCfg.visible && (
        <div style={{ marginBottom: 16 }}>
          <StoreSearchBar
            value={searchQuery}
            onChange={onSearchChange}
            cfg={searchCfg}
            accent={accent}
            maxWidth={520}
          />
        </div>
      )}

      {/* Encabezado de sección */}
      {isUrb ? (
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
          <div style={{ flex: 1, height: 1, background: "#161616" }} />
          <span style={{ fontSize: 9, letterSpacing: 6, color: "#333", textTransform: "uppercase", fontWeight: 800 }}>
            FEATURED DROPS
          </span>
          <div style={{ flex: 1, height: 1, background: "#161616" }} />
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 3, height: 14, background: accent, borderRadius: 2, display: "inline-block" }} />
            <h2 style={{
              fontFamily: `"${fT}",sans-serif`,
              fontSize: 11, letterSpacing: 3, textTransform: "uppercase", margin: 0,
              color: sectionTitle, fontWeight: 700,
            }}>
              {isMin ? "Productos" : "Catálogo"}
            </h2>
          </div>
          <span style={{ fontSize: 10, color: sectionCount, letterSpacing: 0.3 }}>
            {filteredProducts.length}{filteredProducts.length !== totalProducts ? ` / ${totalProducts}` : ""} artículo{filteredProducts.length !== 1 ? "s" : ""}
          </span>
          {isCls && (
            <select style={{
              marginLeft: "auto",
              background: isDark ? "#0e1118" : "#ffffff",
              border: `1px solid ${isDark ? "#1e2230" : "#dde4f0"}`,
              borderRadius: 7, padding: "6px 12px",
              fontSize: 11, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
              cursor: "pointer", outline: "none",
            }}>
              <option>Más relevantes</option>
              <option>Menor precio</option>
              <option>Mayor precio</option>
            </select>
          )}
          {isMin && (
            <span style={{ marginLeft: "auto", fontSize: 11, color: accent, cursor: "pointer", fontWeight: 600, opacity: 0.8 }}>
              Ver todo →
            </span>
          )}
        </div>
      )}

      {/* Grid */}
      <div style={{ minWidth: 0 }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(auto-fill, minmax(${isUrb ? "170px" : "160px"}, 1fr))`,
          gap: 16,
        }}>
          {filteredProducts.map((p, i) => (
            <StoreProductCard
              key={p.id ?? i}
              product={p}
              index={i}
              theme={theme}
              isJustAdded={justAdded === i}
              onAddToCart={addToCart}
            />
          ))}
        </div>

        {/* Estado vacío */}
        {filteredProducts.length === 0 && (
          <div style={{
            textAlign: "center", padding: "60px 20px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <p style={{ fontSize: 13, margin: 0, fontWeight: 500, color: "rgba(255,255,255,0.3)" }}>
              {searchQuery ? `Sin resultados para "${searchQuery}"` : "No hay productos disponibles"}
            </p>
            {searchQuery && (
              <button onClick={clearFilters} style={{
                background: "transparent",
                border: `1px solid ${accent}40`,
                color: accent, padding: "7px 20px", borderRadius: btnR,
                fontSize: 11, cursor: "pointer", fontWeight: 600,
              }}>
                Limpiar búsqueda
              </button>
            )}
          </div>
        )}

        {/* Ver más */}
        {filteredProducts.length > 0 && (
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <button style={{
              background: "transparent",
              border: `1px solid ${isUrb ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.08)"}`,
              color: "rgba(255,255,255,0.3)",
              padding: "11px 40px", borderRadius: btnR, fontSize: 10,
              fontWeight: 700, cursor: "pointer", letterSpacing: 2,
              textTransform: "uppercase",
              transition: "border-color 0.15s, color 0.15s",
            }}>
              {isUrb ? "LOAD MORE" : "Ver más"}
            </button>
          </div>
        )}
      </div>

    </section>
  );
}
