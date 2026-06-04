import { useState } from 'react';
import { GCard } from './storeUtils.jsx';

export default function StoreProductCard({ product, index, theme, isJustAdded, onAddToCart }) {
  const { accent, titleC, paraC, cardBg, b1, b2, bw, br, sh, btnR, fT, isMin, isUrb, isCls, cardGradients } = theme;
  const [hovered, setHovered] = useState(false);

  const imgUrl = product.images?.[0]?.url ?? null;

  return (
    <GCard b1={b1} b2={b2} bw={bw} br={br} sh={sh} bg={cardBg}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ height: "100%", display: "flex", flexDirection: "column" }}
      >
        {/* ── Imagen ── */}
        <div style={{ position: "relative", overflow: "hidden", flexShrink: 0 }}>
          <div style={{
            height: isUrb ? "clamp(160px,20vw,240px)" : "clamp(150px,18vw,200px)",
            background: imgUrl ? "transparent" : cardGradients[index % cardGradients.length],
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden",
            transition: "transform 0.4s cubic-bezier(0.4,0,0.2,1)",
            transform: hovered ? "scale(1.04)" : "scale(1)",
          }}>
            {imgUrl ? (
              <img
                src={imgUrl}
                alt={product.name}
                style={{
                  width: "100%", height: "100%", objectFit: "cover", display: "block",
                  transition: "transform 0.4s cubic-bezier(0.4,0,0.2,1)",
                  transform: hovered ? "scale(1.06)" : "scale(1)",
                }}
              />
            ) : (
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: 3, fontWeight: 700 }}>
                SIN IMAGEN
              </span>
            )}
          </div>

          {/* Overlay de hover con botón rápido */}
          <div style={{
            position: "absolute", inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: hovered && !isJustAdded ? 1 : 0,
            transition: "opacity 0.2s",
            backdropFilter: hovered ? "blur(1px)" : "none",
          }}>
            <button
              onClick={() => onAddToCart(product, index)}
              style={{
                background: accent, border: "none",
                color: accent === "#ffffff" ? "#000" : "#fff",
                padding: "9px 22px", borderRadius: btnR,
                fontSize: 10, fontWeight: 800, cursor: "pointer",
                letterSpacing: 1.5, textTransform: "uppercase",
                transform: hovered ? "translateY(0)" : "translateY(6px)",
                transition: "transform 0.2s",
              }}
            >
              + Agregar
            </button>
          </div>

          {/* Badges */}
          {index === 0 && (
            <span style={{
              position: "absolute", top: 10, left: 10,
              background: accent,
              color: accent === "#ffffff" ? "#000" : "#fff",
              fontSize: 8, fontWeight: 800, padding: "3px 8px",
              borderRadius: 4, letterSpacing: 1.2, textTransform: "uppercase",
            }}>
              NUEVO
            </span>
          )}
          {index === 2 && (
            <span style={{
              position: "absolute", top: 10, left: 10,
              background: "#ef4444", color: "#fff",
              fontSize: 8, fontWeight: 800, padding: "3px 8px",
              borderRadius: 4, letterSpacing: 1.2,
            }}>
              −20%
            </span>
          )}
        </div>

        {/* ── Info ── */}
        <div style={{
          padding: "14px 16px 16px",
          flex: 1,
          display: "flex", flexDirection: "column", justifyContent: "space-between",
          gap: 10,
        }}>
          <div>
            <h3 style={{
              fontFamily: `"${fT}",sans-serif`,
              fontSize: isUrb ? "clamp(12px,1.8vw,15px)" : 13,
              color: titleC,
              margin: "0 0 5px", fontWeight: 700,
              textTransform: isUrb ? "uppercase" : "none",
              letterSpacing: isUrb ? 1.5 : 0,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {product.name}
            </h3>

            {!isUrb && (
              <p style={{
                fontSize: 11,
                color: paraC,
                margin: 0,
                lineHeight: 1.55,
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}>
                {product.description}
              </p>
            )}
          </div>

          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between", gap: 8,
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <span style={{
                fontFamily: `"${fT}",sans-serif`,
                fontSize: isUrb ? "clamp(12px,1.8vw,15px)" : 14,
                fontWeight: 800, color: accent,
                letterSpacing: isUrb ? 1 : 0,
              }}>
                {product.price}
              </span>
              {index === 2 && (
                <span style={{ fontSize: 10, color: paraC, textDecoration: "line-through", opacity: 0.6 }}>
                  {product.price?.replace(/[\d.]+/, (n) => Math.round(parseFloat(n) * 1.25))}
                </span>
              )}
            </div>

            {/* Botón solo visible cuando no hay hover (en mobile) */}
            <button
              onClick={() => onAddToCart(product, index)}
              style={{
                background: isJustAdded
                  ? '#22c55e'
                  : isMin
                    ? `rgba(59,130,246,0.1)`
                    : (isUrb ? "rgba(255,255,255,0.07)" : "rgba(79,142,247,0.1)"),
                border: `1px solid ${isJustAdded ? '#22c55e' : `${accent}40`}`,
                color: isJustAdded ? '#fff' : accent,
                padding: "6px 12px", borderRadius: btnR,
                fontSize: 10, fontWeight: 700, cursor: "pointer",
                whiteSpace: "nowrap", letterSpacing: isUrb ? 1 : 0.3,
                transition: "all 0.2s",
                minWidth: 60,
              }}
            >
              {isJustAdded ? "✓" : (isUrb ? "ADD" : "Agregar")}
            </button>
          </div>
        </div>
      </div>
    </GCard>
  );
}
