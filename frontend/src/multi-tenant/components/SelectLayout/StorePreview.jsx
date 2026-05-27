/**
 * StorePreview.jsx
 * Una sola función que adapta estructura y estilos según layoutType.
 * Sidebar y buscador integrados en los tres layouts.
 *
 * layoutType: "minimalista" | "urbano" | "clasico"
 * data: { header, banner, footer, products, styles, widgets }
 */

/* ── helper fuente ── */
const cf = (f = "Inter") => {
  const m = (f ?? "Inter").match(/['"]([^'"]+)['"]/);
  return m ? m[1] : (f ?? "Inter");
};

/* ── Demo para el preview de selección ── */
const DEMO = {
  header:   { logo: "MI TIENDA", items: ["HOME", "SHOP", "ABOUT"], color: "#fff", bg: "#000000", font: "Inter", size: 14 },
  banner:   { title: "NUEVA COLECCIÓN", color: "#fff", bg: "#111111", font: "Bebas Neue", size: 60, images: [] },
  footer:   { text: "© Mi Tienda 2026", color: "#888888", bg: "#080808", font: "Inter", size: 13 },
  products: [
    { name: "PRODUCTO 01", price: "$85.00" },
    { name: "PRODUCTO 02", price: "$120.00" },
    { name: "PRODUCTO 03", price: "$65.00" },
    { name: "PRODUCTO 04", price: "$95.00" },
  ],
  styles: {
    colorBoton: "#3e78ff", colorTitulo: "#ffffff", colorParrafo: "#888888",
    cardBg: "#0f0f0f", cardBorderColor1: "#3e78ff", cardBorderColor2: "#6c63ff",
    cardBorderWidth: "2", cardRadius: "12", cardShadow: "0 8px 24px rgba(0,0,0,0.4)",
    btnRadius: "6", fontTitle: "Inter", fontBody: "Inter",
    textoTitulo: "PRODUCTO", textoCuerpo: "Descripción del producto.",
  },
  widgets: null,
};

