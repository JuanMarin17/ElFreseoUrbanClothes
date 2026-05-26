import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../../../../assets/LogoVexios/banervexio.png';
import './VexioNav.css';

export default function VexioNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <nav className={`vx-nav${scrolled ? ' vx-nav--scrolled' : ''}`}>
      <div className="vx-nav-inner">

        <div className="vx-nav-brand">
          <img src={Logo} alt="Vexio" className="vx-nav-logo-img" />
        </div>

        <ul className={`vx-nav-links${menuOpen ? ' open' : ''}`}>
          {[
            ['vx-features',  'Características'],
            ['vx-how',       'Cómo funciona'],
            ['vx-pricing',   'Precios'],
            ['vx-reviews',   'Reseñas'],
            ['vx-faq',       'FAQ'],
          ].map(([id, label]) => (
            <li key={id}>
              <button className="vx-nav-link" onClick={() => scrollTo(id)}>
                {label}
              </button>
            </li>
          ))}
        </ul>

        <div className="vx-nav-right">
          <Link to="/login" className="vx-nav-login">Iniciar sesión</Link>
          <button className="vx-nav-cta" onClick={() => scrollTo('vx-pricing')}>
            Empezar gratis
          </button>
          <button
            className={`vx-hamburger${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Menú"
          >
            <span /><span /><span />
          </button>
        </div>

      </div>
    </nav>
  );
}
