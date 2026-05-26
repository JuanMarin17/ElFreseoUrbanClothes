import React, { useEffect, useRef } from 'react';
import './VexioReviews.css';

const REVIEWS = [
  {
    stars: 5,
    text: '"Pasamos de manejar pedidos por WhatsApp a tener una tienda completamente automatizada en menos de una semana. Vexio cambió la forma en que operamos."',
    name: 'Carlos Rodríguez',
    role: 'CEO · Moda Urbana CR',
    initials: 'CR',
    color: 'linear-gradient(135deg,#06b6d4,#7c3aed)',
  },
  {
    stars: 5,
    text: '"La integración con los carriers de logística nos ahorró más de 15 horas semanales en operación. El ROI fue evidente desde el primer mes."',
    name: 'Laura Martínez',
    role: 'Directora Ops · TechGear CO',
    initials: 'LM',
    color: 'linear-gradient(135deg,#f59e0b,#d97706)',
  },
  {
    stars: 5,
    text: '"El analytics avanzado nos permitió identificar exactamente qué productos convertían mejor. Aumentamos nuestras ventas un 40% en 3 meses."',
    name: 'Andrés Peña',
    role: 'Fundador · Hogar & Deco',
    initials: 'AP',
    color: 'linear-gradient(135deg,#06b6d4,#0284c7)',
  },
  {
    stars: 4,
    text: '"Teníamos miedo de migrar nuestra tienda de 1200 productos pero el equipo de Vexio nos acompañó en todo el proceso. La importación masiva funcionó perfectamente."',
    name: 'Sandra Vargas',
    role: 'Gerente · Naturalia Store',
    initials: 'SV',
    color: 'linear-gradient(135deg,#4ade80,#16a34a)',
  },
  {
    stars: 5,
    text: '"La API es robusta y bien documentada. Integramos nuestro ERP en dos días. Por fin un SaaS en Colombia que piensa en negocios serios."',
    name: 'Julián Ospina',
    role: 'CTO · Distribuidora Norte',
    initials: 'JO',
    color: 'linear-gradient(135deg,#f87171,#dc2626)',
  },
  {
    stars: 5,
    text: '"Manejo 3 tiendas distintas desde un solo panel. El plan Pro vale absolutamente cada peso. Soporte rápido y el producto mejora cada mes."',
    name: 'María Torres',
    role: 'Emprendedora · Kits & Co.',
    initials: 'MT',
    color: 'linear-gradient(135deg,#818cf8,#4f46e5)',
  },
];

export default function VexioReviews() {
  const cardsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('vx-visible');
      }),
      { threshold: 0.1 }
    );
    cardsRef.current.forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="vx-reviews" className="vx-section vx-section--dark">
      <div className="vx-section-head vx-section-head--center">
        <p className="vx-section-label">Reseñas</p>
        <h2 className="vx-section-title">Lo que dicen nuestros clientes</h2>
        <p className="vx-section-sub">Negocios reales que escalaron con Vexio.</p>
      </div>

      <div className="vx-reviews-grid">
        {REVIEWS.map((r, i) => (
          <div
            key={r.name}
            className="vx-review-card vx-reveal"
            ref={el => cardsRef.current[i] = el}
            style={{ transitionDelay: `${i * 80}ms` }}
          >
            <div className="vx-review-stars">
              {'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}
            </div>
            <p className="vx-review-text">{r.text}</p>
            <div className="vx-review-author">
              <div className="vx-review-avatar" style={{ background: r.color }}>
                {r.initials}
              </div>
              <div>
                <div className="vx-review-name">{r.name}</div>
                <div className="vx-review-role">{r.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
