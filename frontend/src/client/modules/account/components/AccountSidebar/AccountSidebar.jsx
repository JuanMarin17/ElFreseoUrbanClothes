import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Shield, ShoppingBag,
  MapPin, Settings, HelpCircle, LogOut
} from 'lucide-react';
import './AccountSidebar.css';

const MENU = [
  { key: 'profile',     label: 'Mi Perfil',               icon: <User size={16} /> },
  { key: 'security',    label: 'Seguridad',               icon: <Shield size={16} /> },
  { key: 'orders',      label: 'Mis Pedidos',             icon: <ShoppingBag size={16} /> },
  { key: 'addresses',   label: 'Libreta de Direcciones',  icon: <MapPin size={16} /> },
  { key: 'preferences', label: 'Preferencias',            icon: <Settings size={16} /> },
  { key: 'support',     label: 'Ayuda y Soporte',         icon: <HelpCircle size={16} /> },
];

export default function AccountSidebar({ active, onSelect }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    navigate('/');
    window.location.reload();
  };

  return (
    <aside className="account-sidebar">
      <div className="sidebar-avatar">
        <div className="avatar-glow-container">
          <div className="avatar-circle">
            <User size={24} />
          </div>
          <div className="online-indicator" />
        </div>
        <div className="avatar-info">
          <span className="info-tag">SISTEMA</span>
          <p className="avatar-name">MI CUENTA</p>
        </div>
      </div>

      <nav className="sidebar-nav-account">
        {MENU.map(({ key, label, icon }) => (
          <button
            key={key}
            className={`sidebar-item ${active === key ? 'sidebar-item--active' : ''}`}
            onClick={() => onSelect(key)}
          >
            <span className="sidebar-icon">{icon}</span>
            <span className="sidebar-label">{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-item logout-btn" onClick={handleLogout}>
          <span className="sidebar-icon"><LogOut size={16} /></span>
          <span className="sidebar-label">CERRAR SESIÓN</span>
        </button>
      </div>
    </aside>
  );
}