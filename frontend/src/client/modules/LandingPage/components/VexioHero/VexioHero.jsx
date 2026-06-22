import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoreSettingsByHeader, getAllStores } from '../../../../../multi-tenant/pages/services/storeService';
import './VexioHero.css';

// ─── Constantes ───────────────────────────────────────────────────────────────

const AVATARS = ['SR', 'MC', 'DP', 'AL'];

const SEED_STORES = [
  { storeId: 'seed-1', slug: 'kiora',       name: 'Kiora',       color: '#3B82F6', settings: {} },
  { storeId: 'seed-2', slug: 'transurbano', name: 'TransUrbano', color: '#EC4899', settings: {} },
  { storeId: 'seed-3', slug: 'myacces',     name: 'MyAcess',     color: '#F59E0B', settings: {} },
  { storeId: 'seed-4', slug: 'bella-vita',  name: 'Bella Vita',  color: '#8B5CF6', settings: {} },
  { storeId: 'seed-5', slug: 'multt-shop',  name: 'MultiShop',   color: '#06B6D4', settings: {} },
  { storeId: 'seed-6', slug: 'olysiar',     name: 'OLYSIAR',     color: '#22C55E', settings: {} },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Elimina guiones, underscores y espacios para comparar slugs sin importar formato
const normalize = (s) => s?.toLowerCase().replace(/[-_\s]/g, '') ?? '';

function getLogoSrc(s) {
  const url = s.basic?.logoPreview
    ?? s.logoUrl
    ?? s.components?.header?.logo
    ?? s.components?.header?.logoUrl
    ?? null;
  return url && typeof url === 'string' && url.trim() ? url : null;
}

// ─── OrbitCard ────────────────────────────────────────────────────────────────

function OrbitCard({ store, index, total, onNavigate }) {
  const s         = store.settings ?? {};
  const angle     = (360 / total) * index;
  const initial   = (store.name?.[0] ?? 'T').toUpperCase();
  const logoSrc   = getLogoSrc(s);
  const bannerImg = s.components?.banner?.image ?? null;
  const bannerBg  = s.components?.banner?.bg ?? null;
  const accent    = s.styles?.colorBoton ?? store.color;

  return (
    <div
      className="vx-orbit-card"
      style={{ '--angle': angle, '--color': accent }}
      onClick={() => onNavigate(store.slug)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onNavigate(store.slug)}
      title={`Visitar ${store.name}`}
    >

      <div
        className="vx-orbit-card-banner"
        style={!bannerImg && bannerBg ? { background: bannerBg } : undefined}
      >
        {bannerImg && <img src={bannerImg} alt="" className="vx-orbit-card-banner-img" />}
        <div className="vx-orbit-card-banner-overlay" />

        {logoSrc ? (
          <img
            src={logoSrc}
            alt=""
            className="vx-orbit-card-logo"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.nextElementSibling) {
                e.currentTarget.nextElementSibling.style.display = 'flex';
              }
            }}
          />
        ) : null}

        <span
          className="vx-orbit-card-initial"
          style={{ color: accent, display: logoSrc ? 'none' : 'flex' }}
        >
          {initial}
        </span>
      </div>

      <div className="vx-orbit-card-info">
        <span className="vx-orbit-card-name">{store.name}</span>
        <span className="vx-orbit-card-cat">{store.slug}.vexio.com</span>
        <span className="vx-orbit-card-status">● Activa</span>
      </div>

    </div>
  );
}

// ─── VexioHero ────────────────────────────────────────────────────────────────

