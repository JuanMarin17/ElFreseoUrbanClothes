import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import {
  PackagePlus, Search, RefreshCw, Eye, Pencil,
  ToggleLeft, ToggleRight, Package, AlertTriangle, CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';
import { getAllProducts, activateProduct, inactivateProduct } from '../../services/productService';
import './AdminProductsPage.css';

// ── Utilidades ───────────────────────────────────────────────────────────────

const formatCOP = (val) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0,
  }).format(val ?? 0);

const totalStock = (variants) =>
  (variants ?? []).reduce((s, v) => s + (v.stock ?? 0), 0);

const priceRange = (variants) => {
  const prices = (variants ?? []).map((v) => v.price ?? 0).filter(Boolean);
  if (!prices.length) return 'Sin precio';
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? formatCOP(min) : `${formatCOP(min)} – ${formatCOP(max)}`;
};

const stockStatus = (variants) => {
  if (!variants?.length) return 'empty';
  if (variants.every((v) => v.stock === 0)) return 'out';
  if (variants.some((v) => v.stock > 0 && v.stock <= v.minStock)) return 'low';
  return 'ok';
};

// Extrae el ID de forma defensiva (productId o id)
const getPid = (p) => p?.productId ?? p?.id ?? '';

// ── Componente principal ─────────────────────────────────────────────────────

