import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Star, ThumbsUp, ThumbsDown, MessageSquare, Trash2,
  ChevronDown, ChevronUp, CheckCircle, AlertCircle,
  Loader, X, Plus, Edit3,
} from 'lucide-react';
import './ProductReviews.css';

/* ══════════════════════════════════════════════════════════
   CONFIGURACIÓN
   Ajusta el BASE_URL y el helper getToken() a tu proyecto
══════════════════════════════════════════════════════════ */

const BASE_URL = 'http://localhost:8080/api/v1/reviews';

/** Obtén el JWT de donde lo guardes: localStorage, contexto, etc. */
const getToken = () => localStorage.getItem('token') || '';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

/* ══════════════════════════════════════════════════════════
   CAPA DE API
══════════════════════════════════════════════════════════ */

async function handleRes(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `Error ${res.status}`);
  return data;
}

const api = {
  getByProduct: (productId) =>
    fetch(`${BASE_URL}/product/${productId}`, { headers: authHeaders() }).then(handleRes),

  getMyReviews: () =>
    fetch(`${BASE_URL}/me`, { headers: authHeaders() }).then(handleRes),

  create: (body) =>
    fetch(`${BASE_URL}/create`, {
      method: 'POST', headers: authHeaders(), body: JSON.stringify(body),
    }).then(handleRes),

  remove: (reviewId) =>
    fetch(`${BASE_URL}/${reviewId}`, {
      method: 'DELETE', headers: authHeaders(),
    }).then(handleRes),

  react: (reviewId, reactionType) =>
    fetch(`${BASE_URL}/${reviewId}/reactions`, {
      method: 'POST', headers: authHeaders(),
      body: JSON.stringify({ reactionType }),
    }).then(handleRes),

  getReplies: (reviewId) =>
    fetch(`${BASE_URL}/${reviewId}/replies`, { headers: authHeaders() }).then(handleRes),

  reply: (reviewId, body) =>
    fetch(`${BASE_URL}/${reviewId}/replies`, {
      method: 'POST', headers: authHeaders(),
      body: JSON.stringify({ body }),
    }).then(handleRes),
};

/* ══════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════ */

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function avg(reviews) {
  if (!reviews?.length) return 0;
  return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
}

function ratingDist(reviews) {
  const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => { if (dist[r.rating] !== undefined) dist[r.rating]++; });
  return dist;
}

