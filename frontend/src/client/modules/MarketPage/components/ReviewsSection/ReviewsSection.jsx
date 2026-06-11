import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../../admin/modules/auth/pages/hook/Useauth';
import {
  getUserReviews,
  addUserReview,
  hasUserAlreadyReviewed,
  toggleLike,
} from '../../../../../utils/reviewsStore';
import './ReviewsSection.css';

const STAR_LABELS = ['', 'Malo', 'Regular', 'Bueno', 'Muy bueno', 'Excelente'];
const GAP = 20;

/* ── Helpers ──────────────────────────────────────────────── */
function StarIcon({ filled }) {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={filled ? '#f59e0b' : 'transparent'}
        stroke={filled ? '#f59e0b' : 'rgba(245,158,11,0.25)'}
        strokeWidth="1.5" strokeLinejoin="round"
      />
    </svg>
  );
}

function Stars({ rating, size = 'md' }) {
  return (
    <div className={`rs-stars rs-stars--${size}`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className="rs-star-icon"><StarIcon filled={s <= rating} /></span>
      ))}
    </div>
  );
}

/* ── Tarjeta de reseña ────────────────────────────────────── */
function ReviewCard({ review, index, visible, cardW, isNew, isAuthenticated, onNavigateLogin }) {
  const [liked, setLiked]           = useState(false);
  const [likeCount, setLikeCount]   = useState(review.likes || 0);
  const [burst, setBurst]           = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  const handleLike = async () => {
    if (!isAuthenticated) { onNavigateLogin?.(); return; }
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      const result = await toggleLike(review.id);
      setLiked(result.liked);
      setLikeCount(result.likes);
      if (result.liked) {
        setBurst(true);
        setTimeout(() => setBurst(false), 600);
      }
    } catch {
      // optimistic fallback
      const next = !liked;
      setLiked(next);
      setLikeCount((c) => next ? c + 1 : c - 1);
      if (next) { setBurst(true); setTimeout(() => setBurst(false), 600); }
    } finally {
      setLikeLoading(false);
    }
  };

  return (
    <article
      className={`rs-card ${visible ? 'rs-card--visible' : ''} ${isNew ? 'rs-card--new' : ''}`}
      style={{
        '--rs-delay': `${index * 70}ms`,
        ...(cardW ? { flex: `0 0 ${cardW}px`, width: `${cardW}px` } : {}),
      }}
    >
      {isNew && <span className="rs-new-badge">Nuevo ✦</span>}

      <div className="rs-card-top">
        <div className="rs-avatar" style={{ '--rs-avatar-color': review.avatarColor }}>
          {review.initials}
        </div>
        <div className="rs-user-info">
          <span className="rs-user-name">{review.name}</span>
          {review.email
            ? <span className="rs-user-email">{review.email}</span>
            : <span className="rs-user-handle">{review.date}</span>
          }
        </div>
        <span className="rs-tag rs-tag--community">Comunidad</span>
      </div>

      {review.email && (
        <span className="rs-card-date">{review.date}</span>
      )}

      <Stars rating={review.rating} />
      <p className="rs-review-text">"{review.text}"</p>

      <div className="rs-card-footer">
        <button
          className={`rs-like-btn ${liked ? 'rs-like-btn--active' : ''}`}
          onClick={handleLike}
          disabled={likeLoading}
          aria-label="Me gusta"
        >
          {burst && <span className="rs-like-burst" />}
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              fill={liked ? '#ef4444' : 'transparent'}
              stroke={liked ? '#ef4444' : 'var(--vx-muted)'}
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
          <span>{likeCount}</span>
        </button>
      </div>
    </article>
  );
}

/* ── Auth gate (no logueado) ───────────────────────────────── */
function AuthGate() {
  const navigate = useNavigate();
  return (
    <div className="rs-auth-gate">
      <div className="rs-auth-gate-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" />
        </svg>
      </div>
      <div className="rs-auth-gate-body">
        <h4 className="rs-auth-gate-title">Solo usuarios registrados pueden opinar</h4>
        <p className="rs-auth-gate-sub">
          Inicia sesión para dejar tu reseña y que tu nombre aparezca en la comunidad Vexio.
        </p>
      </div>
      <div className="rs-auth-gate-actions">
        <button
          className="rs-auth-btn rs-auth-btn--primary"
          onClick={() => navigate('/login')}
        >
          Iniciar sesión
        </button>
        <button
          className="rs-auth-btn rs-auth-btn--ghost"
          onClick={() => navigate('/login/register')}
        >
          Registrarse gratis
        </button>
      </div>
    </div>
  );
}

