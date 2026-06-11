import React, { useEffect, useRef, useState } from 'react';
import { getUserReviews } from '../../../../../utils/reviewsStore';
import './VexioReviews.css';

/* Reseñas de vendedores/negocios — siempre presentes */
const SELLER_REVIEWS = [
  {
    id: 'sl-1',
    stars: 5,
    text: '"Pasamos de manejar pedidos por WhatsApp a tener una tienda completamente automatizada en menos de una semana. Vexio cambió la forma en que operamos."',
    name: 'Carlos Rodríguez',
    role: 'CEO · Moda Urbana CR',
    initials: 'CR',
    color: 'linear-gradient(135deg,#06b6d4,#7c3aed)',
  },
  {
    id: 'sl-2',
    stars: 5,
    text: '"La integración con los carriers de logística nos ahorró más de 15 horas semanales en operación. El ROI fue evidente desde el primer mes."',
    name: 'Laura Martínez',
    role: 'Directora Ops · TechGear CO',
    initials: 'LM',
    color: 'linear-gradient(135deg,#f59e0b,#d97706)',
  },
  {
    id: 'sl-3',
    stars: 5,
    text: '"El analytics avanzado nos permitió identificar exactamente qué productos convertían mejor. Aumentamos nuestras ventas un 40% en 3 meses."',
    name: 'Andrés Peña',
    role: 'Fundador · Hogar & Deco',
    initials: 'AP',
    color: 'linear-gradient(135deg,#06b6d4,#0284c7)',
  },
  {
    id: 'sl-4',
    stars: 4,
    text: '"Teníamos miedo de migrar nuestra tienda de 1200 productos pero el equipo de Vexio nos acompañó en todo el proceso. La importación masiva funcionó perfectamente."',
    name: 'Sandra Vargas',
    role: 'Gerente · Naturalia Store',
    initials: 'SV',
    color: 'linear-gradient(135deg,#4ade80,#16a34a)',
  },
  {
    id: 'sl-5',
    stars: 5,
    text: '"La API es robusta y bien documentada. Integramos nuestro ERP en dos días. Por fin un SaaS en Colombia que piensa en negocios serios."',
    name: 'Julián Ospina',
    role: 'CTO · Distribuidora Norte',
    initials: 'JO',
    color: 'linear-gradient(135deg,#f87171,#dc2626)',
  },
  {
    id: 'sl-6',
    stars: 5,
    text: '"Manejo 3 tiendas distintas desde un solo panel. El plan Pro vale absolutamente cada peso. Soporte rápido y el producto mejora cada mes."',
    name: 'María Torres',
    role: 'Emprendedora · Kits & Co.',
    initials: 'MT',
    color: 'linear-gradient(135deg,#818cf8,#4f46e5)',
  },
];

function StarsDisplay({ count }) {
  return (
    <div className="vx-review-stars" aria-label={`${count} de 5 estrellas`}>
      {'★'.repeat(count)}{'☆'.repeat(5 - count)}
    </div>
  );
}

function CommunityCard({ review, cardRef, delay }) {
  return (
    <div
      className="vx-review-card vx-review-card--community vx-reveal"
      ref={cardRef}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <span className="vx-community-badge">Comunidad Vexio</span>
      <StarsDisplay count={review.rating} />
      <p className="vx-review-text">"{review.text}"</p>
      <div className="vx-review-author">
        <div
          className="vx-review-avatar vx-review-avatar--circle"
          style={{ background: review.avatarColor }}
        >
          {review.initials}
        </div>
        <div>
          <div className="vx-review-name">{review.name}</div>
          <div className="vx-review-role">{review.date}</div>
        </div>
      </div>
    </div>
  );
}

function SellerCard({ review, cardRef, delay }) {
  return (
    <div
      className="vx-review-card vx-reveal"
      ref={cardRef}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <StarsDisplay count={review.stars} />
      <p className="vx-review-text">{review.text}</p>
      <div className="vx-review-author">
        <div className="vx-review-avatar" style={{ background: review.color }}>
          {review.initials}
        </div>
        <div>
          <div className="vx-review-name">{review.name}</div>
          <div className="vx-review-role">{review.role}</div>
        </div>
      </div>
    </div>
  );
}

export default function VexioReviews() {
  const [userReviews, setUserReviews] = useState([]);
  const cardsRef = useRef([]);

  /* Load user reviews from shared store */
  useEffect(() => {
    setUserReviews(getUserReviews());
  }, []);

  /* Intersection Observer for reveal animations */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add('vx-visible');
      }),
      { threshold: 0.1 }
    );
    cardsRef.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [userReviews]);

  const hasUserReviews = userReviews.length > 0;
  let idx = 0;

  return (
    <section id="vx-reviews" className="vx-section vx-section--dark">
      <div className="vx-section-head vx-section-head--center">
        <p className="vx-section-label">Reseñas</p>
        <h2 className="vx-section-title">Lo que dice nuestra comunidad</h2>
        <p className="vx-section-sub">Negocios y compradores reales que confían en Vexio.</p>
      </div>

      {/* Reseñas de usuarios del marketplace */}
      {hasUserReviews && (
        <div className="vx-reviews-block">
          <p className="vx-reviews-block-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" />
            </svg>
            De la comunidad
          </p>
          <div className="vx-reviews-grid">
            {userReviews.map((r) => {
              const i = idx++;
              return (
                <CommunityCard
                  key={r.id}
                  review={r}
                  cardRef={(el) => (cardsRef.current[i] = el)}
                  delay={i * 70}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Reseñas de vendedores/plataforma */}
      {hasUserReviews && (
        <p className="vx-reviews-block-label vx-reviews-block-label--sellers">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Vendedores verificados
        </p>
      )}

      <div className="vx-reviews-grid">
        {SELLER_REVIEWS.map((r) => {
          const i = idx++;
          return (
            <SellerCard
              key={r.id}
              review={r}
              cardRef={(el) => (cardsRef.current[i] = el)}
              delay={(i % 6) * 80}
            />
          );
        })}
      </div>
    </section>
  );
}
