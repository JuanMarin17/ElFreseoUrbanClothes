import React, { useState, useEffect, useCallback } from 'react';
import {
  Package, Clock, CheckCircle2, Search, Filter,
  Eye, X, Printer, ChevronLeft, ChevronRight, RefreshCw, ArrowUpDown,
} from 'lucide-react';
import { getOrders, updateOrderStatus } from '../../services/OrdersService';
import './OrdersManagement.css';

// ── Constantes de dominio ────────────────────────────────────────────────────

const STATUS_LABELS = {
  PENDING:    'Pendiente',
  CONFIRMED:  'Confirmada',
  PROCESSING: 'En proceso',
  SHIPPED:    'Enviada',
  DELIVERED:  'Entregada',
  CANCELLED:  'Cancelada',
  REFUNDED:   'Reembolsada',
};

const STATUS_BADGE = {
  PENDING:    'badge-warning',
  CONFIRMED:  'badge-info',
  PROCESSING: 'badge-info',
  SHIPPED:    'badge-info',
  DELIVERED:  'badge-success',
  CANCELLED:  'badge-danger',
  REFUNDED:   'badge-danger',
};

// Flujo de estados válido (avance lineal)
const NEXT_STATUS = {
  PENDING:    'CONFIRMED',
  CONFIRMED:  'PROCESSING',
  PROCESSING: 'SHIPPED',
  SHIPPED:    'DELIVERED',
};

const PAYMENT_METHOD_LABELS = {
  CREDIT_CARD:      'Tarjeta de crédito',
  DEBIT_CARD:       'Tarjeta débito',
  TRANSFER:         'Transferencia',
  CASH_ON_DELIVERY: 'Contra entrega',
  DIGITAL_WALLET:   'Billetera digital',
};

const PAYMENT_STATUS_LABELS = {
  APPROVED: 'Aprobado',
  PENDING:  'Pendiente',
  REJECTED: 'Rechazado',
  REFUNDED: 'Reembolsado',
};

// ── Utilidades ───────────────────────────────────────────────────────────────

const formatCOP = (val) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0,
  }).format(val ?? 0);

// El backend devuelve LocalDateTime sin zona horaria (UTC-5 Colombia)
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(`${dateStr}-05:00`);
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  }).format(d);
};

// ── Componente principal ─────────────────────────────────────────────────────

const PAGE_SIZE = 20;

