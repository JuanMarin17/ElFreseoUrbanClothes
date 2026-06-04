import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PackagePlus,
  Users,
  ShoppingCart,
  BarChart3,
  AlertTriangle,
  LogOut,
} from 'lucide-react';
import './Sidebar.css';
import defaultLogo from '../../../../../assets/LogoVexios/banervexio.png';

// Rutas del panel admin (paths completos)
const DEFAULT_MENU_ITEMS = [
  { path: '/admin/:slug/dashboard',       label: 'DASHBOARD',          icon: LayoutDashboard },
  { path: '/admin/:slug/subir-producto',  label: 'SUBIR PRODUCTOS',    icon: PackagePlus     },
  { path: '/admin/:slug/usuarios',        label: 'GESTIONAR USUARIOS', icon: Users           },
  { path: '/admin/:slug/pedidos',         label: 'VER PEDIDOS',        icon: ShoppingCart    },
  { path: '/admin/:slug/report',          label: 'INFORMES',           icon: BarChart3       },
  { path: '/admin/:slug/alertas',         label: 'ALERTAS DE STOCK',   icon: AlertTriangle   },
];

export default function Sidebar({
  menuItems    = DEFAULT_MENU_ITEMS,
  brandName    = "VEXIO",
  brandSub     = "ADMIN",
  onLogout,
  logoUrl,
  useImageLogo = false,
  storeSlug,          // necesario para construir rutas admin
  lowStockCount = 0,
}) {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      navigate('/login');
    }
  };

  // Si los paths tienen el parámetro :slug, sustituirlo por el slug real
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
          {resolvedItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
              {item.alertKey === 'stock' && lowStockCount > 0 && (
                <span className="nav-badge">{lowStockCount}</span>
              )}
            </NavLink>
          ))}
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
}
