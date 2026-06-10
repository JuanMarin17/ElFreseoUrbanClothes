import { useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";

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
   Items de confianza — estáticos de negocio,
   no vienen del backend
   ────────────────────────────────────────────── */
const TRUST_ITEMS = [
  { id: 1, icon: "fa-solid fa-shield-halved", label: "Garantía 30 días" },
  { id: 2, icon: "fa-solid fa-rotate-left", label: "Devolución gratis" },
  { id: 3, icon: "fa-solid fa-truck-fast", label: "Envío express" },
];

/* ──────────────────────────────────────────────
   ProductPage — orquestador
   ────────────────────────────────────────────── */
export default function ProductPage() {
  const { productId } = useParams();

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
            <Link to={(-1)} className="vx-btn vx-btn--ghost vx-btn--sm">
              <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Volver
              al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vx-page vx-noise">
      {/* ══════════════════════════════
          NAVEGACIÓN
          ══════════════════════════════ */}
      <header>
        <nav className="vx-nav" aria-label="Navegación principal">
          <div className="vx-nav__inner">
            <Link to="/" className="vx-nav__logo" aria-label="VEXIO - Inicio">
              <span className="vx-nav__logo-dot" aria-hidden="true" />
              VEXIO
            </Link>

            {/* Breadcrumb dinámico con datos reales del backend */}
            {!loading && product && (
              <ol
                className="vx-nav__breadcrumb"
                aria-label="Ruta de navegación"
              >
                <li>
                  <Link to="/">Inicio</Link>
                </li>
                <li aria-hidden="true" className="vx-nav__breadcrumb-sep">
                  ›
                </li>
                {/* Primera categoría como enlace */}
                {product.categories[0] && (
                  <>
                    <li>
                      <Link
                        to={`/categories/${product.categories[0].toLowerCase()}`}
                      >
                        {product.categories[0]}
                      </Link>
                    </li>
                    <li aria-hidden="true" className="vx-nav__breadcrumb-sep">
                      ›
                    </li>
                  </>
                )}
                <li className="vx-nav__breadcrumb-current" aria-current="page">
                  {product.name}
                </li>
              </ol>
            )}

            <div className="vx-nav__actions">
              <Link to="/wishlist" className="vx-btn vx-btn--ghost vx-btn--sm">
                <i className="fa-regular fa-heart" aria-hidden="true" />{" "}
                Wishlist
              </Link>
              <Link to="/cart" className="vx-btn vx-btn--primary vx-btn--sm">
                <i className="fa-solid fa-bag-shopping" aria-hidden="true" />{" "}
                Carrito
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <main ref={revealRef}>
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

                  {/* Precio dinámico + marca + categorías */}
                  <ProductPrice
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

                  {/* Garantías — datos estáticos de negocio */}
                  <TrustStrip items={TRUST_ITEMS} />
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
                reviewCount={product.reviewCount}
                qaCount={product.qaCount}
              />

              {activeTab === "description" && (
                <TabDescription
                  description={product.description}
                  brand={product.brand}
                  categories={product.categories}
                />
              )}

              {activeTab === "specs" && (
                <TabSpecs specGroups={product.specGroups ?? []} />
              )}

              {activeTab === "reviews" && (
                <TabReviews
                  rating={product.rating}
                  reviewCount={product.reviewCount}
                  ratingDistribution={product.ratingDistribution}
                  reviews={reviews}
                  hasMoreReviews={hasMoreReviews}
                  onLoadMore={loadMoreReviews}
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
              <a href="/returns">Política de devoluciones</a>
              <a href="/warranty">Garantías</a>
              <a href="/support">Soporte</a>
              <a href="/privacy">Privacidad</a>
              <a href="/terms">Términos</a>
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
