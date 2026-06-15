import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { getStoreSettingsByHeader, getStoreById } from "../../../multi-tenant/pages/services/storeService";
import StoreHeader from "../../../multi-tenant/components/Store/StoreHeader.jsx";
import HeaderMarket from "../../../utils/Header/HeaderMarket.jsx";
import { cf } from "../../../multi-tenant/components/Store/storeUtils.jsx";

import "./ProductPage.css";
import { useProduct } from "./service/useProduct";

import SkeletonHero from "./components/SkeletonHero";
import ProductGallery from "./components/ProductGallery";
import ProductPrice from "./components/Productprice";
import ColorSelector from "./components/ColorSelector";
import SizeSelector from "./components/SizeSelector";
import QuantityControl from "./components/QuantityControl";
import StockIndicator from "./components/Stockindicator";
import ProductActions from "./components/Productactions";
import TrustStrip from "./components/TruspTrip";
import ProductTabs from "./components/Producttabs";
import TabDescription from "./components/Tabsdescription";
import TabSpecs from "./components/Tabspecs";
import TabReviews from "./components/Tabreviews";
import TabQA from "./components/TabqA";
import RelatedProducts from "./components/Relatedproduct";
import { CartToast, StickyCTA } from "./components/Carttoast";

/* ──────────────────────────────────────────────
   Tabs estáticos — sin datos de negocio
   ────────────────────────────────────────────── */
const TABS = [
  { id: "description", label: "Descripción" },
  { id: "specs", label: "Especificaciones" },
  { id: "reviews", label: "Reseñas" },
  { id: "qa", label: "Preguntas" },
];

/* ──────────────────────────────────────────────
   Construye la trust strip a partir de los
   settings que la tienda haya configurado en CMS.
   Si no hay settings, no se muestra nada.
   ────────────────────────────────────────────── */
function buildTrustItems(settings) {
  if (!settings) return [];
  const items = [];
  const ret = settings.returns;

  if (ret?.allowRefunds || ret?.days > 0) {
    items.push({
      id: 1,
      icon: "fa-solid fa-rotate-left",
      label: ret?.days > 0 ? `Devolución ${ret.days} días` : "Devolución gratis",
    });
  }

  if (ret?.allowExchanges) {
    items.push({ id: 2, icon: "fa-solid fa-arrows-rotate", label: "Cambios incluidos" });
  }

  const hasShipping = settings.payment?.shipping || settings.shipping;
  if (hasShipping) {
    items.push({ id: 3, icon: "fa-solid fa-truck-fast", label: "Envío disponible" });
  }

  return items;
}

/* ──────────────────────────────────────────────
   ProductPage — orquestador
   ────────────────────────────────────────────── */
function getUserIdFromJwt() {
  try {
    const jwt = localStorage.getItem("jwt");
    if (!jwt || jwt === "null") return null;
    const payload = JSON.parse(atob(jwt.split(".")[1]));
    return payload.user_id ?? payload.userId ?? payload.sub ?? null;
  } catch {
    return null;
  }
}

