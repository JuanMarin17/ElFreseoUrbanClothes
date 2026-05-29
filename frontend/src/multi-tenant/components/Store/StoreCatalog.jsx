import StoreProductCard from './StoreProductCard.jsx';
import StoreSearchBar from './StoreSearchBar.jsx';

export default function StoreCatalog({
  layoutType, theme,
  filteredProducts, totalProducts,
  searchQuery, clearFilters,
  addToCart, justAdded,
  searchCfg, onSearchChange,
}) {
  const { accent, btnR, fT, catalogBg, isMin, isUrb, isCls } = theme;

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
          <div style={{ flex: 1, height: 1, background: "#111" }} />
          <span style={{ fontSize: 10, letterSpacing: 5, color: "#2a2a2a", textTransform: "uppercase", fontWeight: 700 }}>
            FEATURED DROPS
          </span>
          <div style={{ flex: 1, height: 1, background: "#111" }} />
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <h2 style={{
            fontFamily: `"${fT}",sans-serif`,
            fontSize: 11, letterSpacing: 4, textTransform: "uppercase", margin: 0,
            color: isMin ? "#999" : "#888", fontWeight: 600,
          }}>
            {isMin ? "Productos destacados" : "Catálogo"}
          </h2>
          <span style={{ fontSize: 10, color: isMin ? "#ccc" : "#bbb" }}>
            — {filteredProducts.length}{filteredProducts.length !== totalProducts ? ` de ${totalProducts}` : ""} artículo{filteredProducts.length !== 1 ? "s" : ""}
          </span>
          {isCls && (
            <select style={{
              marginLeft: "auto",
              background: "#fff", border: "1px solid #e0e0e0", borderRadius: 7,
              padding: "5px 10px", fontSize: 11, color: "#555", cursor: "pointer",
              width: "fit-content",
            }}>
              <option>Más relevantes</option>
              <option>Menor precio</option>
              <option>Mayor precio</option>
            </select>
          )}
          {isMin && (
            <span style={{ marginLeft: "auto", fontSize: 11, color: accent, cursor: "pointer", fontWeight: 600 }}>
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
            textAlign: "center", padding: "40px 20px",
            color: isUrb ? "#333" : "#bbb",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
          }}>
            <span style={{ fontSize: 28, opacity: 0.4 }}>🔍</span>
            <p style={{ fontSize: 13, margin: 0, fontWeight: 500 }}>
              Sin resultados{searchQuery ? ` para "${searchQuery}"` : ""}
            </p>
            <button onClick={clearFilters} style={{
              background: "transparent", border: `1px solid ${accent}`,
              color: accent, padding: "6px 16px", borderRadius: btnR,
              fontSize: 11, cursor: "pointer", fontWeight: 600,
            }}>
              Limpiar búsqueda
            </button>
          </div>
        )}

        {/* Ver más */}
        {filteredProducts.length > 0 && (
          <div style={{ textAlign: "center", marginTop: 28 }}>
            <button style={{
              background: "transparent",
              border: `1.5px solid ${isUrb ? "#1a1a1a" : "#ddd"}`,
              color: isUrb ? "#333" : "#888",
              padding: "10px 32px", borderRadius: btnR, fontSize: 11,
              fontWeight: 600, cursor: "pointer", letterSpacing: 1,
            }}>
              {isUrb ? "LOAD MORE" : "Ver más productos"}
            </button>
          </div>
        )}
      </div>

    </section>
  );
}
