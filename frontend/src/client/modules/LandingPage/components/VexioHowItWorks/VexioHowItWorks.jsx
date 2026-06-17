import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Package, Star, Store, ClipboardList, DollarSign, TrendingUp } from 'lucide-react';
import './VexioHowItWorks.css';

const BUYER_STEPS = [
  { num: '01', Icon: Search,       title: 'Descubre tiendas', desc: 'Explora miles de tiendas de emprendedores reales.Filtra por categoría' },
  { num: '02', Icon: ShoppingCart, title: 'Elige y compra',   desc: 'Agrega productos al carrito y paga con tarjeta, PSE, Seguro y sin complicaciones.' },
  { num: '03', Icon: Package,      title: 'Recibe en tu puerta', desc: 'Tu pedido llegara lo mas pronto posible a la puerta de tu casa.' },
  { num: '04', Icon: Star,         title: 'Califica', desc: 'Deja tu reseña, ayuda a la comunidad brinando una opinión sobre tu experiencia.' },
];

const SELLER_STEPS = [
  { num: '01', Icon: Store,         title: 'Crea tu tienda',  desc: 'Regístrate , elige una plantilla y personaliza tu tienda en menos de 10 minutos. Sin código.' },
  { num: '02', Icon: ClipboardList, title: 'Sube tu catálogo', desc: 'Agrega productos con fotos, variantes y stock. Importa masivamente desde Excel o uno a uno.' },
  { num: '03', Icon: DollarSign,    title: 'Recibe pedidos',  desc: 'Notificaciones en tiempo real. Gestiona pedidos, genera guías y coordina envíos desde un solo lugar.' },
  { num: '04', Icon: TrendingUp,    title: 'Crece con data',  desc: 'Analytics de ventas, comportamiento del cliente y herramientas de marketing para escalar sin fricción.' },
];

export default function VexioHowItWorks() {
  const [mode, setMode] = useState('buyer');
  const navigate = useNavigate();
  const stepsRef = useRef([]);

  const steps = mode === 'buyer' ? BUYER_STEPS : SELLER_STEPS;

  useEffect(() => {
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

      <div className="vx-how-tabs">
        <button
          className={`vx-how-tab${mode === 'buyer' ? ' active' : ''}`}
          onClick={() => setMode('buyer')}
        >
          <ShoppingCart size={16} /> Soy comprador
        </button>
        <button
          className={`vx-how-tab${mode === 'seller' ? ' active' : ''}`}
          onClick={() => setMode('seller')}
        >
          <Store size={16} /> Tengo un negocio
        </button>
      </div>

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
              <span className="vx-how-num-icon"><step.Icon size={20} /></span>
              <span className="vx-how-num-badge">{step.num}</span>
            </div>
            <h3 className="vx-how-title">{step.title}</h3>
            <p className="vx-how-desc">{step.desc}</p>
          </div>
        ))}
      </div>

      <div className="vx-how-cta">
        {mode === 'buyer' ? (
          <button className="vx-btn-primary" onClick={() => navigate('/market')}>Empezar a explorar →</button>
        ) : (
          <button className="vx-btn-primary" onClick={() => navigate('/plan')}>Crear mi tienda gratis →</button>
        )}
      </div>
    </section>
  );
}