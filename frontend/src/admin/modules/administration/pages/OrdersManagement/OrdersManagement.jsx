import React, { useState } from 'react';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter, 
  Eye, 
  FileText, 
  ArrowUpDown,
  TrendingUp,
  X,
  Printer
} from 'lucide-react';
import './OrdersManagement.css';

const INITIAL_ORDERS = [
  {
    id: "VX-2026-0091",
    customer: { name: "Carlos Mendoza", email: "c.mendoza@gmail.com", phone: "+57 300 123 4567", address: "Calle 45 #12-34, Bogotá" },
    date: "01 Jun 2026, 10:42 AM",
    products: [
      { name: "Zapatillas Pro X1", qty: 1, price: 120.00 },
      { name: "Calcetines Running", qty: 2, price: 17.10 }
    ],
    total: 154.20,
    payment: "Tarjeta de Crédito (Visa **** 4242)",
    status: "Pendiente"
  },
  {
    id: "VX-2026-0090",
    customer: { name: "Sofía Valentina", email: "sofia.val@hotmail.com", phone: "+57 315 987 6543", address: "Av. Poblado #45-10, Medellín" },
    date: "01 Jun 2026, 09:15 AM",
    products: [
      { name: "Mochila Urban 30L", qty: 1, price: 89.00 }
    ],
    total: 89.00,
    payment: "PayPal (sofia.val@hotmail.com)",
    status: "Procesando"
  },
  {
    id: "VX-2026-0089",
    customer: { name: "Alejandro Ruiz", email: "ale.ruiz92@gmail.com", phone: "+57 311 555 0192", address: "Cra 7 #100-24, Bogotá" },
    date: "31 May 2026, 06:30 PM",
    products: [
      { name: "Audífonos BT-500", qty: 2, price: 80.00 },
      { name: "Reloj Smart V3", qty: 1, price: 85.00 }
    ],
    total: 245.00,
    payment: "Transferencia Bancaria (Bancolombia)",
    status: "Completado"
  }
];

