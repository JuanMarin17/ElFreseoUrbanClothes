import React, { useEffect, useRef, useState } from 'react';
import { getUserReviews } from '../../../../../utils/reviewsStore';
import './VexioReviews.css';

function StarsDisplay({ count }) {
  return (
    <div className="vx-review-stars" aria-label={`${count} de 5 estrellas`}>
      {'★'.repeat(count)}{'☆'.repeat(5 - count)}
    </div>
  );
}

function ReviewCard({ review, cardRef, delay }) {
  return (
    <div
      className="vx-review-card vx-review-card--community vx-reveal"
      ref={cardRef}
      style={{ '--delay': `${delay}ms` }}
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

export default function VexioReviews() {
  const [reviews, setReviews] = useState([]);
  const cardsRef = useRef([]);

  useEffect(() => {
    getUserReviews(1, 50, 'newest').then(({ data }) => setReviews(data));
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add('vx-visible');
      }),
      { threshold: 0.1 }
    );
    cardsRef.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [reviews]);

  if (reviews.length === 0) return null;

  return (
    <section id="vx-reviews" className="vx-section vx-section--dark">
      <div className="vx-section-head vx-section-head--center">
        <p className="vx-section-label">Reseñas</p>
        <h2 className="vx-section-title">Lo que dice nuestra comunidad</h2>
        <p className="vx-section-sub">Negocios y compradores reales que confían en Vexio.</p>
      </div>

      <div className="vx-reviews-grid">
        {reviews.slice(0, 9).map((r, i) => (
          <ReviewCard
            key={r.id}
            review={r}
            cardRef={(el) => (cardsRef.current[i] = el)}
            delay={i * 70}
          />
        ))}
      </div>
    </section>
  );
}