export default function ProductPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const navSource = searchParams.get("src"); // "store" | "catalog" | null
  const fromStore = navSource === "store";
  const currentUserId = getUserIdFromJwt();

  const {
    // Datos
    product,
    reviews,
    related,
    hasMoreReviews,

    // Selecciones
    selectedImage,
    selectedColor,
    selectedSize,
    activeVariant,

    quantity,
    activeTab,
    wishlisted,

    // Precio y stock dinámicos (según variante activa)
    currentStock,
    currentPriceFormatted,

    // Setters
    setSelectedImage,
    setActiveTab,

    // Acciones
    handleSelectColor,
    handleSelectSize,
    incrementQty,
    decrementQty,
    handleAddToCart,
    handleToggleWishlist,
    loadMoreReviews,

    // Estados
    loading,
    error,
    cartLoading,
    cartSuccess,
  } = useProduct(productId);

  /* ── Conteo live de reseñas (se actualiza cuando ProductReviews carga) ── */
  const [liveReviewCount, setLiveReviewCount] = useState(0);

  /* ── Info básica de la tienda (nombre + slug para el card de descripción) ── */
  const [storeInfo, setStoreInfo] = useState(null); // { name, slug }

  useEffect(() => {
    const sid = product?.storeId ?? localStorage.getItem("storeId");
    if (!sid || sid === "null") return;
    getStoreById(sid)
      .then((store) => {
        const name = store?.data?.name ?? store?.name ?? null;
        const slug = store?.data?.slug ?? store?.slug ?? null;
        if (name || slug) setStoreInfo({ name, slug });
      })
      .catch(() => {});
  }, [product?.storeId]);

  /* ── Settings de la tienda (header + trust strip — solo cuando viene de tienda) ── */
  const [storeSettings, setStoreSettings] = useState(null);
  const [isDark, setIsDark] = useState(true);
  const storeSlug = useMemo(() => localStorage.getItem("storeSlug"), []);

  useEffect(() => {
    if (!fromStore) return;
    const storeId = localStorage.getItem("storeId");
    if (!storeId || storeId === "null") return;
    getStoreSettingsByHeader(storeId)
      .then(setStoreSettings)
      .catch(() => {});
  }, [fromStore]);

  /* Construye las props de StoreHeader a partir de los settings CMS de la tienda */
  const storeHeaderProps = useMemo(() => {
    if (!storeSettings) return null;
    const components = storeSettings.components ?? {};
    const styles     = storeSettings.styles     ?? {};
    const layoutType = storeSettings.layout?.id ?? "minimalista";

    const isMin = layoutType === "minimalista";
    const isUrb = layoutType === "urbano";
    const isCls = layoutType === "clasico";

    const header = components.header ?? {
      logo: "MI TIENDA", items: ["HOME", "SHOP"],
      color: "#fff", bg: "#000", font: "Inter",
    };

    const accent = styles.colorBoton ?? (isMin ? "#2563eb" : isUrb ? "#ffffff" : "#2563eb");
    const btnR   = `${styles.btnRadius ?? (isMin ? 8 : isUrb ? 0 : 8)}px`;

    const hBg = header.bg ?? (isDark
      ? (isMin ? "#0c0e14" : isUrb ? "#000000" : "#0c0e18")
      : (isMin ? "#ffffff" : isUrb ? "#111111" : "#ffffff"));

    const hColor = header.color ?? (isDark
      ? (isMin ? "#f0f4ff" : isUrb ? "#ffffff" : "#ecf0ff")
      : (isMin ? "#0f172a" : isUrb ? "#f0f0f0" : "#0f172a"));

    const hFont = cf(header.font ?? "Inter");

    const theme = { isMin, isUrb, isCls, isDark, accent, btnR, hBg, hColor, hFont };

    const searchCfg = {
      visible: isUrb || isCls,
      bg: isMin ? "#f5f5f5" : isUrb ? "#111" : "#f5f5f5",
      borderColor: isMin ? "#e0e0e0" : isUrb ? "#222" : "#e0e0e0",
      borderWidth: 1,
      radius: isMin ? 8 : isUrb ? 0 : 8,
      placeholder: "Buscar productos...",
      font: "Inter",
      showIcon: true,
      iconColor: isUrb ? "#444" : "#aaa",
      placeholderColor: isUrb ? "#555" : "#999",
      color: isMin ? "#333" : isUrb ? "#fff" : "#333",
    };

    return { header, theme, searchCfg };
  }, [storeSettings, isDark]);

  /* Info de la tienda para el card en descripción */
  const storeCard = useMemo(() => {
    const slug = storeInfo?.slug ?? storeSlug;
    const name = storeInfo?.name ?? storeSettings?.components?.header?.logo ?? slug;
    if (!slug && !name) return null;
    return {
      name:    name ?? slug,
      slug:    slug,
      logoUrl: storeSettings?.components?.header?.logoUrl ?? null,
      accent:  storeSettings?.styles?.colorBoton ?? "#2563FF",
    };
  }, [storeInfo, storeSettings, storeSlug]);

  /* ── Scroll-reveal: activa .vx-visible cuando el elemento entra en viewport ── */
  const revealRef = useRef(null);
  useEffect(() => {
    const root = revealRef.current;
    if (!root) return;
    const targets = root.querySelectorAll(".vx-reveal");
    if (!targets.length) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("vx-visible"); observer.unobserve(e.target); } }),
      { threshold: 0.08 }
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [loading]);

  /* ── Error ── */
  if (error) {
    return (
      <div className="vx-page vx-noise">
        <div className="vx-wrap">
          <div className="vx-error-state" role="alert">
            <i
              className="fa-solid fa-triangle-exclamation vx-error-state__icon"
              aria-hidden="true"
            />
            <h1 className="vx-error-state__title">
              No se pudo cargar el producto
            </h1>
            <p className="vx-error-state__msg">{error}</p>
            <button onClick={() => navigate(-1)} className="vx-btn vx-btn--ghost vx-btn--sm">
              <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vx-page vx-noise">
      {/* Header según origen de navegación */}
      {fromStore && storeHeaderProps ? (
        <StoreHeader
          header={storeHeaderProps.header}
          theme={storeHeaderProps.theme}
          searchCfg={storeHeaderProps.searchCfg}
          searchQuery=""
          onSearchChange={() => {}}
          cartCount={0}
          isOwner={false}
          storeSlug={storeSlug}
          onCartOpen={() => {}}
          isDark={isDark}
          onToggleDark={() => setIsDark(d => !d)}
          topOffset={0}
        />
      ) : !fromStore ? (
        <HeaderMarket />
      ) : null}
      <main ref={revealRef}>
        {/* Botón volver al catálogo */}
        {navSource === "catalog" && (
          <div className="vx-back-nav">
            <div className="vx-wrap">
              <button
                className="vx-btn vx-btn--ghost vx-btn--sm"
                onClick={() => navigate(-1)}
              >
                <i className="fa-solid fa-arrow-left" aria-hidden="true" />
                Volver al catálogo
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════
            HERO — Galería + Info
            ══════════════════════════════ */}
        <section className="vx-hero" aria-label="Detalle del producto">
          <div className="vx-wrap">
            {loading ? (
              <SkeletonHero />
            ) : (
              <div className="vx-hero__grid">
                {/* Galería con imágenes de Cloudinary */}
                <ProductGallery
                  images={product.images}
                  selectedImage={selectedImage}
                  onSelect={setSelectedImage}
                  productName={product.name}
                />

                {/* Panel de información */}
                <div className="vx-info">
                  {/* Nombre del producto */}
                  <h1 className="vx-info__title vx-anim vx-anim--d1">
                    {product.name}
                  </h1>

                  {/* Precio — cambia al seleccionar color/talla con distinto precio */}
                  <ProductPrice
                    key={activeVariant?.variantId ?? "base"}
                    priceFormatted={currentPriceFormatted}
                    brand={product.brand}
                    categories={product.categories}
                  />

                  {/* Selector de colores (extraídos de variants) */}
                  <ColorSelector
                    colors={product.colors}
                    selected={selectedColor}
                    onSelect={handleSelectColor}
                  />

                  {/* Selector de tallas (extraídas de variants) */}
                  <SizeSelector
                    sizes={product.sizes}
                    selected={selectedSize}
                    onSelect={handleSelectSize}
                  />

                  {/* Control de cantidad */}
                  <QuantityControl
                    value={quantity}
                    onIncrement={incrementQty}
                    onDecrement={decrementQty}
                    max={currentStock}
                  />

                  {/* Stock dinámico de la variante activa */}
                  <StockIndicator
                    stock={currentStock}
                    minStock={activeVariant?.minStock ?? 5}
                    activeVariant={activeVariant}
                  />

                  {/* CTA: carrito, comprar, wishlist */}
                  <ProductActions
                    stock={currentStock}
                    cartLoading={cartLoading}
                    wishlisted={wishlisted}
                    onAddToCart={handleAddToCart}
                    onBuyNow={() => {}}
                    onToggleWishlist={handleToggleWishlist}
                  />

                  {/* Garantías — dinámicas según CMS de la tienda */}
                  <TrustStrip items={buildTrustItems(storeSettings)} />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ══════════════════════════════
            TABS
            ══════════════════════════════ */}
        {!loading && product && (
          <section className="vx-body vx-reveal" aria-label="Información detallada">
            <div className="vx-wrap">
              <ProductTabs
                tabs={TABS}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                reviewCount={liveReviewCount}
                qaCount={product.qaCount}
              />

              {activeTab === "description" && (
                <TabDescription
                  description={product.description}
                  brand={product.brand}
                  categories={product.categories}
                  storeCard={storeCard}
                />
              )}

              {activeTab === "specs" && (
                <TabSpecs specGroups={product.specGroups ?? []} />
              )}

              {activeTab === "reviews" && (
                <TabReviews
                  productId={productId}
                  currentUserId={currentUserId}
                  onCountChange={setLiveReviewCount}
                />
              )}

              {activeTab === "qa" && <TabQA qaItems={product.qaItems ?? []} />}
            </div>
          </section>
        )}

        {/* Productos relacionados */}
        {!loading && related.length > 0 && (
          <div className="vx-reveal" style={{ transitionDelay: "0.1s" }}>
            <RelatedProducts products={related} />
          </div>
        )}
      </main>

      {/* ══════════════════════════════
          FOOTER
          ══════════════════════════════ */}
      <footer className="vx-footer">
        <div className="vx-wrap">
          <div className="vx-footer__inner">
            <div className="vx-footer__logo">
              <span className="vx-nav__logo-dot" aria-hidden="true" />
              VEXIO
            </div>
            <nav className="vx-footer__links" aria-label="Links legales">
              <button className="vx-footer__link-btn" onClick={() => navigate("/returns")}>Política de devoluciones</button>
              <button className="vx-footer__link-btn" onClick={() => navigate("/warranty")}>Garantías</button>
              <button className="vx-footer__link-btn" onClick={() => navigate("/support")}>Soporte</button>
              <button className="vx-footer__link-btn" onClick={() => navigate("/privacy")}>Privacidad</button>
              <button className="vx-footer__link-btn" onClick={() => navigate("/terms")}>Términos</button>
            </nav>
            <p className="vx-footer__copy">
              © {new Date().getFullYear()} VEXIO. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* CTA sticky mobile */}
      {!loading && product && (
        <StickyCTA
          priceFormatted={currentPriceFormatted}
          stock={currentStock}
          cartLoading={cartLoading}
          wishlisted={wishlisted}
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
        />
      )}

      {/* Toast de confirmación */}
      <CartToast visible={cartSuccess} />
    </div>
  );
}
