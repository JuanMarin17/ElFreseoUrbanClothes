import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  PackagePlus, Search, RefreshCw, Eye, Pencil,
  ToggleLeft, ToggleRight, Package, AlertTriangle, CheckCircle2,
  ArrowUpRight, SlidersHorizontal, X, TrendingDown,
} from 'lucide-react';
import { getAllProducts, activateProduct, inactivateProduct } from '../../services/productService';
import './AdminProductsPage.css';

// ── Utilities ─────────────────────────────────────────────────────────────────

const formatCOP = (val) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0,
  }).format(val ?? 0);

const totalStock = (variants) =>
  (variants ?? []).reduce((s, v) => s + (v.stock ?? 0), 0);

const priceRange = (variants) => {
  const prices = (variants ?? []).map((v) => v.price ?? 0).filter(Boolean);
  if (!prices.length) return 'Sin precio';
  const [min, max] = [Math.min(...prices), Math.max(...prices)];
  return min === max ? formatCOP(min) : `${formatCOP(min)} – ${formatCOP(max)}`;
};

const minPrice = (variants) => {
  const prices = (variants ?? []).map((v) => v.price ?? 0).filter(Boolean);
  return prices.length ? Math.min(...prices) : 0;
};

const stockStatus = (variants) => {
  if (!variants?.length) return 'empty';
  if (variants.every((v) => v.stock === 0)) return 'out';
  if (variants.some((v) => v.stock > 0 && v.stock <= (v.minStock ?? 5))) return 'low';
  return 'ok';
};

const getPid = (p) => p?.productId ?? p?.id ?? '';

// ── Main component ────────────────────────────────────────────────────────────

