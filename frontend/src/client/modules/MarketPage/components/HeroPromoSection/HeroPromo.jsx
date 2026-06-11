import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './HeroPromo.css';

export default function HeroPromo() {
  const navigate = useNavigate();

  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section className="vx-hero-root">
      <div className="blur-gradient blur-gradient--1" aria-hidden="true" />
      <div className="blur-gradient blur-gradient--2" aria-hidden="true" />

      <div className="vx-hero-inner vx-section-wrap">

        {/* ─── BLOQUE TEXTO PRINCIPAL ─── */}
        <div className="hero-content-fluid">
          <h1 className="hero-title">
            Descubre miles de tiendas
            <span className="hero-title--gradient"> y encuentra lo que te gusta</span>
          </h1>

          <p className="hero-subtitle">
            Explora productos únicos de emprendedores y marcas increíbles
            de todo el mundo, en un solo lugar descentralizado.
          </p>

          <div className="hero-ctas">
            <button className="vx-btn-cyan" onClick={() => scrollTo('market-stores')}>
              Explorar tiendas <ArrowRight size={16} />
            </button>
            <button className="vx-btn-ghost" onClick={() => scrollTo('market-products')}>
              Ver ofertas de hoy
            </button>
          </div>
        </div>

        {/* ─── BANNERS FLOTANTES ─── */}
        <div className="hero-floating-display">

          <div className="floating-card card-top">
            <img
              src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&q=80"
              alt="Nuevas tendencias"
              className="floating-card-img"
            />
            <div className="floating-card-overlay" />
            <div className="floating-card-content">
              <span className="floating-tag">NUEVOS PRODUCTOS</span>
              <h3>Todos los días</h3>
              <button className="floating-link" onClick={() => scrollTo('market-new-arrivals')}>
                Descubrir ahora <ArrowRight size={14} />
              </button>
            </div>
          </div>

          <div className="floating-card card-bottom">
            <img
              src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80"
              alt="Ofertas"
              className="floating-card-img"
            />
            <div className="floating-card-overlay" />
            <div className="floating-card-content">
              <span className="floating-tag tag-cyan">HASTA 70% OFF</span>
              <h3>En miles de productos</h3>
              <button className="floating-link tag-cyan" onClick={() => scrollTo('market-products')}>
                Ver ofertas <ArrowRight size={14} />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
