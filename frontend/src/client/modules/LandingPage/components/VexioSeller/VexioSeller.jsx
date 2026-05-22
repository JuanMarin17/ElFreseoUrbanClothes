import React from 'react';
import './VexioSeller.css';

const PERKS = [
  { icon: '🏪', title: 'Tienda en minutos',     desc: 'Sin código, con plantillas profesionales.' },
  { icon: '📦', title: 'Gestión de catálogo',   desc: 'Importa masivamente o agrega uno a uno.' },
  { icon: '💳', title: 'Cobros integrados',     desc: 'PSE, Nequi, Daviplata y más sin comisiones ocultas.' },
  { icon: '🚚', title: 'Logística conectada',   desc: 'Coordinadora, Servientrega, Envia y más.' },
  { icon: '📊', title: 'Analytics en tiempo real', desc: 'Ventas, conversión y comportamiento.' },
  { icon: '🔌', title: '+50 integraciones',     desc: 'WhatsApp, Meta Ads, Google Shopping y más.' },
];

export default function VexioSeller() {
  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section id="vx-seller" className="vx-section vx-section--dark">
      <div className="vx-seller-inner">

        {/* Texto lado izquierdo */}
        <div className="vx-seller-copy">
          <p className="vx-section-label">Para vendedores</p>
          <h2 className="vx-section-title">¿Tienes un negocio?<br />Vexio te impulsa.</h2>
          <p className="vx-section-sub">
            Llega a miles de compradores activos en Vexio. Crea tu tienda gratis en minutos
            y empieza a vender hoy — sin conocimientos técnicos.
          </p>
          <div className="vx-seller-actions">
            <button className="vx-btn-primary" onClick={() => scrollTo('vx-pricing')}>
              Crear tienda gratis
            </button>
            <button className="vx-btn-ghost" onClick={() => scrollTo('vx-how')}>
              Ver cómo funciona
            </button>
          </div>
          <p className="vx-seller-disclaimer">
            14 días gratis · Sin tarjeta de crédito · Cancela cuando quieras
          </p>
        </div>

        {/* Grid de perks lado derecho */}
        <div className="vx-seller-perks">
          {PERKS.map(({ icon, title, desc }) => (
            <div key={title} className="vx-seller-perk">
              <span className="vx-seller-perk-icon">{icon}</span>
              <div>
                <h4 className="vx-seller-perk-title">{title}</h4>
                <p className="vx-seller-perk-desc">{desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
