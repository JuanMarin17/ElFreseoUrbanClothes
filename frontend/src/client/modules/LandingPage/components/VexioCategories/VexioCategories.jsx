import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './VexioCategories.css';

const CATEGORIES = [
  { img: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&q=80&auto=format&fit=crop', label: 'Moda & Ropa',      count: '8,200+', color: 'rose'   },
  { img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80&auto=format&fit=crop', label: 'Belleza',        count: '5,400+', color: 'pink'   },
  { img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80&auto=format&fit=crop', label: 'Alimentos',      count: '3,100+', color: 'amber'  },
  { img: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400&q=80&auto=format&fit=crop', label: 'Tecnología',     count: '2,800+', color: 'blue'   },
  { img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80&auto=format&fit=crop', label: 'Hogar & Deco',     count: '6,500+', color: 'green'  },
  { img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80&auto=format&fit=crop', label: 'Accesorios',       count: '4,700+', color: 'purple' },
  { img: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80&auto=format&fit=crop', label: 'Mascotas',       count: '1,900+', color: 'teal'   },
  { img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=80&auto=format&fit=crop', label: 'Arte & Artesanías', count: '2,300+', color: 'orange' },
];

const FEATURED = [
  {
    img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&q=80&auto=format&fit=crop',
    store: 'Luna Cosmetics',
    tag: 'Más vendido',
    product: 'Kit de maquillaje profesional',
    price: '$89.900',
    rating: '4.9',
    reviews: 312,
    badge: 'hot',
  },
  {
    img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80&auto=format&fit=crop',
    store: 'Raíces Artesanales',
    tag: 'Nuevo',
    product: 'Mochila wayuu edición especial',
    price: '$145.000',
    rating: '5.0',
    reviews: 88,
    badge: 'new',
  },
  {
    img: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=500&q=80&auto=format&fit=crop',
    store: 'UrbanFit Co.',
    tag: 'Oferta',
    product: 'Conjunto deportivo mujer',
    price: '$62.000',
    oldPrice: '$85.000',
    rating: '4.8',
    reviews: 207,
    badge: 'sale',
  },
  {
    img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80&auto=format&fit=crop',
    store: 'StepUp Store',
    tag: 'Popular',
    product: 'Zapatillas urbanas premium',
    price: '$210.000',
    rating: '4.7',
    reviews: 541,
    badge: 'hot',
  },
];

export default function VexioCategories() {
  const navigate = useNavigate();
  const cardsRef = useRef([]);
  const headRef1 = useRef(null);
  const headRef2 = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('vx-visible');
            observer.unobserve(e.target);
          }
        }),
      { threshold: 0.04 }
    );

    cardsRef.current.forEach((el) => el && observer.observe(el));
    if (headRef1.current) observer.observe(headRef1.current);
    if (headRef2.current) observer.observe(headRef2.current);

    return () => observer.disconnect();
  }, []);

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
            ref={(el) => (cardsRef.current[i] = el)}
            style={{ transitionDelay: `${i * 50}ms` }}
            onClick={() => navigate('/market')}
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

        {/* Cabecera destacados */}
        <div className="vx-featured-header vx-reveal" ref={headRef2}>
          <div className="vx-featured-header-left">
            
            <h2 className="vx-section-title">Productos que están volando</h2>
          </div>
          <button className="vx-ver-todo-btn" onClick={() => navigate('/market')}>Ver todo →</button>
        </div>

        {/* Grid productos */}
        <div className="vx-feat-products">
          {FEATURED.map((p, i) => (
            <div
              key={p.product}
              className="vx-product-card vx-reveal"
              ref={(el) => (cardsRef.current[CATEGORIES.length + i] = el)}
              style={{ transitionDelay: `${i * 70}ms` }}
            >
              {/* Imagen */}
              <div className="vx-product-img-wrap">
                <img
                  src={p.img}
                  alt={p.product}
                  loading="lazy"
                  className="vx-product-img-src"
                />
                <span className={`vx-product-badge vx-product-badge--${p.badge}`}>
                  {p.tag}
                </span>
              </div>

              {/* Cuerpo */}
              <div className="vx-product-body">
                <span className="vx-product-store">
                  <span className="vx-store-dot" />
                  {p.store}
                </span>
                <h4 className="vx-product-name">{p.product}</h4>

                <div className="vx-product-bottom">
                  <div className="vx-price-group">
                    <span className="vx-price">{p.price}</span>
                    {p.oldPrice && (
                      <span className="vx-old-price">{p.oldPrice}</span>
                    )}
                  </div>
                  <div className="vx-rating-pill">
                    <span className="vx-star">★</span>
                    <span className="vx-rating-num">{p.rating}</span>
                    <span className="vx-reviews">({p.reviews})</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}