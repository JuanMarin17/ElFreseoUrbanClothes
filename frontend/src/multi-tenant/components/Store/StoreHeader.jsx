import { Link } from "react-router-dom";
import StoreSearchBar from "./StoreSearchBar.jsx";

export default function StoreHeader({
  header,
  theme,
  searchCfg,
  searchQuery,
  onSearchChange,
  cartCount,
  isOwner = false,
  onCartOpen,
  isDark = true,
  onToggleDark,
}) {
  const { accent, btnR, hBg, hColor, hFont, isMin, isUrb, isCls } = theme;

  return (
    <header
      style={{
        background: hBg,
        borderBottom: isDark
          ? "1px solid rgba(255,255,255,0.05)"
          : "1px solid rgba(0,0,0,0.07)",
        padding: "0 clamp(16px,3vw,48px)",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        position: "sticky",
        top: 0,
        zIndex: 10,
        backdropFilter: "blur(10px)",
        transition: "background 0.3s ease, border-color 0.3s ease",
      }}
    >
      {isOwner && (
        <Link
          to="/mi-tienda/productos"
          style={{
            background: "transparent",
            border: `1.5px solid ${isUrb ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)"}`,
            color: hColor,
            padding: "5px 12px",
            borderRadius: btnR,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 1.5,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 5,
            flexShrink: 0,
            textDecoration: "none",
            opacity: 0.75,
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.75)}
        >
          PANEL ADMIN
        </Link>
      )}
      
      {/* NAV izquierda — minimalista */}
      {isMin && (
        <nav
          style={{
            display: "flex",
            gap: "clamp(12px,2vw,28px)",
            flexWrap: "wrap",
          }}
        >
          {(header.items ?? []).slice(0, 3).map((it, i) => (
            <span
              key={i}
              style={{
                fontSize: 11,
                letterSpacing: 1.5,
                color: hColor,
                opacity: i === 0 ? 1 : 0.45,
                fontWeight: i === 0 ? 700 : 400,
                textTransform: "uppercase",
                cursor: "pointer",
                borderBottom:
                  i === 0 ? `1.5px solid ${hColor}` : "1.5px solid transparent",
                paddingBottom: 1,
              }}
            >
              {it}
            </span>
          ))}
        </nav>
      )}

      {/* Logo */}
      <div
        style={{
          fontFamily: `"${hFont}",sans-serif`,
          fontWeight: 900,
          fontSize: "clamp(14px,2.2vw,20px)",
          letterSpacing: isUrb ? 6 : 3,
          color: hColor,
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
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
        <nav
          style={{
            display: "flex",
            gap: "clamp(12px,2vw,28px)",
            flexWrap: "wrap",
          }}
        >
          {(header.items ?? []).slice(0, 3).map((it, i) => (
            <span
              key={i}
              style={{
                fontSize: 11,
                letterSpacing: isUrb ? 2.5 : 1,
                color: hColor,
                opacity: i === 0 ? (isUrb ? 1 : 0.8) : 0.4,
                fontWeight: i === 0 ? 600 : 400,
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              {it}
            </span>
          ))}
        </nav>
      )}

      {/* Carrito */}
      <button
        onClick={onCartOpen}
        style={{
          background: isMin ? "transparent" : accent,
          border: isMin ? `1.5px solid ${hColor}` : "none",
          color: isMin ? hColor : isUrb ? "#000" : "#fff",
          padding: isMin ? "6px 14px" : "8px 18px",
          borderRadius: btnR,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: isUrb ? 2 : 0.5,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 6,
          flexShrink: 0,
        }}
      >
        {isUrb ? (
          <span>{cartCount > 0 ? `BAG (${cartCount})` : "BAG"}</span>
        ) : (
          <>
            <span style={{ fontSize: 13 }}>🛒</span>
            <span
              style={{
                minWidth: 16,
                height: 16,
                borderRadius: 8,
                background: cartCount > 0 ? accent : "transparent",
                color: cartCount > 0 ? (isMin ? "#fff" : "#000") : "inherit",
                fontSize: 10,
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: cartCount > 0 ? "0 4px" : 0,
              }}
            >
              {cartCount}
            </span>
          </>
        )}
      </button>

      {/* Toggle modo oscuro / claro */}
      <button
        onClick={onToggleDark}
        title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        style={{
          background: "transparent",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"}`,
          color: hColor,
          width: 36,
          height: 36,
          borderRadius: btnR,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "border-color 0.2s, background 0.2s",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = "transparent";
        }}
      >
        {isDark ? (
          /* Sol */
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        ) : (
          /* Luna */
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        )}
      </button>

      {/* Panel Admin — solo visible para el dueño */}
      {isOwner && (
        <Link
          to="/mi-tienda/productos"
          style={{
            background: "transparent",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"}`,
            color: hColor,
            padding: "5px 12px",
            borderRadius: btnR,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 1.2,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 5,
            flexShrink: 0,
            textDecoration: "none",
            opacity: 0.6,
            transition: "opacity 0.2s",
            textTransform: "uppercase",
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = 1}
          onMouseLeave={e => e.currentTarget.style.opacity = 0.6}
        >
          ⚙ Admin
        </Link>
      )}
    </header>
  );
}
