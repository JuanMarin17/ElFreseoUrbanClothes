import React, { useEffect, useRef } from 'react';
import './VexioPricing.css';
import SelectPlan from '../../../../../multi-tenant/pages/SelectPlan';

const PLANS = [
  {
    name: 'Starter',
    price: '89.900',
    featured: false,
    features: [
      { text: '1 tienda activa', active: true },
      { text: 'Hasta 200 productos', active: true },
      { text: 'Panel de analytics básico', active: true },
      { text: 'Pasarela de pagos incluida', active: true },
      { text: 'Soporte por email (48h)', active: true },
      { text: 'Integraciones avanzadas', active: false },
      { text: 'API Access', active: false },
      { text: 'Gestor de logística', active: false },
    ],
    cta: 'Comenzar gratis 14 días',
    ctaStyle: 'outline',
  },
  {
    name: 'Pro',
    price: '219.900',
    featured: true,
    features: [
      { text: 'Hasta 3 tiendas activas', active: true },
      { text: 'Productos ilimitados', active: true },
      { text: 'Analytics avanzado + reportes', active: true },
      { text: 'Pasarela multi-método de pago', active: true },
      { text: 'Logística conectada (3 carriers)', active: true },
      { text: 'Integraciones (WhatsApp, Meta)', active: true },
      { text: 'Soporte prioritario (4h)', active: true },
      { text: 'API Access dedicada', active: false },
    ],
    cta: 'Elegir Pro',
    ctaStyle: 'solid',
  },
  {
    name: 'Enterprise',
    price: '489.900',
    featured: false,
    features: [
      { text: 'Tiendas ilimitadas', active: true },
      { text: 'Productos y variantes ilimitados', active: true },
      { text: 'Analytics enterprise + BI export', active: true },
      { text: 'Todos los métodos de pago', active: true },
      { text: 'Logística (todos los carriers)', active: true },
      { text: 'API Access + webhooks dedicados', active: true },
      { text: 'Gestor de cuenta dedicado', active: true },
      { text: 'SLA 99.9% + soporte 24/7', active: true },
    ],
    cta: 'Contactar ventas',
    ctaStyle: 'outline',
  },
];

export default function VexioPricing() {
  const cardsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('vx-visible');
      }),
      { threshold: 0.1 }
    );
    cardsRef.current.forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="vx-pricing" className="vx-section vx-section--dark2">
      <div className="vx-section-head vx-section-head--center">
        <p className="vx-section-label">Planes y Precios</p>
        <h2 className="vx-section-title">Invierte en el crecimiento real</h2>
        <p className="vx-section-sub">
          Sin costos ocultos. Sin sorpresas. Escala tu plan cuando lo necesites.
        </p>
      </div>

      {/* <div className="vx-pricing-grid">
        {PLANS.map((plan, i) => (
          <div
            key={plan.name}
            className={`vx-price-card vx-reveal${plan.featured ? ' vx-price-card--featured' : ''}`}
            ref={el => cardsRef.current[i] = el}
            style={{ transitionDelay: `${i * 100}ms` }}
          >
            {plan.featured && (
              <span className="vx-price-popular">Más popular</span>
            )}

            <p className="vx-price-name">{plan.name}</p>
            <div className="vx-price-amount">
              <sup>$</sup>{plan.price}
            </div>
            <p className="vx-price-period">COP / mes · facturación mensual</p>

            <ul className="vx-price-features">
              {plan.features.map(f => (
                <li key={f.text} className={f.active ? '' : 'vx-price-feat--off'}>
                  <span className="vx-price-check">{f.active ? '✦' : '—'}</span>
                  {f.text}
                </li>
              ))}
            </ul>

            <button className={`vx-price-btn vx-price-btn--${plan.ctaStyle}`}>
              {plan.cta}
            </button>
          </div>
        ))}
      </div> */}

      <SelectPlan showComponents={false} />
    </section>
  );
}
