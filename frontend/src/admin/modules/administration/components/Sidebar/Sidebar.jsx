import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, PackagePlus, Users, ShoppingCart, 
  BarChart3, AlertTriangle, LogOut 
} from 'lucide-react';
import './Sidebar.css';
import defaultLogo from '../../../../../assets/LogoVexios/banervexio.png'; // ← ajusta el path a tu logo

const DEFAULT_MENU_ITEMS = [
  { path: '/admin/dashboard',        label: 'DASHBOARD',          icon: LayoutDashboard },
  { path: '/admin/subir-producto',   label: 'SUBIR PRODUCTOS',    icon: PackagePlus     },
  { path: '/admin/usuarios',         label: 'GESTIONAR USUARIOS', icon: Users           },
  { path: '/admin/pedidos',          label: 'VER PEDIDOS',        icon: ShoppingCart    },
  { path: '/admin/report',           label: 'INFORMES',           icon: BarChart3       },
  { path: '/admin/alertas',          label: 'ALERTAS DE STOCK',   icon: AlertTriangle   },
];

const Sidebar = ({
  menuItems  = DEFAULT_MENU_ITEMS,
  brandName  = "NOMBRE",
  brandSub   = "ADMIN",
  onLogout,
  logoUrl,        // ← URL de Cloudinary para el superadmin
  useImageLogo,   // ← true = mostrar imagen, false = mostrar texto
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
          // Superadmin → logo de la tienda desde Cloudinary o assets
          <img
            src={logoUrl || defaultLogo}
            alt={brandName}
            className="sidebar-logo-img"
            onError={(e) => { e.target.onerror = null; e.target.src = defaultLogo; }} // fallback si falla Cloudinary
          />
        ) : (
          // Admin normal → logo estático desde assets
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
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
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
};

export default Sidebar;