export default function AdminProductsPage() {
  const { slug } = useParams();
  const { key: locationKey } = useLocation();

  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('all'); // all | active | inactive
  const [toast,    setToast]    = useState(null);
  const [toggling, setToggling] = useState(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const handleError = useCallback((err) => {
    if (err.status === 401) { window.location.href = '/login'; return; }
    showToast('error', err.message || 'Error del servidor, intenta de nuevo');
  }, []);

  // Construye la ruta base respetando el contexto tienda/admin
  const adminBase = slug ? `/tienda/${slug}/admin` : '/admin';

  // ── Carga ──────────────────────────────────────────────────────────────────

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  useEffect(() => {
    const run = async () => { await loadProducts(); };
    run();
  }, [locationKey, loadProducts]);

  // ── Filtrado ───────────────────────────────────────────────────────────────

  const displayed = useMemo(() => {
    let list = products;
    if (filter === 'active')   list = list.filter((p) => p.status === 'ACTIVE');
    if (filter === 'inactive') list = list.filter((p) => p.status !== 'ACTIVE');
    if (search.trim()) {
      const t = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(t) ||
          p.brandName?.toLowerCase().includes(t) ||
          (p.categories ?? []).some((c) => c.toLowerCase().includes(t)),
      );
    }
    return list;
  }, [products, filter, search]);

  // ── Activar / Inactivar ────────────────────────────────────────────────────

  const handleToggle = async (product) => {
    const pid = getPid(product);
    setToggling(pid);
    try {
      if (product.status === 'ACTIVE') {
        await inactivateProduct(pid);
      } else {
        await activateProduct(pid);
      }
      setProducts((prev) =>
        prev.map((p) =>
          getPid(p) === pid
            ? { ...p, status: p.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }
            : p,
        ),
      );
      showToast('success', `Producto ${product.status === 'ACTIVE' ? 'desactivado' : 'activado'}`);
    } catch (err) {
      handleError(err);
    } finally {
      setToggling(null);
    }
  };

  // ── KPIs ───────────────────────────────────────────────────────────────────

  const kpi = useMemo(() => ({
    total:    products.length,
    active:   products.filter((p) => p.status === 'ACTIVE').length,
    lowStock: products.filter((p) => stockStatus(p.variants) === 'low').length,
    outStock: products.filter((p) => stockStatus(p.variants) === 'out').length,
  }), [products]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="ap-container">

      {toast && (
        <div className={`ap-toast ap-toast-${toast.type}`}>{toast.msg}</div>
      )}

      {/* Header */}
      <div className="ap-header">
        <div>
          <h1 className="ap-title">Productos</h1>
          <p className="ap-subtitle">Gestiona el catálogo completo de tu tienda.</p>
        </div>
        <div className="ap-header-actions">
          <button className="ap-btn-ghost" onClick={loadProducts} disabled={loading} title="Recargar">
            <RefreshCw size={16} className={loading ? 'ap-spin' : ''} />
          </button>
          <Link to={`${adminBase}/subir-producto`} className="ap-btn-primary">
            <PackagePlus size={16} /> Nuevo producto
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="ap-kpi-row">
        <div className="ap-kpi-card">
          <Package size={18} className="ap-kpi-icon blue" />
          <div>
            <span className="ap-kpi-label">Total</span>
            <span className="ap-kpi-value">{kpi.total}</span>
          </div>
        </div>
        <div className="ap-kpi-card">
          <CheckCircle2 size={18} className="ap-kpi-icon green" />
          <div>
            <span className="ap-kpi-label">Activos</span>
            <span className="ap-kpi-value">{kpi.active}</span>
          </div>
        </div>
        <div className="ap-kpi-card">
          <AlertTriangle size={18} className="ap-kpi-icon orange" />
          <div>
            <span className="ap-kpi-label">Stock bajo</span>
            <span className="ap-kpi-value">{kpi.lowStock}</span>
          </div>
        </div>
        <div className="ap-kpi-card">
          <AlertTriangle size={18} className="ap-kpi-icon red" />
          <div>
            <span className="ap-kpi-label">Sin stock</span>
            <span className="ap-kpi-value">{kpi.outStock}</span>
          </div>
        </div>
      </div>

      {/* Barra de filtros */}
      <div className="ap-toolbar">
        <div className="ap-filter-tabs">
          {[['all', 'Todos'], ['active', 'Activos'], ['inactive', 'Inactivos']].map(([k, lbl]) => (
            <button
              key={k}
              className={`ap-filter-tab ${filter === k ? 'active' : ''}`}
              onClick={() => setFilter(k)}
            >
              {lbl}
            </button>
          ))}
        </div>
        <div className="ap-search-wrap">
          <Search size={14} className="ap-search-icon" />
          <input
            className="ap-search-input"
            placeholder="Buscar por nombre, marca o categoría..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Grid de productos */}
      {loading ? (
        <div className="ap-state-placeholder">Cargando productos...</div>
      ) : displayed.length === 0 ? (
        <div className="ap-state-placeholder">No se encontraron productos.</div>
      ) : (
        <div className="ap-grid">
          {displayed.map((product) => {
            const pid = getPid(product);
            return (
              <ProductCard
                key={pid || product.name}
                product={product}
                detailPath={`${adminBase}/productos/${pid}`}
                editPath={`${adminBase}/editar-producto/${pid}`}
                publicPath={`/products/${pid}`}
                toggling={toggling === pid}
                onToggle={() => handleToggle(product)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Tarjeta de producto ──────────────────────────────────────────────────────

function ProductCard({ product, detailPath, editPath, publicPath, toggling, onToggle }) {
  const thumb    = product.images?.[0]?.url ?? null;
  const stock    = totalStock(product.variants);
  const price    = priceRange(product.variants);
  const ss       = stockStatus(product.variants);
  const isActive = product.status === 'ACTIVE';

  const stockBadge = {
    ok:    { cls: 'ap-sb-ok',  label: `${stock} uds.` },
    low:   { cls: 'ap-sb-low', label: `⚠ ${stock} uds.` },
    out:   { cls: 'ap-sb-out', label: 'Sin stock' },
    empty: { cls: 'ap-sb-out', label: 'Sin variantes' },
  }[ss];

  return (
    <div className={`ap-card ${isActive ? '' : 'ap-card-inactive'}`}>

      {/* Imagen → detalle admin */}
      <Link to={detailPath} className="ap-card-img-link">
        <div className="ap-card-img">
          {thumb
            ? <img src={thumb} alt={product.name} loading="lazy" />
            : <div className="ap-card-img-placeholder"><Package size={32} /></div>}
          <span className={`ap-status-pill ${isActive ? 'ap-pill-active' : 'ap-pill-inactive'}`}>
            {isActive ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </Link>

      {/* Info */}
      <div className="ap-card-body">
        <h3 className="ap-card-name">{product.name}</h3>
        <p className="ap-card-brand">{product.brandName ?? 'Sin marca'}</p>

        {product.categories?.length > 0 && (
          <div className="ap-card-cats">
            {product.categories.slice(0, 3).map((c) => (
              <span key={c} className="ap-cat-chip">{c}</span>
            ))}
            {product.categories.length > 3 && (
              <span className="ap-cat-chip">+{product.categories.length - 3}</span>
            )}
          </div>
        )}

        <div className="ap-card-meta">
          <span className="ap-card-price">{price}</span>
          <span className={`ap-stock-badge ${stockBadge.cls}`}>{stockBadge.label}</span>
        </div>

        <p className="ap-card-variants">
          {product.variants?.length ?? 0} variante{product.variants?.length !== 1 ? 's' : ''}
        </p>

        {/* Ver más → página pública del producto */}
        <Link to={publicPath} className="ap-ver-mas" target="_blank" rel="noopener noreferrer">
          Ver más <ArrowUpRight size={13} />
        </Link>
      </div>

      {/* Acciones admin */}
      <div className="ap-card-actions">
        <Link to={detailPath} className="ap-action-btn ap-action-view" title="Ver detalle admin">
          <Eye size={14} /> Detalle
        </Link>
        <Link to={editPath} className="ap-action-btn ap-action-edit" title="Editar">
          <Pencil size={14} /> Editar
        </Link>
        <button
          className={`ap-action-btn ${isActive ? 'ap-action-deactivate' : 'ap-action-activate'}`}
          onClick={onToggle}
          disabled={toggling}
          title={isActive ? 'Desactivar' : 'Activar'}
        >
          {isActive
            ? <><ToggleLeft size={14} /> {toggling ? '...' : 'Desactivar'}</>
            : <><ToggleRight size={14} /> {toggling ? '...' : 'Activar'}</>}
        </button>
      </div>
    </div>
  );
}
