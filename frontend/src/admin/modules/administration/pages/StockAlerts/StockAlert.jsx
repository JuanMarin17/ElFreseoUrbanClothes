import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle, ShieldAlert, TrendingDown,
  RefreshCw, ShoppingCart, Search, PackageX,
} from 'lucide-react';
import { getAllProducts } from '../../services/productService';
import { useStockAlerts } from '../../../../../hooks/useStockAlerts';
import './StockAlerts.css';

// ── Utilidades ────────────────────────────────────────────────────────────────

function getSeverity(stock, minStock) {
  if (stock === 0) return 'Agotado';
  if (stock <= Math.max(Math.ceil((minStock ?? 0) * 0.3), 3)) return 'Crítico';
  return 'Advertencia';
}

function variantsToAlerts(products) {
  const alerts = [];
  for (const product of products) {
    const categoryName = product.categoryName ?? product.category?.name ?? '—';
    for (const v of product.variants ?? []) {
      const minStock = v.minStock ?? 0;
      if ((v.stock ?? 0) <= minStock) {
        const label = [v.size, v.color].filter(Boolean).join(' — ');
        alerts.push({
          variantId:    v.variantId ?? `${product.productId ?? product.id}-${v.sku}`,
          sku:          v.sku ?? '—',
          productName:  label ? `${product.name} (${label})` : product.name,
          productId:    product.productId ?? product.id,
          stock:        v.stock ?? 0,
          minStock,
          price:        v.price ?? 0,
          categoryName,
          severity:     getSeverity(v.stock ?? 0, minStock),
        });
      }
    }
  }
  return alerts;
}

// ── Componente ────────────────────────────────────────────────────────────────

