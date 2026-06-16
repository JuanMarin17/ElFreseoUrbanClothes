import React, { useEffect, useRef, useState } from 'react';
import { Store, Package, Users, ShoppingBag } from 'lucide-react';
import './StatsSection.css';

const STATS = [
  { icon: Store,       value: 200,   suffix: '+',  label: 'Tiendas Activas',    sub: 'Emprendedores reales' },
  { icon: Package,     value: 12000, suffix: '+',  label: 'Productos Listados', sub: 'En todas las categorías' },
  { icon: Users,       value: 50000, suffix: '+',  label: 'Clientes Activos',   sub: 'Comprando cada día' },
  { icon: ShoppingBag, value: 150000,suffix: '+',  label: 'Pedidos Entregados', sub: 'Con satisfacción garantizada' },
];

function StatItem({ icon: Icon, value, suffix, label, sub, animate }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!animate) return;
    const duration = 1800;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.floor(eased * value));
      if (p < 1) requestAnimationFrame(step);
      else setCount(value);
    };
    requestAnimationFrame(step);
  }, [animate, value]);

  return (
    <div className="ss-stat">
      <div className="ss-stat-icon">
        <Icon size={22} />
      </div>
      <div className="ss-stat-number">
        {animate ? count.toLocaleString() : '0'}{suffix}
      </div>
      <div className="ss-stat-label">{label}</div>
      <div className="ss-stat-sub">{sub}</div>
    </div>
  );
}

export default function StatsSection() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.25 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="ss-section" ref={ref}>
      <div className="vx-section-wrap">
        <div className={`ss-grid ${visible ? 'ss-grid--visible' : ''}`}>
          {STATS.map((stat, i) => (
            <StatItem key={i} {...stat} animate={visible} />
          ))}
        </div>
      </div>
    </section>
  );
}
