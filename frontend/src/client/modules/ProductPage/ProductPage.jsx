import { useParams, Link } from "react-router-dom";

import "../ProductPage.css";
import { useProduct } from "../useProduct";

import SkeletonHero from "./SkeletonHero";
import ProductGallery from "./ProductGallery";
import ProductRating from "./ProductRating";
import ProductPrice from "./ProductPrice";
import ColorSelector from "./ColorSelector";
import VariantSelector from "./VariantSelector";
import QuantityControl from "./QuantityControl";
import StockIndicator from "./StockIndicator";
import ProductActions from "./ProductActions";
import TrustStrip from "./TrustStrip";
import SellerCard from "./SellerCard";
import ProductTabs from "./ProductTabs";
import TabDescription from "./TabDescription";
import TabSpecs from "./TabSpecs";
import TabReviews from "./TabReviews";
import TabQA from "./TabQA";
import RelatedProducts from "./RelatedProducts";
import { CartToast, StickyCTA } from "./CartToast";

/* ─────────────────────────────────────────────
   Definición de tabs (sin datos de negocio)
   ───────────────────────────────────────────── */
const TABS = [
  { id: "description", label: "Descripción" },
  { id: "specs", label: "Especificaciones" },
  { id: "reviews", label: "Reseñas" },
  { id: "qa", label: "Preguntas" },
];

/* ─────────────────────────────────────────────
   ProductPage — componente orquestador
   ───────────────────────────────────────────── */
export default function ProductPage() {
  const { productId } = useParams();

  const {
    // Datos del servidor
    product,
    reviews,
    related,
    hasMoreReviews,

    // Selecciones de UI
    selectedImage,
    selectedColor,
    selectedVariant,
    quantity,
    activeTab,
    wishlisted,

    // Setters de UI
    setSelectedImage,
    setSelectedColor,
    setSelectedVariant,
    setActiveTab,

    // Acciones
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

  /* ── Estado de error ── */
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
            <Link to="/" className="vx-btn vx-btn--ghost vx-btn--sm">
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
                <li>
                  <Link to={`/categories/${product.categorySlug}`}>
                    {product.categoryName}
                  </Link>
                </li>
                <li aria-hidden="true" className="vx-nav__breadcrumb-sep">
                  ›
                </li>
                <li className="vx-nav__breadcrumb-current" aria-current="page">
                  {product.name}
                </li>
              </ol>
            )}

            <div className="vx-nav__actions">
              <Link
                to="/wishlist"
                className="vx-btn vx-btn--ghost vx-btn--sm"
                aria-label="Mi lista de deseos"
              >
                <i className="fa-regular fa-heart" aria-hidden="true" />{" "}
                Wishlist
              </Link>
              <Link
                to="/cart"
                className="vx-btn vx-btn--primary vx-btn--sm"
                aria-label="Ver carrito"
              >
                <i className="fa-solid fa-bag-shopping" aria-hidden="true" />{" "}
                Carrito
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <main>
        {/* ══════════════════════════════
            HERO — Galería + Info
            ══════════════════════════════ */}
        <section className="vx-hero" aria-label="Detalle del producto">
          <div className="vx-wrap">
            {loading ? (
              <SkeletonHero />
            ) : (
              <div className="vx-hero__grid">
                {/* Galería */}
                <ProductGallery
                  images={product.images}
                  selectedImage={selectedImage}
                  onSelect={setSelectedImage}
                />

                {/* Panel de información */}
                <div className="vx-info">
                  <p className="vx-info__category vx-anim vx-anim--d1">
                    {product.categoryName}
                  </p>

                  <h1 className="vx-info__title vx-anim vx-anim--d1">
                    {product.titlePrefix}{" "}
                    {product.titleHighlight && (
                      <span>{product.titleHighlight}</span>
                    )}{" "}
                    {product.titleSuffix}
                  </h1>

                  <ProductRating
                    rating={product.rating}
                    reviewCount={product.reviewCount}
                    soldCount={product.soldCount}
                    viewersNow={product.viewersNow}
                  />

                  <ProductPrice
                    priceFormatted={product.priceFormatted}
                    originalPriceFormatted={product.originalPriceFormatted}
                    discountLabel={product.discountLabel}
                    installmentText={product.installmentText}
                    shippingText={product.shippingText}
                  />

                  <ColorSelector
                    colors={product.colors}
                    selected={selectedColor}
                    onSelect={setSelectedColor}
                  />

                  <VariantSelector
                    label={product.variantLabel ?? "Edición"}
                    variants={product.variants}
                    selected={selectedVariant}
                    onSelect={setSelectedVariant}
                  />

                  <QuantityControl
                    value={quantity}
                    onIncrement={incrementQty}
                    onDecrement={decrementQty}
                    max={product.stock}
                  />

                  <StockIndicator stock={product.stock} />

                  <ProductActions
                    stock={product.stock}
                    cartLoading={cartLoading}
                    wishlisted={wishlisted}
                    onAddToCart={handleAddToCart}
                    onBuyNow={() => {}}
                    onToggleWishlist={handleToggleWishlist}
                  />

                  <TrustStrip items={product.trustItems} />

                  <SellerCard seller={product.seller} />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ══════════════════════════════
            TABS — Descripción / Specs / Reseñas / Q&A
            ══════════════════════════════ */}
        {!loading && product && (
          <section className="vx-body" aria-label="Información detallada">
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
                  features={product.features}
                  quickSpecs={product.quickSpecs}
                />
              )}

              {activeTab === "specs" && (
                <TabSpecs specGroups={product.specGroups} />
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

              {activeTab === "qa" && <TabQA qaItems={product.qaItems} />}
            </div>
          </section>
        )}

        {/* ══════════════════════════════
            PRODUCTOS RELACIONADOS
            ══════════════════════════════ */}
        {!loading && <RelatedProducts products={related} />}
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

      {/* ══════════════════════════════
          MOBILE — CTA Sticky + Toast
          ══════════════════════════════ */}
      {!loading && product && (
        <StickyCTA
          priceFormatted={product.priceFormatted}
          stock={product.stock}
          cartLoading={cartLoading}
          wishlisted={wishlisted}
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
        />
      )}

      <CartToast visible={cartSuccess} />
    </div>
  );
}
