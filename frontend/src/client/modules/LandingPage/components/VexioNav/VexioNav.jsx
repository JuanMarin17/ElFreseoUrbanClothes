import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../../../../assets/LogoVexios/banervexio.png';
import './VexioNav.css';

const isAuthenticated = () => !!localStorage.getItem('jwt');

const NAV_LINKS = [
  { id: 'vx-features', label: 'Características' },
  { id: 'vx-how',      label: 'Cómo funciona'  },
  { id: 'vx-pricing',  label: 'Planes'         },
  { id: 'vx-reviews',  label: 'Reseñas'         },
  { id: 'vx-faq',      label: 'FAQ'             },
];

export default function VexioNav() {
  const [scrolled,  setScrolled]  = useState(false);
  const [hidden,    setHidden]    = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [loggedIn,  setLoggedIn]  = useState(isAuthenticated);
  const lastScrollY = useRef(0);
  const navigate = useNavigate();

  // Auto-hide on scroll-down, reveal on scroll-up
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 50);
      if (y > lastScrollY.current && y > 120) {
        setHidden(true);
      } else if (y < lastScrollY.current) {
        setHidden(false);
      }
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Detecta cambios de sesión en otras pestañas
  useEffect(() => {
    const syncAuth = () => setLoggedIn(isAuthenticated());
    window.addEventListener('storage', syncAuth);
    return () => window.removeEventListener('storage', syncAuth);
  }, []);

  // Cierra el menú al cambiar de ruta / resize
  useEffect(() => {
    const close = () => setMenuOpen(false);
    window.addEventListener('resize', close);
    return () => window.removeEventListener('resize', close);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    setLoggedIn(false);
    navigate('/');
  };

  return (
    <nav className={`vx-nav${scrolled ? ' vx-nav--scrolled' : ''}${hidden ? ' vx-nav--hidden' : ''}`}>
      <div className="vx-nav-inner">

        {/* Logo */}
        <Link to="/" className="vx-nav-brand">
          <img src={Logo} alt="Vexio" className="vx-nav-logo-img" />
        </Link>

        {/* Links de sección */}
        <ul className={`vx-nav-links${menuOpen ? ' open' : ''}`}>
          {NAV_LINKS.map(({ id, label }) => (
            <li key={id}>
              <button className="vx-nav-link" onClick={() => scrollTo(id)}>
                {label}
              </button>
            </li>
          ))}
        </ul>

        {/* Acciones */}
        <div className="vx-nav-right">
          {loggedIn ? (
            <>
              <button
                className="vx-nav-login"
                onClick={() => navigate('/market')}
              >
                Explorar mercado
              </button>
              <button className="vx-nav-cta" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <button
                className="vx-nav-login"
                onClick={() => navigate('/login')}
              >
                Iniciar sesión
              </button>
              <button
                className="vx-nav-cta"
                onClick={() => navigate('/login/register')}
              >
                Comenzar ahora
              </button>
            </>
          )}

          {/* Hamburger */}
          <button
            className={`vx-hamburger${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Abrir menú"
            aria-expanded={menuOpen}
          >
            <span /><span /><span />
          </button>
        </div>

      </div>
    </nav>
  );
}