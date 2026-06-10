import React from 'react';
import { ArrowRight, ShoppingBag, ShieldCheck, RefreshCw, Headphones, Zap } from 'lucide-react';
import './HeroPromo.css';

// ─────────────────────────────────────────────
// HeroPromoSection - Diseño Fluido y Abierto (Vexio Tailored)
// ─────────────────────────────────────────────
export default function HeroPromo() {
  return (
    <section className="vx-hero-root">
      {/* Luces orgánicas usando tus variables de color y glow */}
      <div className="blur-gradient blur-gradient--1" aria-hidden="true" />
      <div className="blur-gradient blur-gradient--2" aria-hidden="true" />

      <div className="vx-hero-inner vx-section-wrap">
        
        {/* ─── BLOQUE TEXTO PRINCIPAL (ABIERTO) ─── */}
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
            <button className="vx-btn-cyan">
              Explorar tiendas <ArrowRight size={16} />
            </button>
            <button className="vx-btn-ghost">
              Ver ofertas de hoy
            </button>
          </div>
        </div>

        {/* ─── BANNERS FLOTANTES ASIMÉTRICOS ─── */}
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
              <a href="/novedades" className="floating-link">
                Descubrir ahora <ArrowRight size={14} />
              </a>
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
              <a href="/ofertas" className="floating-link tag-cyan">
                Ver ofertas <ArrowRight size={14} />
              </a>
            </div>
          </div>

        </div>

      </div>

      

    </section>
  );
}