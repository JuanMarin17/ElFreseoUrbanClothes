import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllStores, getStoreSettingsByHeader } from '../../../../../multi-tenant/pages/services/storeService';
import './VexioStores.css';

const TAG_COLORS = ['gold', 'green', 'blue', 'purple'];
const TAG_LABELS = ['Destacada', 'Popular', 'Nueva', 'Top ventas'];

const getCover = (store) => {
  const banner = store.settings?.components?.banner;
  if (banner?.image) return { type: 'image', src: banner.image };
  if (banner?.bg)    return { type: 'color',  bg: banner.bg };
  return { type: 'color', bg: '#111827' };
};

const getLogo = (store) => {
  const logo = store.settings?.basic?.logoPreview
    ?? store.settings?.components?.header?.logo;
  return logo && logo.startsWith('http') ? logo : null;
};

const getAccent = (store) =>
  store.settings?.styles?.colorBoton ?? '#3e78ff';

export default function VexioStores() {
  const [stores,  setStores]  = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getAllStores()
      .then(async (data) => {
        const list = Array.isArray(data)
          ? data
          : (data?.content ?? data?.stores ?? data?.data ?? []);

        const active = list.filter((s) => s.isActive !== false).slice(0, 8);

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
      .catch(() => setStores([]))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && stores.length === 0) return null;

  const displayStores = stores.length > 0 ? [...stores, ...stores] : [];

  return (
    <section id="vx-stores" className="vx-section vx-section--dark">

      <div className="vx-section-head">
        <p className="vx-section-label">Comunidad</p>
        <h2 className="vx-section-title">Tiendas que están brillando</h2>
        <p className="vx-section-sub">
          Emprendedores reales con productos únicos. Descubre sus historias y apóyalos directamente.
        </p>
      </div>

      <div className="vx-marquee-wrapper">
        <div className={`vx-marquee-track${loading ? ' vx-marquee-track--paused' : ''}`}>
          {loading
            ? [...Array(6)].map((_, i) => (
                <div key={i} className="vx-store-card">
                  <div className="vx-store-cover-wrap vx-skel-cover" />
                  <div className="vx-store-logo-ring">
                    <div className="vx-skel-logo" />
                  </div>
                  <div className="vx-store-info">
                    <div className="vx-skel-line" style={{ width: '65%', marginBottom: 6 }} />
                    <div className="vx-skel-line" style={{ width: '40%' }} />
                    <div className="vx-skel-block" style={{ marginTop: 10 }} />
                    <div className="vx-skel-btn" />
                  </div>
                </div>
              ))
            : displayStores.map((store, i) => {
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
                    aria-hidden={i >= stores.length}
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
                        <img src={logo} alt={store.name} className="vx-store-logo-img" />
                      ) : (
                        <div className="vx-store-logo-initial" style={{ background: accent }}>
                          {initial}
                        </div>
                      )}
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
                      >
                        Visitar tienda →
                      </button>
                    </div>
                  </div>
                );
              })}
        </div>
      </div>

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