export default function AdminProductsPage() {
  const { slug } = useParams();

  const [products, setProducts]             = useState([]);
  const [loading, setLoading]               = useState(false);
  const [search, setSearch]                 = useState('');
  const [filter, setFilter]                 = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter]       = useState('');
  const [stockFilter, setStockFilter]       = useState('');
  const [sortBy, setSortBy]                 = useState('name');
  const [toast, setToast]                   = useState(null);
  const [toggling, setToggling]             = useState(null);
  const [filterKey, setFilterKey]           = useState(0);
  const isFirstRender = useRef(true);

  const adminBase = slug ? `/tienda/${slug}/admin` : '/admin';

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const handleError = useCallback((err) => {
    if (err.status === 401) { window.location.href = '/login'; return; }
    showToast('error', err.message || 'Error del servidor, intenta de nuevo');
  }, []);

  // ── Load ──────────────────────────────────────────────────────────────────────

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      // AdminLayout sets storeId asynchronously — wait up to 700ms
      let storeId = localStorage.getItem('storeId');
      if (!storeId || storeId === 'null') {
        await new Promise((r) => setTimeout(r, 700));
        storeId = localStorage.getItem('storeId');
      }
      const data = await getAllProducts(storeId ?? undefined);
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  useEffect(() => { loadProducts(); }, []);

  // Re-trigger card stagger animation when any filter changes
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    setFilterKey((k) => k + 1);
  }, [filter, search, categoryFilter, brandFilter, stockFilter, sortBy]);

  // ── Filter options derived from loaded products ───────────────────────────────

  const filterOptions = useMemo(() => ({
    categories: [...new Set(products.flatMap((p) => p.categories ?? []))].sort(),
    brands:     [...new Set(products.map((p) => p.brandName).filter(Boolean))].sort(),
  }), [products]);

  const activeFilterCount = [categoryFilter, brandFilter, stockFilter].filter(Boolean).length;

  // ── Filtered + sorted list ────────────────────────────────────────────────────

  const displayed = useMemo(() => {
    let list = products;

    if (filter === 'active')   list = list.filter((p) => p.status === 'ACTIVE');
    if (filter === 'inactive') list = list.filter((p) => p.status !== 'ACTIVE');
    if (categoryFilter)        list = list.filter((p) => (p.categories ?? []).includes(categoryFilter));
    if (brandFilter)           list = list.filter((p) => p.brandName === brandFilter);
    if (stockFilter)           list = list.filter((p) => stockStatus(p.variants) === stockFilter);

    if (search.trim()) {
      const t = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(t) ||
          p.brandName?.toLowerCase().includes(t) ||
          (p.categories ?? []).some((c) => c.toLowerCase().includes(t)),
      );
    }

    return [...list].sort((a, b) => {
      if (sortBy === 'price') return minPrice(a.variants) - minPrice(b.variants);
      if (sortBy === 'stock') return totalStock(b.variants) - totalStock(a.variants);
      return (a.name ?? '').localeCompare(b.name ?? '', 'es');
    });
  }, [products, filter, categoryFilter, brandFilter, stockFilter, search, sortBy]);

  // ── Toggle active / inactive ──────────────────────────────────────────────────

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

  // ── KPIs ──────────────────────────────────────────────────────────────────────

  const kpi = useMemo(() => ({
    total:    products.length,
    active:   products.filter((p) => p.status === 'ACTIVE').length,
    lowStock: products.filter((p) => stockStatus(p.variants) === 'low').length,
    outStock: products.filter((p) => stockStatus(p.variants) === 'out').length,
  }), [products]);

  const clearFilters = () => {
    setCategoryFilter('');
    setBrandFilter('');
    setStockFilter('');
    setSearch('');
    setFilter('all');
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="ap-container">

      {toast && (
        <div className={`ap-toast ap-toast-${toast.type}`}>{toast.msg}</div>
      )}

      {/* Header */}
      <div className="ap-header">
        <div>
          <h1 className="ap-title">Inventario</h1>
          <p className="ap-subtitle">
            {products.length > 0
              ? `${products.length} producto${products.length !== 1 ? 's' : ''} registrado${products.length !== 1 ? 's' : ''}`
              : 'Gestiona el catálogo completo de tu tienda.'}
          </p>
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
        {[
          { icon: <Package size={18} className="ap-kpi-icon blue" />,        label: 'Total',      value: kpi.total    },
          { icon: <CheckCircle2 size={18} className="ap-kpi-icon green" />,  label: 'Activos',    value: kpi.active   },
          { icon: <TrendingDown size={18} className="ap-kpi-icon orange" />, label: 'Stock bajo', value: kpi.lowStock },
          { icon: <AlertTriangle size={18} className="ap-kpi-icon red" />,   label: 'Sin stock',  value: kpi.outStock },
        ].map(({ icon, label, value }, i) => (
          <div key={label} className="ap-kpi-card" style={{ animationDelay: `${i * 60}ms` }}>
            {icon}
            <div>
              <span className="ap-kpi-label">{label}</span>
              <span className="ap-kpi-value">{value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Status tabs + search */}
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

      {/* Advanced filters */}
      <div className="ap-advanced-filters">
        <div className="ap-filter-row">
          <SlidersHorizontal size={13} className="ap-filter-icon" />

          {filterOptions.categories.length > 0 && (
            <select
              className={`ap-select ${categoryFilter ? 'ap-select--active' : ''}`}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">Categoría</option>
              {filterOptions.categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}

          {filterOptions.brands.length > 0 && (
            <select
              className={`ap-select ${brandFilter ? 'ap-select--active' : ''}`}
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
            >
              <option value="">Marca</option>
              {filterOptions.brands.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          )}

          <select
            className={`ap-select ${stockFilter ? 'ap-select--active' : ''}`}
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
          >
            <option value="">Stock</option>
            <option value="ok">Normal</option>
            <option value="low">Bajo</option>
            <option value="out">Sin stock</option>
            <option value="empty">Sin variantes</option>
          </select>

          <select
            className="ap-select ap-select--sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">A–Z</option>
            <option value="price">Precio ↑</option>
            <option value="stock">Stock ↓</option>
          </select>

          {activeFilterCount > 0 && (
            <button className="ap-clear-btn" onClick={clearFilters}>
              <X size={11} /> Limpiar ({activeFilterCount})
            </button>
          )}
        </div>

        {!loading && displayed.length !== products.length && (
          <span className="ap-result-count">
            {displayed.length} de {products.length} productos
          </span>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="ap-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} delay={i * 70} />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <EmptyState hasFilters={activeFilterCount > 0 || !!search} onClear={clearFilters} />
      ) : (
        <div className="ap-grid" key={filterKey}>
          {displayed.map((product, index) => {
            const pid = getPid(product);
            return (
              <ProductCard
                key={pid || product.name}
                product={product}
                detailPath={`${adminBase}/productos/${pid}`}
                editPath={`${adminBase}/editar-producto/${pid}`}
                publicPath={`/producto/${pid}`}
                toggling={toggling === pid}
                onToggle={() => handleToggle(product)}
                entryDelay={Math.min(index * 40, 300)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Skeleton card ─────────────────────────────────────────────────────────────

function SkeletonCard({ delay = 0 }) {
  return (
    <div className="ap-card ap-card--skeleton" style={{ animationDelay: `${delay}ms` }}>
      <div className="ap-skel-img" />
      <div className="ap-card-body">
        <div className="ap-skel-line ap-skel-line--lg" />
        <div className="ap-skel-line ap-skel-line--sm" />
        <div className="ap-skel-line ap-skel-line--md" />
        <div className="ap-skel-line ap-skel-line--xs" />
      </div>
      <div className="ap-skel-actions" />
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ hasFilters, onClear }) {
  return (
    <div className="ap-empty">
      <div className="ap-empty-icon">
        <Package size={36} />
      </div>
      <p className="ap-empty-title">
        {hasFilters ? 'Sin resultados' : 'Sin productos'}
      </p>
      <p className="ap-empty-desc">
        {hasFilters
          ? 'No hay productos que coincidan con los filtros aplicados.'
          : 'Aún no tienes productos registrados en tu tienda.'}
      </p>
      {hasFilters && (
        <button className="ap-btn-ghost" style={{ marginTop: 12, gap: 6 }} onClick={onClear}>
          <X size={13} /> Limpiar filtros
        </button>
      )}
    </div>
  );
}

// ── Product card ──────────────────────────────────────────────────────────────

function ProductCard({ product, detailPath, editPath, publicPath, toggling, onToggle, entryDelay }) {
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
    <div
      className={`ap-card ${isActive ? '' : 'ap-card-inactive'}`}
      style={{ animationDelay: `${entryDelay}ms` }}
    >
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

        <Link to={publicPath} className="ap-ver-mas" target="_blank" rel="noopener noreferrer">
          Ver más <ArrowUpRight size={13} />
        </Link>
      </div>

      <div className="ap-card-actions">
        <Link to={detailPath} className="ap-action-btn ap-action-view" title="Ver detalle">
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
            ? <><ToggleLeft size={14} /> {toggling ? '…' : 'Desactivar'}</>
            : <><ToggleRight size={14} /> {toggling ? '…' : 'Activar'}</>}
        </button>
      </div>
    </div>
  );
}
