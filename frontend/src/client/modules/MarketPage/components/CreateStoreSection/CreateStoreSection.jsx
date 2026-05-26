import React from 'react';
import { Store, Rocket, BarChart3, Globe, ArrowRight, CheckCircle2 } from 'lucide-react';
import './CreateStoreSection.css';

// ─────────────────────────────────────────────
// CreateStoreSection — CTA para emprendedores
// Esta sección es estática/marketing, no necesita API.
// ─────────────────────────────────────────────

const PERKS = [
  { icon: Store,      title: "Tu tienda en minutos",      desc: "Configura tu catálogo y empieza a vender sin complicaciones." },
  { icon: Globe,      title: "Alcance global",             desc: "Llega a compradores en toda Colombia y el mundo." },
  { icon: BarChart3,  title: "Panel de control completo",  desc: "Analíticas en tiempo real, pedidos y clientes en un solo lugar." },
  { icon: Rocket,     title: "Sin comisiones al inicio",   desc: "Los primeros 3 meses sin cobros. Crece sin riesgos." },
];

const STEPS = [
  "Crea tu cuenta gratuita",
  "Personaliza tu tienda",
  "Sube tus productos",
  "¡Empieza a vender!",
];

export default function CreateStoreSection() {
  return (
    <section className="vx-cstore-root" id="crear-tienda">
      {/* Fondo decorativo */}
      <div className="vx-cstore-bg" aria-hidden />

      <div className="vx-section-wrap vx-cstore-wrap">
        {/* Header */}
        <div className="vx-cstore-header">
          <span className="vx-cstore-eyebrow">
            <Store size={13} /> Para emprendedores
          </span>
          <h2 className="vx-cstore-title">
            ¿Tienes un emprendimiento?<br />
            <span>Abre tu tienda en Vexio</span>
          </h2>
          <p className="vx-cstore-sub">
            Únete a más de 1.200 emprendedores que ya venden en la plataforma.
            Sin conocimientos técnicos, sin costos de entrada.
          </p>
        </div>

        {/* Tarjetas de beneficios */}
        <div className="vx-cstore-perks">
          {PERKS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="vx-cstore-perk">
              <div className="vx-cstore-perk-icon">
                <Icon size={22} />
              </div>
              <div>
                <h4>{title}</h4>
                <p>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pasos + CTA */}
        <div className="vx-cstore-bottom">
          <div className="vx-cstore-steps">
            {STEPS.map((step, i) => (
              <div key={i} className="vx-cstore-step">
                <CheckCircle2 size={16} />
                <span>{step}</span>
              </div>
            ))}
          </div>
          <div className="vx-cstore-ctas">
            <a href="/crear-tienda" className="vx-btn-cyan">
              Crear mi tienda gratis <ArrowRight size={16} />
            </a>
            <a href="/como-funciona" className="vx-btn-ghost">
              ¿Cómo funciona?
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