export default function VexioHero() {
  const [stores,     setStores]     = useState(SEED_STORES);
  const [totalCount, setTotalCount] = useState(null);
  const navigate = useNavigate();

  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    getAllStores()
      .then(async (data) => {
        const list   = Array.isArray(data) ? data : (data?.content ?? data?.stores ?? data?.data ?? []);
        const active = list.filter((s) => s.isActive !== false);
        setTotalCount(active.length);

        // Busca cada una de las 6 tiendas deseadas por slug normalizado
        // (ej: seed "bellavita" encuentra "bella-vita", "myaccess" encuentra "my-access")
        const matched = SEED_STORES.map((seed) => {
          const found = active.find(s => normalize(s.slug) === normalize(seed.slug));
          return found
            ? { ...found, color: seed.color, settings: {} }
            : seed; // fallback: seed estático si la tienda no existe en el backend
        });
        setStores(matched);

        // Carga logos y banners para las tiendas con storeId real
        const withSettings = await Promise.all(
          matched.map(async (store) => {
            if (store.storeId?.startsWith('seed-')) return store;
            const settings = await getStoreSettingsByHeader(store.storeId).catch(() => null);
            return { ...store, settings: settings ?? {} };
          }),
        );
        setStores(withSettings);
      })
      .catch(() => {}); // sin auth → queda el seed data estático
  }, []);

  return (
    <section id="vx-hero" className="vx-hero">
      <div className="vx-hero-orb vx-hero-orb--1" />
      <div className="vx-hero-orb vx-hero-orb--2" />
      <div className="vx-hero-orb vx-hero-orb--3" />

      <div className="vx-hero-inner">

        {/* ── Texto ── */}
        <div className="vx-hero-text">
          <h1 className="vx-hero-h1">
            Miles de tiendas.<br />
            <span className="vx-hero-h1-gradient">Un solo lugar.</span>
          </h1>

          <p className="vx-hero-sub">
            Descubre miles de productos de emprendedores reales, recibe domicilios rápidos
            y apoya el comercio local — todo en Vexio.
          </p>

          <div className="vx-hero-actions">
            <button className="vx-btn-primary" onClick={() => scrollTo('vx-categories')}>
              Explorar productos
            </button>
            <button className="vx-btn-ghost" onClick={() => scrollTo('vx-stores')}>
              Ver tiendas →
            </button>
          </div>

          <div className="vx-hero-social-proof">
            <div className="vx-hero-avatars">
              {AVATARS.map(a => (
                <div key={a} className="vx-hero-avatar">{a}</div>
              ))}
            </div>
            <p className="vx-hero-sp-text">
              Conecta con una comunidad de emprendedores en constante crecimiento
            </p>
          </div>

          <div className="vx-hero-seller-nudge">
            ¿Tienes un negocio?{' '}
            <button className="vx-hero-seller-link" onClick={() => scrollTo('vx-seller')}>
              Crea tu tienda gratis →
            </button>
          </div>

          {/* ── Logos de tiendas — solo visible en mobile (< 960px) ── */}
          <div className="vx-hero-stores-strip">
            {stores.map((store) => {
              const s       = store.settings ?? {};
              const logoSrc = getLogoSrc(s);
              const accent  = s.styles?.colorBoton ?? store.color;
              const initial = (store.name?.[0] ?? 'T').toUpperCase();
              return (
                <button
                  key={store.storeId}
                  className="vx-hero-store-chip"
                  style={{ '--chip-accent': accent }}
                  onClick={() => navigate(`/tienda/${store.slug}`)}
                  title={store.name}
                >
                  <span className="vx-hero-store-chip-logo">
                    {logoSrc ? (
                      <img
                        src={logoSrc}
                        alt={store.name}
                        className="vx-hero-store-chip-img"
                        loading="eager"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          if (e.currentTarget.nextElementSibling) {
                            e.currentTarget.nextElementSibling.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <span
                      className="vx-hero-store-chip-initial"
                      style={{ background: accent, display: logoSrc ? 'none' : 'flex' }}
                    >
                      {initial}
                    </span>
                  </span>
                  <span className="vx-hero-store-chip-name">{store.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Orbital ── */}
        <div className="vx-hero-visual">
          <div className="vx-orbit-scene">
            <div className="vx-orbit-ring">
              {stores.map((store, i) => (
                <OrbitCard
                  key={store.storeId}
                  store={store}
                  index={i}
                  total={stores.length}
                  onNavigate={(slug) => navigate(`/tienda/${slug}`)}
                />
              ))}
            </div>

            <div className="vx-orbit-center">
              <span className="vx-orbit-center-num">{totalCount ?? 6}</span>
              <span className="vx-orbit-center-label">tiendas</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
