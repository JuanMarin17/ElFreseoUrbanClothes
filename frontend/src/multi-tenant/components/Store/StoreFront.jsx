import { cf, DEMO } from './storeUtils.jsx';
import { useCart } from './hooks/useCart.js';
import { useFilters } from './hooks/useFilters.js';
import StoreHeader from './StoreHeader.jsx';
import StoreHero from './StoreHero.jsx';
import StoreSidebar from './StoreSidebar.jsx';
import StoreCatalog from './StoreCatalog.jsx';
import StoreFooter from './StoreFooter.jsx';

/* ══════════════════════════════════════════
   StoreFront — Vista pública de la tienda
   Props:
     layoutType: "minimalista" | "urbano" | "clasico"
     data: { header, banner, footer, products, styles, widgets }
══════════════════════════════════════════ */
export default function StoreFront({ layoutType = "minimalista", data = {} }) {
  const header   = data.header   ?? DEMO.header;
  const footer   = data.footer   ?? DEMO.footer;
  const products = data.products ?? DEMO.products;
  const styles   = data.styles   ?? DEMO.styles;
  const widgets  = data.widgets  ?? null;

  const rawBanner      = data.banner ?? DEMO.banner;
  const bannerImageUrl = rawBanner.image || rawBanner.images?.[0]?.url || null;
  const banner         = { ...rawBanner, _imageUrl: bannerImageUrl };

  const isMin = layoutType === "minimalista";
  const isUrb = layoutType === "urbano";
  const isCls = layoutType === "clasico";

  /* ── Tokens de estilo ── */
  const accent = styles.colorBoton       ?? (isMin ? "#111" : isUrb ? "#fff" : "#3e78ff");
  const titleC = styles.colorTitulo      ?? (isMin ? "#111" : isUrb ? "#fff" : "#1a1a1a");
  const paraC  = styles.colorParrafo     ?? (isMin ? "#666" : isUrb ? "#555" : "#666");
  const cardBg = styles.cardBg           ?? (isMin ? "#fff" : isUrb ? "#0a0a0a" : "#fff");
  const b1     = styles.cardBorderColor1 ?? (isMin ? "#e5e5e5" : isUrb ? "#1c1c1c" : "#ddd");
  const b2     = styles.cardBorderColor2 ?? (isMin ? "#e5e5e5" : isUrb ? "#2a2a2a" : "#ddd");
  const bw     = `${styles.cardBorderWidth ?? 1}px`;
  const br     = `${styles.cardRadius     ?? (isMin ? 10 : isUrb ? 0 : 8)}px`;
  const sh     = styles.cardShadow       ?? (isMin ? "0 2px 16px rgba(0,0,0,0.06)" : isUrb ? "none" : "0 2px 12px rgba(0,0,0,0.08)");
  const btnR   = `${styles.btnRadius     ?? (isMin ? 6 : isUrb ? 0 : 6)}px`;
  const fT     = cf(styles.fontTitle ?? (isUrb ? "Bebas Neue" : "Inter"));
  const fB     = cf(styles.fontBody  ?? "Inter");
  const desc   = styles.textoCuerpo ?? "Descripción del producto.";

  const hBg    = header.bg    ?? (isMin ? "#ffffff" : isUrb ? "#000000" : "#ffffff");
  const hColor = header.color ?? (isMin ? "#111111" : isUrb ? "#ffffff" : "#1a1a1a");
  const hFont  = cf(header.font ?? "Inter");

  const pageBg    = isMin ? "#fafafa" : isUrb ? "#000" : "#f0f2f5";
  const catalogBg = isMin ? "#fafafa" : isUrb ? "#000" : "#f0f2f5";
  const footerBg  = footer.bg ?? (isMin ? "#fff" : isUrb ? "#050505" : "#1a1a1a");

  const cardGradients = [
    `linear-gradient(135deg, ${accent}20, ${accent}08)`,
    `linear-gradient(135deg, ${b1}30, ${b2}18)`,
    `linear-gradient(135deg, ${accent}15, ${b1}20)`,
    `linear-gradient(135deg, ${b2}25, ${accent}10)`,
    `linear-gradient(135deg, ${accent}18, ${b2}15)`,
    `linear-gradient(135deg, ${b1}20, ${accent}22)`,
  ];

  /* ── Tema global (se pasa a los hijos) ── */
  const theme = {
    isMin, isUrb, isCls,
    accent, titleC, paraC, cardBg, b1, b2, bw, br, sh, btnR, fT, fB, desc,
    hBg, hColor, hFont, pageBg, catalogBg, footerBg, cardGradients,
  };

  /* ── Config sidebar ── */
  const sb = widgets?.sidebar ?? null;
  const sidebarCfg = {
    visible:     sb !== null ? sb.visible === true : isCls,
    bg:          sb?.bg          ?? (isMin ? "#fff" : isUrb ? "#0a0a0a" : "#fff"),
    color:       sb?.color       ?? (isMin ? "#444" : isUrb ? "#aaa" : "#444"),
    borderColor: sb?.borderColor ?? (isMin ? "#ebebeb" : isUrb ? "#1a1a1a" : "#e0e0e0"),
    borderWidth: sb?.borderWidth ?? 1,
    radius:      sb?.radius      ?? (isMin ? 10 : isUrb ? 0 : 10),
    width:       sb?.width       ?? (isMin ? 210 : isUrb ? 230 : 200),
    font:        cf(sb?.font ?? "Inter"),
    items:       sb?.items ?? ["Inicio", "Productos", "Categorías", "Ofertas", "Contacto"],
  };

  /* ── Config buscador ── */
  const srch = widgets?.searchbar ?? null;
  const searchCfg = {
    visible:      srch !== null ? srch.visible === true : true,
    bg:           srch?.bg               ?? (isMin ? "#f5f5f5" : isUrb ? "#111" : "#f5f5f5"),
    borderColor:  srch?.borderColor      ?? (isMin ? "#e0e0e0" : isUrb ? "#222" : "#e0e0e0"),
    borderWidth:  srch?.borderWidth      ?? 1,
    radius:       srch?.radius           ?? (isMin ? 8 : isUrb ? 0 : 8),
    placeholder:  srch?.placeholder      ?? "Buscar productos...",
    font:         cf(srch?.font ?? "Inter"),
    showIcon:     srch?.showIcon !== false,
    iconColor:    srch?.iconColor        ?? (isUrb ? "#444" : "#aaa"),
    placeholderColor: srch?.placeholderColor ?? (isUrb ? "#555" : "#999"),
    color:        srch?.color            ?? (isMin ? "#333" : isUrb ? "#fff" : "#333"),
  };

  /* ── Estado: carrito y filtros ── */
  const { cartCount, addToCart, justAdded } = useCart();
  const {
    searchQuery, setSearchQuery,
    activeCategory, setActiveCategory,
    activePrices, togglePrice,
    activeSizes, toggleSize,
    clearFilters, filteredProducts, hasActiveFilters,
  } = useFilters(products);

  /* ── Anuncio superior (solo clásico) ── */
  const TopBanner = isCls ? (
    <div style={{
      background: accent, color: "#fff", textAlign: "center",
      padding: "8px 16px", fontSize: 11, letterSpacing: 1, fontWeight: 600,
    }}>
      🚚 Envío gratis en compras mayores a $150.000
    </div>
  ) : null;

  return (
    <div style={{ background: pageBg, color: isMin ? "#111" : isUrb ? "#fff" : "#1a1a1a", fontFamily: `"${fB}",sans-serif`, minHeight: "100vh" }}>

      {TopBanner}

      <StoreHeader
        header={header}
        theme={theme}
        searchCfg={searchCfg}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cartCount={cartCount}
      />

      <StoreHero banner={banner} theme={theme} />

      {/* Sidebar + contenido principal */}
      <div style={{ display: "flex", alignItems: "stretch" }}>
        <StoreSidebar
          cfg={sidebarCfg}
          theme={theme}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          activePrices={activePrices}
          togglePrice={togglePrice}
          activeSizes={activeSizes}
          toggleSize={toggleSize}
          clearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <StoreCatalog
            layoutType={layoutType}
            theme={theme}
            filteredProducts={filteredProducts}
            totalProducts={products.length}
            searchQuery={searchQuery}
            clearFilters={clearFilters}
            addToCart={addToCart}
            justAdded={justAdded}
            searchCfg={searchCfg}
            onSearchChange={setSearchQuery}
          />
        </div>
      </div>

      <StoreFooter footer={footer} header={header} theme={theme} />

    </div>
  );
}
