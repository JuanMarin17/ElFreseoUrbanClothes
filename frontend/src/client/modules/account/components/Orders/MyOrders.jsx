import React, { useState, useEffect } from 'react';
import { Package, ChevronDown, ChevronUp, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import accountService from '../../services/accountService';
import './MyOrders.css';

const STATUS_CONFIG = {
  Pendiente:    { color: '#f28a60', icon: <Clock size={14} /> },
  Confirmado:   { color: '#7880fd', icon: <CheckCircle size={14} /> },
  'En proceso': { color: '#7880fd', icon: <Truck size={14} /> },
  Enviado:      { color: '#7880fd', icon: <Truck size={14} /> },
  Entregado:    { color: '#00ffff', icon: <CheckCircle size={14} /> },
  Cancelado:    { color: '#ff4d4d', icon: <XCircle size={14} /> },
  Reembolsado:  { color: '#ff4d4d', icon: <XCircle size={14} /> },
};

const formatCOP = (n) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0,
  }).format(n ?? 0);

export default function MyOrders() {
  const [orders, setOrders]     = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    accountService.getOrders()
      .then(({ data }) => setOrders(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="orders-section">
      <div className="orders-header-main">
        <span className="info-tag">HISTORIAL_TRANSACCIONES</span>
        <h2 className="section-title">MIS PEDIDOS</h2>
      </div>

      {loading ? (
        <div className="loader-container">
          <div className="terminal-loader">Cargando registros del sistema...</div>
        </div>
      ) : orders.length === 0 ? (
        <div className="orders-empty">
          <Package size={40} className="empty-icon" />
          <p className="empty-text">NO SE ENCONTRARON REGISTROS DE COMPRA</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div className={`order-card ${expanded === order.id ? 'expanded' : ''}`} key={order.id}>
              <div className="order-header-row" onClick={() =>
                setExpanded(e => e === order.id ? null : order.id)}>
                
                <div className="order-main-meta">
                  <span className="order-id">ID: #{order.id}</span>
                  <span className="order-date">{order.date}</span>
                </div>

                <div className="order-status-group">
                  <div 
                    className="status-badge" 
                    style={{ '--status-color': STATUS_CONFIG[order.status]?.color }}
                  >
                    {STATUS_CONFIG[order.status]?.icon}
                    <span>{order.status.toUpperCase()}</span>
                  </div>
                  <span className="order-total-price">{formatCOP(order.total)}</span>
                  <div className="expand-icon-box">
                    {expanded === order.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>
              </div>

              {expanded === order.id && (
                <div className="order-expanded-detail">
                  <div className="detail-grid">
                    {order.items?.map((item, i) => (
                      <div className="order-item-row" key={i}>
                        <div className="item-img-wrapper">
                          <img src={item.image} alt={item.name} />
                        </div>
                        <div className="item-info">
                          <p className="item-name">{item.name}</p>
                          <p className="item-meta">
                            CANTIDAD: {item.qty} <span className="divider">|</span> UNIDAD: {formatCOP(item.price)}
                          </p>
                        </div>
                        <div className="item-subtotal">
                          {formatCOP(item.qty * item.price)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="order-footer-actions">
                    <button className="action-btn-outline">DESCARGAR FACTURA</button>
                    <button className="action-btn-outline">RASTREAR ENVÍO</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}