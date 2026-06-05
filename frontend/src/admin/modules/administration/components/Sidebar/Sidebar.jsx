import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, PackagePlus, Users, ShoppingCart,
  BarChart3, AlertTriangle, LogOut,
} from 'lucide-react';
import './Sidebar.css';
import defaultLogo from '../../../../../assets/LogoVexios/banervexio.png';

const DEFAULT_MENU_ITEMS = [
  { path: '/tienda/:slug/admin/dashboard',      label: 'DASHBOARD',          icon: LayoutDashboard },
  { path: '/tienda/:slug/admin/subir-producto', label: 'SUBIR PRODUCTOS',    icon: PackagePlus     },
  { path: '/tienda/:slug/admin/usuarios',       label: 'GESTIONAR USUARIOS', icon: Users           },
  { path: '/tienda/:slug/admin/pedidos',        label: 'VER PEDIDOS',        icon: ShoppingCart    },
  { path: '/tienda/:slug/admin/report',         label: 'INFORMES',           icon: BarChart3       },
  { path: '/tienda/:slug/admin/alertas',        label: 'ALERTAS DE STOCK',   icon: AlertTriangle, alertKey: 'stock' },
];

const Sidebar = ({
  menuItems    = DEFAULT_MENU_ITEMS,
  brandName    = "NOMBRE",
  brandSub     = "ADMIN",
  onLogout,
  logoUrl,
  useImageLogo,
  storeSlug,
  lowStockCount = 0,
}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) onLogout();
    else navigate('/login');
  };

  // Sustituir el parámetro :slug por el slug real
  const resolvedItems = menuItems.map((item) => ({
    ...item,
    path: storeSlug ? item.path.replace(':slug', storeSlug) : item.path,
  }));

  return (
    <aside className="sidebar-container">

      {/* ── Brand / Logo ─────────────────────────────────────────────── */}
      <div className="sidebar-brand">
        {useImageLogo ? (
          <img
            src={logoUrl || defaultLogo}
            alt={brandName}
            className="sidebar-logo-img"
            onError={(e) => { e.target.onerror = null; e.target.src = defaultLogo; }}
          />
        ) : (
          <img src={defaultLogo} alt="Logo" className="sidebar-logo-img" />
        )}
        <span className="brand-subtitle">{brandSub}</span>
      </div>

      {/* ── Nav ──────────────────────────────────────────────────────── */}
      <nav className="sidebar-nav">
        <div className="nav-group">
          {resolvedItems.map((item) => {
            const showStockAlert = item.alertKey === 'stock' && lowStockCount > 0;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              >
                <span className="nav-icon-wrapper">
                  <item.icon size={18} />
                  {showStockAlert && (
                    <span className="stock-alert-dot" title={`${lowStockCount} productos con stock bajo`} />
                  )}
                </span>
                <span>{item.label}</span>
                {showStockAlert && (
                  <span className="stock-alert-badge">{lowStockCount}</span>
                )}
              </NavLink>
            );
          })}
        </div>

        <div className="nav-footer">
          <button onClick={handleLogout} className="nav-link logout-btn">
            <LogOut size={18} />
            <span>CERRAR SESIÓN</span>
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