/* ── Carta con borde gradiente ── */
function GCard({ b1, b2, bw, br, sh, bg, children }) {
  return (
    <div style={{ background: `linear-gradient(135deg,${b1},${b2})`, padding: bw, borderRadius: br, boxShadow: sh }}>
      <div style={{ background: bg, borderRadius: `calc(${br} - ${bw})`, overflow: "hidden", height: "100%" }}>
        {children}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   FUNCIÓN ÚNICA — cambia estructura y estilos según layoutType
══════════════════════════════════════════════════════════════ */
export default function StorePreview({ layoutType = "minimalista", data = {} }) {
  /* ── datos con fallback a demo ── */
  const header   = data.header   ?? DEMO.header;
  const footer   = data.footer   ?? DEMO.footer;
  const products = data.products ?? DEMO.products;
  const styles   = data.styles   ?? DEMO.styles;
  const widgets  = data.widgets  ?? null;

  // Normaliza banner: soporta tanto { image: string } como { images: [] }
  const rawBanner = data.banner ?? DEMO.banner;
  const bannerImageUrl = rawBanner.image
    || rawBanner.images?.[0]?.url
    || null;
  const banner = { ...rawBanner, _imageUrl: bannerImageUrl };

  const isMin = layoutType === "minimalista";
  const isUrb = layoutType === "urbano";
  const isCls = layoutType === "clasico";

  /* ── Estilos del usuario ── */
  const accent = styles.colorBoton       ?? (isMin ? "#111" : isUrb ? "#fff" : "#3e78ff");
  const titleC = styles.colorTitulo      ?? (isMin ? "#111" : isUrb ? "#fff" : "#1a1a1a");
  const paraC  = styles.colorParrafo     ?? (isMin ? "#888" : isUrb ? "#555" : "#666");
  const cardBg = styles.cardBg           ?? (isMin ? "#fff" : isUrb ? "#0a0a0a" : "#fff");
  const b1     = styles.cardBorderColor1 ?? (isMin ? "#e5e5e5" : isUrb ? "#222" : "#ddd");
  const b2     = styles.cardBorderColor2 ?? (isMin ? "#e5e5e5" : isUrb ? "#333" : "#ddd");
  const bw     = `${styles.cardBorderWidth ?? (isMin ? 1 : isUrb ? 1 : 1)}px`;
  const br     = `${styles.cardRadius     ?? (isMin ? 8 : isUrb ? 0 : 6)}px`;
  const sh     = styles.cardShadow       ?? (isMin ? "0 2px 12px rgba(0,0,0,0.06)" : isUrb ? "none" : "0 2px 8px rgba(0,0,0,0.07)");
  const btnR   = `${styles.btnRadius     ?? (isMin ? 4 : isUrb ? 0 : 4)}px`;
  const fT     = cf(styles.fontTitle ?? (isUrb ? "Bebas Neue" : "Inter"));
  const fB     = cf(styles.fontBody  ?? "Inter");
  const desc   = styles.textoCuerpo ?? "Descripción del producto.";

  /* ── Header del usuario ── */
  const hBg    = header.bg    ?? (isMin ? "#ffffff" : isUrb ? "#000000" : "#ffffff");
  const hColor = header.color ?? (isMin ? "#111111" : isUrb ? "#ffffff" : "#1a1a1a");
  const hFont  = cf(header.font ?? "Inter");

  /* ── Widgets: sidebar ── */
  const sb             = widgets?.sidebar ?? null;
  const sidebarVisible = sb !== null ? sb.visible === true : isCls; // default: visible solo en clásico
  const sbBg      = sb?.bg          ?? (isMin ? "#fff"     : isUrb ? "#0d0d0d" : "#fff");
  const sbColor   = sb?.color       ?? (isMin ? "#555"     : isUrb ? "#aaa"    : "#555");
  const sbBorder  = sb?.borderColor ?? (isMin ? "#ebebeb"  : isUrb ? "#1a1a1a" : "#e0e0e0");
  const sbBorderW = sb?.borderWidth ?? 1;
  const sbRadius  = sb?.radius      ?? (isMin ? 8 : isUrb ? 0 : 8);
  const sbWidth   = sb?.width       ?? (isMin ? 200 : isUrb ? 220 : 190);
  const sbFont    = sb?.font        ?? "Inter";
  const sbItems   = sb?.items       ?? ["Inicio", "Productos", "Categorías", "Ofertas", "Contacto"];

  /* ── Widgets: buscador ── */
  const srch          = widgets?.searchbar ?? null;
  const searchVisible = srch !== null ? srch.visible === true : true;
  const srBg      = srch?.bg               ?? (isMin ? "#f5f5f5"  : isUrb ? "#111"     : "#f5f5f5");
  const srBorder  = srch?.borderColor      ?? (isMin ? "#e0e0e0"  : isUrb ? "#222"     : "#e0e0e0");
  const srBorderW = srch?.borderWidth      ?? 1;
  const srRadius  = srch?.radius           ?? (isMin ? 6 : isUrb ? 0 : 6);
  const srPh      = srch?.placeholder      ?? "Buscar productos...";
  const srFont    = srch?.font             ?? "Inter";
  const srIcon    = srch?.showIcon         !== false;
  const srIconC   = srch?.iconColor        ?? (isUrb ? "#555" : "#aaa");
  const srPhC     = srch?.placeholderColor ?? (isUrb ? "#555" : "#aaa");

  /* ── Colores de fondo de secciones según layout ── */
  const pageBg    = isMin ? "#fafafa" : isUrb ? "#000"     : "#f0f2f5";
  const catalogBg = isMin ? "#fafafa" : isUrb ? "#000"     : "#f0f2f5";
  const footerBg  = footer.bg ?? (isMin ? "#fff" : isUrb ? "#000" : "#1a1a1a");

  /* ── Icono de búsqueda SVG ── */
  const SearchIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={srIconC} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );

  /* ── Buscador reutilizable ── */
  const SearchBar = ({ maxWidth = 340 }) => searchVisible ? (
    <div style={{ flex: 1, maxWidth, minWidth: 100, background: srBg, border: `${srBorderW}px solid ${srBorder}`, borderRadius: srRadius, padding: "7px 12px", display: "flex", alignItems: "center", gap: 7, fontFamily: `"${srFont}",sans-serif` }}>
      {srIcon && <SearchIcon />}
      <span style={{ fontSize: 12, color: srPhC, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{srPh}</span>
    </div>
  ) : null;

  /* ── Sidebar reutilizable ── */
  const Sidebar = () => sidebarVisible ? (
    <aside style={{ background: sbBg, border: `${sbBorderW}px solid ${sbBorder}`, borderRadius: sbRadius, padding: "16px 0", marginRight: 16, fontFamily: `"${sbFont}",sans-serif`, minWidth: 0, flexShrink: 0 }}>
      <div style={{ padding: "0 12px 10px", borderBottom: `1px solid ${sbBorder}`, marginBottom: 6 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: sbColor, opacity: 0.5, letterSpacing: 1, textTransform: "uppercase" }}>Menú</span>
      </div>
      {sbItems.map((item, i) => (
        <div key={i} style={{ padding: "8px 12px", fontSize: 12, color: i === 0 ? accent : sbColor, fontWeight: i === 0 ? 700 : 400, borderLeft: i === 0 ? `3px solid ${accent}` : "3px solid transparent", background: i === 0 ? `${accent}10` : "transparent", cursor: "pointer", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {item}
        </div>
      ))}
      <div style={{ padding: "12px 12px 0", borderTop: `1px solid ${sbBorder}`, marginTop: 8 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: sbColor, opacity: 0.5, letterSpacing: 1, textTransform: "uppercase" }}>Filtros</span>
        <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 4 }}>
          {["< $50", "$50–$100", "$100–$200", "> $200"].map((r, i) => (
            <label key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: sbColor, cursor: "pointer" }}>
              <input type="checkbox" style={{ accentColor: accent, margin: 0 }} readOnly />{r}
            </label>
          ))}
        </div>
      </div>
    </aside>
  ) : null;

  /* ══════════════════════════════════════════
     RENDER — estructura diferente por layout
  ══════════════════════════════════════════ */
  return (
    <div style={{ background: pageBg, color: isMin ? "#111" : isUrb ? "#fff" : "#1a1a1a", fontFamily: `"${fB}",sans-serif` }}>

      {/* ── TOPBAR (solo clásico) ── */}
      {isCls && (
        <div style={{ background: accent, color: "#fff", textAlign: "center", padding: "7px 16px", fontSize: 11, letterSpacing: 1, fontWeight: 600 }}>
          🚚 Envío gratis en compras mayores a $150.000
        </div>
      )}

      {/* ── HEADER ── */}
      <header style={{
        background: hBg,
        borderBottom: isUrb ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.08)",
        padding: "0 clamp(14px,3vw,40px)",
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
      }}>
        {/* Logo — centrado en minimalista, izquierda en urbano/clásico */}
        {isMin && (
          <nav style={{ display: "flex", gap: "clamp(10px,2vw,24px)", flexWrap: "wrap" }}>
            {(header.items ?? []).map((it, i) => (
              <span key={i} style={{ fontSize: 11, letterSpacing: 1.5, color: hColor, opacity: 0.5, textTransform: "uppercase", cursor: "pointer" }}>{it}</span>
            ))}
          </nav>
        )}

        <div style={{ fontFamily: `"${hFont}",sans-serif`, fontWeight: 900, fontSize: "clamp(13px,2vw,18px)", letterSpacing: isUrb ? 5 : 3, color: hColor, textTransform: isUrb ? "uppercase" : "none", whiteSpace: "nowrap" }}>
          {header.logo}
        </div>

        {/* Buscador en header (urbano y clásico) */}
        {(isUrb || isCls) && <SearchBar maxWidth={isUrb ? 280 : 340} />}

        {!isMin && (
          <nav style={{ display: "flex", gap: "clamp(10px,2vw,24px)", flexWrap: "wrap" }}>
            {(header.items ?? []).map((it, i) => (
              <span key={i} style={{ fontSize: 11, letterSpacing: isUrb ? 2.5 : 1, color: hColor, opacity: isUrb ? 0.4 : 0.6, textTransform: "uppercase", cursor: "pointer" }}>{it}</span>
            ))}
          </nav>
        )}

        <button style={{
          background: isMin ? "transparent" : accent,
          border: isMin ? `1px solid ${hColor}` : "none",
          color: isMin ? hColor : (isUrb ? "#000" : "#fff"),
          padding: "7px 16px",
          borderRadius: btnR,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: isUrb ? 2 : 0.5,
          cursor: "pointer",
          opacity: isMin ? 0.8 : 1,
        }}>
          {isUrb ? "BAG" : "🛒 Carrito"}
        </button>
      </header>

      {/* ── HERO ── */}
      {isMin && (
        /* Minimalista: split izquierda/derecha */
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", minHeight: 300, overflow: "hidden" }}>
          <div style={{ padding: "clamp(28px,5vw,60px) clamp(20px,4vw,48px)", display: "flex", flexDirection: "column", justifyContent: "center", gap: 16, background: "#fff" }}>
            <span style={{ fontSize: 10, letterSpacing: 4, color: accent, textTransform: "uppercase", fontWeight: 700 }}>Nueva colección</span>
            <h1 style={{ fontFamily: `"${cf(banner.font)}",sans-serif`, fontSize: "clamp(1.8rem,4vw,3rem)", color: "#111", lineHeight: 1.05, margin: 0 }}>{banner.title}</h1>
            <p style={{ fontSize: 13, color: "#888", lineHeight: 1.7, maxWidth: 320, margin: 0 }}>{desc}</p>
            <button style={{ alignSelf: "flex-start", background: accent, border: "none", color: "#fff", padding: "11px 28px", borderRadius: btnR, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, cursor: "pointer" }}>VER COLECCIÓN</button>
          </div>
          <div style={{ background: banner._imageUrl ? `url(${banner._imageUrl}) center/cover` : `${accent}12`, minHeight: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {!banner._imageUrl && <span style={{ fontSize: 11, color: "#ccc", letterSpacing: 3 }}>IMAGEN</span>}
          </div>
        </section>
      )}

      {isUrb && (
        /* Urbano: full-bleed con texto gigante */
        <section style={{ position: "relative", minHeight: "clamp(260px,45vw,460px)", background: banner._imageUrl ? `linear-gradient(rgba(0,0,0,.55),rgba(0,0,0,.55)) center/cover, url(${banner._imageUrl}) center/cover` : banner.bg ?? "#0a0a0a", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "0 clamp(16px,3vw,40px) clamp(24px,4vw,44px)", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: "clamp(16px,3vw,40px)", width: 1, height: "100%", background: "#1a1a1a" }} />
          <span style={{ fontSize: 10, letterSpacing: 5, color: accent, textTransform: "uppercase", marginBottom: 12, fontWeight: 700 }}>— DROP 2026</span>
          <h1 style={{ fontFamily: `"${cf(banner.font)}",sans-serif`, fontSize: "clamp(2.5rem,8vw,6.5rem)", color: banner.color ?? "#fff", lineHeight: 0.9, margin: "0 0 20px", textTransform: "uppercase", letterSpacing: -2, wordBreak: "break-word" }}>{banner.title}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <button style={{ background: accent, border: "none", color: "#000", padding: "12px 32px", borderRadius: btnR, fontSize: 11, fontWeight: 900, letterSpacing: 3, cursor: "pointer", textTransform: "uppercase" }}>SHOP NOW</button>
            <span style={{ fontSize: 12, color: "#444", letterSpacing: 2 }}>{desc}</span>
          </div>
        </section>
      )}

      {isCls && (
        /* Clásico: banner horizontal con oferta */
        <section style={{ background: banner._imageUrl ? `linear-gradient(rgba(0,0,0,.4),rgba(0,0,0,.4)), url(${banner._imageUrl}) center/cover` : `linear-gradient(135deg, ${banner.bg ?? "#1a1a2e"}, ${accent}cc)`, padding: "clamp(20px,4vw,40px) clamp(16px,3vw,32px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, minHeight: 160, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <span style={{ background: accent, color: "#fff", fontSize: 10, fontWeight: 800, padding: "3px 9px", borderRadius: 4, letterSpacing: 1, marginBottom: 10, display: "inline-block" }}>OFERTA ESPECIAL</span>
            <h1 style={{ fontFamily: `"${cf(banner.font)}",sans-serif`, fontSize: "clamp(1.4rem,3vw,2.4rem)", color: "#fff", margin: "8px 0 8px", lineHeight: 1.1, wordBreak: "break-word" }}>{banner.title}</h1>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,.7)", maxWidth: 340, lineHeight: 1.6 }}>{desc}</p>
          </div>
          <button style={{ background: "#fff", border: "none", color: accent, padding: "11px 24px", borderRadius: btnR, fontSize: 13, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>COMPRAR AHORA →</button>
        </section>
      )}

      {/* ── CATÁLOGO con sidebar ── */}
      <section style={{ padding: "clamp(20px,4vw,44px) clamp(14px,3vw,40px)", background: catalogBg }}>

        {/* Título de sección */}
        {isUrb ? (
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div style={{ flex: 1, height: 1, background: "#111" }} />
            <span style={{ fontSize: 10, letterSpacing: 5, color: "#333", textTransform: "uppercase" }}>FEATURED</span>
            <div style={{ flex: 1, height: 1, background: "#111" }} />
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20, flexWrap: "wrap", gap: 8 }}>
            <h2 style={{ fontFamily: `"${fT}",sans-serif`, fontSize: 11, letterSpacing: 5, color: isMin ? "#bbb" : "#888", textTransform: "uppercase", margin: 0 }}>
              {isMin ? "Productos destacados" : "Catálogo"}
            </h2>
            {isCls && (
              <select style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 6, padding: "5px 9px", fontSize: 11, color: "#555", cursor: "pointer", margin: 0 }}>
                <option>Más relevantes</option><option>Menor precio</option><option>Mayor precio</option>
              </select>
            )}
            {isMin && <span style={{ fontSize: 11, color: accent, cursor: "pointer" }}>Ver todo →</span>}
          </div>
        )}

        {/* Layout con sidebar */}
        <div style={{ display: "flex", gap: 0, alignItems: "start" }}>
          <Sidebar />

          {/* Grid de productos */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit,minmax(${isUrb ? "160px" : "140px"},1fr))`, gap: isUrb ? 2 : 12 }}>
              {products.map((p, i) => (
                <GCard key={i} b1={b1} b2={b2} bw={bw} br={br} sh={sh} bg={cardBg}>
                  <div style={{ position: "relative" }}>
                    <div style={{ height: isUrb ? "clamp(100px,16vw,180px)" : 140, background: `${accent}${isUrb ? "15" : "10"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 9, color: isUrb ? "#222" : "#ccc", letterSpacing: 2 }}>IMAGEN</span>
                    </div>
                    {isCls && i === 0 && <span style={{ position: "absolute", top: 8, left: 8, background: accent, color: "#fff", fontSize: 9, fontWeight: 800, padding: "3px 7px", borderRadius: 4 }}>NUEVO</span>}
                  </div>
                  <div style={{ padding: isUrb ? "12px 14px 14px" : "10px 12px 12px" }}>
                    <h3 style={{ fontFamily: `"${fT}",sans-serif`, fontSize: isUrb ? "clamp(12px,2vw,18px)" : 12, color: titleC, margin: "0 0 5px", fontWeight: 700, textTransform: isUrb ? "uppercase" : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</h3>
                    {!isUrb && <p style={{ fontSize: 10, color: paraC, margin: "0 0 8px", lineHeight: 1.4 }}>{desc}</p>}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                      <span style={{ fontFamily: `"${fT}",sans-serif`, fontSize: isUrb ? "clamp(12px,2vw,16px)" : 14, fontWeight: 800, color: accent }}>{p.price}</span>
                      <button style={{ background: isMin ? "transparent" : accent, border: isMin ? `1px solid ${accent}` : "none", color: isMin ? accent : (isUrb ? "#000" : "#fff"), padding: "5px 10px", borderRadius: btnR, fontSize: 10, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                        {isUrb ? "ADD" : isMin ? "AÑADIR" : "Agregar"}
                      </button>
                    </div>
                  </div>
                </GCard>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: footerBg, borderTop: isMin ? "1px solid rgba(0,0,0,0.06)" : isUrb ? "1px solid #0d0d0d" : "none", padding: "20px clamp(14px,3vw,40px)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <span style={{ fontFamily: `"${cf(footer.font)}",sans-serif`, fontSize: 12, color: footer.color ?? (isUrb ? "#333" : "#888"), letterSpacing: isUrb ? 2 : 0, textTransform: isUrb ? "uppercase" : "none" }}>{footer.text}</span>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {(header.items ?? []).map((it, i) => (
            <span key={i} style={{ fontSize: 11, color: footer.color ?? (isUrb ? "#333" : "#888"), cursor: "pointer", opacity: 0.7, letterSpacing: isUrb ? 2 : 0.5, textTransform: isUrb ? "uppercase" : "none" }}>{it}</span>
          ))}
        </div>
      </footer>
    </div>
  );
}
