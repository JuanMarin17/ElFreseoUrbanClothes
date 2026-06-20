import React, { useState, useEffect, useMemo } from 'react';
import {
  CreditCard,
  DollarSign,
  Search,
  Filter,
  Layers,
  ArrowUpDown,
  RefreshCw,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { getAllTransactions } from '../services/transactionService';
import { getAllStores } from '../services/storeService';
import './Transaction.css';

const STATUS_CONFIG = {
  APPROVED:  { label: 'Aprobado',   cls: 'status-approved' },
  PENDING:   { label: 'Pendiente',  cls: 'status-dispute'  },
  IN_PROCESS:{ label: 'En proceso', cls: 'status-dispute'  },
  REJECTED:  { label: 'Rechazado',  cls: 'status-failed'   },
  CANCELLED: { label: 'Cancelado',  cls: 'status-failed'   },
  REFUNDED:  { label: 'Reembolsado', cls: 'status-failed'  },
};

const formatCOP = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n ?? 0);

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso));
};

const getStatusConfig = (status) =>
  STATUS_CONFIG[status?.toUpperCase()] ?? { label: status ?? '—', cls: '' };

const planBadgeClass = (plan) => {
  const p = (plan ?? '').toUpperCase();
  if (p.includes('PREMIUM')) return 'plan-premium';
  if (p.includes('PRO'))     return 'plan-pro';
  if (p.includes('BASIC'))   return 'plan-basico';
  return '';
};

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [stores,       setStores]       = useState([]);
  const [loading,       setLoading]     = useState(false);
  const [error,         setError]       = useState(null);
  const [searchTerm,    setSearchTerm]  = useState("");
  const [planFilter,    setPlanFilter]  = useState("Todos");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [txnsRaw, storesRaw] = await Promise.all([
        getAllTransactions(),
        getAllStores().catch(() => []),
      ]);
      const txns = Array.isArray(txnsRaw) ? txnsRaw : (txnsRaw?.content ?? txnsRaw?.data ?? []);
      const storeList = Array.isArray(storesRaw) ? storesRaw : (storesRaw?.content ?? storesRaw?.data ?? []);
      setTransactions(txns);
      setStores(storeList);
    } catch (err) {
      setError(err.message ?? 'No se pudieron cargar las transacciones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const storeMap = useMemo(
    () => new Map(stores.map((s) => [s.storeId, s])),
    [stores],
  );

  const planOptions = useMemo(
    () => Array.from(new Set(transactions.map((t) => t.planName).filter(Boolean))),
    [transactions],
  );

  const filteredTransactions = transactions.filter((txn) => {
    const store = storeMap.get(txn.storeId);
    const haystack = `${txn.transactionId ?? ''} ${store?.name ?? ''} ${txn.mpPaymentId ?? ''}`.toLowerCase();
    const matchesSearch = haystack.includes(searchTerm.toLowerCase());
    const matchesPlan = planFilter === "Todos" || txn.planName === planFilter;
    return matchesSearch && matchesPlan;
  });

  const approved = useMemo(
    () => transactions.filter((t) => t.status?.toUpperCase() === 'APPROVED'),
    [transactions],
  );
  const totalVolume = approved.reduce((acc, t) => acc + (t.amount ?? 0), 0);

  const leadingPlan = useMemo(() => {
    if (!approved.length) return null;
    const counts = {};
    approved.forEach((t) => { if (t.planName) counts[t.planName] = (counts[t.planName] ?? 0) + 1; });
    const entries = Object.entries(counts);
    if (!entries.length) return null;
    const [name, count] = entries.sort((a, b) => b[1] - a[1])[0];
    return { name, pct: Math.round((count / approved.length) * 100) };
  }, [approved]);

  return (
    <div className="transactions-container">

      {/* ── ENCABEZADO DE LA SECCIÓN ── */}
      <div className="txn-page-header">
        <div>
          <h1 className="txn-title">Historial de Transacciones</h1>
          <p className="txn-subtitle">Auditoría de pagos de suscripción de toda la plataforma (MercadoPago).</p>
        </div>
        <button className="txn-refresh-btn" onClick={load} disabled={loading} title="Recargar">
          <RefreshCw size={15} className={loading ? 'txn-spin' : ''} />
        </button>
      </div>

      {error && (
        <div className="txn-alert">
          <AlertTriangle size={15} /> {error}
        </div>
      )}

      {/* ── METRICAS DE FACTURACIÓN ── */}
      <div className="txn-stats-grid">
        <div className="txn-kpi-card">
          <div className="kpi-icon-container green">
            <DollarSign size={18} />
          </div>
          <div className="kpi-content">
            <span className="kpi-title-label">Volumen Aprobado</span>
            <h3 className="kpi-main-number">{formatCOP(totalVolume)}</h3>
            <span className="kpi-subtext-label text-green">{approved.length} transacciones aprobadas</span>
          </div>
        </div>

        <div className="txn-kpi-card">
          <div className="kpi-icon-container blue">
            <Layers size={18} />
          </div>
          <div className="kpi-content">
            <span className="kpi-title-label">Suscripción Líder</span>
            <h3 className="kpi-main-number">{leadingPlan?.name ?? '—'}</h3>
            <span className="kpi-subtext-label">
              {leadingPlan ? `Representa el ${leadingPlan.pct}% de las aprobadas` : 'Sin datos aún'}
            </span>
          </div>
        </div>

        <div className="txn-kpi-card">
          <div className="kpi-icon-container purple">
            <CreditCard size={18} />
          </div>
          <div className="kpi-content">
            <span className="kpi-title-label">Total de Transacciones</span>
            <h3 className="kpi-main-number">{transactions.length}</h3>
            <span className="kpi-subtext-label">En todas las tiendas de la plataforma</span>
          </div>
        </div>
      </div>

      {/* ── FILTROS Y CONTROLES ── */}
      <div className="txn-filter-bar">
        <div className="txn-search-box">
          <Search size={14} className="search-icon-inside" />
          <input
            type="text"
            placeholder="Buscar por ID, tienda o ID de pago..."
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
              {planOptions.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
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
              <th>Tienda</th>
              <th>Plan</th>
              <th>Monto</th>
              <th>Fecha</th>
              <th>ID Pago (MercadoPago)</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="txn-empty-state">Cargando transacciones...</td>
              </tr>
            ) : filteredTransactions.length > 0 ? (
              filteredTransactions.map((txn) => {
                const store = storeMap.get(txn.storeId);
                const sc = getStatusConfig(txn.status);
                return (
                  <tr key={txn.transactionId}>
                    <td className="font-code text-cyan">{txn.transactionId}</td>
                    <td>
                      <div className="txn-user-cell">
                        <span className="user-fullname">{store?.name ?? txn.storeId}</span>
                        {store?.slug && <span className="user-email-address">{store.slug}.vexio.com</span>}
                      </div>
                    </td>
                    <td>
                      <span className={`plan-badge ${planBadgeClass(txn.planName)}`}>
                        {txn.planName ?? '—'}
                      </span>
                    </td>
                    <td className="font-weight-heavy">{formatCOP(txn.amount)}</td>
                    <td className="text-gray-dim">{formatDate(txn.createdAt)}</td>
                    <td className="text-gray-dim font-sm font-code">{txn.mpPaymentId ?? '—'}</td>
                    <td>
                      <span className={`txn-status-indicator ${sc.cls}`}>
                        <span className="indicator-circle"></span>
                        {sc.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="txn-empty-state">
                  <XCircle size={28} className="empty-state-graphic" />
                  <p>Ningún registro coincide con los filtros establecidos.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
