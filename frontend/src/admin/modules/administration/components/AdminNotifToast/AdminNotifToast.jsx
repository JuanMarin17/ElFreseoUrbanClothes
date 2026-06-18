import React, { useState, useEffect, useCallback } from "react";
import { ShoppingBag, Ticket, Star, X } from "lucide-react";
import "./AdminNotifToast.css";

const TYPE_CONFIG = {
  NEW_ORDER:  { icon: ShoppingBag, color: "#22c55e", label: "Nueva orden"   },
  NEW_TICKET: { icon: Ticket,      color: "#f59e0b", label: "Nuevo ticket"  },
  NEW_REVIEW: { icon: Star,        color: "#818cf8", label: "Nueva reseña"  },
};

function NotifToastItem({ notif, onDismiss }) {
  const cfg = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.NEW_ORDER;
  const Icon = cfg.icon;

  useEffect(() => {
    const t = setTimeout(() => onDismiss(notif.id), 5_500);
    return () => clearTimeout(t);
  }, [notif.id, onDismiss]);

  return (
    <div className="ant-item" style={{ "--ant-color": cfg.color }}>
      <div className="ant-icon">
        <Icon size={16} />
      </div>
      <div className="ant-body">
        <p className="ant-label">{cfg.label}</p>
        <p className="ant-title">{notif.title}</p>
        {notif.message && <p className="ant-msg">{notif.message}</p>}
      </div>
      <button className="ant-close" onClick={() => onDismiss(notif.id)} aria-label="Cerrar">
        <X size={13} />
      </button>
      <div className="ant-progress" />
    </div>
  );
}

/**
 * Muestra los toasts de notificaciones SSE del admin (órdenes, tickets, reseñas).
 * @param {{ notifications: object[] }} props
 */
export default function AdminNotifToast({ notifications }) {
  const [visible, setVisible] = useState([]);

  useEffect(() => {
    if (!notifications.length) return;
    const latest = notifications[0];
    setVisible((prev) => {
      if (prev.find((n) => n.id === latest.id)) return prev;
      return [latest, ...prev].slice(0, 4);
    });
  }, [notifications]);

  const dismiss = useCallback((id) => {
    setVisible((prev) => prev.filter((n) => n.id !== id));
  }, []);

  if (!visible.length) return null;

  return (
    <div className="ant-stack">
      {visible.map((n) => (
        <NotifToastItem key={n.id} notif={n} onDismiss={dismiss} />
      ))}
    </div>
  );
}
