import React from 'react';
import { useNavigate } from 'react-router-dom';
import VexioNav        from '../../components/VexioNav/VexioNav';
import VexioHero       from '../../components/VexioHero/VexioHero';
import VexioCategories from '../../components/VexioCategories/VexioCategories';
import VexioHowItWorks from '../../components/VexioHowItWorks/VexioHowItWorks';
import VexioStores     from '../../components/VexioStores/VexioStores';
import VexioSeller     from '../../components/VexioSeller/VexioSeller';
import VexioPricing    from '../../components/VexioPricing/VexioPricing';
import VexioReviews    from '../../components/VexioReviews/VexioReviews';
import VexioFaq        from '../../components/VexioFaq/VexioFaq';
import VexioFooter     from '../../components/VexioFooter/VexioFooter';
import './VexioLanding.css';

export default function VexioLanding() {
  const navigate = useNavigate();
  return (
    <div className="vx-landing">
      <VexioNav />
      <main>
        {/* 1. Hero — enfocado en el comprador */}
        <VexioHero />

        {/* 2. Categorías / productos destacados */}
        <VexioCategories />

        {/* 3. Cómo funciona — tabs comprador / vendedor */}
        <VexioHowItWorks />

        {/* 4. Tiendas destacadas */}
        <VexioStores />

        {/* 5. Propuesta para vendedores — secundaria */}
        <VexioSeller />

        {/* 6. Planes (vendedores) */}
        <VexioPricing />

        {/* 7. Reseñas y FAQ */}
        <VexioReviews />
        <VexioFaq />

        {/* CTA final orientado al comprador */}
        <section className="vx-cta-section">
          <div className="vx-cta-inner">
            <div className="vx-cta-orb" />
            <h2 className="vx-cta-title">Miles de productos. Una sola app.</h2>
            <p className="vx-cta-sub">
              Descubre tiendas de emprendedores reales, recibe en tu puerta y paga como prefieras.
              Totalmente gratis para compradores.
            </p>
            <div className="vx-cta-actions">
              <button className="vx-btn-primary" onClick={() => navigate('/market')}>Explorar productos</button>
              <button className="vx-btn-ghost" onClick={() => navigate('/market')}>Ver tiendas →</button>
            </div>
          </div>
        </section>
      </main>
      <VexioFooter />
    </div>
  );
}
