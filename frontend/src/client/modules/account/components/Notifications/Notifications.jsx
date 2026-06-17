import React from 'react';
import { Bell, Package, XCircle, CheckCircle, ShieldAlert, Ban, Store, AlertCircle } from 'lucide-react';
import { useNotificationInbox } from '../../../../../hooks/useUserNotifications';
import './Notifications.css';

const TYPE_CONFIG = {
  STORE_DISABLED:       { icon: <Ban size={16} />,         color: '#ef4444', label: 'Tienda inhabilitada' },
  STORE_ENABLED:        { icon: <Store size={16} />,       color: '#22c55e', label: 'Tienda habilitada'   },
  SESSION_ALERT:        { icon: <ShieldAlert size={16} />, color: '#f97316', label: 'Alerta de seguridad' },
  ORDER_STATUS_CHANGED: { icon: <Package size={16} />,     color: '#7880fd', label: 'Pedido'              },
  ORDER_CANCELLED:      { icon: <XCircle size={16} />,     color: '#ef4444', label: 'Pedido cancelado'    },
  PAYMENT_RESULT:       { icon: <CheckCircle size={16} />, color: '#10b981', label: 'Pago'                },
};

const DEFAULT_CONFIG = { icon: <Bell size={16} />, color: '#888', label: 'Notificación' };

function formatTime(iso) {
  if (!iso) return '';
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Hace un momento';
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  return `Hace ${days} día${days !== 1 ? 's' : ''}`;
}

export default function Notifications() {
  const { notifications, unread, loading, error, markRead, markAllRead } = useNotificationInbox();

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
      ) : error ? (
        <div className="notif-empty-state">
          <div className="notif-empty-icon-wrap" style={{ color: '#ef4444' }}>
            <AlertCircle size={36} />
          </div>
          <p className="notif-empty-title">ERROR AL CARGAR</p>
          <p className="notif-empty-sub">{error}</p>
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
            const cfg = TYPE_CONFIG[n.type] ?? DEFAULT_CONFIG;
            return (
              <div
                key={n.id}
                className={`notif-item ${n.read ? 'notif-item--read' : 'notif-item--unread'}`}
                onClick={() => !n.read && markRead(n.id)}
                role="button"
                tabIndex={0}
              >
                <div className="notif-item-icon" style={{ color: cfg.color }}>
                  {cfg.icon}
                </div>
                <div className="notif-item-body">
                  <p className="notif-item-title">{n.title}</p>
                  <p className="notif-item-msg">{n.message}</p>
                  <span className="notif-item-time">{formatTime(n.createdAt)}</span>
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
