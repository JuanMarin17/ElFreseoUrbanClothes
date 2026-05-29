import { cf } from './storeUtils.jsx';

export default function StoreFooter({ footer, header, theme }) {
  const { footerBg, hFont, fT, fB, desc, isMin, isUrb } = theme;

  return (
    <footer style={{
      background: footerBg,
      borderTop: isMin ? "1px solid rgba(0,0,0,0.06)" : isUrb ? "1px solid #0d0d0d" : "none",
      padding: "clamp(24px,4vw,40px) clamp(16px,3vw,48px) clamp(16px,3vw,28px)",
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        flexWrap: "wrap", gap: 24, marginBottom: 24,
      }}>
        {/* Marca */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{
            fontFamily: `"${hFont}",sans-serif`,
            fontWeight: 900, fontSize: 15, letterSpacing: 3,
            color: isUrb ? "#222" : isMin ? "#111" : "#fff",
            textTransform: "uppercase",
          }}>
            {header.logo}
          </span>
          <p style={{
            fontSize: 11.5,
            color: isUrb ? "#2a2a2a" : isMin ? "#999" : "rgba(255,255,255,0.5)",
            maxWidth: 200, lineHeight: 1.6, margin: 0,
          }}>
            {desc}
          </p>
        </div>

        {/* Columnas de links */}
        <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
          {["Tienda", "Nosotros", "Contacto"].map((col, ci) => (
            <div key={ci} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{
                fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase",
                color: isUrb ? "#222" : isMin ? "#888" : "rgba(255,255,255,0.5)",
                marginBottom: 2,
              }}>
                {col}
              </span>
              {(header.items ?? []).slice(0, 2).map((it, i) => (
                <span key={i} style={{
                  fontSize: 12,
                  color: isUrb ? "#2a2a2a" : isMin ? "#bbb" : "rgba(255,255,255,0.4)",
                  cursor: "pointer",
                  letterSpacing: isUrb ? 1.5 : 0.3,
                  textTransform: isUrb ? "uppercase" : "none",
                }}>
                  {it}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div style={{
        borderTop: `1px solid ${isUrb ? "#111" : isMin ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)"}`,
        paddingTop: 16,
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8,
      }}>
        <span style={{
          fontFamily: `"${cf(footer.font)}",sans-serif`,
          fontSize: 11.5,
          color: footer.color ?? (isUrb ? "#222" : isMin ? "#ccc" : "rgba(255,255,255,0.35)"),
          letterSpacing: isUrb ? 2 : 0.3,
          textTransform: isUrb ? "uppercase" : "none",
        }}>
          {footer.text}
        </span>
        <div style={{ display: "flex", gap: 12 }}>
          {["Privacidad", "Términos"].map((t, i) => (
            <span key={i} style={{
              fontSize: 10.5,
              color: isUrb ? "#222" : isMin ? "#ccc" : "rgba(255,255,255,0.3)",
              cursor: "pointer",
              letterSpacing: isUrb ? 1.5 : 0.3,
              textTransform: isUrb ? "uppercase" : "none",
            }}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
