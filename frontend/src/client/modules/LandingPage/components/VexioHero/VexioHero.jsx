import React, { useEffect, useState } from 'react';
import { getAllStores, getStoreSettingsByHeader } from '../../../../../multi-tenant/pages/services/storeService';
import './VexioHero.css';

const AVATARS = ['SR', 'MC', 'DP', 'AL'];

const ORBIT_COLORS = ['#3B82F6', '#EC4899', '#F59E0B', '#8B5CF6', '#06B6D4', '#22C55E'];

/* Usados mientras la API carga o si retorna menos de 3 tiendas */
const FALLBACK_STORES = [
  { storeId: 'f1', name: 'StepUp Store',       slug: 'stepup'   },
  { storeId: 'f2', name: 'Luna Cosmetics',     slug: 'luna'     },
  { storeId: 'f3', name: 'Raíces Artesanales', slug: 'raices'   },
  { storeId: 'f4', name: 'UrbanFit Co.',       slug: 'urbanfit' },
  { storeId: 'f5', name: 'TechZone',           slug: 'techzone' },
  { storeId: 'f6', name: 'Casa & Deco',        slug: 'casadeco' },
];

export default function VexioHero() {
  const [apiStores, setApiStores] = useState([]);

  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    getAllStores()
      .then(async (data) => {
        const list = Array.isArray(data)
          ? data
          : (data?.content ?? data?.stores ?? data?.data ?? []);
        const active = list.filter((s) => s.isActive !== false).slice(0, 6);
        if (active.length < 3) return;

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
        setApiStores(withSettings);
      })
      .catch(() => {/* usa fallback */});
  }, []);

  /* Usa tiendas reales si hay ≥3, si no muestra el fallback */
  const orbitStores = apiStores.length >= 3 ? apiStores : FALLBACK_STORES;

  return (
    <section id="vx-hero" className="vx-hero">
      <div className="vx-hero-orb vx-hero-orb--1" />
      <div className="vx-hero-orb vx-hero-orb--2" />
      <div className="vx-hero-orb vx-hero-orb--3" />

      <div className="vx-hero-inner">

        {/* Columna izquierda — texto */}
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
        </div>

        {/* Columna derecha — orbital 3D con tiendas reales */}
        <div className="vx-hero-visual" aria-hidden="true">
          <div className="vx-orbit-scene">
            <div className="vx-orbit-ring">
              {orbitStores.map((store, i) => {
                const angle = (360 / orbitStores.length) * i;
                const color = ORBIT_COLORS[i % ORBIT_COLORS.length];
                const initial = (store.name?.[0] ?? 'T').toUpperCase();

                const logo = store.settings?.basic?.logoPreview
                    ?? store.settings?.components?.header?.logo;
                  const logoUrl = logo && logo.startsWith('http') ? logo : null;

                  return (
                  <div
                    key={store.storeId}
                    className="vx-orbit-card"
                    style={{ '--angle': angle, '--color': color }}
                  >
                    {logoUrl ? (
                      <img src={logoUrl} alt="" className="vx-orbit-card-logo" />
                    ) : (
                      <span className="vx-orbit-card-initial" style={{ color }}>
                        {initial}
                      </span>
                    )}
                    <span className="vx-orbit-card-name">{store.name}</span>
                    <span className="vx-orbit-card-cat">
                      {store.slug}.vexio.com
                    </span>
                    <span className="vx-orbit-card-status">● Activa</span>
                  </div>
                );
              })}
            </div>

            {/* Centro estático */}
            <div className="vx-orbit-center">
              <span className="vx-orbit-center-num">
                {orbitStores === apiStores ? `${apiStores.length}` : '100+'}
              </span>
              <span className="vx-orbit-center-label">tiendas</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
