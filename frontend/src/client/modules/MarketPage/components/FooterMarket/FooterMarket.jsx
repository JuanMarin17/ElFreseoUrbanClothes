import React, { useState } from 'react';
import {
  Zap, Store, HelpCircle, Gift, Smartphone,
  Instagram, Twitter, Youtube, Facebook,
  MapPin, Mail, Phone, ArrowRight,
} from 'lucide-react';
import './FooterMarket.css';

// ─────────────────────────────────────────────
// FooterMarket — Footer completo de Vexio
// ─────────────────────────────────────────────

const FOOTER_LINKS = {
  "Marketplace": [
    { label: "Explorar tiendas",   href: "/tiendas" },
    { label: "Categorías",         href: "/categorias" },
    { label: "Productos nuevos",   href: "/novedades" },
    { label: "Mejores ofertas",    href: "/ofertas" },
    { label: "Tiendas verificadas",href: "/verificadas" },
  ],
  "Emprendedores": [
    { label: "Crear mi tienda",    href: "/crear-tienda" },
    { label: "Cómo funciona",      href: "/como-funciona" },
    { label: "Precios y planes",   href: "/planes" },
    { label: "Centro de ayuda",    href: "/ayuda" },
    { label: "Casos de éxito",     href: "/casos" },
  ],
  "Empresa": [
    { label: "Sobre Vexio",        href: "/nosotros" },
    { label: "Blog",               href: "/blog" },
    { label: "Prensa",             href: "/prensa" },
    { label: "Afiliados",          href: "/afiliados" },
    { label: "Trabaja con nosotros",href: "/careers" },
  ],
};

const SOCIAL = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Twitter,   href: "#", label: "Twitter / X" },
  { icon: Youtube,   href: "#", label: "YouTube" },
  { icon: Facebook,  href: "#", label: "Facebook" },
];

export default function FooterMarket() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    // 🔌 API TODO: POST /api/newsletter { email }
    setSubscribed(true);
  };

  return (
    <footer className="vx-footer-root">
      {/* ─── Banda superior: pilares de conversión ─── */}
      <div className="vx-footer-pillars">
        <div className="vx-section-wrap vx-footer-pillars-inner">
        
          <div className="vx-footer-pillar vx-footer-pillar--cyan">
            <Store size={22} />
            <div>
              <h5>Vende en Vexio</h5>
              <p>Abre tu tienda gratis hoy</p>
            </div>
          </div>
          <div className="vx-footer-pillar">
            <HelpCircle size={22} />
            <div>
              <h5>Atención 24/7</h5>
              <p>Siempre estamos para ayudarte</p>
            </div>
          </div>
          
        </div>
      </div>

      {/* ─── Cuerpo del footer ─── */}
      <div className="vx-section-wrap vx-footer-body">

        {/* Col 1: Marca + suscripción */}
        <div className="vx-footer-brand-col">
          <a href="/" className="vx-footer-logo">
            <span className="vx-footer-logo-icon"><Zap size={17} /></span>
            <span>vexio</span>
          </a>
          <p className="vx-footer-brand-desc">
            El marketplace descentralizado donde miles de emprendedores
            conectan con compradores de todo el mundo.
          </p>

          <div className="vx-footer-contact">
            <span><MapPin size={13} /> Colombia</span>
            <span><Mail size={13} /> hola@vexio.com</span>
            <span><Phone size={13} /> +57 300 000 0000</span>
          </div>

          {/* Newsletter */}
          <div className="vx-footer-newsletter">
            <p>Recibe novedades y ofertas</p>
            {subscribed ? (
              <p className="vx-footer-sub-ok">¡Suscrito! 🎉</p>
            ) : (
              <form className="vx-footer-sub-form" onSubmit={handleSubscribe}>
                <input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="vx-footer-sub-input"
                  required
                />
                <button type="submit" className="vx-footer-sub-btn" aria-label="Suscribirse">
                  <ArrowRight size={15} />
                </button>
              </form>
            )}
          </div>

          {/* Social */}
          <div className="vx-footer-social">
            {SOCIAL.map(({ icon: Icon, href, label }) => (
              <a key={label} href={href} className="vx-footer-social-btn" aria-label={label}>
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {/* Cols de links */}
        {Object.entries(FOOTER_LINKS).map(([group, links]) => (
          <div key={group} className="vx-footer-link-col">
            <h6>{group}</h6>
            <ul>
              {links.map(link => (
                <li key={link.label}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* ─── Pie legal ─── */}
      <div className="vx-footer-legal">
        <div className="vx-section-wrap vx-footer-legal-inner">
          <p>© 2026 Vexio · Ecosistema multitienda descentralizado. Todos los derechos reservados.</p>
          <div className="vx-footer-legal-links">
            <a href="/privacidad">Privacidad</a>
            <a href="/terminos">Términos</a>
            <a href="/cookies">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
