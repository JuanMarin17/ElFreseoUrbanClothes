import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Pencil, ToggleLeft, ToggleRight, Package,
  Plus, Minus, RefreshCw, Tag, Layers,
} from 'lucide-react';
import {
  getProductById,
  activateProduct,
  inactivateProduct,
  increaseStock,
  decreaseStock,
} from '../../services/productService';
import './AdminProductDetail.css';

// ── Utilidades ───────────────────────────────────────────────────────────────

const formatCOP = (val) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0,
  }).format(val ?? 0);

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(new Date(dateStr));
};

const variantLabel = (v) => {
  const parts = [v.size, v.color].filter(Boolean);
  return parts.length ? parts.join(' · ') : 'Sin variante';
};

const stockStatus = (stock, minStock) => {
  if (stock === 0)           return { label: 'Sin stock',   cls: 'apd-sb-out' };
  if (stock <= minStock)     return { label: 'Stock bajo',  cls: 'apd-sb-low' };
  return                            { label: 'Disponible',  cls: 'apd-sb-ok'  };
};

// ── Componente principal ─────────────────────────────────────────────────────

export default function AdminProductDetail() {
  const { id, slug }  = useParams();
  const navigate       = useNavigate();

  const [product,   setProduct]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [imgIdx,    setImgIdx]    = useState(0);
  const [toast,     setToast]     = useState(null);
  const [toggling,  setToggling]  = useState(false);
  // Map variantId → pending amount for stock adjustment
  const [stockEdits, setStockEdits] = useState({});
  const [adjusting,  setAdjusting]  = useState(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const handleError = useCallback((err) => {
    if (err.status === 401) { window.location.href = '/login'; return; }
    showToast('error', err.message || 'Error del servidor, intenta de nuevo');
  }, []);

  // ── Carga del producto ────────────────────────────────────────────────────

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProductById(id);
      setProduct(data);
      setImgIdx(0);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [id, handleError]);

  useEffect(() => { load(); }, [load]);

  // ── Activar / Inactivar ────────────────────────────────────────────────────

  const handleToggle = async () => {
    if (!product) return;
    setToggling(true);
    try {
      if (product.status === 'ACTIVE') {
        await inactivateProduct(product.productId);
        setProduct((p) => ({ ...p, status: 'INACTIVE' }));
        showToast('success', 'Producto desactivado');
      } else {
        await activateProduct(product.productId);
        setProduct((p) => ({ ...p, status: 'ACTIVE' }));
        showToast('success', 'Producto activado');
      }
    } catch (err) {
      handleError(err);
    } finally {
      setToggling(false);
    }
  };

  // ── Ajuste de stock ───────────────────────────────────────────────────────

  const setEdit = (variantId, val) =>
    setStockEdits((prev) => ({ ...prev, [variantId]: val }));

  const handleStockAdjust = async (variant, direction) => {
    const amount = Math.abs(stockEdits[variant.variantId] ?? 1);
    if (!amount || amount < 1) return;
    setAdjusting(variant.variantId);
    try {
      const updated =
        direction === 'increase'
          ? await increaseStock(variant.variantId, amount)
          : await decreaseStock(variant.variantId, amount);

      setProduct((p) => ({
        ...p,
        variants: p.variants.map((v) =>
          v.variantId === variant.variantId ? { ...v, stock: updated.stock } : v,
        ),
      }));
      setEdit(variant.variantId, 1);
      showToast('success', `Stock actualizado: ${updated.stock} uds.`);
    } catch (err) {
      handleError(err);
    } finally {
      setAdjusting(null);
    }
  };

  // ── Navegación ─────────────────────────────────────────────────────────────

  const goBack = () => {
    const base = slug ? `/tienda/${slug}/admin` : '/admin';
    navigate(`${base}/productos`);
  };

  const goEdit = () => {
    const base = slug ? `/tienda/${slug}/admin` : '/admin';
    navigate(`${base}/editar-producto/${id}`);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="apd-container">
        <div className="apd-state-placeholder">Cargando producto...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="apd-container">
        <div className="apd-state-placeholder">Producto no encontrado.</div>
      </div>
    );
  }

  const isActive  = product.status === 'ACTIVE';
  const images    = product.images ?? [];
  const variants  = product.variants ?? [];
  const totalSt   = variants.reduce((s, v) => s + (v.stock ?? 0), 0);

  return (
    <div className="apd-container">

      {toast && (
        <div className={`apd-toast apd-toast-${toast.type}`}>{toast.msg}</div>
      )}

      {/* Breadcrumb / header */}
      <div className="apd-topbar">
        <button className="apd-back-btn" onClick={goBack}>
          <ArrowLeft size={16} /> Productos
        </button>
        <div className="apd-topbar-actions">
          <button className="apd-btn-ghost" onClick={load} title="Recargar">
            <RefreshCw size={15} />
          </button>
          <button className="apd-btn-secondary" onClick={goEdit}>
            <Pencil size={14} /> Editar
          </button>
          <button
            className={`apd-btn-toggle ${isActive ? 'apd-btn-deactivate' : 'apd-btn-activate'}`}
            onClick={handleToggle}
            disabled={toggling}
          >
            {isActive
              ? <><ToggleLeft size={14} /> {toggling ? '...' : 'Desactivar'}</>
              : <><ToggleRight size={14} /> {toggling ? '...' : 'Activar'}</>}
          </button>
        </div>
      </div>

      {/* Título + status */}
      <div className="apd-title-row">
        <h1 className="apd-title">{product.name}</h1>
        <span className={`apd-status-badge ${isActive ? 'apd-s-active' : 'apd-s-inactive'}`}>
          {isActive ? 'Activo' : 'Inactivo'}
        </span>
      </div>

      {/* Contenido principal: galería + info */}
      <div className="apd-content-row">

        {/* ── Galería ────────────────────────────────────────────── */}
        <div className="apd-gallery-col">
          <div className="apd-main-img">
            {images.length > 0
              ? <img src={images[imgIdx]?.url} alt={product.name} />
              : <div className="apd-img-placeholder"><Package size={48} /></div>}
          </div>
          {images.length > 1 && (
            <div className="apd-thumbs">
              {images.map((img, i) => (
                <button
                  key={i}
                  className={`apd-thumb ${i === imgIdx ? 'apd-thumb-active' : ''}`}
                  onClick={() => setImgIdx(i)}
                >
                  <img src={img.url} alt="" />
                </button>
              ))}
            </div>
          )}
          {images.length === 0 && (
            <p className="apd-no-images">Sin imágenes</p>
          )}
        </div>

        {/* ── Información del producto ────────────────────────────── */}
        <div className="apd-info-col">

          {/* Marca + categorías */}
          <div className="apd-meta-section">
            {product.brandName && (
              <div className="apd-meta-row">
                <Tag size={14} className="apd-meta-icon" />
                <span className="apd-meta-label">Marca:</span>
                <span className="apd-meta-value">{product.brandName}</span>
              </div>
            )}
            {product.categories?.length > 0 && (
              <div className="apd-meta-row apd-cats-row">
                <Layers size={14} className="apd-meta-icon" />
                <span className="apd-meta-label">Categorías:</span>
                <div className="apd-cats">
                  {product.categories.map((c) => (
                    <span key={c} className="apd-cat-chip">{c}</span>
                  ))}
                </div>
              </div>
            )}
            <div className="apd-meta-row">
              <span className="apd-meta-label">Creado:</span>
              <span className="apd-meta-value">{formatDate(product.createdAt)}</span>
            </div>
            <div className="apd-meta-row">
              <span className="apd-meta-label">Stock total:</span>
              <span className="apd-meta-value apd-stock-total">{totalSt} uds.</span>
            </div>
          </div>

          {/* Descripción */}
          {product.description && (
            <div className="apd-description">
              <h4 className="apd-section-label">Descripción</h4>
              <p>{product.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Tabla de variantes ────────────────────────────────────────────── */}
      <div className="apd-variants-section">
        <h3 className="apd-section-title">
          Variantes <span className="apd-variants-count">({variants.length})</span>
        </h3>

        {variants.length === 0 ? (
          <div className="apd-state-placeholder">Sin variantes registradas.</div>
        ) : (
          <div className="apd-table-wrap">
            <table className="apd-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Variante</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Mínimo</th>
                  <th>Estado</th>
                  <th className="text-center">Ajustar stock</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((v) => {
                  const ss        = stockStatus(v.stock, v.minStock);
                  const isAdj     = adjusting === v.variantId;
                  const editVal   = stockEdits[v.variantId] ?? 1;

                  return (
                    <tr key={v.variantId}>
                      <td><code className="apd-sku">{v.sku}</code></td>
                      <td>{variantLabel(v)}</td>
                      <td className="apd-price">{formatCOP(v.price)}</td>
                      <td className="apd-stock-num">{v.stock}</td>
                      <td className="apd-text-muted">{v.minStock}</td>
                      <td>
                        <span className={`apd-stock-badge ${ss.cls}`}>{ss.label}</span>
                      </td>
                      <td>
                        <div className="apd-stock-controls">
                          <button
                            className="apd-adj-btn apd-adj-minus"
                            onClick={() => handleStockAdjust(v, 'decrease')}
                            disabled={isAdj || v.stock === 0}
                            title="Disminuir stock"
                          >
                            <Minus size={12} />
                          </button>
                          <input
                            type="number"
                            className="apd-adj-input"
                            value={editVal}
                            min={1}
                            max={9999}
                            onChange={(e) => setEdit(v.variantId, Math.max(1, parseInt(e.target.value) || 1))}
                            disabled={isAdj}
                          />
                          <button
                            className="apd-adj-btn apd-adj-plus"
                            onClick={() => handleStockAdjust(v, 'increase')}
                            disabled={isAdj}
                            title="Aumentar stock"
                          >
                            <Plus size={12} />
                          </button>
                          {isAdj && <span className="apd-adj-loading">...</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
