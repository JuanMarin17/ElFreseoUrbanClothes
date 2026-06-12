import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck, Truck, Star, Headphones, CreditCard, Store } from 'lucide-react';
import './WhyChooseUs.css';

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: 'Compras 100% Seguras',
    desc: 'Cada transacción está protegida con cifrado SSL y sistemas de verificación avanzados.',
    color: '#22c55e',
  },
  {
    icon: Truck,
    title: 'Envíos Rápidos',
    desc: 'Colaboramos con los mejores operadores logísticos para que tu pedido llegue cuanto antes.',
    color: '#3b82f6',
  },
  {
    icon: Star,
    title: 'Calidad Verificada',
    desc: 'Revisamos cada tienda antes de publicarla para garantizarte la mejor experiencia de compra.',
    color: '#f59e0b',
  },
  {
    icon: Headphones,
    title: 'Soporte 24/7',
    desc: 'Nuestro equipo está disponible todo el día para resolver cualquier duda o inconveniente.',
    color: '#a855f7',
  },
  {
    icon: CreditCard,
    title: 'Pagos Flexibles',
    desc: 'Acepta múltiples métodos: tarjetas, transferencia bancaria y billeteras digitales.',
    color: '#0ea5e9',
  },
  {
    icon: Store,
    title: 'Variedad Única',
    desc: 'Cientos de tiendas con miles de productos originales que no encontrarás en ningún otro sitio.',
    color: '#f43f5e',
  },
];

export default function WhyChooseUs() {
  const ref     = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="wcu-section" ref={ref}>
      <div className="vx-section-wrap">

        {/* Header */}
        <div className="wcu-head">
          <span className="vx-eyebrow">
            <ShieldCheck size={12} aria-hidden="true" /> Por qué elegirnos
          </span>
          <h2 className="wcu-title">
            Todo lo que necesitas<br />
            <span>en un solo lugar</span>
          </h2>
          <p className="wcu-sub">
            Vexio conecta compradores y emprendedores con la experiencia de multitienda más completa del mercado.
          </p>
        </div>

        {/* Grid */}
        <div className={`wcu-grid ${visible ? 'wcu-grid--visible' : ''}`}>
          {BENEFITS.map((b, i) => (
            <div
              key={i}
              className="wcu-card"
              style={{ '--wcu-color': b.color }}
            >
              <div className="wcu-icon" aria-hidden="true">
                <b.icon size={22} />
              </div>
              <h3 className="wcu-card-title">{b.title}</h3>
              <p className="wcu-card-desc">{b.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
