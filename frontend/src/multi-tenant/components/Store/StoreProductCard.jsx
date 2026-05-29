import { GCard } from './storeUtils.jsx';

export default function StoreProductCard({ product, index, theme, isJustAdded, onAddToCart }) {
  const { accent, titleC, paraC, cardBg, b1, b2, bw, br, sh, btnR, fT, desc, isMin, isUrb, cardGradients } = theme;

  return (
    <GCard b1={b1} b2={b2} bw={bw} br={br} sh={sh} bg={cardBg}>

      {/* Imagen */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        <div style={{
          height: isUrb ? "clamp(120px,18vw,200px)" : 155,
          background: cardGradients[index % cardGradients.length],
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: 9, color: isUrb ? "#1a1a1a" : "#ddd", letterSpacing: 2, opacity: 0.6 }}>
            IMAGEN
          </span>
        </div>

        {/* Badges */}
        {index === 0 && (
          <span style={{
            position: "absolute", top: 8, left: 8,
            background: accent, color: isUrb ? "#000" : "#fff",
            fontSize: 8, fontWeight: 800, padding: "3px 7px", borderRadius: 4, letterSpacing: 1,
          }}>
            NUEVO
          </span>
        )}
        {index === 2 && (
          <span style={{
            position: "absolute", top: 8, left: 8,
            background: "#e53e3e", color: "#fff",
            fontSize: 8, fontWeight: 800, padding: "3px 7px", borderRadius: 4, letterSpacing: 1,
          }}>
            −20%
          </span>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "12px 14px 14px" }}>
        <h3 style={{
          fontFamily: `"${fT}",sans-serif`,
          fontSize: isUrb ? "clamp(13px,2vw,17px)" : 13,
          color: titleC, margin: "0 0 4px", fontWeight: 700,
          textTransform: isUrb ? "uppercase" : "none",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {product.name}
        </h3>

        {!isUrb && (
          <p style={{ fontSize: 11, color: paraC, margin: "0 0 10px", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {product.description ?? desc}
          </p>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
            <span style={{
              fontFamily: `"${fT}",sans-serif`,
              fontSize: isUrb ? "clamp(13px,2vw,16px)" : 14,
              fontWeight: 800, color: accent,
            }}>
              {product.price}
            </span>
            {index === 2 && !isUrb && (
              <span style={{ fontSize: 10, color: "#bbb", textDecoration: "line-through" }}>
                ${(parseInt((product.price ?? '0').replace(/\D/g, '')) * 1.25).toFixed(0)}
              </span>
            )}
          </div>

          <button
            onClick={() => onAddToCart(product, index)}
            style={{
              background: isJustAdded ? '#22c55e' : (isMin ? "transparent" : accent),
              border: isMin ? `1.5px solid ${isJustAdded ? '#22c55e' : accent}` : "none",
              color: isJustAdded ? '#fff' : (isMin ? accent : (isUrb ? "#000" : "#fff")),
              padding: "6px 12px", borderRadius: btnR,
              fontSize: 10, fontWeight: 700, cursor: "pointer",
              whiteSpace: "nowrap", letterSpacing: isUrb ? 1 : 0,
              transition: "background 0.2s, border-color 0.2s, color 0.2s",
              minWidth: 56,
            }}
          >
            {isJustAdded ? "✓" : (isUrb ? "ADD" : "Agregar")}
          </button>
        </div>
      </div>

    </GCard>
  );
}
