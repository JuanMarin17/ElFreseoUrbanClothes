import React from "react";
import Logo from "../../../../../assets/LogoVexios/banervexio.png";
import "./VexioFooter.css";

const LINKS = {
  Producto: ["Características", "Precios", "Integraciones"],
  Empresa: ["Sobre nosotros", "Trabaja con nosotros"],
  Soporte: ["Centro de ayuda", "Contacto"],
};

const SOCIALS = [
  { label: "LinkedIn", icon: "ti-brand-linkedin", href: "#" },
  { label: "Instagram", icon: "ti-brand-instagram", href: "#" },
  { label: "X / Twitter", icon: "ti-brand-x", href: "#" },
  { label: "YouTube", icon: "ti-brand-youtube", href: "#" },
];

export default function VexioFooter() {
  return (
    <footer className="vx-footer" role="contentinfo">
      {/* ── TOP GRID ─────────────────────────────────────── */}
      <div className="vx-footer-top">
        {/* Brand */}
        <div className="vx-footer-brand">
          <img src={Logo} alt="Vexio" className="vx-footer-logo" />

          <p className="vx-footer-tagline">
            La plataforma de comercio unificado para negocios colombianos que
            quieren crecer sin límites.
          </p>

          <div className="vx-footer-socials">
            {SOCIALS.map(({ label, icon, href }) => (
              <a
                key={label}
                href={href}
                className="vx-footer-social"
                aria-label={label}
              >
                <i className={`ti ${icon}`} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(LINKS).map(([col, items], colIdx) => (
          <div
            key={col}
            className="vx-footer-col"
            style={{ "--col-delay": `${0.15 + colIdx * 0.1}s` }}
          >
            <h4 className="vx-footer-col-title">{col}</h4>
            <ul>
              {items.map((item) => (
                <li key={item}>
                  <a href="#">
                    {item}
                    <span className="vx-link-arrow" aria-hidden="true">
                      ›
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* ── DIVIDER ──────────────────────────────────────── */}
      <hr className="vx-footer-divider" />

      {/* ── BOTTOM BAR ───────────────────────────────────── */}
      <div className="vx-footer-bottom">
        <span className="vx-footer-copy">
          <span className="vx-status-dot" title="Todos los sistemas operando" />
          © {new Date().getFullYear()} Vexio. Todos los derechos reservados
        </span>

        <nav className="vx-footer-legal" aria-label="Legal">
          <a href="#">Términos</a>
          <span className="vx-legal-sep" aria-hidden="true" />
          <a href="#">Privacidad</a>
          <span className="vx-legal-sep" aria-hidden="true" />
          <a href="#">Cookies</a>
        </nav>
      </div>
    </footer>
  );
}
