import React from 'react';
import './VexioHero.css';

const STATS = [
  { num: '+48,000', label: 'Productos disponibles' },
  { num: '+2,400',  label: 'Tiendas activas'       },
  { num: '18',      label: 'Ciudades con domicilio' },
  { num: '4.9★',    label: 'Calificación promedio'  },
];

const AVATARS = ['SR', 'MC', 'DP', 'AL'];

export default function VexioHero() {
  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section id="vx-hero" className="vx-hero">
      {/* Orbes de fondo */}
      <div className="vx-hero-orb vx-hero-orb--1" />
      <div className="vx-hero-orb vx-hero-orb--2" />
      <div className="vx-hero-orb vx-hero-orb--3" />

      <div className="vx-hero-inner">

        {/* Badge */}
       

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

        {/* CTA buttons — comprador primero */}
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
            Más de <strong>12,000 compradores</strong> ya descubren nuevas tiendas cada día
          </p>
        </div>

        {/* Stats — panel estilo dashboard */}
        <div className="vx-hero-stats">
          {STATS.map(({ num, label }) => (
            <div key={label} className="vx-hero-stat">
              <span className="vx-hero-stat-num">{num}</span>
              <span className="vx-hero-stat-label">{label}</span>
            </div>
          ))}
        </div>

        {/* CTA vendedor — secundario, abajo */}
        <div className="vx-hero-seller-nudge">
          ¿Tienes un negocio?{' '}
          <button
            className="vx-hero-seller-link"
            onClick={() => scrollTo('vx-seller')}
          >
            Crea tu tienda gratis →
          </button>
        </div>

      </div>
    </section>
  );
}
