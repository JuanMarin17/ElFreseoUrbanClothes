import React from 'react';
import './VexioHero.css';

const AVATARS = ['SR', 'MC', 'DP', 'AL'];

export default function VexioHero() {
  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section id="vx-hero" className="vx-hero">
      <div className="vx-hero-orb vx-hero-orb--1" />
      <div className="vx-hero-orb vx-hero-orb--2" />
      <div className="vx-hero-orb vx-hero-orb--3" />

      <div className="vx-hero-inner">


        {/* Heading */}
        <h1 className="vx-hero-h1">
          Miles de tiendas.<br />
          <span className="vx-hero-h1-gradient">Un solo lugar.</span>
        </h1>

        {/* Subtítulo */}
        <p className="vx-hero-sub">
          Descubre miles de productos de emprendedores reales, recibe domicilios rápidos
          y apoya el comercio local — todo en Vexio.
        </p>

        {/* CTAs */}
        <div className="vx-hero-actions">
          <button className="vx-btn-primary" onClick={() => scrollTo('vx-categories')}>
            Explorar productos
          </button>
          <button className="vx-btn-ghost" onClick={() => scrollTo('vx-stores')}>
            Ver tiendas →
          </button>
        </div>

        {/* Social proof */}
        <div className="vx-hero-social-proof">
          <div className="vx-hero-avatars">
            {AVATARS.map(a => (
              <div key={a} className="vx-hero-avatar">{a}</div>
            ))}
          </div>
          <p className="vx-hero-sp-text">
            Descubre tiendas únicas y conecta con una comunidad en constante crecimiento
          </p>
        </div>

        {/* CTA vendedor */}
        <div className="vx-hero-seller-nudge">
          ¿Tienes un negocio?{' '}
          <button className="vx-hero-seller-link" onClick={() => scrollTo('vx-seller')}>
            Crea tu tienda gratis →
          </button>
        </div>

      </div>
    </section>
  );
}