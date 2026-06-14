import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCatalogProducts } from '../../../Catalogo/catalogoService';
import './VexioCategories.css';

const CATEGORIES = [
  { img: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&q=80&auto=format&fit=crop', label: 'Moda & Ropa',        count: '8,200+', color: 'rose'   },
  { img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80&auto=format&fit=crop', label: 'Belleza',          count: '5,400+', color: 'pink'   },
  { img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80&auto=format&fit=crop', label: 'Alimentos',        count: '3,100+', color: 'amber'  },
  { img: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400&q=80&auto=format&fit=crop', label: 'Tecnología',       count: '2,800+', color: 'blue'   },
  { img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80&auto=format&fit=crop', label: 'Hogar & Deco',       count: '6,500+', color: 'green'  },
  { img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80&auto=format&fit=crop', label: 'Accesorios',         count: '4,700+', color: 'purple' },
  { img: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80&auto=format&fit=crop', label: 'Mascotas',         count: '1,900+', color: 'teal'   },
  { img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=80&auto=format&fit=crop', label: 'Arte & Artesanías', count: '2,300+', color: 'orange' },
];

const BADGE_CYCLE = ['hot', 'new', 'sale', 'hot'];
const TAG_CYCLE   = ['Destacado', 'Nuevo', 'Oferta', 'Popular'];

const PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23181818"/></svg>';

function mapProduct(p, idx) {
  return {
    id:       p.id,
    img:      p.image || PLACEHOLDER,
    store:    p.storeName || null,   // null → se oculta la sección
    product:  p.name || 'Producto',
    price:    p.priceFormatted || `$${Number(p.price || 0).toLocaleString('es-CO')}`,
    rating:   p.rating ? Number(p.rating).toFixed(1) : null,
    reviews:  p.reviewCount || 0,
    badge:    BADGE_CYCLE[idx % BADGE_CYCLE.length],
    tag:      TAG_CYCLE[idx % TAG_CYCLE.length],
    storeId:  p.storeId,
  };
}

function ProductSkeleton() {
  return (
    <div className="vx-product-card vx-product-skeleton">
      <div className="vx-product-img-wrap vx-skel-img" />
      <div className="vx-product-body">
        <div className="vx-skel-line vx-skel-line--sm" />
        <div className="vx-skel-line" />
        <div className="vx-skel-line vx-skel-line--md" />
      </div>
    </div>
  );
}

export default function VexioCategories() {
  const navigate = useNavigate();
  const cardsRef = useRef([]);
  const headRef1 = useRef(null);
  const headRef2 = useRef(null);

  const [featured, setFeatured] = useState([]);
  const [loading,  setLoading]  = useState(true);

  /* ── Carga productos reales ── */
  useEffect(() => {
    let cancelled = false;
    fetchCatalogProducts()
      .then(data => {
        if (cancelled) return;
        // Toma 4 productos con mejor stock (proxy de popularidad)
        const top4 = [...data]
          .sort((a, b) => (b.stock ?? 0) - (a.stock ?? 0))
          .slice(0, 4)
          .map(mapProduct);
        setFeatured(top4);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  /* ── Scroll reveal ── */
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('vx-visible');
          observer.unobserve(e.target);
        }
      }),
      { threshold: 0.04 }
    );
    cardsRef.current.forEach(el => el && observer.observe(el));
    if (headRef1.current) observer.observe(headRef1.current);
    if (headRef2.current) observer.observe(headRef2.current);
    return () => observer.disconnect();
  }, [featured, loading]);

  const handleProductClick = (p) => {
    if (p.storeId) localStorage.setItem('storeId', p.storeId);
    navigate(`/products/${p.id}`);
  };

  return (
    <section id="vx-categories" className="vx-section vx-section--dark2">

      {/* ── Cabecera categorías ── */}
      <div className="vx-section-head vx-reveal" ref={headRef1}>
        <span className="vx-section-chip">
          <span className="vx-chip-dot" />
          Explorar
        </span>
        <h2 className="vx-section-title">¿Qué estás buscando hoy?</h2>
        <p className="vx-section-sub">
          Navega por categorías y encuentra productos únicos de emprendedores de toda Colombia.
        </p>
      </div>

      {/* ── Grid categorías ── */}
      <div className="vx-cat-grid">
        {CATEGORIES.map((cat, i) => (
          <button
            key={cat.label}
            className={`vx-cat-card vx-cat-card--${cat.color} vx-reveal`}
            ref={el => (cardsRef.current[i] = el)}
            style={{ transitionDelay: `${i * 50}ms` }}
            onClick={() => navigate('/catalogo')}
          >
            <img src={cat.img} alt={cat.label} loading="lazy" className="vx-cat-img" />
            <div className="vx-cat-overlay">
              <div className="vx-cat-text-group">
                <span className="vx-cat-label">{cat.label}</span>
                <span className="vx-cat-count">{cat.count} productos</span>
              </div>
              <span className="vx-cat-arrow">→</span>
            </div>
          </button>
        ))}
      </div>

      {/* ── Sección productos destacados ── */}
      <div className="vx-featured-section">

        <div className="vx-featured-header vx-reveal" ref={headRef2}>
          <div className="vx-featured-header-left">
            <h2 className="vx-section-title">Productos que están volando</h2>
          </div>
          <button className="vx-ver-todo-btn" onClick={() => navigate('/catalogo')}>
            Ver catálogo completo →
          </button>
        </div>

        {/* Grid productos */}
        <div className="vx-feat-products">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)
            : featured.length > 0
              ? featured.map((p, i) => (
                  <div
                    key={p.id}
                    className="vx-product-card vx-reveal"
                    ref={el => (cardsRef.current[CATEGORIES.length + i] = el)}
                    style={{ transitionDelay: `${i * 70}ms` }}
                    onClick={() => handleProductClick(p)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && handleProductClick(p)}
                  >
                    <div className="vx-product-img-wrap">
                      <img
                        src={p.img}
                        alt={p.product}
                        loading="lazy"
                        className="vx-product-img-src"
                        onError={e => { e.currentTarget.src = PLACEHOLDER; }}
                      />
                      <span className={`vx-product-badge vx-product-badge--${p.badge}`}>
                        {p.tag}
                      </span>
                    </div>

                    <div className="vx-product-body">
                      {p.store && (
                        <span className="vx-product-store">
                          <span className="vx-store-dot" />
                          {p.store}
                        </span>
                      )}
                      <h4 className="vx-product-name">{p.product}</h4>

                      <div className="vx-product-bottom">
                        <div className="vx-price-group">
                          <span className="vx-price">{p.price}</span>
                        </div>
                        {p.rating && (
                          <div className="vx-rating-pill">
                            <span className="vx-star">★</span>
                            <span className="vx-rating-num">{p.rating}</span>
                            {p.reviews > 0 && (
                              <span className="vx-reviews">({p.reviews})</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              : (
                <div className="vx-feat-empty">
                  <p>Los productos están cargando. ¡Vuelve pronto!</p>
                  <button className="vx-ver-todo-btn" onClick={() => navigate('/catalogo')}>
                    Explorar catálogo →
                  </button>
                </div>
              )
          }
        </div>
      </div>

    </section>
  );
}
