import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, LogIn, Truck, HelpCircle, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../../../../admin/modules/auth/pages/hook/Useauth'; // Ajusta según tu estructura
 // Ajusta según tu ubicación
import './Header.css';
import Logo from "../../../../../assets/logo.png";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''} ${isHidden ? 'header-scroll-hidden' : ''}`}>
      <div className="header-container">

        {/* Logo */}
        <Link to="/" className="logo" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
          <img src={Logo} alt="Freseo Logo" className="logo-image" />
          EL FRESEO
        </Link>

        {/* Navegación Principal */}
        <nav className="nav-menu">
          <Link to="/" className="nav-link">INICIO</Link>
          <Link to="/tienda" className="nav-link">TIENDA</Link>
          <Link to="/catalogo" className="nav-link">CATÁLOGO</Link>
        </nav>

        {/* Acciones */}
        <div className="header-actions">
          <button className="icon-btn cart-btn" aria-label="Carrito">
            <ShoppingCart size={22} />
            <span className="cart-badge">0</span>
          </button>

          <div className="user-menu-wrapper">
            <button className="icon-btn" aria-label="Usuario">
              <User size={22} />
            </button>

            <div className="user-dropdown">
              <div className="dropdown-header">
                {user ? (
                  <p>Hola, <strong>{user.nombre}</strong></p>
                ) : (
                  <p>Bienvenido a <strong>EL FRESEO</strong></p>
                )}
              </div>

              <ul className="dropdown-list">
                {!user ? (
                  /* SI NO ESTÁ LOGUEADO */
                  <li>
                    <Link to="/login" className="login-link-wrapper">
                      <button className="login-action-btn">
                        <LogIn size={16} /> INICIAR SESIÓN
                      </button>
                    </Link>
                  </li>
                ) : (
                  /* SI ESTÁ LOGUEADO */
                  <>
                    <li>
                      <Link to="/pedidos">
                        <Truck size={16} /> Rastrear Pedido
                      </Link>
                    </li>
                    <li>
                      <Link to="/ayuda">
                        <HelpCircle size={16} /> Ayuda y Soporte
                      </Link>
                    </li>
                    <li>
                      <Link to="/ajustes">
                        <Settings size={16} /> Preferencias
                      </Link>
                    </li>
                    <hr className="dropdown-divider" />
                    <li>
                      <button onClick={handleLogout} className="logout-action-btn">
                        <LogOut size={16} /> CERRAR SESIÓN
                      </button>
                    </li>
                  </>
                )}
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