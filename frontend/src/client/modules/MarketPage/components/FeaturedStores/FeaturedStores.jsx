import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Store } from 'lucide-react';
import { getAllStores, getStoreSettingsByHeader } from '../../../../../multi-tenant/pages/services/storeService';
import './FeaturedStores.css';

export default function FeaturedStores() {
  const [stores, setStores]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const gridRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError(null);

    getAllStores()
      .then(async (data) => {
        const all = Array.isArray(data)
          ? data
          : (data?.content ?? data?.stores ?? data?.data ?? []);

        const active = all.filter((s) => s.isActive);

        const withSettings = await Promise.all(
          active.map(async (store) => {
            try {
              const settings = await getStoreSettingsByHeader(store.storeId);
              return { ...store, settings: settings ?? {} };
            } catch {
              return { ...store, settings: {} };
            }
          }),
        );

        setStores(withSettings);
      })
      .catch((err) => setError(err.message ?? 'No se pudieron cargar las tiendas.'))
      .finally(() => setLoading(false));
  }, []);

  /* Intersection Observer para animación de entrada */
  useEffect(() => {
    if (!gridRef.current) return;
    const cards = gridRef.current.querySelectorAll('.vx-store-card');
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e, i) => {
          if (e.isIntersecting) {
            setTimeout(() => e.target.classList.add('vx-visible'), i * 80);
            obs.unobserve(e.target);
          }
        }),
      { threshold: 0.1 },
    );
    cards.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [stores]);

  const getCover = (store) => {
    const banner = store.settings?.components?.banner;
    if (banner?.image) return { type: 'image', src: banner.image };
    if (banner?.bg)    return { type: 'color', bg: banner.bg };
    return { type: 'color', bg: '#111827' };
  };

  const getLogo = (store) => {
    const logo = store.settings?.basic?.logoPreview
      ?? store.settings?.components?.header?.logo;
    return logo && logo.startsWith('http') ? logo : null;
  };

  const getAccent = (store) =>
    store.settings?.styles?.colorBoton ?? '#3e78ff';

  return (
    <section className="vx-fstores-root">
      <div className="vx-section-wrap">
        <div className="vx-section-head">
          <h2>Tiendas <span>destacadas</span></h2>
          <a href="/tiendas" className="vx-section-link">
            Ver todas <ArrowRight size={14} />
          </a>
        </div>

        {loading && (
          <div className="vx-fstores-loading">
            {[...Array(6)].map((_, i) => <div key={i} className="vx-store-skeleton" />)}
          </div>
        )}

        {!loading && error && (
          <div className="vx-fstores-empty">
            <Store size={28} />
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && stores.length === 0 && (
          <div className="vx-fstores-empty">
            <Store size={28} />
            <p>No hay tiendas activas por el momento.</p>
          </div>
        )}

        {!loading && !error && stores.length > 0 && (
          <div className="vx-fstores-grid" ref={gridRef}>
            {stores.map((store) => {
              const cover  = getCover(store);
              const logo   = getLogo(store);
              const accent = getAccent(store);
              const desc   = store.description
                ?? store.settings?.components?.banner?.title
                ?? '';

              const plan = store.settings?.plan?.name ?? null;

              return (
                <article
                  key={store.storeId}
                  className="vx-store-card"
                  style={{ '--store-accent': accent }}
                  onClick={() => navigate(`/tienda/${store.slug}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/tienda/${store.slug}`)}
                >
                  {/* Cover */}
                  <div className="vx-store-cover-wrap">
                    {cover.type === 'image' ? (
                      <img src={cover.src} alt={store.name} className="vx-store-cover" loading="lazy" />
                    ) : (
                      <div className="vx-store-cover-gradient" style={{ background: cover.bg }} />
                    )}
                    <div className="vx-store-cover-overlay" />
                    <span className="vx-store-badge">Activa</span>
                  </div>

                  {/* Avatar superpuesto — fuera del cover para no ser recortado */}
                  <div className="vx-store-avatar-ring">
                    {logo ? (
                      <img src={logo} alt="" className="vx-store-avatar" />
                    ) : (
                      <div className="vx-store-avatar-initials" style={{ background: accent }}>
                        {store.name?.[0]?.toUpperCase() ?? 'T'}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="vx-store-info">
                    <div className="vx-store-header">
                      <h4 className="vx-store-name">{store.name}</h4>
                      {plan && <span className="vx-store-plan">{plan}</span>}
                    </div>
                    {desc && <p className="vx-store-tagline">{desc}</p>}
                    <p className="vx-store-url">{store.slug}.freseo.com</p>
                    <div className="vx-store-divider" />
                    <button className="vx-store-btn">Visitar tienda →</button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
