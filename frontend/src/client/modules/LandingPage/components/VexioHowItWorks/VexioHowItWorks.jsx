import React, { useState, useEffect, useRef } from 'react';
import './VexioHowItWorks.css';

const BUYER_STEPS = [
  {
    num: '01',
    icon: '🔍',
    title: 'Descubre tiendas',
    desc: 'Explora miles de tiendas de emprendedores reales. Filtra por categoría, ciudad o calificación.',
  },
  {
    num: '02',
    icon: '🛒',
    title: 'Elige y compra',
    desc: 'Agrega productos al carrito y paga con tarjeta, PSE, Nequi o Daviplata. Seguro y sin complicaciones.',
  },
  {
    num: '03',
    icon: '📦',
    title: 'Recibe en tu puerta',
    desc: 'Seguimiento en tiempo real desde que el emprendedor despacha hasta que el domicilio llega a ti.',
  },
  {
    num: '04',
    icon: '⭐',
    title: 'Califica y vuelve',
    desc: 'Deja tu reseña, ayuda a la comunidad y acumula puntos para descuentos en tu próxima compra.',
  },
];

const SELLER_STEPS = [
  {
    num: '01',
    icon: '🏪',
    title: 'Crea tu tienda',
    desc: 'Regístrate gratis, elige una plantilla y personaliza tu tienda en menos de 10 minutos. Sin código.',
  },
  {
    num: '02',
    icon: '📋',
    title: 'Sube tu catálogo',
    desc: 'Agrega productos con fotos, variantes y stock. Importa masivamente desde Excel o uno a uno.',
  },
  {
    num: '03',
    icon: '💰',
    title: 'Recibe pedidos',
    desc: 'Notificaciones en tiempo real. Gestiona pedidos, genera guías y coordina envíos desde un solo lugar.',
  },
  {
    num: '04',
    icon: '📈',
    title: 'Crece con data',
    desc: 'Analytics de ventas, comportamiento del cliente y herramientas de marketing para escalar sin fricción.',
  },
];

export default function VexioHowItWorks() {
  const [mode, setMode] = useState('buyer'); // 'buyer' | 'seller'
  const stepsRef = useRef([]);

  const steps = mode === 'buyer' ? BUYER_STEPS : SELLER_STEPS;

  useEffect(() => {
    // Reset visibility then re-observe when tab changes
    stepsRef.current.forEach(el => el && el.classList.remove('vx-visible'));
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        (entries) => entries.forEach(e => {
          if (e.isIntersecting) e.target.classList.add('vx-visible');
        }),
        { threshold: 0.1 }
      );
      stepsRef.current.forEach(el => el && observer.observe(el));
      return () => observer.disconnect();
    }, 50);
    return () => clearTimeout(timer);
  }, [mode]);

  return (
    <section id="vx-how" className="vx-section vx-section--dark">
      <div className="vx-section-head vx-section-head--center">
        <p className="vx-section-label">Cómo funciona</p>
        <h2 className="vx-section-title">Simple para todos</h2>
        <p className="vx-section-sub">
          Tanto si quieres comprar como si quieres vender, Vexio está diseñado para que empieces hoy.
        </p>
      </div>

      {/* Toggle tabs */}
      <div className="vx-how-tabs">
        <button
          className={`vx-how-tab${mode === 'buyer' ? ' active' : ''}`}
          onClick={() => setMode('buyer')}
        >
          🛍️ Soy comprador
        </button>
        <button
          className={`vx-how-tab${mode === 'seller' ? ' active' : ''}`}
          onClick={() => setMode('seller')}
        >
          🏪 Tengo un negocio
        </button>
      </div>

      {/* Steps */}
      <div className="vx-how-steps">
        <div className="vx-how-line" />
        {steps.map((step, i) => (
          <div
            key={`${mode}-${step.num}`}
            className="vx-how-step vx-reveal"
            ref={el => stepsRef.current[i] = el}
            style={{ transitionDelay: `${i * 90}ms` }}
          >
            <div className="vx-how-num">
              <span className="vx-how-num-icon">{step.icon}</span>
              <span className="vx-how-num-badge">{step.num}</span>
            </div>
            <h3 className="vx-how-title">{step.title}</h3>
            <p className="vx-how-desc">{step.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA contextual */}
      <div className="vx-how-cta">
        {mode === 'buyer' ? (
          <button className="vx-btn-primary">
            Empezar a explorar →
          </button>
        ) : (
          <button className="vx-btn-primary">
            Crear mi tienda gratis →
          </button>
        )}
      </div>
    </section>
  );
}