export default function OrdersManagement() {
  const [orders,        setOrders]        = useState([]);
  const [page,          setPage]          = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages,    setTotalPages]    = useState(0);
  const [statusFilter,  setStatusFilter]  = useState('');
  const [searchTerm,    setSearchTerm]    = useState('');
  const [loading,       setLoading]       = useState(false);
  const [stats,         setStats]         = useState({ total: 0, pending: 0 });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId,    setUpdatingId]    = useState(null);
  const [toast,         setToast]         = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleError = useCallback((err) => {
    if (err.status === 401) { window.location.href = '/login'; return; }
    if (err.status === 403) { showToast('error', 'Sin permisos para esta acción'); return; }
    if (err.status === 404) { showToast('error', 'Recurso no encontrado'); return; }
    if (err.status === 409) { showToast('error', err.message || 'Conflicto detectado'); return; }
    showToast('error', 'Error del servidor, intenta de nuevo');
  }, []);

  // ── Carga de órdenes ───────────────────────────────────────────────────────

  const loadOrders = useCallback(async (pg = 0) => {
    setLoading(true);
    try {
      const data = await getOrders({
        status: statusFilter || undefined,
        page:   pg,
        size:   PAGE_SIZE,
      });
      setOrders(data.content ?? []);
      setTotalElements(data.totalElements ?? 0);
      setTotalPages(data.totalPages ?? 0);
      setPage(pg);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, handleError]);

  // Carga KPIs: total de órdenes y cuántas están pendientes
  const loadStats = useCallback(async () => {
    try {
      const [allRes, pendingRes] = await Promise.all([
        getOrders({ page: 0, size: 1 }),
        getOrders({ status: 'PENDING', page: 0, size: 1 }),
      ]);
      setStats({ total: allRes.totalElements ?? 0, pending: pendingRes.totalElements ?? 0 });
    } catch { /* KPIs son no críticos */ }
  }, []);

  useEffect(() => {
    const run = async () => { await loadOrders(0); };
    run();
  }, [statusFilter, loadOrders]);

  useEffect(() => {
    const run = async () => { await loadStats(); };
    run();
  }, [loadStats]);

  // ── Actualización de estado ────────────────────────────────────────────────

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const updated = await updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      if (selectedOrder?.id === orderId) setSelectedOrder(updated);
      showToast('success', `Estado actualizado a "${STATUS_LABELS[newStatus]}"`);
      loadStats();
    } catch (err) {
      handleError(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancel = (orderId) => {
    if (!window.confirm('¿Cancelar esta orden? Esta acción no se puede deshacer.')) return;
    handleStatusUpdate(orderId, 'CANCELLED');
  };

  // ── Filtrado local (solo sobre la página actual) ───────────────────────────

  const filteredOrders = orders.filter((o) => {
    if (!searchTerm) return true;
    const t = searchTerm.toLowerCase();
    return (
      (o.orderNumber    ?? '').toLowerCase().includes(t) ||
      (o.customerName   ?? '').toLowerCase().includes(t) ||
      (o.customerEmail  ?? '').toLowerCase().includes(t)
    );
  });

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="orders-container">

      {/* Toast */}
      {toast && (
        <div className={`orders-toast orders-toast-${toast.type}`}>
          {toast.message}
        </div>
      )}

      {/* Encabezado */}
      <div className="orders-page-header">
        <div>
          <h1 className="orders-title">Historial de Pedidos</h1>
          <p className="orders-subtitle">
            Monitoreo de transacciones y despachos en tiempo real.
          </p>
        </div>
        <button
          className="orders-refresh-btn"
          onClick={() => { loadOrders(page); loadStats(); }}
          disabled={loading}
          title="Recargar"
        >
          <RefreshCw size={16} className={loading ? 'orders-spin' : ''} />
        </button>
      </div>

      {/* KPIs */}
      <div className="orders-stats-grid">
        <div className="order-kpi-card">
          <div className="kpi-icon-wrapper blue"><Package size={20} /></div>
          <div className="kpi-data">
            <span className="kpi-label">Pedidos Totales</span>
            <h3 className="kpi-value">{(stats.total ?? 0).toLocaleString('es-CO')}</h3>
          </div>
        </div>
        <div className="order-kpi-card">
          <div className="kpi-icon-wrapper orange"><Clock size={20} /></div>
          <div className="kpi-data">
            <span className="kpi-label">Pendientes</span>
            <h3 className="kpi-value">{(stats.pending ?? 0).toLocaleString('es-CO')}</h3>
            <span className="kpi-trend neutral">Por procesar</span>
          </div>
        </div>
        <div className="order-kpi-card">
          <div className="kpi-icon-wrapper green"><CheckCircle2 size={20} /></div>
          <div className="kpi-data">
            <span className="kpi-label">
              {statusFilter ? STATUS_LABELS[statusFilter] : 'Todos los estados'}
            </span>
            <h3 className="kpi-value">{totalElements.toLocaleString('es-CO')}</h3>
            <span className="kpi-trend neutral">Resultados del filtro</span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="orders-filter-bar">
        <div className="orders-search-input-wrapper">
          <Search size={16} className="search-box-icon" />
          <input
            type="text"
            placeholder="Buscar por N° orden o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="orders-search-input"
          />
        </div>
        <div className="orders-filter-options">
          <div className="filter-select-container">
            <Filter size={14} className="filter-select-icon" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="orders-status-select"
            >
              <option value="">Todos los estados</option>
              {Object.entries(STATUS_LABELS).map(([val, lbl]) => (
                <option key={val} value={val}>{lbl}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="orders-table-wrapper">
        {loading ? (
          <div className="orders-state-placeholder">Cargando pedidos...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="orders-state-placeholder">No se encontraron pedidos.</div>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>N° Pedido <ArrowUpDown size={12} className="sort-icon" /></th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Productos</th>
                <th>Total</th>
                <th>Estado</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td className="font-mono text-highlight">{order.orderNumber}</td>
                  <td>
                    <div className="customer-info-cell">
                      <span className="customer-name">{order.customerName || 'Anónimo'}</span>
                      <span className="customer-email">{order.customerEmail || '-'}</span>
                    </div>
                  </td>
                  <td className="text-muted">{formatDate(order.createdAt)}</td>
                  <td>
                    <span className="products-cell-text">
                      {(order.items ?? []).slice(0, 2).map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                      {(order.items ?? []).length > 2 && ` +${order.items.length - 2} más`}
                    </span>
                  </td>
                  <td className="font-semibold">{formatCOP(order.total)}</td>
                  <td>
                    <span className={`orders-status-badge ${STATUS_BADGE[order.status] ?? 'badge-default'}`}>
                      <span className="badge-dot" />
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </td>
                  <td>
                    <div className="orders-action-buttons">
                      <button
                        className="action-row-btn"
                        title="Ver detalles"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginación */}
      {!loading && totalPages > 1 && (
        <div className="orders-table-footer">
          <p className="footer-records-text">
            Página <b>{page + 1}</b> de <b>{totalPages}</b> —{' '}
            {totalElements.toLocaleString('es-CO')} resultados
          </p>
          <div className="orders-pagination-controls">
            <button
              className="pag-btn"
              disabled={page === 0}
              onClick={() => loadOrders(page - 1)}
            >
              <ChevronLeft size={14} /> Anterior
            </button>
            <span className="pag-btn active">{page + 1}</span>
            <button
              className="pag-btn"
              disabled={page >= totalPages - 1}
              onClick={() => loadOrders(page + 1)}
            >
              Siguiente <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Modal de detalle */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          updatingId={updatingId}
          onClose={() => setSelectedOrder(null)}
          onAdvance={(id, status) => handleStatusUpdate(id, status)}
          onCancel={(id)          => handleCancel(id)}
        />
      )}
    </div>
  );
}

// ── Modal de detalle de orden ────────────────────────────────────────────────

function OrderDetailModal({ order, updatingId, onClose, onAdvance, onCancel }) {
  const nextStatus  = NEXT_STATUS[order.status];
  const isUpdating  = updatingId === order.id;
  const canCancel   = !['CANCELLED', 'DELIVERED', 'REFUNDED'].includes(order.status);

  return (
    <div
      className="invoice-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="invoice-card" id="printable-invoice-area">

        {/* Header del modal */}
        <div className="invoice-modal-header no-print">
          <h3>Pedido {order.orderNumber}</h3>
          <div className="modal-header-actions">
            {nextStatus && (
              <button
                className="invoice-btn-primary"
                onClick={() => onAdvance(order.id, nextStatus)}
                disabled={isUpdating}
              >
                {isUpdating
                  ? 'Actualizando...'
                  : `Marcar como ${STATUS_LABELS[nextStatus]}`}
              </button>
            )}
            {canCancel && (
              <button
                className="orders-btn-danger no-print"
                onClick={() => onCancel(order.id)}
                disabled={isUpdating}
              >
                Cancelar orden
              </button>
            )}
            <button
              className="invoice-btn-primary no-print"
              onClick={() => window.print()}
            >
              <Printer size={14} /> Imprimir
            </button>
            <button className="close-modal-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Cuerpo imprimible */}
        <div className="invoice-print-body">
          <div className="invoice-brand-row">
            <div>
              <h2 className="invoice-logo">Vexio</h2>
              <p className="invoice-meta-text">Comprobante de pedido</p>
            </div>
            <div className="text-right">
              <h4 className="invoice-id-title">ORDEN DE VENTA</h4>
              <p className="invoice-id-num">{order.orderNumber}</p>
              <span className={`orders-status-badge ${STATUS_BADGE[order.status] ?? ''}`}>
                <span className="badge-dot" />
                {STATUS_LABELS[order.status] ?? order.status}
              </span>
            </div>
          </div>

          <hr className="invoice-divider" />

          <div className="invoice-details-grid">
            <div>
              <span className="invoice-section-label">CLIENTE:</span>
              <h4 className="invoice-client-name">{order.customerName || 'Anónimo'}</h4>
              <p className="invoice-client-detail">{order.customerEmail || '-'}</p>
              <p className="invoice-client-detail">{order.shippingAddress || 'Sin dirección registrada'}</p>
            </div>
            <div className="text-right flex-end-dir">
              <p className="invoice-meta-item"><b>Fecha:</b> {formatDate(order.createdAt)}</p>
              {order.payment && (
                <>
                  <p className="invoice-meta-item">
                    <b>Método de pago:</b>{' '}
                    {PAYMENT_METHOD_LABELS[order.payment.method] ?? order.payment.method}
                  </p>
                  <p className="invoice-meta-item">
                    <b>Estado del pago:</b>{' '}
                    {PAYMENT_STATUS_LABELS[order.payment.status] ?? order.payment.status}
                  </p>
                  {order.payment.transactionReference && (
                    <p className="invoice-meta-item">
                      <b>Ref:</b> {order.payment.transactionReference}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          <table className="invoice-items-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Variante</th>
                <th className="text-center">Cant.</th>
                <th className="text-right">P. Unitario</th>
                <th className="text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {(order.items ?? []).map((item) => (
                <tr key={item.id}>
                  <td>{item.productName}</td>
                  <td className="text-muted">{item.variantName || '-'}</td>
                  <td className="text-center">{item.quantity}</td>
                  <td className="text-right">{formatCOP(item.unitPrice)}</td>
                  <td className="text-right">{formatCOP(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="invoice-summary-block">
            <div className="invoice-summary-row">
              <span>Subtotal:</span>
              <span>{formatCOP(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="invoice-summary-row">
                <span>Descuento:</span>
                <span>−{formatCOP(order.discount)}</span>
              </div>
            )}
            <div className="invoice-summary-row">
              <span>Impuestos:</span>
              <span>{formatCOP(order.tax)}</span>
            </div>
            <hr className="invoice-divider-sm" />
            <div className="invoice-summary-row total-row">
              <span>TOTAL:</span>
              <span>{formatCOP(order.total)}</span>
            </div>
          </div>

          {order.notes && (
            <div className="orders-modal-notes">
              <b>Notas:</b> {order.notes}
            </div>
          )}

          <div className="invoice-footer-print-only">
            <p>Gracias por tu compra. Este documento sirve como soporte legal.</p>
            <small>El Vexio • Pedido {order.orderNumber}</small>
          </div>
        </div>
      </div>
    </div>
  );
}
