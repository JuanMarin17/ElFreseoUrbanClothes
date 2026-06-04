import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, PackagePlus, Users, ShoppingCart, 
  BarChart3, AlertTriangle, LogOut 
} from 'lucide-react';
import './Sidebar.css';
import defaultLogo from '../../../../../assets/LogoVexios/banervexio.png';

const DEFAULT_MENU_ITEMS = [
  { path: '/admin/dashboard',        label: 'DASHBOARD',          icon: LayoutDashboard },
  { path: '/admin/subir-producto',   label: 'SUBIR PRODUCTOS',    icon: PackagePlus     },
  { path: '/admin/usuarios',         label: 'GESTIONAR USUARIOS', icon: Users           },
  { path: '/admin/pedidos',          label: 'VER PEDIDOS',        icon: ShoppingCart    },
  { path: '/admin/report',           label: 'INFORMES',           icon: BarChart3       },
  { path: '/admin/alertas',          label: 'ALERTAS DE STOCK',   icon: AlertTriangle, alertKey: 'stock' }, // 👈 marca este item
];

const Sidebar = ({
  menuItems    = DEFAULT_MENU_ITEMS,
  brandName    = "NOMBRE",
  brandSub     = "ADMIN",
  onLogout,
  logoUrl,
  useImageLogo,
  lowStockCount = 0,  // 👈 NUEVA PROP: cuántos productos con stock bajo
}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) onLogout();
    else navigate('/login');
  };

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
          <img
            src={defaultLogo}
            alt="Logo"
            className="sidebar-logo-img"
          />
        )}
        <span className="brand-subtitle">{brandSub}</span>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-group">
          {menuItems.map((item) => {
            // ¿Este item debe mostrar alerta de stock?
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
                {/* Contador opcional al lado del label */}
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