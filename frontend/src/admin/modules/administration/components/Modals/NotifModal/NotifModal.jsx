import React, { useState } from 'react';
import { X, Bell, Package, Users, TrendingDown, ShoppingCart, Shield, Globe } from 'lucide-react';
import '../styles/Modal.css';

// ── Notificaciones SuperAdmin ────────────────────────────────────────────────
const SUPER_NOTIFS = [
  {
    id: 1, read: false,
    icon: Users, iconColor: "#3b82f6",
    title: "Nuevo usuario registrado",
    desc: "carlos.m@gmail.com se registró en la plataforma.",
    time: "Hace 5 min",
  },
  {
    id: 2, read: false,
    icon: Globe, iconColor: "#8b5cf6",
    title: "Nueva tienda creada",
    desc: "La tienda 'ModaUrbana' fue activada con plan PRO.",
    time: "Hace 18 min",
  },
  {
    id: 3, read: false,
    icon: Shield, iconColor: "#f59e0b",
    title: "Alerta de seguridad",
    desc: "3 intentos de login fallidos detectados desde IP desconocida.",
    time: "Hace 1 h",
  },
  {
    id: 4, read: true,
    icon: TrendingDown, iconColor: "#ef4444",
    title: "Caída de conversión",
    desc: "La tasa de conversión bajó un 12% respecto a ayer.",
    time: "Hace 3 h",
  },
  {
    id: 5, read: true,
    icon: ShoppingCart, iconColor: "#10b981",
    title: "Transacción completada",
    desc: "Plan ENTERPRISE activado para tienda 'TechStore'.",
    time: "Hace 5 h",
  },
];

// ── Notificaciones Admin Normal ──────────────────────────────────────────────
const ADMIN_NOTIFS = [
  {
    id: 1, read: false,
    icon: ShoppingCart, iconColor: "#3b82f6",
    title: "Nuevo pedido #1084",
    desc: "Juan Pérez realizó un pedido por $124.00.",
    time: "Hace 3 min",
  },
  {
    id: 2, read: false,
    icon: Package, iconColor: "#f59e0b",
    title: "Stock crítico",
    desc: "Zapatillas Pro X1 tiene solo 3 unidades disponibles.",
    time: "Hace 22 min",
  },
  {
    id: 3, read: false,
    icon: Users, iconColor: "#8b5cf6",
    title: "Cliente nuevo",
    desc: "maria.g@hotmail.com se registró en tu tienda.",
    time: "Hace 45 min",
  },
  {
    id: 4, read: true,
    icon: TrendingDown, iconColor: "#ef4444",
    title: "Pedido cancelado",
    desc: "El pedido #1079 fue cancelado por el cliente.",
    time: "Hace 2 h",
  },
  {
    id: 5, read: true,
    icon: Package, iconColor: "#10b981",
    title: "Producto publicado",
    desc: "'Audífonos BT-500' ya está visible en tu tienda.",
    time: "Hace 4 h",
  },
];

const NotifModal = ({ isOpen, onClose, isSuperAdmin }) => {
  const allNotifs = isSuperAdmin ? SUPER_NOTIFS : ADMIN_NOTIFS;
  const [notifs, setNotifs] = useState(allNotifs);
  const unread = notifs.filter((n) => !n.read).length;

  const markAllRead = () =>
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));

  const dismiss = (id) =>
    setNotifs((prev) => prev.filter((n) => n.id !== id));

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-left">
            <Bell size={16} className="modal-header-icon" />
            <h2 className="modal-title">Notificaciones</h2>
            {unread > 0 && <span className="modal-badge">{unread}</span>}
          </div>
          <div className="modal-header-right">
            {unread > 0 && (
              <button className="modal-text-btn" onClick={markAllRead}>
                Marcar todo como leído
              </button>
            )}
            <button className="modal-close-btn" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Lista */}
        <div className="modal-body">
          {notifs.length === 0 ? (
            <div className="modal-empty">
              <Bell size={32} strokeWidth={1} />
              <p>Sin notificaciones</p>
            </div>
          ) : (
            notifs.map(({ id, read, icon: Icon, iconColor, title, desc, time }) => (
              <div key={id} className={`notif-item ${!read ? 'notif-item--unread' : ''}`}>
                <div className="notif-icon-wrap" style={{ background: `${iconColor}18` }}>
                  <Icon size={16} color={iconColor} />
                </div>
                <div className="notif-content">
                  <p className="notif-title">{title}</p>
                  <p className="notif-desc">{desc}</p>
                  <span className="notif-time">{time}</span>
                </div>
                <button className="notif-dismiss" onClick={() => dismiss(id)}>
                  <X size={12} />
                </button>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default NotifModal;