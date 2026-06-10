import React, { useEffect, useRef } from 'react';
import './VexioFeatures.css';

const FEATURES = [
  {
    icon: '🏪', color: 'purple',
    title: 'Constructor de Tienda',
    desc: 'Diseña y publica tu tienda con un editor visual intuitivo. Elige entre +40 plantillas profesionales y personaliza cada detalle de tu layout.',
  },
  {
    icon: '📦', color: 'amber',
    title: 'Gestión de Productos',
    desc: 'Carga, organiza y actualiza tu catálogo completo. Soporta variantes, stock en tiempo real, precios dinámicos y bundles.',
  },
  {
    icon: '📊', color: 'cyan',
    title: 'Analytics Avanzado',
    desc: 'Dashboard con métricas de ventas, comportamiento del cliente, conversión por canal y reportes exportables en tiempo real.',
  },
  {
    icon: '💳', color: 'green',
    title: 'Pagos Integrados',
    desc: 'Acepta tarjetas, PSE, Nequi, Daviplata y más. Liquidaciones automáticas y conciliación bancaria sin comisiones ocultas.',
  },
  {
    icon: '🚚', color: 'rose',
    title: 'Logística Conectada',
    desc: 'Integración con Coordinadora, Servientrega, Envia y más. Guías automáticas y seguimiento en tiempo real para tus clientes.',
  },
  {
    icon: '🔌', color: 'blue',
    title: 'Integraciones & API',
    desc: 'Conecta con WhatsApp Business, Meta Ads, Google Shopping, Siigo y +50 herramientas más a través de nuestra API REST documentada.',
  },
];

export default function VexioFeatures() {
  const cardsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('vx-visible');
      }),
      { threshold: 0.12 }
    );
    cardsRef.current.forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="vx-features" className="vx-section vx-section--dark2">
      <div className="vx-section-head">
        <p className="vx-section-label">Características</p>
        <h2 className="vx-section-title">Todo lo que tu negocio necesita</h2>
        <p className="vx-section-sub">
          Herramientas enterprise diseñadas para negocios medianos que quieren escalar sin fricción.
        </p>
      </div>

      <div className="vx-features-grid">
        {FEATURES.map((f, i) => (
          <div
            key={f.title}
            className="vx-feat-card vx-reveal"
            ref={el => cardsRef.current[i] = el}
            style={{ transitionDelay: `${i * 80}ms` }}
          >
            <div className={`vx-feat-icon vx-feat-icon--${f.color}`}>{f.icon}</div>
            <h3 className="vx-feat-title">{f.title}</h3>
            <p className="vx-feat-desc">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