/* ── Formulario inline (logueado) ─────────────────────────── */
function InlineReviewForm({ userName, userEmail, alreadyReviewed, onSubmit }) {
  const [rating, setRating]       = useState(0);
  const [hovered, setHovered]     = useState(0);
  const [text, setText]           = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]     = useState(false);
  const [apiError, setApiError]   = useState('');

  if (alreadyReviewed) {
    return (
      <div className="rs-already-reviewed">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div>
          <strong>Ya dejaste tu reseña</strong>
          <p>Tu opinión ya está visible en la comunidad. ¡Gracias!</p>
        </div>
      </div>
    );
  }

  const canSubmit = rating > 0 && text.trim().length >= 10 && text.trim().length <= 300;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setApiError('');
    try {
      await onSubmit(rating, text);
      setSuccess(true);
      setRating(0);
      setText('');
      setTimeout(() => setSuccess(false), 3500);
    } catch (err) {
      if (err.code === 409) {
        setApiError('Ya tienes una reseña publicada.');
      } else if (err.code === 401 || err.code === 403) {
        setApiError('Debes iniciar sesión para publicar una reseña.');
      } else {
        setApiError(err.message ?? 'Error al publicar. Inténtalo de nuevo.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rs-form-wrap">
      <div className="rs-form-wrap-inner">
        {/* Encabezado */}
        <div className="rs-form-header">
          <span className="rs-form-eyebrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" />
            </svg>
            Deja tu reseña
          </span>
          <h3 className="rs-form-title">¿Cómo fue tu experiencia con Vexio?</h3>
          <p className="rs-form-sub">Tu reseña aparece aquí mismo, con tu nombre, para toda la comunidad.</p>
        </div>

        {/* Info del usuario (read-only) */}
        <div className="rs-form-user-info">
          <div className="rs-form-user-avatar">
            {userName.slice(0, 2).toUpperCase()}
          </div>
          <div className="rs-form-user-details">
            <span className="rs-form-user-name">{userName}</span>
            <span className="rs-form-user-email">{userEmail}</span>
          </div>
          <span className="rs-form-user-badge">Sesión activa</span>
        </div>

        <form className="rs-inline-form" onSubmit={handleSubmit}>
          {/* Stars picker */}
          <div className="rs-form-stars-col">
            <div className="rs-form-stars-row">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`rs-form-star ${(hovered || rating) >= s ? 'rs-form-star--on' : ''}`}
                  onMouseEnter={() => setHovered(s)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setRating(s)}
                  aria-label={`${s} estrellas`}
                >
                  <StarIcon filled={(hovered || rating) >= s} />
                </button>
              ))}
            </div>
            <p className="rs-form-star-label">
              {STAR_LABELS[hovered || rating] || 'Selecciona puntuación'}
            </p>
          </div>

          {/* Textarea */}
          <div className="rs-form-fields-col">
            <div className="rs-form-textarea-wrap">
              <textarea
                className="rs-form-textarea"
                placeholder="Cuéntanos tu experiencia con Vexio... (mín. 10 caracteres)"
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={300}
                rows={3}
              />
              <span className="rs-form-char">{text.length}/300</span>
            </div>
            <div className="rs-form-actions">
              {success && (
                <span className="rs-form-success">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  ¡Reseña publicada!
                </span>
              )}
              {apiError && (
                <span className="rs-form-error">{apiError}</span>
              )}
              <button
                type="submit"
                className={`rs-form-submit ${submitting ? 'rs-form-submit--loading' : ''}`}
                disabled={!canSubmit || submitting}
              >
                {submitting ? <span className="rs-spinner" /> : (
                  <>
                    Publicar reseña
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Skeleton de carga ────────────────────────────────────── */
function ReviewSkeleton({ cardW }) {
  return (
    <article
      className="rs-card rs-card--skeleton"
      style={cardW ? { flex: `0 0 ${cardW}px`, width: `${cardW}px` } : {}}
    >
      <div className="rs-sk-avatar" />
      <div className="rs-sk-line rs-sk-line--short" />
      <div className="rs-sk-line rs-sk-line--stars" />
      <div className="rs-sk-line" />
      <div className="rs-sk-line rs-sk-line--medium" />
    </article>
  );
}

/* ── Componente principal ─────────────────────────────────── */
export default function ReviewsSection() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth() || {};
  const userName  = user?.userName || user?.name || '';
  const userEmail = user?.email || localStorage.getItem('last_email') || '';

  const [reviews, setReviews]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [totalReviews, setTotalReviews]   = useState(0);
  const [newId, setNewId]                 = useState(null);
  const [visible, setVisible]             = useState(false);
  const [activeIndex, setActiveIndex]     = useState(0);
  const [paused, setPaused]               = useState(false);
  const [perView, setPerView]             = useState(3);
  const [cardW, setCardW]                 = useState(null);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  const sectionRef  = useRef(null);
  const viewportRef = useRef(null);

  // Cargar reseñas desde la API
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getUserReviews(1, 50, "newest").then(({ data, total }) => {
      if (cancelled) return;
      setReviews(data);
      setTotalReviews(total);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  // Verificar si el usuario ya reseñó
  useEffect(() => {
    if (!isAuthenticated) { setAlreadyReviewed(false); return; }
    hasUserAlreadyReviewed().then(setAlreadyReviewed);
  }, [isAuthenticated]);

  // IntersectionObserver para animaciones de entrada
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  // Cálculo de tarjetas visibles según ancho
  useEffect(() => {
    const calc = () => {
      if (!viewportRef.current) return;
      const w = viewportRef.current.offsetWidth;
      const pv = w > 900 ? 3 : w > 600 ? 2 : 1;
      setPerView(pv);
      setCardW((w - GAP * (pv - 1)) / pv);
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  useEffect(() => {
    setActiveIndex((i) => Math.min(i, Math.max(0, reviews.length - perView)));
  }, [perView, reviews.length]);

  const go = useCallback((dir) => {
    setActiveIndex((i) => {
      const max = Math.max(0, reviews.length - perView);
      const n = i + dir;
      return n < 0 ? max : n > max ? 0 : n;
    });
  }, [reviews.length, perView]);

  useEffect(() => {
    if (paused || !visible || loading) return;
    const id = setInterval(() => go(1), 4000);
    return () => clearInterval(id);
  }, [paused, visible, loading, go]);

  const handleNewReview = async (rating, text) => {
    const review = await addUserReview(rating, text);
    setReviews((prev) => [review, ...prev]);
    setTotalReviews((t) => t + 1);
    setNewId(review.id);
    setActiveIndex(0);
    setAlreadyReviewed(true);
    setTimeout(() => setNewId(null), 4000);
  };

  const displayReviews = reviews;
  const avgRating = displayReviews.length
    ? (displayReviews.slice(0, 20).reduce((a, r) => a + r.rating, 0) / Math.min(displayReviews.length, 20)).toFixed(1)
    : "—";
  const dist = [5, 4, 3, 2, 1].map((s) => ({
    star: s,
    pct: displayReviews.length
      ? Math.round((displayReviews.filter((r) => r.rating === s).length / displayReviews.length) * 100)
      : 0,
  }));
  const trackOffset   = cardW ? activeIndex * (cardW + GAP) : 0;
  const currentMaxIdx = Math.max(0, displayReviews.length - perView);

  return (
    <section className="rs-section" ref={sectionRef}>
      <div className="rs-orb rs-orb--1" aria-hidden="true" />
      <div className="rs-orb rs-orb--2" aria-hidden="true" />

      <div className="rs-container">
        {/* Header */}
        <div className={`rs-header ${visible ? 'rs-header--visible' : ''}`}>
          <span className="rs-eyebrow">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            Reseñas de la comunidad
          </span>
          <h2 className="rs-title">
            Lo que dicen nuestros <span className="rs-title-accent">usuarios</span>
          </h2>
          <p className="rs-subtitle">
            Reseñas reales de compradores y vendedores verificados de Vexio.
          </p>
        </div>

        {/* Resumen */}
        <div className={`rs-summary ${visible ? 'rs-summary--visible' : ''}`}>
          <div className="rs-summary-score">
            <span className="rs-big-rating">{avgRating}</span>
            <Stars rating={5} size="lg" />
            <span className="rs-total-reviews">{totalReviews || displayReviews.length} reseñas</span>
          </div>
          <div className="rs-summary-bars">
            {dist.map(({ star, pct }) => (
              <div key={star} className="rs-bar-row">
                <span className="rs-bar-label">{star}</span>
                <div className="rs-bar-track">
                  <div
                    className={`rs-bar-fill ${visible ? 'rs-bar-fill--animated' : ''}`}
                    style={{ '--rs-bar-w': `${pct}%` }}
                  />
                </div>
                <span className="rs-bar-pct">{pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Carrusel */}
        <div
          className="rs-carousel-wrap"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <button className="rs-nav-btn" onClick={() => go(-1)} aria-label="Anterior">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="rs-track-viewport" ref={viewportRef}>
            <div className="rs-track" style={{ transform: `translateX(-${trackOffset}px)` }}>
              {loading
                ? Array.from({ length: perView }).map((_, i) => (
                    <ReviewSkeleton key={i} cardW={cardW} />
                  ))
                : displayReviews.length === 0
                  ? (
                    <div style={{ padding: '32px 0', color: 'var(--vx-muted)', fontSize: 15 }}>
                      Aún no hay reseñas. ¡Sé el primero en opinar!
                    </div>
                  )
                  : displayReviews.map((r, i) => (
                    <ReviewCard
                      key={r.id}
                      review={r}
                      index={i}
                      visible={visible}
                      cardW={cardW}
                      isNew={r.id === newId}
                      isAuthenticated={isAuthenticated}
                      onNavigateLogin={() => navigate('/login')}
                    />
                  ))
              }
            </div>
          </div>

          <button className="rs-nav-btn" onClick={() => go(1)} aria-label="Siguiente">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Dots */}
        {!loading && displayReviews.length > 0 && (
          <div className="rs-dots">
            {Array.from({ length: currentMaxIdx + 1 }).map((_, i) => (
              <button
                key={i}
                className={`rs-dot ${i === activeIndex ? 'rs-dot--active' : ''}`}
                onClick={() => setActiveIndex(i)}
                aria-label={`Página ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Form / Auth gate */}
        {isAuthenticated
          ? <InlineReviewForm
              userName={userName}
              userEmail={userEmail}
              alreadyReviewed={alreadyReviewed}
              onSubmit={handleNewReview}
            />
          : <AuthGate />
        }
      </div>
    </section>
  );
}