export default function OrdersManagement() {
  const [orders] = useState(INITIAL_ORDERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [selectedOrder, setSelectedOrder] = useState(null); // Estado para el Modal

  const filteredOrders = orders.filter(order => {
    const pString = order.products.map(p => p.name).join(", ");
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pString.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "Todos" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Completado': return 'badge-success';
      case 'Procesando': return 'badge-info';
      case 'Pendiente': return 'badge-warning';
      case 'Cancelado': return 'badge-danger';
      default: return 'badge-default';
    }
  };

  // Función Nativa para Imprimir el PDF
  const handlePrintPDF = (order) => {
    // Seteamos temporalmente el pedido para renderizar la vista de impresión
    setSelectedOrder(order);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div className="orders-container">
      
      {/* ── ENCABEZADO ── */}
      <div className="orders-page-header">
        <div>
          <h1 className="orders-title">Historial de Pedidos</h1>
          <p className="orders-subtitle">Monitoreo de transacciones, despachos y reportes listos para facturación.</p>
        </div>
      </div>

      {/* ── METRICAS ── */}
      <div className="orders-stats-grid">
        <div className="order-kpi-card">
          <div className="kpi-icon-wrapper blue"><Package size={20} /></div>
          <div className="kpi-data">
            <span className="kpi-label">Pedidos Totales (Mes)</span>
            <h3 className="kpi-value">1,248</h3>
            <span className="kpi-trend positive"><TrendingUp size={12} /> +14.2%</span>
          </div>
        </div>
        <div className="order-kpi-card">
          <div className="kpi-icon-wrapper orange"><Clock size={20} /></div>
          <div className="kpi-data">
            <span className="kpi-label">Pedidos Pendientes</span>
            <h3 className="kpi-value">{orders.filter(o => o.status === 'Pendiente').length}</h3>
            <span className="kpi-trend neutral">Por procesar</span>
          </div>
        </div>
        <div className="order-kpi-card">
          <div className="kpi-icon-wrapper green"><CheckCircle2 size={20} /></div>
          <div className="kpi-data">
            <span className="kpi-label">Tasa de Entrega</span>
            <h3 className="kpi-value">98.4%</h3>
            <span className="kpi-trend positive">Eficiencia alta</span>
          </div>
        </div>
      </div>

      {/* ── FILTROS ── */}
      <div className="orders-filter-bar">
        <div className="orders-search-input-wrapper">
          <Search size={16} className="search-box-icon" />
          <input 
            type="text" 
            placeholder="Buscar por ID, cliente o producto..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="orders-search-input"
          />
        </div>

        <div className="orders-filter-options">
          <div className="filter-select-container">
            <Filter size={14} className="filter-select-icon" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="orders-status-select">
              <option value="Todos">Todos los estados</option>
              <option value="Completado">Completados</option>
              <option value="Procesando">Procesando</option>
              <option value="Pendiente">Pendientes</option>
              <option value="Cancelado">Cancelados</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── TABLA PRINCIPAL ── */}
      <div className="orders-table-wrapper">
        <table className="orders-table">
          <thead>
            <tr>
              <th>ID Pedido <ArrowUpDown size={12} className="sort-icon" /></th>
              <th>Cliente</th>
              <th>Fecha / Hora</th>
              <th>Productos</th>
              <th>Total</th>
              <th>Estado</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td className="font-mono text-highlight">{order.id}</td>
                <td>
                  <div className="customer-info-cell">
                    <span className="customer-name">{order.customer.name}</span>
                    <span className="customer-email">{order.customer.email}</span>
                  </div>
                </td>
                <td className="text-muted">{order.date}</td>
                <td>
                  <span className="products-cell-text">
                    {order.products.map(p => `${p.qty}x ${p.name}`).join(', ')}
                  </span>
                </td>
                <td className="font-semibold">${order.total.toFixed(2)}</td>
                <td>
                  <span className={`orders-status-badge ${getStatusBadgeClass(order.status)}`}>
                    <span className="badge-dot"></span>
                    {order.status}
                  </span>
                </td>
                <td>
                  <div className="orders-action-buttons">
                    <button className="action-row-btn" title="Ver Detalles" onClick={() => setSelectedOrder(order)}>
                      <Eye size={14} />
                    </button>
                    <button className="action-row-btn" title="Imprimir PDF" onClick={() => handlePrintPDF(order)}>
                      <FileText size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── VENTANA MODAL DETALLES / FACTURA IMPRIMIBLE ── */}
      {selectedOrder && (
        <div className="invoice-modal-overlay">
          <div className="invoice-card" id="printable-invoice-area">
            
            {/* Cabecera Modal (Oculta en Impresión) */}
            <div className="invoice-modal-header no-print">
              <h3>Detalles del Pedido</h3>
              <div className="modal-header-actions">
                <button className="invoice-btn-primary" onClick={() => window.print()}>
                  <Printer size={14} /> Imprimir PDF
                </button>
                <button className="close-modal-btn" onClick={() => setSelectedOrder(null)}>
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* CUERPO DEL COMPROBANTE (Lo que se vuelve PDF real) */}
            <div className="invoice-print-body">
              <div className="invoice-brand-row">
                <div>
                  <h2 className="invoice-logo">VERTEX TERMINAL</h2>
                  <p className="invoice-meta-text">E-commerce Cloud Management System</p>
                </div>
                <div className="text-right">
                  <h4 className="invoice-id-title">FACTURA DE VENTA</h4>
                  <p className="invoice-id-num">{selectedOrder.id}</p>
                </div>
              </div>

              <hr className="invoice-divider" />

              <div className="invoice-details-grid">
                <div>
                  <span className="invoice-section-label">FACTURADO A:</span>
                  <h4 className="invoice-client-name">{selectedOrder.customer.name}</h4>
                  <p className="invoice-client-detail">{selectedOrder.customer.email}</p>
                  <p className="invoice-client-detail">{selectedOrder.customer.phone}</p>
                  <p className="invoice-client-detail">{selectedOrder.customer.address}</p>
                </div>
                <div className="text-right flex-end-dir">
                  <p className="invoice-meta-item"><b>Fecha Emisión:</b> {selectedOrder.date}</p>
                  <p className="invoice-meta-item"><b>Método Pago:</b> {selectedOrder.payment}</p>
                  <p className="invoice-meta-item">
                    <b>Estado Pago:</b> 
                    <span className={`print-status-text ${selectedOrder.status.toLowerCase()}`}> {selectedOrder.status}</span>
                  </p>
                </div>
              </div>

              <table className="invoice-items-table">
                <thead>
                  <tr>
                    <th>Descripción Producto</th>
                    <th className="text-center">Cant.</th>
                    <th className="text-right">Precio Unitario</th>
                    <th className="text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.products.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.name}</td>
                      <td className="text-center">{item.qty}</td>
                      <td className="text-right">${item.price.toFixed(2)}</td>
                      <td className="text-right">${(item.qty * item.price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="invoice-summary-block">
                <div className="invoice-summary-row">
                  <span>Subtotal Neto:</span>
                  <span>${selectedOrder.total.toFixed(2)}</span>
                </div>
                <div className="invoice-summary-row">
                  <span>Impuestos e IVA (0%):</span>
                  <span>$0.00</span>
                </div>
                <hr className="invoice-divider-sm" />
                <div className="invoice-summary-row total-row">
                  <span>TOTAL FACTURADO:</span>
                  <span>${selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="invoice-footer-print-only">
                <p>Gracias por confiar en nuestra plataforma. Este documento sirve como soporte legal de compra.</p>
                <small>VERTEX system core • Operation ID: {Math.random().toString(36).substring(2, 9).toUpperCase()}</small>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}