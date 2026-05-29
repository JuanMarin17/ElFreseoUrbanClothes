import StoreSearchBar from './StoreSearchBar.jsx';

export default function StoreHeader({ header, theme, searchCfg, searchQuery, onSearchChange, cartCount }) {
  const { accent, btnR, hBg, hColor, hFont, isMin, isUrb, isCls } = theme;

  return (
    <header style={{
      background: hBg,
      borderBottom: isUrb ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.08)",
      padding: "0 clamp(16px,3vw,48px)",
      height: 64,
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
      position: "sticky", top: 0, zIndex: 10,
      backdropFilter: "blur(8px)",
    }}>

      {/* NAV izquierda — minimalista */}
      {isMin && (
        <nav style={{ display: "flex", gap: "clamp(12px,2vw,28px)", flexWrap: "wrap" }}>
          {(header.items ?? []).slice(0, 3).map((it, i) => (
            <span key={i} style={{
              fontSize: 11, letterSpacing: 1.5, color: hColor,
              opacity: i === 0 ? 1 : 0.45, fontWeight: i === 0 ? 700 : 400,
              textTransform: "uppercase", cursor: "pointer",
              borderBottom: i === 0 ? `1.5px solid ${hColor}` : "1.5px solid transparent",
              paddingBottom: 1,
            }}>
              {it}
            </span>
          ))}
        </nav>
      )}

      {/* Logo */}
      <div style={{
        fontFamily: `"${hFont}",sans-serif`,
        fontWeight: 900, fontSize: "clamp(14px,2.2vw,20px)",
        letterSpacing: isUrb ? 6 : 3, color: hColor,
        textTransform: "uppercase", whiteSpace: "nowrap",
      }}>
        {header.logo}
      </div>

      {/* Buscador en header (urbano y clásico) */}
      {(isUrb || isCls) && (
        <StoreSearchBar
          value={searchQuery}
          onChange={onSearchChange}
          cfg={searchCfg}
          accent={accent}
          maxWidth={isUrb ? 260 : 320}
        />
      )}

      {/* NAV derecha — urbano y clásico */}
      {!isMin && (
        <nav style={{ display: "flex", gap: "clamp(12px,2vw,28px)", flexWrap: "wrap" }}>
          {(header.items ?? []).slice(0, 3).map((it, i) => (
            <span key={i} style={{
              fontSize: 11, letterSpacing: isUrb ? 2.5 : 1, color: hColor,
              opacity: i === 0 ? (isUrb ? 1 : 0.8) : 0.4, fontWeight: i === 0 ? 600 : 400,
              textTransform: "uppercase", cursor: "pointer",
            }}>
              {it}
            </span>
          ))}
        </nav>
      )}

      {/* Carrito */}
      <button style={{
        background: isMin ? "transparent" : accent,
        border: isMin ? `1.5px solid ${hColor}` : "none",
        color: isMin ? hColor : (isUrb ? "#000" : "#fff"),
        padding: isMin ? "6px 14px" : "8px 18px",
        borderRadius: btnR, fontSize: 11, fontWeight: 700,
        letterSpacing: isUrb ? 2 : 0.5, cursor: "pointer",
        display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
      }}>
        {isUrb ? (
          <span>{cartCount > 0 ? `BAG (${cartCount})` : "BAG"}</span>
        ) : (
          <>
            <span style={{ fontSize: 13 }}>🛒</span>
            <span style={{
              minWidth: 16, height: 16, borderRadius: 8,
              background: cartCount > 0 ? accent : "transparent",
              color: cartCount > 0 ? (isMin ? "#fff" : "#000") : "inherit",
              fontSize: 10, fontWeight: 800,
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: cartCount > 0 ? "0 4px" : 0,
            }}>
              {cartCount}
            </span>
          </>
        )}
      </button>

    </header>
  );
}
