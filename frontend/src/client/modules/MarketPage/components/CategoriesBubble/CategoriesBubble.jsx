import React, { useState, useEffect, useRef } from 'react'; // ← agrega useEffect y useRef
import { LayoutGrid } from 'lucide-react';
import './CategoriesBubble.css';

const categories = [
  { id: 1,  name: "Mujer",       img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=200&q=80" },
  { id: 2,  name: "Hombre",      img: "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=200&q=80" },
  { id: 3,  name: "Hogar",       img: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=200&q=80" },
  { id: 4,  name: "Belleza",     img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&q=80" },
  { id: 5,  name: "Niños",       img: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=200&q=80" },
  { id: 6,  name: "Electrónica", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80" },
  { id: 7,  name: "Deportes",    img: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=200&q=80" },
  { id: 8,  name: "Joyería",     img: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=200&q=80" },
];

export default function CategoriesBubble() {
  const [active, setActive] = useState(null);
  const rootRef = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) entry.target.classList.add('vx-visible'); },
      { threshold: 0.12 }
    );
    if (rootRef.current) obs.observe(rootRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="vx-cats-root" ref={rootRef}> {/* ← agrega ref aquí */}
      <div className="vx-section-wrap">
        <div className="vx-cats-scroll">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`vx-cat-item ${active === cat.id ? 'is-active' : ''}`}
              onClick={() => setActive(cat.id)}
              aria-pressed={active === cat.id}
            >
              <div className="vx-cat-circle">
                <img src={cat.img} alt={cat.name} loading="lazy" />
              </div>
              <span className="vx-cat-label">{cat.name}</span>
            </button>
          ))}

          <button className="vx-cat-item" aria-label="Ver todas las categorías">
            <div className="vx-cat-circle vx-cat-circle--more">
              <LayoutGrid size={22} />
            </div>
            <span className="vx-cat-label">Ver más</span>
          </button>
        </div>
      </div>
    </section>
  );
}