import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllStores } from '../../../../../multi-tenant/pages/services/storeService';
import './VexioStores.css';

const AVATAR_COLORS = ['pink', 'orange', 'teal', 'purple', 'blue'];
const TAG_COLORS    = ['gold', 'green', 'blue', 'purple'];
const TAG_LABELS    = ['Destacada', 'Popular', 'Nueva', 'Top ventas'];

export default function VexioStores() {
  const [stores,  setStores]  = useState([]);
  const [loading, setLoading] = useState(true);
  const cardsRef = useRef([]);
  const navigate = useNavigate();

  // Carga tiendas activas (máx 4)
  useEffect(() => {
    getAllStores()
      .then((data) => {
        const list = Array.isArray(data)
          ? data
          : (data?.content ?? data?.stores ?? data?.data ?? []);
        setStores(list.filter((s) => s.isActive !== false).slice(0, 4));
      })
      .catch(() => setStores([]))
      .finally(() => setLoading(false));
  }, []);

  // Animación de entrada con IntersectionObserver
  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add('vx-visible');
      }),
      { threshold: 0.1 },
    );
    cardsRef.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [loading, stores]);

  // No renderizar si no hay tiendas y ya terminó de cargar
  if (!loading && stores.length === 0) return null;

  return (
    <section id="vx-stores" className="vx-section vx-section--dark">

      <div className="vx-section-head">
        <p className="vx-section-label">Comunidad</p>
        <h2 className="vx-section-title">Tiendas que están brillando</h2>
        <p className="vx-section-sub">
          Emprendedores reales con productos únicos. Descubre sus historias y apóyalos directamente.
        </p>
      </div>

      <div className="vx-stores-grid">
        {loading
          ? /* Skeleton mientras carga */
            [...Array(4)].map((_, i) => (
              <div key={i} className="vx-store-card" style={{ opacity: 0.35, pointerEvents: 'none' }}>
                <div className="vx-store-header">
                  <div
                    className="vx-store-avatar vx-store-avatar--blue"
                    style={{ background: 'rgba(37,99,255,0.06)' }}
                  />
                  <div className="vx-store-meta">
                    <div style={{ height: 11, background: 'var(--vx-border)', borderRadius: 4, width: '65%', marginBottom: 6 }} />
                    <div style={{ height: 9,  background: 'var(--vx-border)', borderRadius: 4, width: '45%' }} />
                  </div>
                </div>
                <div style={{ height: 60, background: 'var(--vx-border)', borderRadius: 10, opacity: 0.5 }} />
                <div style={{ height: 34, background: 'var(--vx-border)', borderRadius: 7 }} />
              </div>
            ))
          : stores.map((store, i) => {
              const color    = AVATAR_COLORS[i % AVATAR_COLORS.length];
              const tagColor = TAG_COLORS[i % TAG_COLORS.length];
              const tagLabel = TAG_LABELS[i % TAG_LABELS.length];
              const initial  = (store.name?.[0] ?? 'T').toUpperCase();

              return (
                <div
                  key={store.storeId}
                  className="vx-store-card vx-reveal"
                  ref={(el) => (cardsRef.current[i] = el)}
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  {/* Cabecera: avatar + nombre + tag */}
                  <div className="vx-store-header">
                    <div className={`vx-store-avatar vx-store-avatar--${color}`}>
                      {initial}
                    </div>
                    <div className="vx-store-meta">
                      <div className="vx-store-name">{store.name}</div>
                      <div className="vx-store-category">{store.slug}.vexio.com</div>
                    </div>
                    <span className={`vx-store-tag vx-store-tag--${tagColor}`}>{tagLabel}</span>
                  </div>

                  {/* Descripción si existe */}
                  {store.description && (
                    <p style={{
                      fontSize: '0.82rem',
                      color: 'var(--vx-muted)',
                      lineHeight: 1.55,
                      margin: 0,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {store.description}
                    </p>
                  )}

                  {/* Botón */}
                  <button
                    className="vx-store-btn"
                    onClick={() => navigate(`/tienda/${store.slug}`)}
                  >
                    Visitar tienda →
                  </button>
                </div>
              );
            })}
      </div>

      {/* Footer de sección */}
      {!loading && stores.length > 0 && (
        <div className="vx-stores-footer">
          <p className="vx-stores-footer-text">
            Únete a los <strong>{stores.length}+ emprendedores</strong> que ya venden con Vexio.
          </p>
          <button className="vx-btn-ghost" onClick={() => navigate('/market')}>
            Ver todas las tiendas →
          </button>
        </div>
      )}

    </section>
  );
}
