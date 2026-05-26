import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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

  const menuItems = [
    { path: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
    { path: 'subir-productos', label: 'SUBIR PRODUCTOS', icon: PackagePlus },
    { path: 'usuarios', label: 'GESTIONAR USUARIOS', icon: Users },
    { path: 'pedidos', label: 'VER PEDIDOS', icon: ShoppingCart },
    { path: 'informes', label: 'INFORMES', icon: BarChart3 },
    { path: 'carrusel', label: 'CARRUSEL', icon: ImageIcon },
    { path: 'alertas', label: 'ALERTAS DE STOCK', icon: AlertTriangle },
  ];

  const handleLogout = () => {
    // Aquí puedes añadir la lógica para limpiar LocalStorage o Cookies
    // localStorage.removeItem('token');
    console.log("Cerrando sesión...");
    navigate('/login'); 
  };

  return (
    <aside className="sidebar-container">
      <div className="sidebar-brand">
        <h2>EL FRESEO</h2>
        <span className="brand-subtitle">ADMIN TERMINAL</span>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-group">
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
        </div>

        {/* Opción de Cerrar Sesión separada */}
        <div className="nav-footer">
          <button onClick={handleLogout} className="nav-link logout-btn">
            <LogOut size={18} />
            <span>CERRAR SESIÓN</span>
          </button>
        </div>
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