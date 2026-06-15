import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, PackagePlus, Package, Users, ShoppingCart,
  BarChart3, AlertTriangle, LogOut, FileText, ArrowLeft,
  Building2, Bot, Tag, MonitorSmartphone, UserCircle2, MapPin,
  RefreshCw, Settings,
} from 'lucide-react';
import './Sidebar.css';
import defaultLogo from '../../../../../assets/LogoVexios/banervexio.png';

const DEFAULT_MENU_ITEMS = [
  { path: '/tienda/:slug/admin/dashboard',      label: 'DASHBOARD',          icon: LayoutDashboard },
  { path: '/tienda/:slug/admin/productos',      label: 'PRODUCTOS',          icon: Package         },
  { path: '/tienda/:slug/admin/subir-producto', label: 'SUBIR PRODUCTO',     icon: PackagePlus     },
  { path: '/tienda/:slug/admin/usuarios',       label: 'GESTIONAR USUARIOS', icon: Users           },
  { path: '/tienda/:slug/admin/clientes',       label: 'CLIENTES',           icon: UserCircle2     },
  { path: '/tienda/:slug/admin/pedidos',        label: 'VER PEDIDOS',        icon: ShoppingCart    },
  { path: '/tienda/:slug/admin/devoluciones',   label: 'DEVOLUCIONES',       icon: RefreshCw       },
  { path: '/tienda/:slug/admin/pos',            label: 'PUNTO DE VENTA',     icon: MonitorSmartphone },
  { path: '/tienda/:slug/admin/promociones',    label: 'PROMOCIONES',        icon: Tag             },
  { path: '/tienda/:slug/admin/report',         label: 'INFORMES',           icon: BarChart3       },
  { path: '/tienda/:slug/admin/alertas',        label: 'ALERTAS DE STOCK',   icon: AlertTriangle,  alertKey: 'stock' },
  { path: '/tienda/:slug/admin/ubicaciones',    label: 'UBICACIONES',        icon: MapPin          },
  { path: '/tienda/:slug/admin/proveedores',    label: 'PROVEEDORES',        icon: Building2       },
  { path: '/tienda/:slug/admin/cms',            label: 'CONTENIDO CMS',      icon: FileText        },
  { path: '/tienda/:slug/admin/IA',             label: 'ASISTENTE IA',       icon: Bot             },
  { path: '/tienda/:slug/admin/configuracion',  label: 'CONFIGURACIÓN',      icon: Settings        },
];

const Sidebar = ({
  menuItems     = DEFAULT_MENU_ITEMS,
  brandName,
  brandSub      = "ADMIN",
  onLogout,
  logoUrl,
  useImageLogo,
  storeSlug,
  lowStockCount = 0,
  isOpen        = false,
  onClose,
  sidebarColor,
}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) onLogout();
    else navigate('/login');
  };

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  const resolvedItems = menuItems.map((item) => ({
    ...item,
    path: storeSlug ? item.path.replace(':slug', storeSlug) : item.path,
  }));

  // Inicial del nombre de la tienda para el placeholder
  const initial = (brandName ?? 'T')[0].toUpperCase();

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'sidebar-overlay--visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`sidebar-container ${isOpen ? 'sidebar-container--open' : ''}`}
        style={sidebarColor ? { '--sidebar-bg': sidebarColor } : undefined}
      >

        {/* ── Brand / Logo ─────────────────────────────────────────────── */}
        <div className="sidebar-brand">
          <div className="sidebar-logo-row">
            {useImageLogo && logoUrl ? (
              <img
                src={logoUrl}
                alt={brandName ?? 'Logo'}
                className="sidebar-logo-img"
                onError={(e) => { e.target.onerror = null; e.target.src = defaultLogo; }}
              />
            ) : brandName ? (
              <div className="sidebar-logo-placeholder" title={brandName}>
                {initial}
              </div>
            ) : (
              <img src={defaultLogo} alt="Logo" className="sidebar-logo-full" />
            )}

            {brandName && (
              <div className="sidebar-brand-text">
                <span className="sidebar-store-name">{brandName}</span>
                <span className="brand-subtitle">{brandSub}</span>
              </div>
            )}
          </div>

          {!brandName && (
            <span className="brand-subtitle">{brandSub}</span>
          )}
        </div>

        {/* ── Nav ──────────────────────────────────────────────────────── */}
        <nav className="sidebar-nav">
          {storeSlug && (
            <NavLink
              to={`/tienda/${storeSlug}`}
              className="nav-link back-to-store"
              onClick={handleNavClick}
            >
              <ArrowLeft size={18} />
              <span>VOLVER A LA TIENDA</span>
            </NavLink>
          )}

          <div className="nav-group">
            {resolvedItems.map((item) => {
              const showStockAlert = item.alertKey === 'stock' && lowStockCount > 0;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                  onClick={handleNavClick}
                >
                  <span className="nav-icon-wrapper">
                    <item.icon size={18} />
                    {showStockAlert && (
                      <span
                        className="stock-alert-dot"
                        title={`${lowStockCount} productos con stock bajo`}
                      />
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
    </>
  );
};

export default Sidebar;