export default function StockAlerts() {
  const [alerts,     setAlerts]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab,  setActiveTab]  = useState('Todos');

  // Snapshot inicial desde la API de productos
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const products = await getAllProducts();
      setAlerts(variantsToAlerts(Array.isArray(products) ? products : []));
    } catch {
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Actualizaciones en tiempo real vía SSE
  useStockAlerts((incoming) => {
    setAlerts((prev) => {
      const idx = prev.findIndex((a) => a.variantId === incoming.variantId);
      const label = [incoming.size, incoming.color].filter(Boolean).join(' — ');
      const updated = {
        variantId:   incoming.variantId,
        sku:         incoming.sku,
        productName: label ? `${incoming.productName} (${label})` : incoming.productName,
        productId:   incoming.productId,
        stock:       incoming.stock,
        minStock:    incoming.minStock,
        price:       idx >= 0 ? prev[idx].price : 0,
        categoryName: idx >= 0 ? prev[idx].categoryName : '—',
        severity:    getSeverity(incoming.stock, incoming.minStock),
      };
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updated;
        return next;
      }
      return [updated, ...prev];
    });
  });

  // Filtrado
  const filteredAlerts = alerts.filter((item) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      item.productName?.toLowerCase().includes(term) ||
      item.sku?.toLowerCase().includes(term) ||
      item.categoryName?.toLowerCase().includes(term);
    const matchesTab = activeTab === 'Todos' || item.severity === activeTab;
    return matchesSearch && matchesTab;
  });

  // Métricas
  const critical   = alerts.filter((a) => a.severity === 'Crítico' || a.severity === 'Agotado').length;
  const warnings   = alerts.filter((a) => a.severity === 'Advertencia').length;
  const lossImpact = alerts.reduce((acc, a) => acc + ((a.minStock - a.stock) * a.price), 0);

  return (
    <div className="stock-alerts-container">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="alerts-page-header">
        <div>
          <h1 className="alerts-title">Alertas de Stock e Inventario</h1>
          <p className="alerts-subtitle">
            Auditoría automática de SKUs en niveles críticos. Evita quiebres de stock en tus canales de venta.
          </p>
        </div>
        <button
          className="action-btn restock-btn"
          onClick={load}
          disabled={loading}
          title="Actualizar"
          style={{ alignSelf: 'center' }}
        >
          <RefreshCw size={14} className={loading ? 'alerts-spin' : ''} />
          Actualizar
        </button>
      </div>

      {/* ── KPIs ───────────────────────────────────────────────────────────── */}
      <div className="alerts-stats-grid">
        <div className="stock-kpi-card danger">
          <div className="kpi-icon-box"><ShieldAlert size={20} /></div>
          <div className="kpi-info">
            <span className="kpi-tag">Riesgo Crítico</span>
            <h3 className="kpi-num">{critical} SKUs</h3>
            <span className="kpi-subtext text-danger">Requieren acción inmediata</span>
          </div>
        </div>

        <div className="stock-kpi-card warning">
          <div className="kpi-icon-box"><AlertTriangle size={20} /></div>
          <div className="kpi-info">
            <span className="kpi-tag">Advertencias en Espera</span>
            <h3 className="kpi-num">{warnings} SKUs</h3>
            <span className="kpi-subtext text-warning">Próximos a agotarse</span>
          </div>
        </div>

        <div className="stock-kpi-card money">
          <div className="kpi-icon-box"><TrendingDown size={20} /></div>
          <div className="kpi-info">
            <span className="kpi-tag">Costo de Ruptura Est.</span>
            <h3 className="kpi-num">
              ${lossImpact.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
            </h3>
            <span className="kpi-subtext text-muted">Capital faltante para stock ideal</span>
          </div>
        </div>
      </div>

      {/* ── Filtros ─────────────────────────────────────────────────────────── */}
      <div className="alerts-filters-row">
        <div className="alerts-tabs">
          {['Todos', 'Crítico', 'Advertencia', 'Agotado'].map((tab) => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'Crítico' ? 'Críticos' : tab === 'Advertencia' ? 'Advertencias' : tab}
            </button>
          ))}
        </div>

        <div className="alerts-search-wrapper">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por SKU o producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="alerts-search-input"
          />
        </div>
      </div>

      {/* ── Tabla ───────────────────────────────────────────────────────────── */}
      <div className="alerts-table-wrapper">
        {loading ? (
          <div className="alerts-empty-state" style={{ padding: '60px 20px' }}>
            <RefreshCw size={28} className="alerts-spin" style={{ opacity: 0.4, marginBottom: 12 }} />
            <p style={{ margin: 0, color: 'var(--at-text-3, #52525b)' }}>Cargando alertas...</p>
          </div>
        ) : (
          <table className="alerts-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Nombre del Producto</th>
                <th>Categoría</th>
                <th className="text-center">Stock Actual</th>
                <th className="text-center">Mín. Requerido</th>
                <th>Estado de Alerta</th>
                <th className="text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlerts.length > 0 ? (
                filteredAlerts.map((item) => (
                  <tr key={item.variantId} className={`alert-row-status-${item.severity.toLowerCase()}`}>
                    <td className="font-mono text-cyan">{item.sku}</td>
                    <td>
                      <div className="product-meta-cell">
                        <span className="product-title-name">{item.productName}</span>
                        {item.price > 0 && (
                          <span className="product-price-label">
                            Precio: ${item.price.toLocaleString('es-CO')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="text-dim">{item.categoryName}</td>
                    <td className="text-center font-bold">
                      <span className={`stock-count-badge ${item.stock === 0 ? 'zero' : 'low'}`}>
                        {item.stock} uds.
                      </span>
                    </td>
                    <td className="text-center text-dim">{item.minStock} uds.</td>
                    <td>
                      <span className={`severity-badge badge-${item.severity.toLowerCase()}`}>
                        {item.severity}
                      </span>
                    </td>
                    <td>
                      <div className="alerts-actions-cell">
                        <button className="action-btn restock-btn" title="Ir a gestionar producto"
                          onClick={() => window.location.href = `./editar-producto?id=${item.productId}`}>
                          <ShoppingCart size={13} />
                          <span>Pedir</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="alerts-empty-state">
                    <PackageX size={32} className="empty-box-icon" />
                    <h4>{alerts.length === 0 ? '¡Todo en orden!' : 'Sin resultados'}</h4>
                    <p>
                      {alerts.length === 0
                        ? 'Ningún producto tiene stock por debajo del mínimo.'
                        : 'Ningún producto coincide con el filtro seleccionado.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}
