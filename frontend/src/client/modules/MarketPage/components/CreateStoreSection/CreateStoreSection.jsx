import React, { useEffect } from 'react';
import { Store, Rocket, BarChart3, Globe, ArrowRight, CheckCircle2 } from 'lucide-react';
import './CreateStoreSection.css';

// ─────────────────────────────────────────────
// CreateStoreSection — CTA para emprendedores
// Esta sección es estática/marketing, no necesita API.
// ─────────────────────────────────────────────

const PERKS = [
  { icon: Store,     title: "Tu tienda en minutos",       desc: "Configura tu catálogo y empieza a vender sin complicaciones técnicas." },
  { icon: Globe,     title: "Más compradores, más ventas", desc: "Conéctate con clientes que ya están buscando lo que tú vendes." },
  { icon: BarChart3, title: "Panel de control completo",   desc: "Tus pedidos, clientes y analíticas en un solo lugar, siempre al día." },
  { icon: Rocket,    title: "Entra gratis desde el inicio","desc": "Crea tu tienda sin costo. Sin letra pequeña." },
];

const STEPS = [
  "Crea tu cuenta gratuita",
  "Personaliza tu tienda",
  "Sube tus productos",
  "¡Empieza a vender!",
];

export default function CreateStoreSection() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('vx-visible');
          obs.unobserve(e.target);
        }
      }),
      { threshold: 0.12 }
    );

    // Header y bottom juntos
    document.querySelectorAll('.vx-cstore-header, .vx-cstore-bottom')
      .forEach(el => obs.observe(el));

    // Perks con stagger
    document.querySelectorAll('.vx-cstore-perk').forEach((el, i) => {
      const o = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add('vx-visible'), i * 100);
          o.disconnect();
        }
      }, { threshold: 0.1 });
      o.observe(el);
    });
  }, []);

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
          Sé de los primeros en vender en la plataforma.
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
