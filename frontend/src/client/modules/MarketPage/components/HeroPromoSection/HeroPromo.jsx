import React from 'react';
import { ArrowRight, ShoppingBag, ShieldCheck, RefreshCw, Headphones, Zap } from 'lucide-react';
import './HeroPromo.css';

// ─────────────────────────────────────────────
// HeroPromoSection
// 🔌 API TODO: los banners laterales pueden venir
//    de GET /api/banners?position=hero-side
// ─────────────────────────────────────────────
export default function HeroPromoSection() {
  return (
    <section className="vx-hero-root">
      <div className="vx-hero-inner vx-section-wrap">

        {/* ─── CARD PRINCIPAL IZQUIERDA ─── */}
        <div className="hero-main-card">
          {/* Destellos decorativos de fondo */}
          <div className="hero-glow hero-glow--top"    aria-hidden />
          <div className="hero-glow hero-glow--bottom" aria-hidden />

          <div className="hero-eyebrow">
            <Zap size={13} />
            <span>Marketplace global de emprendedores</span>
          </div>

          <h1 className="hero-title">
            Descubre miles de tiendas<br />
            <span className="hero-title--cyan">y encuentra lo que te gusta</span>
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
              Ver ofertas
            </button>
          </div>

          <div className="hero-features-bar">
            <div className="hero-feat">
              <ShoppingBag size={15} />
              <span>Miles de tiendas disponibles</span>
            </div>
            <div className="hero-feat">
              <ShieldCheck size={15} />
              <span>Pagos seguros y protegidos</span>
            </div>
            <div className="hero-feat">
              <RefreshCw size={15} />
              <span>Devoluciones fáciles</span>
            </div>
            <div className="hero-feat">
              <Headphones size={15} />
              <span>Atención 24/7</span>
            </div>
          </div>
        </div>

        {/* ─── BANNERS LATERALES DERECHOS ─── */}
        {/* 🔌 Reemplazar src e info con datos de API */}
        <div className="hero-side-banners">
          <div className="side-card">
            <img
              src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&q=80"
              alt="Nuevas tendencias"
              className="side-card-img"
            />
            <div className="side-card-overlay" />
            <div className="side-card-body">
              <span className="side-tag side-tag--muted">NUEVOS PRODUCTOS</span>
              <h3>todos los días</h3>
              <a href="/novedades" className="side-card-link">
                Descubrir ahora <ArrowRight size={13} />
              </a>
            </div>
          </div>

          <div className="side-card">
            <img
              src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80"
              alt="Ofertas hasta 70% off"
              className="side-card-img"
            />
            <div className="side-card-overlay" />
            <div className="side-card-body">
              <span className="side-tag side-tag--cyan">HASTA 70% OFF</span>
              <h3>en miles de productos</h3>
              <a href="/ofertas" className="side-card-link side-card-link--cyan">
                Ver ofertas <ArrowRight size={13} />
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
