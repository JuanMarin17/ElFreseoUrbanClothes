import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // 1. Importamos Link
import { ShoppingCart, User, Menu, LogIn, Truck, HelpCircle, Settings } from 'lucide-react';
import './Header.css';
import Logo from "../../../../../assets/logo.png";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      setIsScrolled(currentScrollY > 50);

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsHidden(true);
      } else {
        setIsHidden(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''} ${isHidden ? 'header-scroll-hidden' : ''}`}>
      <div className="header-container">

        {/* 2. Logo envuelto en Link para volver al inicio */}
        <Link to="/" className="logo" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
          <img src={Logo} alt="Freseo Logo" className="logo-image" />
          EL FRESEO
        </Link>

        <nav className="nav-menu">
          {/* 3. Cambiamos a etiquetas Link */}
          <Link to="/" className="nav-link">INICIO</Link>
          <Link to="/tienda" className="nav-link">TIENDA</Link>
          <Link to="/catalogo" className="nav-link">CATÁLOGO</Link>
        </nav>

        <div className="header-actions">
          <div className="user-menu-wrapper">
            <button className="icon-btn" aria-label="Usuario">
              <User size={22} />
            </button>

            <div className="user-dropdown">
              <div className="dropdown-header">
                <p>Bienvenido a <strong>EL FRESEO</strong></p>
              </div>
              <ul className="dropdown-list">
                <li>
                  <Link to="/login" className="login-link-wrapper">
                    <button className="login-action-btn">
                      <LogIn size={16} /> INICIAR SESIÓN
                    </button>
                  </Link>
                </li>
                <hr className="dropdown-divider" />
                <li>
                  <Link to="/pedidos">
                    <Truck size={16} /> Rastrear Pedido
                  </Link>
                </li>
                <li>
                  {/* 4. Direccionamiento al Centro de Ayuda desde el perfil */}
                  <Link to="/ayuda">
                    <HelpCircle size={16} /> Ayuda y Soporte
                  </Link>
                </li>
                <li>
                  <Link to="/ajustes">
                    <Settings size={16} /> Preferencias
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <button className="menu-mobile">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;