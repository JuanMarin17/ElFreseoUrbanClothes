import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Shield, ShoppingBag, Bell,
  MapPin, Settings, HelpCircle, LogOut, ArrowLeft,
  RefreshCw, Star,
} from 'lucide-react';
import './AccountSidebar.css';

const MENU = [
  { key: 'profile',       path: '/cuenta/perfil',          label: 'Mi Perfil',               icon: <User size={16} /> },
  { key: 'security',      path: '/cuenta/seguridad',       label: 'Seguridad',               icon: <Shield size={16} /> },
  { key: 'orders',        path: '/cuenta/pedidos',         label: 'Mis Pedidos',             icon: <ShoppingBag size={16} /> },
  { key: 'returns',       path: '/cuenta/devoluciones',    label: 'Devoluciones',            icon: <RefreshCw size={16} /> },
  { key: 'loyalty',       path: '/cuenta/puntos',          label: 'Mis Puntos',              icon: <Star size={16} /> },
  { key: 'notifications', path: '/cuenta/notificaciones',  label: 'Notificaciones',          icon: <Bell size={16} /> },
  { key: 'addresses',     path: '/cuenta/direcciones',     label: 'Libreta de Direcciones',  icon: <MapPin size={16} /> },
  { key: 'preferences',   path: '/cuenta/preferencias',    label: 'Preferencias',            icon: <Settings size={16} /> },
  { key: 'support',       path: '/cuenta/soporte',         label: 'Ayuda y Soporte',         icon: <HelpCircle size={16} /> },
];

export default function AccountSidebar({ active, onSelect }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
    sessionStorage.clear();
    navigate('/');
    window.location.reload();
  };

  return (
    <aside className="account-sidebar">
      <button className="sidebar-back-btn" onClick={() => navigate('/market')}>
        <ArrowLeft size={15} />
        <span>Volver al Market</span>
      </button>

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
        {MENU.map(({ key, path, label, icon }) => (
          <button
            key={key}
            className={`sidebar-item ${active === key ? 'sidebar-item--active' : ''}`}
            onClick={() => { onSelect(key); navigate(path); }}
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
