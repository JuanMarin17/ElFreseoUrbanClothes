import React, { useState, useEffect, useCallback } from 'react';
import { Users, Search, X, ChevronRight, Mail, ShoppingBag, TrendingUp, Loader2, RefreshCw, ExternalLink, Calendar } from 'lucide-react';
import { getCustomers, getCustomerById } from '../../services/customersService';
import './CustomersPage.css';

function formatCOP(n) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n ?? 0);
}

function relDate(iso) {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso));
}

function CustomerDetailModal({ customerId, onClose }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!customerId) return;
    setLoading(true);
    getCustomerById(customerId)
      .then(d => setData(d?.data ?? d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [customerId]);

  return (
    <div className="cust-modal-overlay" onClick={onClose}>
      <div className="cust-modal" onClick={e => e.stopPropagation()}>
        <div className="cust-modal-header">
          <h3>Detalle del cliente</h3>
          <button onClick={onClose} className="cust-modal-close"><X size={16} /></button>
        </div>

        {loading ? (
          <div className="cust-modal-loading"><Loader2 size={20} className="cust-spin" /></div>
        ) : !data ? (
          <div className="cust-modal-empty">No se pudo cargar el perfil.</div>
        ) : (
          <div className="cust-modal-body">
            <div className="cust-modal-avatar">
              {data.imageProfile
                ? <img src={data.imageProfile} alt={data.userName} className="cust-avatar-img" />
                : <span className="cust-avatar-init">{(data.userName ?? 'U')[0].toUpperCase()}</span>
              }
              <div>
                <p className="cust-modal-name">{data.userName ?? '—'}</p>
                <p className="cust-modal-email">{data.email ?? '—'}</p>
              </div>
            </div>

            <div className="cust-modal-stats">
              <div className="cust-modal-stat">
                <ShoppingBag size={14} />
                <span>{data.totalOrders ?? 0} órdenes</span>
              </div>
              <div className="cust-modal-stat">
                <TrendingUp size={14} />
                <span>{formatCOP(data.totalSpent)} gastado</span>
              </div>
              <div className="cust-modal-stat">
                <Calendar size={14} />
                <span>Desde {relDate(data.createdAt)}</span>
              </div>
            </div>

            {Array.isArray(data.recentOrders) && data.recentOrders.length > 0 && (
              <div className="cust-modal-orders">
                <p className="cust-modal-section-title">Últimas órdenes</p>
                {data.recentOrders.slice(0, 5).map((o, i) => (
                  <div key={o.id ?? i} className="cust-order-row">
                    <span className="cust-order-id">#{o.id?.slice(-8)}</span>
                    <span className="cust-order-amount">{formatCOP(o.total)}</span>
                    <span className={`cust-order-status cust-order-status--${(o.status ?? '').toLowerCase()}`}>
                      {o.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [search, setSearch]       = useState('');
  const [page, setPage]           = useState(1);
  const [total, setTotal]         = useState(0);
  const [selectedId, setSelectedId] = useState(null);

  const LIMIT = 20;

  const load = useCallback(async (pg = 1, q = '') => {
    setLoading(true);
    setError('');
    try {
      const data = await getCustomers({ page: pg, limit: LIMIT, search: q });
      const list  = Array.isArray(data)         ? data
                  : Array.isArray(data?.data)    ? data.data
                  : Array.isArray(data?.content) ? data.content
                  : [];
      const tot   = data?.total ?? data?.totalElements ?? list.length;
      setCustomers(list);
      setTotal(tot);
    } catch (e) {
      setError(e.message ?? 'No se pudieron cargar los clientes.');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(1, ''); }, [load]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load(1, search);
  };

  const handleClearSearch = () => {
    setSearch('');
    setPage(1);
    load(1, '');
  };

  const totalPages = Math.ceil(total / LIMIT);

  const changePage = (p) => {
    setPage(p);
    load(p, search);
  };

  return (
    <div className="cust-root">
      <div className="cust-header">
        <div>
          <p className="cust-eyebrow">Panel de administración</p>
          <h1 className="cust-title">Clientes</h1>
          <p className="cust-subtitle">Listado de clientes que han comprado en tu tienda.</p>
        </div>
        <button className="cust-refresh-btn" onClick={() => load(page, search)} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'cust-spin' : ''} />
        </button>
      </div>

      {/* ── Búsqueda ─────────────────────────────────────────────────────── */}
      <form className="cust-search-bar" onSubmit={handleSearch}>
        <Search size={15} className="cust-search-icon" />
        <input
          className="cust-search-input"
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button type="button" className="cust-search-clear" onClick={handleClearSearch}>
            <X size={13} />
          </button>
        )}
        <button type="submit" className="cust-search-btn">Buscar</button>
      </form>

      {/* ── Error ────────────────────────────────────────────────────────── */}
      {error && <div className="cust-error-banner">{error}</div>}

      {/* ── Tabla ────────────────────────────────────────────────────────── */}
      <div className="cust-table-card">
        {loading ? (
          <div className="cust-loading">
            <Loader2 size={22} className="cust-spin" />
            <span>Cargando clientes...</span>
          </div>
        ) : customers.length === 0 ? (
          <div className="cust-empty">
            <Users size={36} className="cust-empty-icon" />
            <p className="cust-empty-title">Sin clientes</p>
            <p className="cust-empty-sub">
              {search ? `No hay resultados para "${search}"` : 'Todavía no hay clientes registrados en esta tienda.'}
            </p>
          </div>
        ) : (
          <>
            <div className="cust-table-wrap">
              <table className="cust-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th className="cust-hide-sm">Email</th>
                    <th>Órdenes</th>
                    <th className="cust-hide-sm">Total gastado</th>
                    <th className="cust-hide-sm">Registrado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c, i) => (
                    <tr
                      key={c.id ?? i}
                      className="cust-row"
                      onClick={() => setSelectedId(c.id)}
                    >
                      <td>
                        <div className="cust-cell-user">
                          <div className="cust-avatar-sm">
                            {c.imageProfile
                              ? <img src={c.imageProfile} alt={c.userName} />
                              : <span>{(c.userName ?? 'U')[0].toUpperCase()}</span>
                            }
                          </div>
                          <span className="cust-cell-name">{c.userName ?? '—'}</span>
                        </div>
                      </td>
                      <td className="cust-hide-sm">
                        <div className="cust-cell-email">
                          <Mail size={12} />
                          <span>{c.email ?? '—'}</span>
                        </div>
                      </td>
                      <td>
                        <div className="cust-cell-orders">
                          <ShoppingBag size={12} />
                          <span>{c.totalOrders ?? 0}</span>
                        </div>
                      </td>
                      <td className="cust-hide-sm">
                        <span className="cust-cell-amount">{formatCOP(c.totalSpent)}</span>
                      </td>
                      <td className="cust-hide-sm">
                        <span className="cust-cell-date">{relDate(c.createdAt)}</span>
                      </td>
                      <td>
                        <button className="cust-view-btn" title="Ver detalle">
                          <ExternalLink size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Paginación ─────────────────────────────────────────────── */}
            {totalPages > 1 && (
              <div className="cust-pagination">
                <button
                  className="cust-page-btn"
                  disabled={page <= 1}
                  onClick={() => changePage(page - 1)}
                >
                  ← Anterior
                </button>
                <span className="cust-page-info">
                  Página {page} de {totalPages} · {total} clientes
                </span>
                <button
                  className="cust-page-btn"
                  disabled={page >= totalPages}
                  onClick={() => changePage(page + 1)}
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Modal detalle ─────────────────────────────────────────────────── */}
      {selectedId && (
        <CustomerDetailModal
          customerId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
