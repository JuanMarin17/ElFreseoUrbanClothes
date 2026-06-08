import React from 'react';
import { Bell, X, ShoppingCart, AlertTriangle, CheckCircle } from 'lucide-react';
import './NotifModal.css';

const DEMO_NOTIFS = [
  { id: 1, icon: <ShoppingCart size={15} />, color: '#6366f1', text: 'Nuevo pedido #1042 recibido',         time: 'Hace 5 min'  },
  { id: 2, icon: <AlertTriangle size={15} />, color: '#f59e0b', text: 'Stock bajo: Camiseta Oversize (2 ud)', time: 'Hace 20 min' },
  { id: 3, icon: <CheckCircle size={15} />,  color: '#10b981', text: 'Pedido #1039 marcado como entregado',  time: 'Hace 1 h'    },
];

export default function NotifModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="notif-modal">
        <div className="notif-modal__header">
          <div className="notif-modal__title">
            <Bell size={15} />
            <span>Notificaciones</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}><X size={16} /></button>
        </div>

        <ul className="notif-list">
          {DEMO_NOTIFS.map(n => (
            <li key={n.id} className="notif-item">
              <span className="notif-icon" style={{ color: n.color }}>{n.icon}</span>
              <div className="notif-body">
                <p className="notif-text">{n.text}</p>
                <span className="notif-time">{n.time}</span>
              </div>
            </li>
          ))}
        </ul>

        <div className="notif-modal__footer">
          <button className="notif-clear-btn" onClick={onClose}>Marcar todas como leídas</button>
        </div>
      </div>
    </>
  );
}
