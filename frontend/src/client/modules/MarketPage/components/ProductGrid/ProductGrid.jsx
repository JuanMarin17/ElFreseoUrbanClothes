import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Heart, ShoppingBag, ChevronLeft, ChevronRight, Store, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  getWishlist,
  toggleInWishlist,
  isWishlisted,
} from '../../../../../utils/wishlistService';
import './ProductGrid.css';

const PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400"><rect width="300" height="400" fill="%23111116"/><text x="150" y="200" text-anchor="middle" fill="%2333334a" font-size="40" font-family="sans-serif">◻</text></svg>';

function useItemsPerPage() {
  const [ipp, setIpp] = useState(4);
  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      setIpp(w < 480 ? 1 : w < 720 ? 2 : w < 1024 ? 3 : 4);
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);
  return ipp;
}

function formatPrice(product) {
  if (product.priceFormatted) return product.priceFormatted;
  const n = Number(product.price || 0);
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0,
  }).format(n);
}

function ProductCard({ product, wishlisted, onWish, onClick }) {
  const [imgSrc, setImgSrc] = useState(product.image || PLACEHOLDER);
  const displayName = product.name || product.title || 'Producto';

  return (
    <article
      className="vx-product-card pgc-card-anim"
      style={{ '--pgc-i': product._idx ?? 0 }}
      onClick={() => onClick(product)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick(product)}
    >
      <div className="vx-product-img-wrap">
        <img
          src={imgSrc}
          alt={displayName}
          className="vx-product-img"
          loading="lazy"
          onError={() => setImgSrc(PLACEHOLDER)}
        />

        {/* Badge */}
        {product.badge && (
          <span className="vx-product-badge">{product.badge}</span>
        )}

        {/* Store — solo si el nombre está disponible */}
        {(product.storeName || product.storeSlug) && (
          <span className="vx-product-store-badge">
            <Store size={9} />
            {product.storeName || product.storeSlug}
          </span>
        )}

        {/* Wishlist */}
        <button
          className={`vx-product-wish ${wishlisted ? 'is-wished' : ''}`}
          aria-label="Añadir a favoritos"
          onClick={e => { e.stopPropagation(); onWish(product); }}
        >
          <Heart size={13} fill={wishlisted ? '#ef4444' : 'none'} />
        </button>

        {/* CTA hover */}
        <div className="vx-product-cta">
          <button
            className="vx-product-cta-btn"
            aria-label="Ver producto"
            onClick={e => { e.stopPropagation(); onClick(product); }}
          >
            <ShoppingBag size={13} />
            Ver producto
          </button>
        </div>
      </div>

      <div className="vx-product-meta">
        <p className="vx-product-title">{displayName}</p>

        {product.brand && (
          <p className="vx-product-brand">{product.brand}</p>
        )}

        <div className="vx-product-bottom">
          <span className="vx-product-price">{formatPrice(product)}</span>

          <div className="vx-product-right">
            {product.rating > 0 && (
              <span className="vx-product-rating">
                <Star size={10} fill="#f59e0b" color="#f59e0b" />
                {Number(product.rating).toFixed(1)}
              </span>
            )}
            {product.stock > 0 && product.stock < 10 && (
              <span className="vx-product-stock-warn">¡Últimas {product.stock}!</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function ProductGrid({ title, products = [], loading = false, emptyText }) {
  const navigate   = useNavigate();
  const ipp        = useItemsPerPage();
  const totalPages = Math.max(1, Math.ceil(products.length / ipp));

  const [page,     setPage]     = useState(0);
  const [animKey,  setAnimKey]  = useState(0);
  const [dir,      setDir]      = useState(1);
  const [paused,   setPaused]   = useState(false);
  // IDs en wishlist — sincronizado con localStorage
  const [wishedIds, setWishedIds] = useState(() =>
    new Set(getWishlist().map(p => p.id))
  );

  useEffect(() => {
    const sync = () => setWishedIds(new Set(getWishlist().map(p => p.id)));
    window.addEventListener('wishlist-updated', sync);
    return () => window.removeEventListener('wishlist-updated', sync);
  }, []);
  const sectionRef = useRef(null);
  const [visible,  setVisible]  = useState(false);
  const timerRef   = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.10 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  const goTo = useCallback((p, d = 1) => {
    const target = (p + totalPages) % totalPages;
    setDir(d);
    setPage(target);
    setAnimKey(k => k + 1);
  }, [totalPages]);

  const next = useCallback(() => goTo(page + 1,  1), [goTo, page]);
  const prev = useCallback(() => goTo(page - 1, -1), [goTo, page]);

  useEffect(() => {
    if (paused || totalPages <= 1) return;
    timerRef.current = setInterval(next, 5000);
    return () => clearInterval(timerRef.current);
  }, [paused, next, totalPages]);

  // Reset page when products change
  useEffect(() => { setPage(0); setAnimKey(k => k + 1); }, [products.length]);

  const toggleWish = (product) => {
    toggleInWishlist(product);
    setWishedIds(new Set(getWishlist().map(p => p.id)));
  };

  const handleProductClick = (product) => {
    if (product.storeId) localStorage.setItem('storeId', product.storeId);
    navigate(`/products/${product.id}`);
  };

  const currentProducts = products
    .slice(page * ipp, page * ipp + ipp)
    .map((p, i) => ({ ...p, _idx: i }));

  return (
    <section
      ref={sectionRef}
      className={`vx-pcarousel-root vx-section-wrap ${visible ? 'pgc-visible' : ''}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Header */}
      <div className="vx-pcarousel-head">
        <div className="vx-pcarousel-title-block">
          <h2>{title}</h2>
          {!loading && products.length > 0 && totalPages > 1 && (
            <span className="pgc-page-indicator">{page + 1} / {totalPages}</span>
          )}
          {!loading && products.length > 0 && (
            <span className="pgc-count-badge">{products.length} productos</span>
          )}
        </div>
        <div className="vx-carousel-controls">
          <button className="vx-cc-btn" onClick={prev} aria-label="Anterior" disabled={totalPages <= 1}>
            <ChevronLeft size={16} />
          </button>
          <button className="vx-cc-btn" onClick={next} aria-label="Siguiente" disabled={totalPages <= 1}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Cards */}
      <div
        key={loading ? 'loading' : `page-${animKey}`}
        className="pgc-cards"
        data-dir={dir}
      >
        {loading
          ? [...Array(ipp)].map((_, i) => (
              <div key={i} className="vx-product-skeleton-card">
                <div className="sk-img" />
                <div className="sk-text-1" />
                <div className="sk-text-2" />
              </div>
            ))
          : currentProducts.length > 0
            ? currentProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  wishlisted={wishedIds.has(product.id)}
                  onWish={toggleWish}
                  onClick={handleProductClick}
                />
              ))
            : (
              <div className="pgc-empty">
                <p>{emptyText || 'No hay productos disponibles en este momento.'}</p>
              </div>
            )
        }
      </div>

      {/* Dots */}
      {!loading && totalPages > 1 && (
        <div className="pgc-dots">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              className={`pgc-dot ${i === page ? 'pgc-dot--active' : ''}`}
              onClick={() => goTo(i, i > page ? 1 : -1)}
              aria-label={`Página ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