/* ══════════════════════════════════════════════════════════
   STAR DISPLAY — estrellas de solo lectura
══════════════════════════════════════════════════════════ */
function Stars({ rating, size = 14 }) {
  return (
    <span className="rvx-stars" aria-label={`${rating} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={n <= rating ? 'rvx-star--fill' : 'rvx-star--empty'}
        />
      ))}
    </span>
  );
}

/* ══════════════════════════════════════════════════════════
   STAR SELECTOR — para el formulario de creación
══════════════════════════════════════════════════════════ */
function StarSelector({ value, onChange }) {
  const [hover, setHover] = useState(0);
  const labels = ['', 'Malo', 'Regular', 'Bueno', 'Muy bueno', 'Excelente'];

  return (
    <div className="rvx-star-selector">
      <div className="rvx-star-selector-row">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className={`rvx-star-btn ${n <= (hover || value) ? 'active' : ''}`}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(n)}
            aria-label={`${n} estrellas`}
          >
            <Star size={26} />
          </button>
        ))}
      </div>
      <span className="rvx-star-label">
        {labels[hover || value] || 'Selecciona una calificación'}
      </span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════════════════ */
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`rvx-toast rvx-toast--${type}`}>
      {type === 'error' ? <AlertCircle size={15} /> : <CheckCircle size={15} />}
      <span>{message}</span>
      <button onClick={onClose} className="rvx-toast-close"><X size={13} /></button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   FORMULARIO DE NUEVA RESEÑA
══════════════════════════════════════════════════════════ */
function ReviewForm({ productId, onCreated, onToast, onClose }) {
  const [rating,  setRating]  = useState(0);
  const [title,   setTitle]   = useState('');
  const [body,    setBody]    = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (rating === 0) { onToast('Selecciona al menos 1 estrella', 'error'); return; }
    try {
      setLoading(true);
      const review = await api.create({ productId, rating, title, body });
      onToast('¡Reseña publicada!', 'success');
      onCreated(review);
      onClose();
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rvx-form-overlay" onClick={onClose}>
      <div className="rvx-form-modal" onClick={(e) => e.stopPropagation()}>

        <div className="rvx-form-header">
          <h3 className="rvx-form-title">Escribe tu reseña</h3>
          <button className="rvx-icon-btn" onClick={onClose}><X size={17} /></button>
        </div>

        <form onSubmit={submit} className="rvx-form-body">

          {/* Selector de estrellas */}
          <div className="rvx-field">
            <label className="rvx-label">Calificación *</label>
            <StarSelector value={rating} onChange={setRating} />
          </div>

          {/* Título */}
          <div className="rvx-field">
            <label className="rvx-label" htmlFor="rvx-title">
              Título <span className="rvx-optional">(opcional)</span>
            </label>
            <input
              id="rvx-title"
              className="rvx-input"
              placeholder="Resumen breve de tu experiencia"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={80}
            />
            <span className="rvx-char-count">{title.length}/80</span>
          </div>

          {/* Cuerpo */}
          <div className="rvx-field">
            <label className="rvx-label" htmlFor="rvx-body">
              Comentario <span className="rvx-optional">(opcional)</span>
            </label>
            <textarea
              id="rvx-body"
              className="rvx-textarea"
              placeholder="Cuéntanos más sobre el producto, calidad, envío..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              maxLength={600}
            />
            <span className="rvx-char-count">{body.length}/600</span>
          </div>

          <div className="rvx-form-actions">
            <button type="button" className="rvx-btn-ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="rvx-btn-primary" disabled={loading}>
              {loading ? <Loader size={14} className="rvx-spin" /> : <Plus size={14} />}
              Publicar reseña
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SECCIÓN DE RESPUESTAS (replies de una reseña)
══════════════════════════════════════════════════════════ */
function RepliesSection({ reviewId, currentUserId, isStoreOwner, onToast }) {
  const [replies,  setReplies]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [replyTxt, setReplyTxt] = useState('');
  const [sending,  setSending]  = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await api.getReplies(reviewId);
        setReplies(data);
      } catch { /* silencia */ }
      finally { setLoading(false); }
    })();
  }, [reviewId]);

  const sendReply = async () => {
    if (!replyTxt.trim()) return;
    try {
      setSending(true);
      const r = await api.reply(reviewId, replyTxt.trim());
      setReplies((p) => [...p, r]);
      setReplyTxt('');
      onToast('Respuesta publicada', 'success');
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="rvx-replies">
      {loading && <div className="rvx-replies-loading"><Loader size={13} className="rvx-spin" /> Cargando...</div>}

      {replies.map((r) => (
        <div key={r.replyId} className="rvx-reply">
          <div className="rvx-reply-avatar">
            {r.userId === currentUserId ? 'Tú' : r.userId?.slice(0, 2).toUpperCase()}
          </div>
          <div className="rvx-reply-content">
            <span className="rvx-reply-author">
              {r.userId === currentUserId ? 'Tú' : 'Vendedor'}
              {isStoreOwner && r.userId !== currentUserId && (
                <span className="rvx-owner-badge">Tienda</span>
              )}
            </span>
            <p className="rvx-reply-text">{r.body}</p>
            <span className="rvx-reply-date">{formatDate(r.createdAt)}</span>
          </div>
        </div>
      ))}

      {/* Input para responder — solo si es dueño de tienda */}
      {isStoreOwner && (
        <div className="rvx-reply-input-row">
          <input
            className="rvx-reply-input"
            placeholder="Responde esta reseña como vendedor..."
            value={replyTxt}
            onChange={(e) => setReplyTxt(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) sendReply(); }}
            maxLength={400}
          />
          <button
            className="rvx-btn-primary rvx-btn-sm"
            onClick={sendReply}
            disabled={!replyTxt.trim() || sending}
          >
            {sending ? <Loader size={12} className="rvx-spin" /> : 'Responder'}
          </button>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TARJETA DE RESEÑA
══════════════════════════════════════════════════════════ */
function ReviewCard({ review, currentUserId, isStoreOwner, onDelete, onToast }) {
  const [repliesOpen, setRepliesOpen] = useState(false);
  const [deleting,    setDeleting]    = useState(false);
  const isAuthor = review.userId === currentUserId;

  const handleDelete = async () => {
    if (!window.confirm('¿Eliminar tu reseña? Esta acción no se puede deshacer.')) return;
    try {
      setDeleting(true);
      await api.remove(review.reviewId);
      onDelete(review.reviewId);
      onToast('Reseña eliminada', 'success');
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleReact = async (type) => {
    try {
      await api.react(review.reviewId, type);
      onToast(type === 'LIKE' ? '👍 ¡Gracias por tu reacción!' : '👎 Recibido', 'success');
    } catch (err) {
      onToast(err.message, 'error');
    }
  };

  return (
    <article className="rvx-card">

      {/* Cabecera de la card */}
      <div className="rvx-card-header">
        <div className="rvx-card-avatar">
          {review.userId?.slice(0, 2).toUpperCase() || '??'}
        </div>
        <div className="rvx-card-meta">
          <div className="rvx-card-top-row">
            <Stars rating={review.rating} size={13} />
            {review.isVerified && (
              <span className="rvx-verified-badge">
                <CheckCircle size={11} /> Compra verificada
              </span>
            )}
          </div>
          <span className="rvx-card-date">{formatDate(review.createdAt)}</span>
        </div>

        {/* Botón eliminar — solo el autor */}
        {isAuthor && (
          <button
            className="rvx-delete-btn"
            onClick={handleDelete}
            disabled={deleting}
            title="Eliminar reseña"
          >
            {deleting
              ? <Loader size={13} className="rvx-spin" />
              : <Trash2 size={13} />}
          </button>
        )}
      </div>

      {/* Contenido */}
      {review.title && <h4 className="rvx-card-title">{review.title}</h4>}
      {review.body  && <p  className="rvx-card-body">{review.body}</p>}

      {/* Acciones */}
      <div className="rvx-card-footer">
        <div className="rvx-reactions">
          <span className="rvx-helpful-label">¿Útil?</span>
          <button
            className="rvx-react-btn"
            onClick={() => handleReact('LIKE')}
            title="Me fue útil"
          >
            <ThumbsUp size={13} /> Sí
          </button>
          <button
            className="rvx-react-btn rvx-react-btn--dis"
            onClick={() => handleReact('DISLIKE')}
            title="No me fue útil"
          >
            <ThumbsDown size={13} /> No
          </button>
        </div>

        <button
          className="rvx-replies-toggle"
          onClick={() => setRepliesOpen((v) => !v)}
        >
          <MessageSquare size={13} />
          Respuestas
          {repliesOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {/* Respuestas expandibles */}
      {repliesOpen && (
        <RepliesSection
          reviewId={review.reviewId}
          currentUserId={currentUserId}
          isStoreOwner={isStoreOwner}
          onToast={onToast}
        />
      )}
    </article>
  );
}

/* ══════════════════════════════════════════════════════════
   RESUMEN VISUAL — barra de distribución de ratings
══════════════════════════════════════════════════════════ */
function RatingSummary({ reviews }) {
  const average = avg(reviews).toFixed(1);
  const dist    = ratingDist(reviews);
  const total   = reviews.length;

  return (
    <div className="rvx-summary">
      {/* Número grande */}
      <div className="rvx-summary-score">
        <span className="rvx-summary-num">{average}</span>
        <Stars rating={Math.round(avg(reviews))} size={18} />
        <span className="rvx-summary-total">{total} {total === 1 ? 'reseña' : 'reseñas'}</span>
      </div>

      {/* Barras por estrella */}
      <div className="rvx-summary-bars">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = dist[star] || 0;
          const pct   = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={star} className="rvx-bar-row">
              <span className="rvx-bar-label">{star}<Star size={10} className="rvx-star--fill" /></span>
              <div className="rvx-bar-track">
                <div className="rvx-bar-fill" style={{ width: `${pct}%` }} />
              </div>
              <span className="rvx-bar-count">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL — ProductReviews
   Props:
     productId     string  (requerido)
     currentUserId string  — ID del usuario autenticado
     isStoreOwner  bool    — true si es el dueño de la tienda
══════════════════════════════════════════════════════════ */
export default function ProductReviews({ productId, currentUserId, isStoreOwner = false }) {
  const [reviews,   setReviews]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [toast,     setToast]     = useState(null);
  const [sortBy,    setSortBy]    = useState('recent'); // 'recent' | 'highest' | 'lowest'

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  /* ── Carga de reseñas ── */
  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getByProduct(productId);
      setReviews(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [productId, showToast]);

  useEffect(() => { loadReviews(); }, [loadReviews]);

  /* ── ¿El usuario ya reseñó este producto? ── */
  const userReview = reviews.find((r) => r.userId === currentUserId);
  const canWrite   = currentUserId && !userReview;

  /* ── Orden de las reseñas ── */
  const sorted = [...reviews].sort((a, b) => {
    if (sortBy === 'highest') return b.rating - a.rating;
    if (sortBy === 'lowest')  return a.rating - b.rating;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  /* ── Al crear una reseña nueva ── */
  const onCreated = (review) => {
    setReviews((prev) => [review, ...prev]);
  };

  /* ── Al eliminar ── */
  const onDelete = (reviewId) => {
    setReviews((prev) => prev.filter((r) => r.reviewId !== reviewId));
  };

  return (
    <section className="rvx-root">

      {/* ── Encabezado de sección ── */}
      <div className="rvx-section-header">
        <div className="rvx-section-title-group">
          <h2 className="rvx-section-title">Reseñas del producto</h2>
          {!loading && reviews.length > 0 && (
            <span className="rvx-section-badge">{reviews.length}</span>
          )}
        </div>

        {/* Botón escribir reseña */}
        {canWrite && (
          <button className="rvx-btn-primary" onClick={() => setShowForm(true)}>
            <Edit3 size={14} /> Escribir reseña
          </button>
        )}
        {userReview && (
          <span className="rvx-already-badge">
            <CheckCircle size={13} /> Ya reseñaste este producto
          </span>
        )}
      </div>

      {/* ── Estado de carga ── */}
      {loading && (
        <div className="rvx-loading">
          <Loader size={22} className="rvx-spin" />
          <p>Cargando reseñas...</p>
        </div>
      )}

      {/* ── Sin reseñas ── */}
      {!loading && reviews.length === 0 && (
        <div className="rvx-empty">
          <Star size={36} className="rvx-empty-icon" />
          <p className="rvx-empty-title">Sin reseñas todavía</p>
          <p className="rvx-empty-sub">Sé el primero en compartir tu experiencia con este producto.</p>
          {canWrite && (
            <button className="rvx-btn-primary" onClick={() => setShowForm(true)}>
              <Edit3 size={14} /> Escribir la primera reseña
            </button>
          )}
        </div>
      )}

      {/* ── Resumen + lista ── */}
      {!loading && reviews.length > 0 && (
        <>
          {/* Resumen de calificaciones */}
          <RatingSummary reviews={reviews} />

          {/* Controles de orden */}
          <div className="rvx-controls">
            <span className="rvx-controls-label">Ordenar por</span>
            {[
              { k: 'recent',  label: 'Más recientes' },
              { k: 'highest', label: 'Mayor calificación' },
              { k: 'lowest',  label: 'Menor calificación' },
            ].map(({ k, label }) => (
              <button
                key={k}
                className={`rvx-sort-btn${sortBy === k ? ' active' : ''}`}
                onClick={() => setSortBy(k)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Lista de reseñas */}
          <div className="rvx-list">
            {sorted.map((review) => (
              <ReviewCard
                key={review.reviewId}
                review={review}
                currentUserId={currentUserId}
                isStoreOwner={isStoreOwner}
                onDelete={onDelete}
                onToast={showToast}
              />
            ))}
          </div>
        </>
      )}

      {/* ── Modal formulario ── */}
      {showForm && (
        <ReviewForm
          productId={productId}
          onCreated={onCreated}
          onToast={showToast}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* ── Toast ── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   EXPORT ADICIONAL — MyReviews (para el perfil del usuario)
   Uso: <MyReviewsPage currentUserId="uuid" />
══════════════════════════════════════════════════════════ */
export function MyReviewsPage({ currentUserId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast,   setToast]   = useState(null);

  const showToast = useCallback((msg, type = 'success') => setToast({ message: msg, type }), []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await api.getMyReviews();
        setReviews(data);
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, [showToast]);

  const onDelete = (reviewId) => setReviews((p) => p.filter((r) => r.reviewId !== reviewId));

  return (
    <section className="rvx-root">
      <div className="rvx-section-header">
        <div className="rvx-section-title-group">
          <h2 className="rvx-section-title">Mis reseñas</h2>
          {!loading && <span className="rvx-section-badge">{reviews.length}</span>}
        </div>
      </div>

      {loading && (
        <div className="rvx-loading"><Loader size={22} className="rvx-spin" /><p>Cargando...</p></div>
      )}

      {!loading && reviews.length === 0 && (
        <div className="rvx-empty">
          <Star size={36} className="rvx-empty-icon" />
          <p className="rvx-empty-title">No has escrito reseñas todavía</p>
          <p className="rvx-empty-sub">Cuando compres productos podrás dejar tu opinión.</p>
        </div>
      )}

      {!loading && reviews.length > 0 && (
        <div className="rvx-list">
          {reviews.map((review) => (
            <ReviewCard
              key={review.reviewId}
              review={review}
              currentUserId={currentUserId}
              isStoreOwner={false}
              onDelete={onDelete}
              onToast={showToast}
            />
          ))}
        </div>
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </section>
  );
}