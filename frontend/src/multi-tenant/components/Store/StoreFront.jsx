import { useState, useCallback } from 'react';
import { cf, DEMO } from './storeUtils.jsx';
import { useCart } from './hooks/useCart.js';
import { useFilters } from './hooks/useFilters.js';
import StoreHeader from './StoreHeader.jsx';
import StoreHero from './StoreHero.jsx';
import StoreSidebar from './StoreSidebar.jsx';
import StoreCatalog from './StoreCatalog.jsx';
import StoreFooter from './StoreFooter.jsx';
import CartDrawer from './CartDrawer.jsx';
import AiChatDrawer from './AiChatDrawer.jsx';

/* ══════════════════════════════════════════
   StoreFront — Vista pública de la tienda
   Props:
     layoutType: "minimalista" | "urbano" | "clasico"
     data: { header, banner, footer, products, styles, widgets }
══════════════════════════════════════════ */
export default function StoreFront({ layoutType = "minimalista", data = {}, isOwner = false, storeId = null, storeSlug = null, headerTopOffset = 0 }) {
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

  const [isDark, setIsDark] = useState(true);
  const toggleDark = useCallback(() => setIsDark(d => !d), []);


  /* ── Tokens de estilo (reaccionan a isDark) ── */
  const accent = styles.colorBoton ?? (isMin ? "#2563eb" : isUrb ? "#ffffff" : "#2563eb");

  const titleC = styles.colorTitulo ?? (isDark
    ? (isMin ? "#f0f4ff" : isUrb ? "#ffffff"  : "#ecf0ff")
    : (isMin ? "#0f172a" : isUrb ? "#0f0f0f"  : "#0f172a"));

  const paraC = styles.colorParrafo ?? (isDark
    ? (isMin ? "#94a3b8" : isUrb ? "#555555"  : "#8898b0")
    : (isMin ? "#475569" : isUrb ? "#444444"  : "#4b5a72"));

  const cardBg = styles.cardBg ?? (isDark
    ? (isMin ? "#12151c" : isUrb ? "#0a0a0a"  : "#0e1220")
    : (isMin ? "#ffffff" : isUrb ? "#f5f5f5"  : "#ffffff"));

  const b1 = styles.cardBorderColor1 ?? (isDark
    ? (isMin ? "#1d2436" : isUrb ? "#1a1a1a"  : "#1a2540")
    : (isMin ? "#e2e8f0" : isUrb ? "#d4d4d4"  : "#dde4f0"));

  const b2 = styles.cardBorderColor2 ?? (isDark
    ? (isMin ? "#252e45" : isUrb ? "#242424"  : "#202d4a")
    : (isMin ? "#e2e8f0" : isUrb ? "#e4e4e4"  : "#dde4f0"));

  const bw   = `${styles.cardBorderWidth ?? 1}px`;
  const br   = `${styles.cardRadius     ?? (isMin ? 12 : isUrb ? 2 : 10)}px`;
  const sh   = styles.cardShadow ?? (isDark
    ? "0 4px 28px rgba(0,0,0,0.5)"
    : "0 2px 16px rgba(0,0,0,0.08)");
  const btnR = `${styles.btnRadius ?? (isMin ? 8 : isUrb ? 0 : 8)}px`;
  const fT   = cf(styles.fontTitle ?? (isUrb ? "Bebas Neue" : "Inter"));
  const fB   = cf(styles.fontBody  ?? "Inter");
  const desc = styles.textoCuerpo ?? "Descripción del producto.";

  const hBg = header.bg ?? (isDark
    ? (isMin ? "#0c0e14" : isUrb ? "#000000" : "#0c0e18")
    : (isMin ? "#ffffff" : isUrb ? "#111111" : "#ffffff"));

  const hColor = header.color ?? (isDark
    ? (isMin ? "#f0f4ff" : isUrb ? "#ffffff" : "#ecf0ff")
    : (isMin ? "#0f172a" : isUrb ? "#f0f0f0" : "#0f172a"));

  const hFont = cf(header.font ?? "Inter");

  const pageBg = isDark
    ? (isMin ? "#0c0e14" : isUrb ? "#000000" : "#0d1020")
    : (isMin ? "#dededf" : isUrb ? "#e7e6e6" : "#dfdfdf");

  const catalogBg = pageBg;

  const footerBg = footer.bg ?? (isDark
    ? (isMin ? "#080a10" : isUrb ? "#040404" : "#080b14")
    : (isMin ? "#eef2fa" : isUrb ? "#eeeeee" : "#e8edf8"));

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
    isMin, isUrb, isCls, isDark,
    accent, titleC, paraC, cardBg, b1, b2, bw, br, sh, btnR, fT, fB, desc,
    hBg, hColor, hFont, pageBg, catalogBg, footerBg, cardGradients,
  };

  /* ── Config sidebar ── */
  const sb = widgets?.sidebar ?? null;
  const sidebarCfg = {
    visible:     sb !== null ? sb.visible === true : isCls,
    bg:          sb?.bg          ?? (isDark ? (isMin ? "#0e111a" : isUrb ? "#0a0a0a" : "#0e1220") : (isMin ? "#ffffff" : isUrb ? "#f5f5f5" : "#ffffff")),
    color:       sb?.color       ?? (isDark ? (isMin ? "#94a3b8" : isUrb ? "#888" : "#94a3b8") : (isMin ? "#374151" : isUrb ? "#444" : "#374151")),
    borderColor: sb?.borderColor ?? (isDark ? (isMin ? "#1d2436" : isUrb ? "#1a1a1a" : "#1a2540") : (isMin ? "#e2e8f0" : isUrb ? "#d4d4d4" : "#dde4f0")),
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
  const {
    cart, cartCount, isOpen: cartOpen, loading: cartLoading,
    itemLoading, error: cartError,
    openCart, closeCart, refreshCart, addToCart, justAdded,
    updateQuantity, removeCartItem, emptyCart, clearError,
  } = useCart(storeId);

  // Cuando la IA agrega un producto: refresca los datos y abre el drawer
  const handleIaCartRefresh = useCallback(async () => {
    await refreshCart();
    openCart();
  }, [refreshCart, openCart]);
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
    <div style={{ background: pageBg, color: titleC, fontFamily: `"${fB}",sans-serif`, minHeight: "100vh", transition: "background 0.3s ease, color 0.3s ease" }}>

      {TopBanner}

      <StoreHeader
        header={header}
        theme={theme}
        searchCfg={searchCfg}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cartCount={cartCount}
        isOwner={isOwner}
        storeSlug={storeSlug}
        onCartOpen={openCart}
        isDark={isDark}
        onToggleDark={toggleDark}
        topOffset={headerTopOffset}
      />

      <CartDrawer
        isOpen={cartOpen}
        onClose={closeCart}
        cart={cart}
        loading={cartLoading}
        itemLoading={itemLoading}
        error={cartError}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeCartItem}
        onClearCart={emptyCart}
        onClearError={clearError}
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

      <StoreFooter footer={footer} header={header} theme={theme} storeSlug={storeSlug} />

      <AiChatDrawer
        storeId={storeId}
        onCartRefresh={handleIaCartRefresh}
        accentColor={accent}
        products={products}
        storeName={banner.title ?? "Tienda"}
      />

    </div>
  );
}
