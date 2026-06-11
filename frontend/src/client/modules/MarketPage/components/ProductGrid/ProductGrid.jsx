import React, { useState, useEffect, useRef } from 'react';
import { Heart, ShoppingCart, ArrowLeft, ArrowRight } from 'lucide-react';
import './ProductGrid.css';

export default function ProductGrid({ title, products = [], loading = false }) {
  const [wishlist, setWishlist] = useState([]);
  const sliderRef = useRef(null);

  // Manejo de favoritos (Toggle Wishlist)
  const toggleWish = (id) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Controles de navegación nativos del carrusel con cálculo matemático preciso
  const scroll = (direction) => {
    if (!sliderRef.current) return;

    const slider = sliderRef.current;
    const firstCard = slider.querySelector('.vx-product-card, .vx-product-skeleton-card');
    
    if (!firstCard) return;

    // Calculamos el ancho real de una tarjeta + el espacio real (gap) entre ellas
    const cardWidth = firstCard.getBoundingClientRect().width;
    const gap = parseFloat(window.getComputedStyle(slider).gap) || 20;
    
    // Determinamos cuántas tarjetas completas caben visibles en pantalla
    const visibleCards = Math.max(1, Math.floor(slider.clientWidth / (cardWidth + gap)));
    
    // El scroll avanza la cantidad exacta del bloque visible para no cortar elementos
    const scrollAmount = (cardWidth + gap) * visibleCards;

    slider.scrollTo({
      left: direction === 'left' ? slider.scrollLeft - scrollAmount : slider.scrollLeft + scrollAmount,
      behavior: 'smooth',
    });
  };

  // Intersection Observer para revelación por cascada suave al hacer scroll
  useEffect(() => {
    if (loading || products.length === 0 || !sliderRef.current) return;
    
    const slider = sliderRef.current;
    const cards = slider.querySelectorAll('.vx-product-card');
    
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('vx-visible');
            obs.unobserve(e.target);
          }
        });
      },
      { 
        root: slider, // Rastrea la visibilidad relativa interna del propio carrusel horizontal
        threshold: 0.05, 
        rootMargin: '0px 100px 0px 100px' 
      }
    );

    cards.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [loading, products]);

  return (
    <section className="vx-pcarousel-root vx-section-wrap">
      
      {/* Cabecera con controles de navegación a la derecha */}
      <div className="vx-pcarousel-head">
        <div className="vx-pcarousel-title-block">
          <h2>{title}</h2>
        </div>
        
        <div className="vx-carousel-controls">
          <button 
            className="vx-cc-btn" 
            onClick={() => scroll('left')} 
            aria-label="Anterior producto"
          >
            <ArrowLeft size={16} />
          </button>
          <button 
            className="vx-cc-btn" 
            onClick={() => scroll('right')} 
            aria-label="Siguiente producto"
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Tira deslizable por hardware del Carrusel */}
      <div className="vx-pcarousel-slider" ref={sliderRef}>
        {loading
          ? [...Array(6)].map((_, i) => (
              <div key={i} className="vx-product-skeleton-card">
                <div className="sk-img" />
                <div className="sk-text-1" />
                <div className="sk-text-2" />
              </div>
            ))
          : products.map((product, i) => (
              <article
                key={product.id}
                className="vx-product-card"
                style={{ '--vx-index': i }}
              >
                {/* Imagen */}
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

                  {/* Wishlist — siempre visible */}
                  <button
                    className={`vx-product-wish ${wishlist.includes(product.id) ? 'is-wished' : ''}`}
                    aria-label="Agregar a favoritos"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWish(product.id);
                    }}
                  >
                    <Heart
                      size={13}
                      fill={wishlist.includes(product.id) ? '#ef4444' : 'none'}
                    />
                  </button>

                  {/* CTA "Añadir" — sube desde abajo en hover */}
                  <div className="vx-product-cta">
                    <button className="vx-product-cta-btn" aria-label="Agregar al carrito">
                      <ShoppingCart size={13} />
                      Añadir al carrito
                    </button>
                  </div>
                </div>

                {/* Metadatos */}
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
    </section>
  );
}