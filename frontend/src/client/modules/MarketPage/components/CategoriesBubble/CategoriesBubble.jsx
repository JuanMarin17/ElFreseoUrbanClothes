import React, { useState, useEffect, useRef } from 'react';
import { LayoutGrid } from 'lucide-react';
import './CategoriesBubble.css';

const categories = [
  { id: 1, name: "Mujer",       img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80" },
  { id: 2, name: "Hombre",      img: "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=400&q=80" },
  { id: 3, name: "Hogar",       img: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&q=80" },
  { id: 4, name: "Belleza",     img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80" },
  { id: 5, name: "Niños",       img: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=400&q=80" },
  { id: 6, name: "Electrónica", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80" },
  { id: 7, name: "Deportes",    img: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400&q=80" },
  { id: 8, name: "Joyería",     img: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80" },
];

export default function CategoriesBubble({ onCategorySelect, onViewAll }) {
  const [active, setActive] = useState(null);
  const itemsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('cb-visible');
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    itemsRef.current.forEach((el) => el && observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const handleSelect = (cat) => {
    setActive((prev) => (prev === cat.id ? null : cat.id));
    onCategorySelect?.(cat.name);
  };

  return (
    <section className="cb-root vx-section-wrap">

      {/* Cabecera Alineada al Sistema */}
      <div className="cb-header">
        <span className="vx-eyebrow">
          <span className="cb-chip-dot" />
          Explorar por estilo
        </span>
        <h2 className="cb-title">¿Qué estás buscando hoy?</h2>
      </div>

      {/* Grid Fluido Autoadaptable */}
      <div className="cb-grid">
        {categories.map((cat, i) => (
          <button
            key={cat.id}
            className={`cb-card cb-reveal ${active === cat.id ? 'cb-active' : ''}`}
            ref={(el) => (itemsRef.current[i] = el)}
            style={{ transitionDelay: `${i * 40}ms` }}
            onClick={() => handleSelect(cat)}
            aria-pressed={active === cat.id}
          >
            <div className="cb-image-container">
              <img src={cat.img} alt={cat.name} loading="lazy" />
              <div className="cb-overlay" />
            </div>
            <span className="cb-label">{cat.name}</span>
            {active === cat.id && <div className="cb-card-ring" />}
          </button>
        ))}

        {/* Tarjeta "Ver más" Integrada Estilizada */}
        <button
          className="cb-card cb-card--more cb-reveal"
          ref={(el) => (itemsRef.current[categories.length] = el)}
          style={{ transitionDelay: `${categories.length * 40}ms` }}
          onClick={() => onViewAll?.()}
          aria-label="Ver todas las categorías"
        >
          <div className="cb-more-content">
            <div className="cb-icon-box">
              <LayoutGrid size={20} strokeWidth={2} />
            </div>
            <span className="cb-label-more">Todas las categorías</span>
          </div>
        </button>
      </div>

      {/* Separador Líquido */}
      <div className="cb-divider" />

    </section>
  );
}