import React from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import {
  LayoutDashboard,
  PackagePlus,
  Users,
  ShoppingCart,
  BarChart3,
  ImageIcon,
  AlertTriangle,
  LogOut
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const { storeSlug } = useParams();

  const menuItems = [
    { path: 'dashboard',        label: 'DASHBOARD',          icon: LayoutDashboard },
    { path: 'subir-producto',   label: 'SUBIR PRODUCTOS',    icon: PackagePlus },
    { path: 'usuarios',         label: 'GESTIONAR USUARIOS', icon: Users },
    { path: 'pedidos',          label: 'VER PEDIDOS',        icon: ShoppingCart },
    { path: 'report',           label: 'INFORMES',           icon: BarChart3 },
    { path: 'alertas',          label: 'ALERTAS DE STOCK',   icon: AlertTriangle },
  ];

  const adminBase = `/admin/${storeSlug}`;

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <aside className="sidebar-container">
      <div className="sidebar-brand">
        <h2>Nombre</h2>
        <span className="brand-subtitle">ADMIN TERMINAL</span>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-group">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={`${adminBase}/${item.path}`}
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