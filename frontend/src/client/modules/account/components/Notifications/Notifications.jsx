import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, Package, Tag, Info } from 'lucide-react';
import './Notifications.css';

const TYPE_CONFIG = {
  order:   { icon: <Package size={16} />,     color: '#7880fd', label: 'Pedido'      },
  promo:   { icon: <Tag size={16} />,          color: '#f59e0b', label: 'Promoción'   },
  info:    { icon: <Info size={16} />,         color: '#22d3ee', label: 'Información' },
  success: { icon: <CheckCircle size={16} />,  color: '#10b981', label: 'Éxito'       },
};

// Sin API de notificaciones aún — estado vacío por defecto
function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    // TODO: reemplazar con llamada real cuando exista el endpoint
    setTimeout(() => {
      setNotifications([]);
      setLoading(false);
    }, 600);
  }, []);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return { notifications, loading, markAllRead };
}

export default function Notifications() {
  const { notifications, loading, markAllRead } = useNotifications();
  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="notif-section">
      <div className="notif-section-header">
        <span className="info-tag">CENTRO_NOTIFICACIONES</span>
        <div className="notif-title-row">
          <h2 className="section-title">NOTIFICACIONES</h2>
          {unread > 0 && (
            <button className="notif-mark-all" onClick={markAllRead}>
              Marcar todas como leídas
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="notif-loader">
          <div className="terminal-loader">Cargando notificaciones...</div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="notif-empty-state">
          <div className="notif-empty-icon-wrap">
            <Bell size={40} />
          </div>
          <p className="notif-empty-title">SIN NOTIFICACIONES</p>
          <p className="notif-empty-sub">Cuando tengas alertas o novedades aparecerán aquí.</p>
        </div>
      ) : (
        <div className="notif-list">
          {notifications.map(n => {
            const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.info;
            return (
              <div
                key={n.id}
                className={`notif-item ${n.read ? 'notif-item--read' : 'notif-item--unread'}`}
              >
                <div className="notif-item-icon" style={{ color: cfg.color }}>
                  {cfg.icon}
                </div>
                <div className="notif-item-body">
                  <p className="notif-item-title">{n.title}</p>
                  <p className="notif-item-msg">{n.message}</p>
                  <span className="notif-item-time">{n.time}</span>
                </div>
                {!n.read && <span className="notif-dot" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
