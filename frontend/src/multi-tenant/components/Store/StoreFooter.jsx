import { cf, isBgDark } from './storeUtils.jsx';
import { Link } from 'react-router-dom';

const FOOTER_LINKS = [
  { label: "Catálogo",     to: "" },
  { label: "Nosotros",     to: "/nosotros" },
  { label: "FAQ",          to: "/faq" },
  { label: "Devoluciones", to: "/devoluciones" },
  { label: "Contacto",     to: "/contacto" },
];

export default function StoreFooter({ footer, header, theme, storeSlug = null }) {
  const { footerBg, hFont, fB, desc, accent, isMin, isUrb, isCls } = theme;

  const bgIsDark    = isBgDark(footerBg);
  const textPrimary = bgIsDark ? "rgba(255,255,255,0.80)" : "rgba(0,0,0,0.70)";
  const textMuted   = bgIsDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.50)";
  const borderColor = bgIsDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const pagesLabel  = bgIsDark ? "rgba(255,255,255,0.40)" : "rgba(0,0,0,0.35)";

  return (
    <footer style={{
      background: footerBg,
      borderTop: `1px solid ${borderColor}`,
      padding: "clamp(32px,5vw,52px) clamp(20px,4vw,56px) clamp(20px,3vw,32px)",
      fontFamily: `"${fB}",sans-serif`,
    }}>

      {/* Top row */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", flexWrap: "wrap", gap: 32, marginBottom: 36,
      }}>

        {/* Marca */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 220 }}>
          {header.logoUrl ? (
            <img
              src={header.logoUrl}
              alt={header.logo ?? "Logo"}
              style={{ height: 32, width: "auto", maxWidth: 140, objectFit: "contain", opacity: 0.85 }}
            />
          ) : (
            <span style={{
              fontFamily: `"${hFont}",sans-serif`,
              fontWeight: 900, fontSize: 14, letterSpacing: isUrb ? 5 : 2,
              color: textPrimary,
              textTransform: "uppercase",
            }}>
              {header.storeName ?? header.logo}
            </span>
          )}
          <p style={{
            fontSize: 12, color: textMuted, lineHeight: 1.7, margin: 0,
          }}>
            {desc}
          </p>
        </div>

        {/* Links de la tienda */}
        {storeSlug && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: 2,
              textTransform: "uppercase", color: pagesLabel,
              marginBottom: 2,
            }}>
              Páginas
            </span>
            {FOOTER_LINKS.map(link => (
              <Link key={link.to} to={`/tienda/${storeSlug}${link.to}`} style={{
                fontSize: 12, color: textMuted, cursor: "pointer",
                letterSpacing: isUrb ? 1.5 : 0.2,
                textTransform: isUrb ? "uppercase" : "none",
                transition: "color 0.15s",
                fontWeight: 400,
                textDecoration: "none",
              }}
              onMouseEnter={e => e.currentTarget.style.color = textPrimary}
              onMouseLeave={e => e.currentTarget.style.color = textMuted}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Bottom row */}
      <div style={{
        borderTop: `1px solid ${borderColor}`,
        paddingTop: 18,
        display: "flex", justifyContent: "space-between",
        alignItems: "center", flexWrap: "wrap", gap: 10,
      }}>
        <span style={{
          fontFamily: `"${cf(footer.font)}",sans-serif`,
          fontSize: 11, color: textMuted, letterSpacing: 0.3,
        }}>
          {footer.text}
        </span>

        <div style={{ display: "flex", gap: 20 }}>
          {["Privacidad", "Términos", "Cookies"].map((t, i) => (
            <span key={i} style={{
              fontSize: 10.5, color: textMuted, cursor: "pointer",
              letterSpacing: isUrb ? 1.2 : 0.3,
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
