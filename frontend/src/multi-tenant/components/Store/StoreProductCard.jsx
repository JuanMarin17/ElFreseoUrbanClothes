import { useState } from "react";
import { Link } from "react-router-dom";
import { GCard } from "./storeUtils.jsx";

export default function StoreProductCard({ product, index, theme, isJustAdded, onAddToCart, storeId = null }) {
  const { accent, titleC, paraC, cardBg, b1, b2, bw, br, sh, btnR, fT, isUrb, isDark } = theme;
  const [hovered, setHovered] = useState(false);

  const imgUrl = product.images?.[0]?.url ?? null;

  /* Placeholder tono neutro según el tema */
  const placeholderBg  = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";
  const placeholderIcon = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)";

  const isNew      = index === 0;
  const isSale     = index === 2;
  const btnText    = isJustAdded ? "✓" : isUrb ? "ADD" : "Agregar";
  const btnBg      = isJustAdded ? "#22c55e" : `${accent}18`;
  const btnBorder  = isJustAdded ? "#22c55e" : `${accent}50`;
  const btnColor   = isJustAdded ? "#fff"    : accent;

  return (
    <GCard b1={b1} b2={b2} bw={bw} br={br} sh={sh} bg={cardBg}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ display: "flex", flexDirection: "column", height: "100%" }}
      >
        {/* ── Imagen ── */}
        <div style={{ position: "relative", aspectRatio: "4/3", overflow: "hidden", flexShrink: 0 }}>
          {imgUrl ? (
            <img
              src={imgUrl}
              alt={product.name}
              style={{
                width: "100%", height: "100%",
                objectFit: "cover", display: "block",
                transition: "transform 0.45s cubic-bezier(0.4,0,0.2,1)",
                transform: hovered ? "scale(1.07)" : "scale(1)",
              }}
            />
          ) : (
            <div style={{
              width: "100%", height: "100%",
              background: placeholderBg,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={placeholderIcon} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2.5" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span style={{ fontSize: 9, letterSpacing: 2, color: placeholderIcon, fontWeight: 600, textTransform: "uppercase" }}>
                Sin imagen
              </span>
            </div>
          )}

          {/* Overlay hover */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.22s",
          }}>
            <button
              onClick={() => onAddToCart(product, index)}
              style={{
                background: accent, border: "none",
                color: accent === "#ffffff" ? "#000" : "#fff",
                padding: "9px 24px", borderRadius: btnR,
                fontSize: 11, fontWeight: 800, cursor: "pointer",
                letterSpacing: 1.5, textTransform: "uppercase",
                transform: hovered ? "translateY(0) scale(1)" : "translateY(8px) scale(0.95)",
                transition: "transform 0.22s cubic-bezier(0.34,1.56,0.64,1)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
              }}
            >
              + Agregar
            </button>
          </div>

          {/* Badges */}
          {isNew && (
            <span style={{
              position: "absolute", top: 10, left: 10,
              background: accent, color: accent === "#ffffff" ? "#000" : "#fff",
              fontSize: 9, fontWeight: 800, padding: "3px 9px",
              borderRadius: 4, letterSpacing: 1.2, textTransform: "uppercase",
            }}>
              NUEVO
            </span>
          )}
          {isSale && (
            <span style={{
              position: "absolute", top: 10, left: 10,
              background: "#ef4444", color: "#fff",
              fontSize: 9, fontWeight: 800, padding: "3px 9px",
              borderRadius: 4, letterSpacing: 1,
            }}>
              −20%
            </span>
          )}
        </div>

        {/* ── Info ── */}
        <div style={{
          padding: isUrb ? "12px 14px 14px" : "13px 14px 15px",
          display: "flex", flexDirection: "column", gap: 10, flex: 1,
        }}>
          {/* Nombre */}
          <h3 style={{
            fontFamily: `"${fT}",sans-serif`,
            fontSize: isUrb ? 13 : 13,
            fontWeight: isUrb ? 800 : 600,
            color: titleC, margin: 0,
            textTransform: isUrb ? "uppercase" : "none",
            letterSpacing: isUrb ? 1.5 : 0.2,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {product.name}
          </h3>

          {/* Descripción solo en minimalista y clásico */}
          {!isUrb && product.description && (
            <p style={{
              fontSize: 11, color: paraC, margin: 0,
              lineHeight: 1.5,
              overflow: "hidden",
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
              opacity: 0.8,
            }}>
              {product.description}
            </p>
          )}

          {/* Precio + botón */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: "auto" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <span style={{
                fontFamily: `"${fT}",sans-serif`,
                fontSize: 14, fontWeight: 800, color: accent,
                letterSpacing: isUrb ? 0.5 : 0,
              }}>
                {product.price}
              </span>
              {isSale && (
                <span style={{ fontSize: 10, color: paraC, textDecoration: "line-through", opacity: 0.5 }}>
                  {product.price?.replace(/[\d,.]+/, (n) =>
                    Math.round(parseFloat(n.replace(/\./g, "").replace(",", ".")) * 1.25).toLocaleString("es-CO")
                  )}
                </span>
              )}
            </div>

            <button
              onClick={() => onAddToCart(product, index)}
              style={{
                background: btnBg, border: `1px solid ${btnBorder}`, color: btnColor,
                padding: "6px 12px", borderRadius: btnR,
                fontSize: 10, fontWeight: 700, cursor: "pointer",
                letterSpacing: isUrb ? 1 : 0.3, whiteSpace: "nowrap",
                transition: "all 0.18s", flexShrink: 0,
              }}
            >
              {btnText}
            </button>
          </div>

          {/* Ver más → ProductPage */}
          <Link
            to={`/producto/${product.id ?? product.productId}?src=store${storeId ? `&sid=${storeId}` : ""}`}
            onClick={() => { if (storeId) localStorage.setItem("storeId", storeId); }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              marginTop: 10,
              padding: isUrb ? "8px 0" : "8px 0",
              borderRadius: btnR,
              border: `1px solid ${accent}35`,
              background: `${accent}0d`,
              color: accent,
              fontSize: isUrb ? 9 : 11,
              fontWeight: isUrb ? 800 : 600,
              letterSpacing: isUrb ? 2.5 : 0.4,
              textTransform: isUrb ? "uppercase" : "none",
              textDecoration: "none",
              fontFamily: `"${fT}",sans-serif`,
              transition: "background 0.18s, border-color 0.18s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = `${accent}22`;
              e.currentTarget.style.borderColor = `${accent}70`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = `${accent}0d`;
              e.currentTarget.style.borderColor = `${accent}35`;
            }}
          >
            {isUrb ? "VER MÁS" : "Ver más"}
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" />
            </svg>
          </Link>
        </div>
      </div>
    </GCard>
  );
}
