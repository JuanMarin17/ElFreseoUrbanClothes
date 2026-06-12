import React, { useEffect, useState } from 'react';
import { Bell, X, ShoppingCart, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { getOrders } from '../../../services/OrdersService';
import { getAllProducts } from '../../../services/productService';
import './NotifModal.css';

const ORDER_COLOR = {
  PENDING:    '#6366f1',
  PROCESSING: '#f59e0b',
  DELIVERED:  '#10b981',
  CANCELLED:  '#ef4444',
};

const ORDER_LABEL = {
  PENDING:    'pendiente',
  PROCESSING: 'en proceso',
  DELIVERED:  'entregado',
  CANCELLED:  'cancelado',
};

function formatRelative(dateStr) {
  if (!dateStr) return 'Reciente';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Hace un momento';
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  return `Hace ${days} día${days !== 1 ? 's' : ''}`;
}

function useNotifications() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);

    Promise.allSettled([
      Promise.resolve().then(() => getOrders({ size: 5 })),
      Promise.resolve().then(() => getAllProducts(localStorage.getItem('storeId'))),
    ]).then(([ordersRes, productsRes]) => {
      const items = [];

      if (ordersRes.status === 'fulfilled') {
        const raw = ordersRes.value;
        const list = Array.isArray(raw) ? raw : (raw?.content ?? raw?.data ?? []);
        list.slice(0, 4).forEach((o) => {
          const id = o.orderId ?? o.id;
          const status = (o.status ?? 'PENDING').toUpperCase();
          items.push({
            id: `order-${id}`,
            icon: <ShoppingCart size={15} />,
            color: ORDER_COLOR[status] ?? '#6366f1',
            text: `Pedido #${id} — ${ORDER_LABEL[status] ?? status.toLowerCase()}`,
            time: formatRelative(o.createdAt),
          });
        });
      }

      if (productsRes.status === 'fulfilled') {
        const products = Array.isArray(productsRes.value) ? productsRes.value : [];
        products
          .filter((p) => {
            const stock = (p.variants ?? []).reduce((s, v) => s + (v.stock ?? 0), 0);
            return stock <= 5 && (p.variants?.length ?? 0) > 0;
          })
          .slice(0, 3)
          .forEach((p) => {
            const stock = (p.variants ?? []).reduce((s, v) => s + (v.stock ?? 0), 0);
            items.push({
              id: `stock-${p.productId ?? p.id}`,
              icon: <AlertTriangle size={15} />,
              color: stock === 0 ? '#ef4444' : '#f59e0b',
              text: stock === 0
                ? `Sin stock: ${p.name}`
                : `Stock bajo: ${p.name} (${stock} ud${stock !== 1 ? 's' : ''})`,
              time: 'Ahora',
            });
          });
      }

      if (ordersRes.status === 'rejected' && productsRes.status === 'rejected') {
        setError(true);
      }

      setNotifs(items);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  return { notifs, loading, error, reload: load };
}

export default function NotifModal({ isOpen, onClose }) {
  const { notifs, loading, error, reload } = useNotifications();

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
          {loading ? (
            <li className="notif-item notif-item--loading">
              <Loader2 size={15} className="notif-spinner" />
              <span className="notif-text">Cargando notificaciones...</span>
            </li>
          ) : error ? (
            <li className="notif-item notif-item--empty">
              <span className="notif-icon" style={{ color: '#ef4444' }}><AlertTriangle size={15} /></span>
              <div className="notif-body">
                <p className="notif-text">Error al cargar notificaciones</p>
                <button
                  className="notif-clear-btn"
                  style={{ padding: 0, marginTop: 4 }}
                  onClick={reload}
                >
                  Reintentar
                </button>
              </div>
            </li>
          ) : notifs.length === 0 ? (
            <li className="notif-item notif-item--empty">
              <span className="notif-icon" style={{ color: '#10b981' }}><CheckCircle size={15} /></span>
              <div className="notif-body">
                <p className="notif-text">Todo al día, sin alertas pendientes</p>
              </div>
            </li>
          ) : (
            notifs.map((n) => (
              <li key={n.id} className="notif-item">
                <span className="notif-icon" style={{ color: n.color }}>{n.icon}</span>
                <div className="notif-body">
                  <p className="notif-text">{n.text}</p>
                  <span className="notif-time">{n.time}</span>
                </div>
              </li>
            ))
          )}
        </ul>

        <div className="notif-modal__footer">
          <button className="notif-clear-btn" onClick={onClose}>
            Marcar todas como leídas
          </button>
        </div>
      </div>
    </>
  );
}
