import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PackagePlus, Users, ShoppingCart, BarChart3, ImageIcon, AlertTriangle } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const menuItems = [
    { path: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
    { path: 'subir-productos', label: 'SUBIR PRODUCTOS', icon: PackagePlus },
    { path: 'usuarios', label: 'GESTIONAR USUARIOS', icon: Users },
    { path: 'pedidos', label: 'VER PEDIDOS', icon: ShoppingCart },
    { path: 'informes', label: 'INFORMES', icon: BarChart3 },
    { path: 'carrusel', label: 'CARRUSEL', icon: ImageIcon },
    { path: 'alertas', label: 'ALERTAS DE STOCK', icon: AlertTriangle },
  ];

  return (
    <aside className="sidebar-container">
      <div className="sidebar-brand">
        <h2>EL FRESEO</h2>
        <span className="brand-subtitle">ADMIN TERMINAL</span>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={`/admin/${item.path}`} 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-user-pill">
        <div className="user-avatar" />
        <div className="user-info">
          <p className="user-name">ADMIN USER</p>
          <p className="user-role">SUPER ADMIN</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;