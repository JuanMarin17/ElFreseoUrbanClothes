import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, LogIn, Truck, HelpCircle, Settings, LogOut, Bell } from 'lucide-react';
import { useAuth } from '../../admin/modules/auth/pages/hook/Useauth';
import Logo from '../../assets/LogoVexios/banervexio.png';
import './HeaderMarket.css';

const HeaderMarket = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [notificationCount] = useState(0);

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
        <Link to="/" className="logo-market-link">
          <div className="logo-image">
            <img src={Logo} alt="Vexio Logo" className="logo-image-img" />
          </div>
        </Link>

        {/* Navegación */}
        <nav className="nav-menu">
          <Link to="/" className="nav-link">LANDING</Link>
          <Link to="/catalogo" className="nav-link">CATÁLOGO</Link>
          <Link to="/ayuda" className="nav-link">AYUDA</Link>
          <Link to="/landing" className="nav-link nav-link--accent">HOME</Link>
        </nav>

        {/* Acciones */}
        <div className="header-actions">

          <button className="icon-btn cart-btn" aria-label="Carrito">
            <ShoppingCart size={22} />
            <span className="cart-badge">0</span>
          </button>

          {user && (
            <button className="icon-btn notif-btn" aria-label="Notificaciones">
              <Bell size={22} />
              {notificationCount > 0 && (
                <span className="notif-badge">{notificationCount}</span>
              )}
            </button>
          )}

          <div className="user-menu-wrapper">
            <button className="icon-btn" aria-label="Usuario">
              {user ? (
                <span className="user-avatar-init">{user.userName?.[0]?.toUpperCase()}</span>
              ) : (
                <User size={22} />
              )}
            </button>

            <div className="user-dropdown">
              <div className="dropdown-header">
                {user ? (
                  <>
                    <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)' }}>Hola,</p>
                    <p style={{ margin: 0, fontWeight: 600 }}>{user.userName}</p>
                  </>
                ) : (
                  <p>Bienvenido a <strong style={{ color: 'var(--primary-color)' }}>VEXIO</strong></p>
                )}
              </div>

              <ul className="dropdown-list">
                {!user ? (
                  <li>
                    <Link to="/login" className="login-link-wrapper">
                      <button className="login-action-btn">
                        <LogIn size={16} /> INICIAR SESIÓN
                      </button>
                    </Link>
                  </li>
                ) : (
                  <>
                    <li>
                      <Link to="/cuenta/pedidos">
                        <Truck size={16} /> Mis Pedidos
                      </Link>
                    </li>
                    <li>
                      <Link to="/notificaciones">
                        <Bell size={16} /> Notificaciones
                        {notificationCount > 0 && (
                          <span className="dropdown-badge">{notificationCount}</span>
                        )}
                      </Link>
                    </li>
                    <li>
                      <Link to="/ayuda">
                        <HelpCircle size={16} /> Ayuda y Soporte
                      </Link>
                    </li>
                    <li>
                      <Link to="/cuenta/configuracion">
                        <Settings size={16} /> Mi Cuenta
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

export default HeaderMarket;
