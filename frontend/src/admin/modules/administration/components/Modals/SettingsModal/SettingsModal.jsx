import React, { useState } from 'react';
import {
  X, Settings, User, Lock, Bell, Globe, CreditCard,
  Store, Palette, Shield, ChevronRight
} from 'lucide-react';
import '../styles/Modal.css';

// ── Secciones SuperAdmin ─────────────────────────────────────────────────────
const SUPER_SECTIONS = [
  {
    group: "Plataforma",
    items: [
      { icon: Globe,      color: "#3b82f6", label: "Configuración global",    desc: "Idioma, zona horaria, moneda" },
      { icon: CreditCard, color: "#8b5cf6", label: "Gestión de planes",       desc: "Precios, límites, features" },
      { icon: Shield,     color: "#f59e0b", label: "Seguridad",               desc: "2FA, sesiones, permisos" },
    ],
  },
  {
    group: "Cuenta",
    items: [
      { icon: User,       color: "#10b981", label: "Perfil de administrador", desc: "Nombre, email, avatar" },
      { icon: Lock,       color: "#ef4444", label: "Cambiar contraseña",      desc: "Actualiza tus credenciales" },
      { icon: Bell,       color: "#f59e0b", label: "Preferencias de alertas", desc: "Qué notificaciones recibir" },
    ],
  },
];

// ── Secciones Admin Normal ───────────────────────────────────────────────────
const ADMIN_SECTIONS = [
  {
    group: "Mi Tienda",
    items: [
      { icon: Store,      color: "#3b82f6", label: "Datos de la tienda",      desc: "Nombre, logo, descripción" },
      { icon: Palette,    color: "#8b5cf6", label: "Apariencia",              desc: "Colores, tipografía, banner" },
      { icon: Globe,      color: "#10b981", label: "Dominio y SEO",           desc: "Slug, meta tags, favicon" },
    ],
  },
  {
    group: "Cuenta",
    items: [
      { icon: User,       color: "#10b981", label: "Mi perfil",               desc: "Nombre, email, avatar" },
      { icon: Lock,       color: "#ef4444", label: "Cambiar contraseña",      desc: "Actualiza tus credenciales" },
      { icon: Bell,       color: "#f59e0b", label: "Notificaciones",          desc: "Pedidos, stock, clientes" },
    ],
  },
];

const SettingsModal = ({ isOpen, onClose, isSuperAdmin, userName, userRole }) => {
  const sections = isSuperAdmin ? SUPER_SECTIONS : ADMIN_SECTIONS;
  const [activeItem, setActiveItem] = useState(null);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-box--settings" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-left">
            <Settings size={16} className="modal-header-icon" />
            <h2 className="modal-title">Configuración</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* User pill */}
        <div className="settings-user-pill">
          <div className="settings-avatar">
            {(userName ?? "U")[0].toUpperCase()}
          </div>
          <div className="settings-user-info">
            <span className="settings-user-name">{userName ?? "Usuario"}</span>
            <span className="settings-user-role">{userRole ?? "ADMIN"}</span>
          </div>
          <span className={`settings-plan-badge ${isSuperAdmin ? 'settings-plan-badge--super' : ''}`}>
            {isSuperAdmin ? "SUPER ADMIN" : "ADMIN"}
          </span>
        </div>

        {/* Secciones */}
        <div className="modal-body">
          {sections.map(({ group, items }) => (
            <div key={group} className="settings-group">
              <p className="settings-group-label">{group}</p>
              {items.map(({ icon: Icon, color, label, desc }) => (
                <button
                  key={label}
                  className={`settings-item ${activeItem === label ? 'settings-item--active' : ''}`}
                  onClick={() => setActiveItem(label)}
                >
                  <div className="settings-item-icon" style={{ background: `${color}18` }}>
                    <Icon size={15} color={color} />
                  </div>
                  <div className="settings-item-text">
                    <span className="settings-item-label">{label}</span>
                    <span className="settings-item-desc">{desc}</span>
                  </div>
                  <ChevronRight size={14} className="settings-item-arrow" />
                </button>
              ))}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;