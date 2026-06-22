import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllStores, getStoreSettingsByHeader } from '../../../../../multi-tenant/pages/services/storeService';
import './VexioStores.css';

const TAG_COLORS = ['gold', 'green', 'blue', 'purple', 'gold', 'green'];
const TAG_LABELS = ['Destacada', 'Popular', 'Nueva', 'Top ventas', 'Destacada', 'Popular'];

const normalize = (s) => s?.toLowerCase().replace(/[-_\s]/g, '') ?? '';

// Slugs exactos según la BD — fallback visual mientras carga la API
const SEED_STORES = [
  { storeId: 'seed-1', slug: 'kiora',       name: 'Kiora',       description: '', settings: {} },
  { storeId: 'seed-2', slug: 'transurbano', name: 'TransUrbano', description: '', settings: {} },
  { storeId: 'seed-3', slug: 'myacces',     name: 'MyAcess',     description: '', settings: {} },
  { storeId: 'seed-4', slug: 'bella-vita',  name: 'Bella Vita',  description: '', settings: {} },
  { storeId: 'seed-5', slug: 'multt-shop',  name: 'MultiShop',   description: '', settings: {} },
  { storeId: 'seed-6', slug: 'olysiar',     name: 'OLYSIAR',     description: '', settings: {} },
];

const getCover = (store) => {
  const banner = store.settings?.components?.banner;
  if (banner?.image) return { type: 'image', src: banner.image };
  if (banner?.bg)    return { type: 'color',  bg: banner.bg };
  return { type: 'color', bg: '#111827' };
};

const getLogo = (store) => {
  const s = store.settings ?? {};
  const logo = s.basic?.logoPreview
    ?? s.logoUrl
    ?? s.components?.header?.logoUrl
    ?? s.components?.header?.logo;
  return logo && typeof logo === 'string' && logo.trim() ? logo : null;
};

const getAccent = (store) =>
  store.settings?.styles?.colorBoton ?? '#3e78ff';

export default function VexioStores() {
  // Empieza con datos quemados — sin estado de carga
  const [stores, setStores] = useState(SEED_STORES);
  const navigate = useNavigate();

  useEffect(() => {
    getAllStores()
      .then(async (data) => {
        const list   = Array.isArray(data) ? data : (data?.content ?? data?.stores ?? data?.data ?? []);
        const active = list.filter((s) => s.isActive !== false);

        const matched = SEED_STORES.map((seed) => {
          const found = active.find(s => normalize(s.slug) === normalize(seed.slug));
          return found ? { ...seed, ...found, settings: {} } : seed;
        });
        setStores(matched);

        const withSettings = await Promise.all(
          matched.map(async (store) => {
            if (store.storeId?.startsWith('seed-')) return store;
            const settings = await getStoreSettingsByHeader(store.storeId).catch(() => null);
            return { ...store, settings: settings ?? {} };
          }),
        );
        setStores(withSettings);
      })
      .catch(() => {});
  }, []);

  const displayStores = [...stores, ...stores, ...stores];
  const [paused, setPaused] = useState(false);

  return (
    <section id="vx-stores" className="vx-section vx-stores-section">

      <div className="vx-section-head vx-section-head--center">
        <p className="vx-section-label">Tiendas</p>
        <h2 className="vx-section-title">Tiendas destacadas</h2>
        <p className="vx-section-sub">
          Emprendedores reales con productos únicos. Descubre sus historias y apóyalos directamente.
        </p>
      </div>

      <div
        className="vx-marquee-wrapper"
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        <div className={`vx-marquee-track${paused ? ' vx-marquee-track--paused' : ''}`}>
          {displayStores.map((store, i) => {
                const cover    = getCover(store);
                const logo     = getLogo(store);
                const accent   = getAccent(store);
                const tagColor = TAG_COLORS[i % TAG_COLORS.length];
                const tagLabel = TAG_LABELS[i % TAG_LABELS.length];
                const initial  = (store.name?.[0] ?? 'T').toUpperCase();
                const desc     = store.description
                  ?? store.settings?.components?.banner?.title
                  ?? '';

                return (
                  <div
                    key={`${store.storeId}-${i}`}
                    className="vx-store-card"
                    style={{ '--store-accent': accent }}
                    aria-hidden={i >= stores.length ? 'true' : undefined}
                  >
                    {/* Banner / Cover */}
                    <div className="vx-store-cover-wrap">
                      {cover.type === 'image' ? (
                        <img src={cover.src} alt="" className="vx-store-cover-img" loading="lazy" />
                      ) : (
                        <div className="vx-store-cover-color" style={{ background: cover.bg }} />
                      )}
                      <div className="vx-store-cover-overlay" />
                      <span className={`vx-store-tag vx-store-tag--${tagColor}`}>{tagLabel}</span>
                    </div>

                    {/* Logo superpuesto */}
                    <div className="vx-store-logo-ring">
                      {logo ? (
                        <img
                          src={logo}
                          alt={store.name}
                          className="vx-store-logo-img"
                          loading="eager"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            if (e.currentTarget.nextElementSibling) {
                              e.currentTarget.nextElementSibling.style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div
                        className="vx-store-logo-initial"
                        style={{ background: accent, display: logo ? 'none' : 'flex' }}
                      >
                        {initial}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="vx-store-info">
                      <div className="vx-store-name">{store.name}</div>
                      <div className="vx-store-category">{store.slug}.vexio.com</div>
                      {desc && <p className="vx-store-desc">{desc}</p>}
                      <button
                        className="vx-store-btn"
                        onClick={() => navigate(`/tienda/${store.slug}`)}
                        tabIndex={i >= stores.length ? -1 : 0}
                        aria-hidden={i >= stores.length ? 'true' : undefined}
                      >
                        Visitar tienda →
                      </button>
                    </div>
                  </div>
                );
              })}
        </div>
      </div>

      <div className="vx-stores-footer">
        <p className="vx-stores-footer-text">
          Únete a los <strong>6+ emprendedores</strong> que ya venden con Vexio.
        </p>
        <button className="vx-btn-ghost" onClick={() => navigate('/market')}>
          Ver todas las tiendas →
        </button>
      </div>

    </section>
  );
}
