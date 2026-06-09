import { Link } from "react-router-dom";
import { ShoppingBag, Sun, Moon, Settings } from "lucide-react";
import StoreSearchBar from "./StoreSearchBar.jsx";
import "./styles/styles.css"

export default function StoreHeader({
  header,
  theme,
  searchCfg,
  searchQuery,
  onSearchChange,
  cartCount,
  isOwner = false,
  storeSlug = null,
  onCartOpen,
  isDark = true,
  onToggleDark,
}) {
  const { accent, btnR, hBg, hColor, hFont, isMin, isUrb, isCls } = theme;

  const btnBg     = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";
  const btnBgHov  = isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.11)";
  const btnBorder = isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.18)";

  const iconBtnStyle = {
    background: btnBg,
    border: `1px solid ${btnBorder}`,
    color: hColor,
    width: 36,
    height: 36,
    borderRadius: btnR,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "background 0.2s",
  };

  return (
    <header
      style={{
        background: hBg,
        borderBottom: `1px solid ${btnBorder}`,
        padding: "0 clamp(16px,3vw,48px)",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        position: "sticky",
        top: 0,
        zIndex: 10,
        backdropFilter: "blur(12px)",
        transition: "background 0.3s ease, border-color 0.3s ease",
      }}
    >
      {/* NAV izquierda — solo minimalista */}
      {isMin && (
        <nav style={{ display: "flex", gap: "clamp(12px,2vw,28px)" }}>
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
                borderBottom: i === 0 ? `1.5px solid ${hColor}` : "1.5px solid transparent",
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
          flexShrink: 0,
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
        <nav style={{ display: "flex", gap: "clamp(12px,2vw,28px)" }}>
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

      {/* ── Acciones lado derecho ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>

        {/* Carrito */}
        <button
          onClick={onCartOpen}
          style={{
            background: isMin ? "transparent" : accent,
            border: isMin ? `1.5px solid ${btnBorder}` : "none",
            color: isMin ? hColor : isUrb ? "#000" : "#fff",
            padding: isMin ? "7px 14px" : "8px 18px",
            borderRadius: btnR,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: isUrb ? 2 : 0.5,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 7,
            transition: "opacity 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = "0.8"; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
        >
          <ShoppingBag size={16} />
          {isUrb ? (
            <span>{cartCount > 0 ? `(${cartCount})` : ""}</span>
          ) : (
            cartCount > 0 && (
              <span
                style={{
                  minWidth: 18,
                  height: 18,
                  borderRadius: 9,
                  background: isMin ? accent : "rgba(255,255,255,0.25)",
                  color: isMin ? "#fff" : "inherit",
                  fontSize: 10,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 4px",
                }}
              >
                {cartCount}
              </span>
            )
          )}
        </button>

        {/* Toggle modo oscuro / claro */}
        <button className="btn-sun-moon"
          onClick={onToggleDark}
          title={isDark ? "Modo claro" : "Modo oscuro"}
          style={iconBtnStyle}
          onMouseEnter={e => { e.currentTarget.style.background = btnBgHov; }}
          onMouseLeave={e => { e.currentTarget.style.background = btnBg; }}
        >
          {isDark ? <Sun/> : <Moon/>}
        </button>

        {/* Botón Admin — solo visible para el dueño */}
        {isOwner && storeSlug && (
          <Link
            to={`/tienda/${storeSlug}/admin/dashboard`}
            title="Panel de administración"
            style={{ ...iconBtnStyle, textDecoration: "none" }}
            onMouseEnter={e => { e.currentTarget.style.background = btnBgHov; }}
            onMouseLeave={e => { e.currentTarget.style.background = btnBg; }}
          >
            <Settings size={14} />
          </Link>
        )}
      </div>
    </header>
  );
}
