import React, { useState } from 'react';
import { 
  CreditCard, 
  ArrowUpRight, 
  DollarSign, 
  Search, 
  Filter, 
  Layers,
  ArrowUpDown,
  Download,
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import './Transaction.css';

const INITIAL_TRANSACTIONS = [
  {
    id: "TXN-2026-8801",
    customer: { name: "Marcos Acuña", email: "m.acuna@dev.io" },
    plan: "Premium",
    amount: 49.99,
    date: "Hoy, 02:14 PM",
    gateway: "Stripe",
    status: "Aprobado"
  },
  {
    id: "TXN-2026-8800",
    customer: { name: "Elena Rostova", email: "elena.ros@design.com" },
    plan: "Pro",
    amount: 24.99,
    date: "Hoy, 11:05 AM",
    gateway: "PayPal",
    status: "Aprobado"
  },
  {
    id: "TXN-2026-8799",
    customer: { name: "Daniel Ortega", email: "d.ortega@テック.jp" },
    plan: "Basico",
    amount: 9.99,
    date: "Ayer, 05:40 PM",
    gateway: "Stripe",
    status: "Aprobado"
  },
  {
    id: "TXN-2026-8798",
    customer: { name: "Lucas Silva", email: "lucas.silva@Fintech.br" },
    plan: "Premium",
    amount: 49.99,
    date: "Ayer, 09:12 AM",
    gateway: "Tarjeta de Crédito",
    status: "Fallido"
  },
  {
    id: "TXN-2026-8797",
    customer: { name: "Camila Buendía", email: "cami.buendia@gmail.com" },
    plan: "Pro",
    amount: 24.99,
    date: "29 May 2026",
    gateway: "Stripe",
    status: "Disputa"
  }
];

export default function Transactions() {
  const [transactions] = useState(INITIAL_TRANSACTIONS);
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("Todos");

  // Filtro inteligente en tiempo real
  const filteredTransactions = transactions.filter(txn => {
    const matchesSearch = 
      txn.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.customer.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPlan = planFilter === "Todos" || txn.plan === planFilter;

    return matchesSearch && matchesPlan;
  });

  // Clases dinámicas para las etiquetas de los planes
  const getPlanBadgeClass = (plan) => {
    switch (plan) {
      case 'Premium': return 'plan-premium';
      case 'Pro': return 'plan-pro';
      case 'Basico': return 'plan-basico';
      default: return '';
    }
  };

  // Clases dinámicas para el estado del pago
  const getStatusClass = (status) => {
    switch (status) {
      case 'Aprobado': return 'status-approved';
      case 'Disputa': return 'status-dispute';
      case 'Fallido': return 'status-failed';
      default: return '';
    }
  };

  // Cálculos financieros basados en el estado actual
  const totalVolume = transactions.filter(t => t.status === "Aprobado").reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="transactions-container">
      
      {/* ── ENCABEZADO DE LA SECCIÓN ── */}
      <div className="txn-page-header">
        <div>
          <h1 className="txn-title">Historial de Transacciones</h1>
          <p className="txn-subtitle">Auditoría de pasarela de pagos, suscripciones activas y pasarela recurrente del SaaS.</p>
        </div>
      </div>

      {/* ── METRICAS DE FACTURACIÓN ── */}
      <div className="txn-stats-grid">
        <div className="txn-kpi-card">
          <div className="kpi-icon-container green">
            <DollarSign size={18} />
          </div>
          <div className="kpi-content">
            <span className="kpi-title-label">Volumen Aprobado (Mes)</span>
            <h3 className="kpi-main-number">${totalVolume.toFixed(2)}</h3>
            <span className="kpi-subtext-label text-green">Fuga de capital: 0.00%</span>
          </div>
        </div>

        <div className="txn-kpi-card">
          <div className="kpi-icon-container blue">
            <Layers size={18} />
          </div>
          <div className="kpi-content">
            <span className="kpi-title-label">Suscripción Líder</span>
            <h3 className="kpi-main-number">Premium</h3>
            <span className="kpi-subtext-label">Representa el 60% del MRR</span>
          </div>
        </div>

        <div className="txn-kpi-card">
          <div className="kpi-icon-container purple">
            <CreditCard size={18} />
          </div>
          <div className="kpi-content">
            <span className="kpi-title-label">Pasarela Principal</span>
            <h3 className="kpi-main-number">Stripe API</h3>
            <span className="kpi-subtext-label">Tiempo de respuesta: 140ms</span>
          </div>
        </div>
      </div>

      {/* ── FILTROS Y CONTROLES ── */}
      <div className="txn-filter-bar">
        <div className="txn-search-box">
          <Search size={14} className="search-icon-inside" />
          <input 
            type="text" 
            placeholder="Buscar por ID de pago o cliente..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="txn-input-field"
          />
        </div>

        <div className="txn-select-filters">
          <div className="select-wrapper">
            <Filter size={12} className="select-icon" />
            <select 
              value={planFilter} 
              onChange={(e) => setPlanFilter(e.target.value)}
              className="txn-dropdown-select"
            >
              <option value="Todos">Todos los planes</option>
              <option value="Basico">Plan Básico ($9.99)</option>
              <option value="Pro">Plan Pro ($24.99)</option>
              <option value="Premium">Plan Premium ($49.99)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── TABLA DE TRANSACCIONES CORE ── */}
      <div className="txn-table-wrapper">
        <table className="txn-table">
          <thead>
            <tr>
              <th>ID Transacción <ArrowUpDown size={11} className="sort-arrow" /></th>
              <th>Usuario Suscrito</th>
              <th>Plan Adquirido</th>
              <th>Monto Tarifa</th>
              <th>Fecha Pasarela</th>
              <th>Canal de Pago</th>
              <th>Estado Transacción</th>
              <th className="text-right">Reporte</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((txn) => (
                <tr key={txn.id}>
                  <td className="font-code text-cyan">{txn.id}</td>
                  <td>
                    <div className="txn-user-cell">
                      <span className="user-fullname">{txn.customer.name}</span>
                      <span className="user-email-address">{txn.customer.email}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`plan-badge ${getPlanBadgeClass(txn.plan)}`}>
                      {txn.plan}
                    </span>
                  </td>
                  <td className="font-weight-heavy">${txn.amount.toFixed(2)}</td>
                  <td className="text-gray-dim">{txn.date}</td>
                  <td className="text-gray-dim font-sm">{txn.gateway}</td>
                  <td>
                    <span className={`txn-status-indicator ${getStatusClass(txn.status)}`}>
                      <span className="indicator-circle"></span>
                      {txn.status}
                    </span>
                  </td>
                  <td>
                    <div className="txn-row-actions">
                      <button className="download-btn-table" title="Descargar Log JSON">
                        <Download size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="txn-empty-state">
                  <XCircle size={28} className="empty-state-graphic" />
                  <p>Ningún registro coincide con los filtros de pasarela establecidos.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}