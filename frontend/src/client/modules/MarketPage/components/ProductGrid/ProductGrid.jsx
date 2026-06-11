import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Heart, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import './ProductGrid.css';

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

export default function ProductGrid({ title, products = [], loading = false }) {
  const ipp        = useItemsPerPage();
  const totalPages = Math.max(1, Math.ceil(products.length / ipp));

  const [page, setPage]       = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [dir, setDir]         = useState(1); // 1 = forward
  const [paused, setPaused]   = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const sectionRef = useRef(null);
  const [visible, setVisible]  = useState(false);
  const timerRef = useRef(null);

  // Section scroll reveal
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.12 }
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

  // Auto-advance
  useEffect(() => {
    if (paused || totalPages <= 1) return;
    timerRef.current = setInterval(next, 5000);
    return () => clearInterval(timerRef.current);
  }, [paused, next, totalPages]);

  const toggleWish = (id, e) => {
    e.stopPropagation();
    setWishlist(w => w.includes(id) ? w.filter(x => x !== id) : [...w, id]);
  };

  const currentProducts = products.slice(page * ipp, page * ipp + ipp);

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
          {/* Page indicator */}
          {totalPages > 1 && (
            <span className="pgc-page-indicator">
              {page + 1} / {totalPages}
            </span>
          )}
        </div>
        <div className="vx-carousel-controls">
          <button className="vx-cc-btn" onClick={prev} aria-label="Anterior">
            <ChevronLeft size={16} />
          </button>
          <button className="vx-cc-btn" onClick={next} aria-label="Siguiente">
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
          : currentProducts.map((product, i) => (
              <article
                key={product.id}
                className="vx-product-card pgc-card-anim"
                style={{ '--vx-index': i, '--pgc-i': i }}
              >
                <div className="vx-product-img-wrap">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="vx-product-img"
                    loading="lazy"
                  />
                  {product.badge && (
                    <span className="vx-product-badge">{product.badge}</span>
                  )}
                  <button
                    className={`vx-product-wish ${wishlist.includes(product.id) ? 'is-wished' : ''}`}
                    aria-label="Añadir a favoritos"
                    onClick={(e) => toggleWish(product.id, e)}
                  >
                    <Heart
                      size={13}
                      fill={wishlist.includes(product.id) ? '#ef4444' : 'none'}
                    />
                  </button>
                  <div className="vx-product-cta">
                    <button className="vx-product-cta-btn" aria-label="Añadir al carrito">
                      <ShoppingCart size={13} />
                      Añadir al carrito
                    </button>
                  </div>
                </div>
                <div className="vx-product-meta">
                  <p className="vx-product-title">{product.title}</p>
                  <div className="vx-product-bottom">
                    <span className="vx-product-price">
                      ${typeof product.price === 'number' ? product.price.toFixed(2) : Number(product.price || 0).toFixed(2)}
                    </span>
                    {product.salesBadge && (
                      <span className="vx-product-sales">{product.salesBadge}</span>
                    )}
                  </div>
                </div>
              </article>
            ))}
      </div>

      {/* Dots */}
      {totalPages > 1 && (
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
