import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Shield, ShoppingBag, Bell,
  MapPin, Settings, HelpCircle, LogOut, ArrowLeft,
  RefreshCw, Star,
} from 'lucide-react';
import './AccountSidebar.css';

const MENU = [
  { key: 'profile',       path: '/cuenta/perfil',         label: 'Mi Perfil',              icon: <User size={15} /> },
  { key: 'security',      path: '/cuenta/seguridad',      label: 'Seguridad',              icon: <Shield size={15} /> },
  { key: 'orders',        path: '/cuenta/pedidos',        label: 'Mis Pedidos',            icon: <ShoppingBag size={15} /> },
  { key: 'returns',       path: '/cuenta/devoluciones',   label: 'Devoluciones',           icon: <RefreshCw size={15} /> },
  { key: 'loyalty',       path: '/cuenta/puntos',         label: 'Mis Puntos',             icon: <Star size={15} /> },
  { key: 'notifications', path: '/cuenta/notificaciones', label: 'Notificaciones',         icon: <Bell size={15} /> },
  { key: 'addresses',     path: '/cuenta/direcciones',    label: 'Libreta de Direcciones', icon: <MapPin size={15} /> },
  { key: 'preferences',   path: '/cuenta/preferencias',   label: 'Preferencias',           icon: <Settings size={15} /> },
  { key: 'support',       path: '/cuenta/soporte',        label: 'Ayuda y Soporte',        icon: <HelpCircle size={15} /> },
];

function getUserInfo() {
  try {
    // 1. Preferir profile_cache de sessionStorage (más fresco, lo guarda MyProfile)
    const cached = sessionStorage.getItem('profile_cache');
    if (cached) {
      const u = JSON.parse(cached);
      return {
        name:   (u.userName || u.name || u.userEmail || 'USUARIO').toUpperCase(),
        avatar: u.imageProfile || u.avatar || null,
      };
    }
    // 2. Fallback: objeto user del login en localStorage
    const raw = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (raw) {
      const u = JSON.parse(raw);
      return {
        name:   (u.userName || u.name || u.email || 'USUARIO').toUpperCase(),
        avatar: u.imageProfile || u.avatar || null,
      };
    }
  } catch { /* noop */ }
  return { name: 'MI CUENTA', avatar: null };
}

export default function AccountSidebar({ active, onSelect }) {
  const navigate = useNavigate();
  const user = useMemo(getUserInfo, []);

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
    sessionStorage.clear();
    navigate('/');
    window.location.reload();
  };

  return (
    <aside className="account-sidebar">
      {/* Volver al market */}
      <button className="sidebar-back-btn" onClick={() => navigate('/market')}>
        <ArrowLeft size={13} />
        <span>Volver al Market</span>
      </button>

      {/* Área de usuario */}
      <div className="sidebar-user-area">
        <div className="avatar-glow-container">
          <div className="avatar-circle">
            {user.avatar
              ? <img src={user.avatar} alt="avatar" />
              : <User size={18} />
            }
          </div>
          <div className="online-indicator" />
        </div>
        <div className="avatar-info">
          <p className="avatar-name">{user.name}</p>
          <span className="info-tag sidebar-role-tag">• ACTIVO</span>
        </div>
      </div>

      {/* Navegación */}
      <span className="sidebar-group-label">PANEL</span>
      <nav className="sidebar-nav-account">
        {MENU.map(({ key, path, label, icon }) => (
          <button
            key={key}
            className={`sidebar-item${active === key ? ' sidebar-item--active' : ''}`}
            onClick={() => { onSelect(key); navigate(path); }}
          >
            <span className="sidebar-icon">{icon}</span>
            <span className="sidebar-label">{label}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <button className="sidebar-item logout-btn" onClick={handleLogout}>
          <span className="sidebar-icon"><LogOut size={15} /></span>
          <span className="sidebar-label">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
