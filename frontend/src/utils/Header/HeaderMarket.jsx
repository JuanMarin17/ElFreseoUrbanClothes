import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, User, Menu, X, LogIn, Truck, HelpCircle, Settings, LogOut, Bell } from 'lucide-react';
import { useAuth } from '../../admin/modules/auth/pages/hook/Useauth';
import { useCart } from '../../multi-tenant/components/Store/hooks/useCart.js';
import CartDrawer from '../../multi-tenant/components/Store/CartDrawer.jsx';
import WishlistDrawer from './WishlistDrawer.jsx';
import { getWishlist } from '../wishlistService.js';
import Logo from '../../assets/LogoVexios/banervexio.png';
import './HeaderMarket.css';

const NAV_LINKS = [
  { to: '/',         label: 'LANDING'       },
  { to: '/catalogo', label: 'CATÁLOGO'      },
  { to: '/ayuda',    label: 'AYUDA'         },
  { to: '/market',   label: 'HOME'          },
  { to: '/plan',     label: 'CREAR TIENDA'  },
];

function isActivePath(to, pathname) {
  if (to === '/') return pathname === '/';
  return pathname === to || pathname.startsWith(to + '/');
}

const HeaderMarket = () => {
  const { user, logout }     = useAuth();
  const navigate             = useNavigate();
  const location             = useLocation();
  const [isScrolled, setIsScrolled]         = useState(false);
  const [isHidden, setIsHidden]             = useState(false);
  const [lastScrollY, setLastScrollY]       = useState(0);
  const [isMobileOpen, setIsMobileOpen]     = useState(false);
  const [notificationCount]                 = useState(0);

  // Cart: storeId tracked via localStorage + event
  const [cartStoreId, setCartStoreId] = useState(() => {
    const s = localStorage.getItem("storeId");
    return s && s !== "null" && s !== "undefined" ? s : null;
  });

  const {
    cart, cartCount, isOpen: cartOpen, loading: cartLoading,
    itemLoading, error: cartError,
    openCart, closeCart, updateQuantity, removeCartItem, emptyCart, clearError, refreshCart,
  } = useCart(cartStoreId);

  useEffect(() => {
    const handler = () => {
      const s = localStorage.getItem("storeId");
      const newId = s && s !== "null" && s !== "undefined" ? s : null;
      setCartStoreId(newId);
      refreshCart();
    };
    window.addEventListener("cart-updated", handler);
    return () => window.removeEventListener("cart-updated", handler);
  }, [refreshCart]);

  // Wishlist
  const [wishlistItems, setWishlistItems] = useState(() => getWishlist());
  const [wishlistOpen, setWishlistOpen]   = useState(false);

  useEffect(() => {
    const handler = () => setWishlistItems(getWishlist());
    window.addEventListener("wishlist-updated", handler);
    return () => window.removeEventListener("wishlist-updated", handler);
  }, []);

  // Scroll behaviour
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setIsScrolled(y > 50);
      setIsHidden(y > lastScrollY && y > 100);
      setLastScrollY(y);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [lastScrollY]);

  // Close mobile menu on route change
  useEffect(() => { setIsMobileOpen(false); }, [location.pathname]);

  // Prevent body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileOpen]);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <>
      <header
        className={`header ${isScrolled ? 'scrolled' : ''} ${isHidden ? 'header-hidden' : ''}`}
      >
        <div className="header-container">

          {/* Logo */}
          <Link to="/" className="logo-market-link" aria-label="Vexio – Ir al inicio">
            <div className="logo-image">
              <img src={Logo} alt="Vexio" className="logo-image-img" />
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="nav-menu" aria-label="Navegación principal">
            {NAV_LINKS.map(({ to, label }) => {
              const active = isActivePath(to, location.pathname);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`nav-link${active ? ' nav-link--active' : ''}`}
                >
                  {label}
                  {active && (
                    <motion.span
                      className="nav-active-indicator"
                      layoutId="nav-indicator"
                      transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="header-actions">

            <button className="icon-btn cart-btn" aria-label="Carrito de compras" onClick={openCart}>
              <ShoppingCart size={22} aria-hidden="true" />
              {cartCount > 0 && (
                <span className="cart-badge" aria-live="polite">{cartCount > 99 ? "99+" : cartCount}</span>
              )}
            </button>

            <button
              className="icon-btn wishlist-btn"
              aria-label="Lista de deseos"
              onClick={() => setWishlistOpen(true)}
            >
              <Heart size={20} aria-hidden="true" className={wishlistItems.length > 0 ? "wishlist-icon--active" : ""} />
              {wishlistItems.length > 0 && (
                <span className="wishlist-badge" aria-live="polite">
                  {wishlistItems.length > 99 ? "99+" : wishlistItems.length}
                </span>
              )}
            </button>

            {user && (
              <button className="icon-btn notif-btn" aria-label="Notificaciones">
                <Bell size={22} aria-hidden="true" />
                {notificationCount > 0 && (
                  <span className="notif-badge" aria-live="polite">{notificationCount}</span>
                )}
              </button>
            )}

            {/* User dropdown */}
            <div className="user-menu-wrapper">
              <button className="icon-btn" aria-label="Menú de usuario" aria-haspopup="true">
                {user ? (
                  <span className="user-avatar-init" aria-hidden="true">
                    {user.userName?.[0]?.toUpperCase()}
                  </span>
                ) : (
                  <User size={22} aria-hidden="true" />
                )}
              </button>

              <div className="user-dropdown" role="menu">
                <div className="dropdown-header">
                  {user ? (
                    <>
                      <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Hola,</p>
                      <p style={{ margin: 0, fontWeight: 600 }}>{user.userName}</p>
                    </>
                  ) : (
                    <p>Bienvenido a <strong style={{ color: 'var(--primary-color)' }}>VEXIO</strong></p>
                  )}
                </div>
                <ul className="dropdown-list">
                  {!user ? (
                    <li>
                      <Link to="/login" className="login-link-wrapper" role="menuitem">
                        <button className="login-action-btn">
                          <LogIn size={16} aria-hidden="true" /> INICIAR SESIÓN
                        </button>
                      </Link>
                    </li>
                  ) : (
                    <>
                      <li><Link to="/cuenta/pedidos" role="menuitem"><Truck size={16} aria-hidden="true" /> Mis Pedidos</Link></li>
                      <li>
                        <Link to="/cuenta/configuracion" role="menuitem">
                          <Bell size={16} aria-hidden="true" /> Notificaciones
                          {notificationCount > 0 && <span className="dropdown-badge">{notificationCount}</span>}
                        </Link>
                      </li>
                      <li><Link to="/ayuda" role="menuitem"><HelpCircle size={16} aria-hidden="true" /> Ayuda y Soporte</Link></li>
                      <li><Link to="/cuenta/configuracion" role="menuitem"><Settings size={16} aria-hidden="true" /> Mi Cuenta</Link></li>
                      <hr className="dropdown-divider" />
                      <li>
                        <button onClick={handleLogout} className="logout-action-btn" role="menuitem">
                          <LogOut size={16} aria-hidden="true" /> CERRAR SESIÓN
                        </button>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            {/* Hamburger */}
            <button
              className={`menu-mobile ${isMobileOpen ? 'menu-mobile--open' : ''}`}
              onClick={() => setIsMobileOpen((o) => !o)}
              aria-label={isMobileOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={isMobileOpen}
            >
              {isMobileOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile navigation drawer */}
      <nav
        className={`mobile-nav ${isMobileOpen ? 'mobile-nav--open' : ''}`}
        aria-label="Menú móvil"
        aria-hidden={!isMobileOpen}
      >
        <div className="mobile-nav-links" onClick={() => setIsMobileOpen(false)}>
          {NAV_LINKS.map(({ to, label }) => {
            const active = isActivePath(to, location.pathname);
            return (
              <Link
                key={to}
                to={to}
                className={`mobile-nav-link${active ? ' mobile-nav-link--active' : ''}`}
              >
                {active && (
                  <motion.span
                    className="mobile-nav-active-bar"
                    layoutId="mobile-nav-indicator"
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                  />
                )}
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Overlay backdrop */}
      <div
        className={`mobile-nav-overlay ${isMobileOpen ? 'mobile-nav-overlay--visible' : ''}`}
        onClick={() => setIsMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Cart drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={closeCart}
        cart={cart}
        loading={cartLoading}
        itemLoading={itemLoading}
        error={cartError}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeCartItem}
        onClearCart={emptyCart}
        onClearError={clearError}
      />

      {/* Wishlist drawer */}
      <WishlistDrawer
        isOpen={wishlistOpen}
        onClose={() => setWishlistOpen(false)}
        items={wishlistItems}
      />
    </>
  );
};

export default HeaderMarket;
