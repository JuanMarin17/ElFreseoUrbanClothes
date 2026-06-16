import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Search, Plus, Eye, Edit3, Unlink, PowerOff,
  X, Loader, CheckCircle, AlertCircle,
  Mail, Phone, User, Building2, Calendar, RefreshCw,
  Package, ExternalLink, Tag,
} from 'lucide-react';
import {
  getSuppliersByStore,
  getSupplierById,
  createSupplier,
  updateSupplier,
  unlinkSupplier,
  deactivateSupplier,
} from '../../services/SupplierService';
import { getAllProducts } from '../../services/productService';
import './Suppliers.css';

// ══════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'El nombre es requerido';
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = 'Ingresa un correo válido';
  if (form.phone && !/^[+\d\s\-()]{6,20}$/.test(form.phone))
    errors.phone = 'Ingresa un teléfono válido';
  return errors;
}

function initForm(supplier) {
  return {
    name:        supplier?.name        ?? '',
    contactName: supplier?.contactName ?? '',
    phone:       supplier?.phone       ?? '',
    email:       supplier?.email       ?? '',
    tipo:        supplier?.supplierId  ? getSupplierTipo(supplier.supplierId) : '',
  };
}

function extractErrorMsg(err) {
  if (err?.status === 409) return 'Ya existe un proveedor con ese nombre.';
  if (err?.status === 403) return 'No tienes permisos para realizar esta acción.';
  if (err?.status === 404) return 'Proveedor no encontrado.';
  if (err?.status === 400) return err.message || 'Datos inválidos. Revisa el formulario.';
  return err?.message || 'Ocurrió un error. Intenta de nuevo.';
}

// ── Metadata local (tipo/especialidad) ────────────────────────────────────────
// El backend no persiste este campo aún; se guarda en localStorage por tienda.
const META_KEY = () => `sp_meta_${localStorage.getItem('storeId') ?? 'default'}`;

function getMeta() {
  try { return JSON.parse(localStorage.getItem(META_KEY()) ?? '{}'); }
  catch { return {}; }
}

function saveMeta(supplierId, patch) {
  const all = getMeta();
  all[supplierId] = { ...(all[supplierId] ?? {}), ...patch };
  localStorage.setItem(META_KEY(), JSON.stringify(all));
}

function getSupplierTipo(supplierId) {
  return getMeta()[supplierId]?.tipo ?? '';
}

// ══════════════════════════════════════════════════════════
// TOAST
// ══════════════════════════════════════════════════════════

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`sp-toast sp-toast--${type}`}>
      {type === 'error'
        ? <AlertCircle size={15} />
        : <CheckCircle size={15} />}
      <span>{message}</span>
      <button className="sp-toast-close" onClick={onClose}><X size={13} /></button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// CONFIRM MODAL
// ══════════════════════════════════════════════════════════

function ConfirmModal({ action, onConfirm, onCancel, loading }) {
  const isUnlink = action.type === 'unlink';
  return (
    <div className="sp-overlay" onClick={onCancel}>
      <div className="sp-modal sp-modal--sm" onClick={e => e.stopPropagation()}>
        <div className="sp-modal-header">
          <div className={`sp-confirm-icon sp-confirm-icon--${isUnlink ? 'warn' : 'danger'}`}>
            {isUnlink ? <Unlink size={20} /> : <PowerOff size={20} />}
          </div>
          <button className="sp-icon-btn" onClick={onCancel}><X size={16} /></button>
        </div>

        <div className="sp-confirm-body">
          <h3 className="sp-confirm-title">
            {isUnlink ? 'Desvincular proveedor' : 'Desactivar proveedor'}
          </h3>
          <p className="sp-confirm-desc">
            {isUnlink
              ? <>¿Desvincular a <strong>{action.name}</strong> de esta tienda? El proveedor seguirá existiendo y puede volver a vincularse.</>
              : <>¿Desactivar a <strong>{action.name}</strong>? Esta acción es un borrado lógico y lo ocultará de todos los listados.</>}
          </p>
        </div>

        <div className="sp-confirm-actions">
          <button className="sp-btn-ghost" onClick={onCancel} disabled={loading}>
            Cancelar
          </button>
          <button
            className={`sp-btn-danger ${loading ? 'sp-btn--loading' : ''}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading
              ? <Loader size={14} className="sp-spin" />
              : isUnlink ? <Unlink size={14} /> : <PowerOff size={14} />}
            {isUnlink ? 'Desvincular' : 'Desactivar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// DETAIL MODAL
// ══════════════════════════════════════════════════════════

function SupplierProductsPanel({ supplier, adminBase }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    getAllProducts()
      .then(data => {
        const list = Array.isArray(data) ? data
          : Array.isArray(data?.data) ? data.data
          : Array.isArray(data?.content) ? data.content
          : [];
        setProducts(list.filter(p => p.supplierId === supplier.supplierId));
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [supplier.supplierId]);

  const formatCOP = (n) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n ?? 0);

  if (loading) {
    return (
      <div className="sp-products-loading">
        <Loader size={18} className="sp-spin" />
        <span>Cargando productos…</span>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="sp-products-empty">
        <Package size={32} className="sp-products-empty-icon" />
        <p className="sp-products-empty-title">Sin productos vinculados</p>
        <p className="sp-products-empty-sub">
          Al crear o editar un producto puedes asignarle este proveedor.
        </p>
        <button className="sp-btn-primary sp-btn-sm" onClick={() => navigate(`${adminBase}/subir-producto`)}>
          <Plus size={13} /> Crear producto
        </button>
      </div>
    );
  }

  return (
    <div className="sp-products-list">
      {products.map(p => {
        const price = p.variants?.[0]?.price ?? p.price ?? 0;
        const img   = p.images?.[0]?.url ?? null;
        return (
          <div key={p.productId ?? p.id} className="sp-product-row">
            <div className="sp-product-thumb">
              {img
                ? <img src={img} alt={p.name} />
                : <Package size={16} />}
            </div>
            <div className="sp-product-info">
              <p className="sp-product-name">{p.name}</p>
              <p className="sp-product-price">{formatCOP(price)}</p>
            </div>
            <button
              className="sp-action-btn sp-action-btn--view"
              title="Editar producto"
              onClick={() => navigate(`${adminBase}/editar-producto/${p.productId ?? p.id}`)}
            >
              <ExternalLink size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

function DetailModal({ supplier, onClose, onEdit, adminBase }) {
  const avatar = supplier.name?.[0]?.toUpperCase() ?? 'P';
  const [tab, setTab] = useState('info'); // 'info' | 'products'

  return (
    <div className="sp-overlay" onClick={onClose}>
      <div className="sp-modal sp-modal--detail" onClick={e => e.stopPropagation()}>

        <div className="sp-modal-header">
          <h2 className="sp-modal-title">Detalle del proveedor</h2>
          <button className="sp-icon-btn" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="sp-detail-hero">
          <div className="sp-detail-avatar">{avatar}</div>
          <div className="sp-detail-hero-info">
            <h3 className="sp-detail-name">{supplier.name}</h3>
            <span className="sp-detail-id">ID: {supplier.supplierId}</span>
          </div>
          <button className="sp-btn-primary sp-btn-sm" onClick={() => onEdit(supplier)}>
            <Edit3 size={13} /> Editar
          </button>
        </div>

        {/* Tabs */}
        <div className="sp-detail-tabs">
          <button
            className={`sp-detail-tab ${tab === 'info' ? 'sp-detail-tab--active' : ''}`}
            onClick={() => setTab('info')}
          >
            <User size={13} /> Información
          </button>
          <button
            className={`sp-detail-tab ${tab === 'products' ? 'sp-detail-tab--active' : ''}`}
            onClick={() => setTab('products')}
          >
            <Package size={13} /> Productos
          </button>
        </div>

        {tab === 'info' && (
          <div className="sp-detail-body">
            {supplier._tipo && (
              <div className="sp-detail-row">
                <div className="sp-detail-icon-wrap"><Tag size={14} /></div>
                <div>
                  <p className="sp-detail-label">Especialidad</p>
                  <p className="sp-detail-value">{supplier._tipo}</p>
                </div>
              </div>
            )}
            <div className="sp-detail-row">
              <div className="sp-detail-icon-wrap"><User size={14} /></div>
              <div>
                <p className="sp-detail-label">Contacto</p>
                <p className="sp-detail-value">{supplier.contactName || '—'}</p>
              </div>
            </div>
            <div className="sp-detail-row">
              <div className="sp-detail-icon-wrap"><Mail size={14} /></div>
              <div>
                <p className="sp-detail-label">Correo electrónico</p>
                <p className="sp-detail-value">{supplier.email || '—'}</p>
              </div>
            </div>
            <div className="sp-detail-row">
              <div className="sp-detail-icon-wrap"><Phone size={14} /></div>
              <div>
                <p className="sp-detail-label">Teléfono</p>
                <p className="sp-detail-value">{supplier.phone || '—'}</p>
              </div>
            </div>
            <div className="sp-detail-row">
              <div className="sp-detail-icon-wrap"><Calendar size={14} /></div>
              <div>
                <p className="sp-detail-label">Registrado</p>
                <p className="sp-detail-value">{formatDate(supplier.createdAt)}</p>
              </div>
            </div>
          </div>
        )}

        {tab === 'products' && (
          <SupplierProductsPanel supplier={supplier} adminBase={adminBase} />
        )}

      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// FORM MODAL
// ══════════════════════════════════════════════════════════

function FormModal({ mode, supplier, onSubmit, onClose, loading }) {
  const [form,   setForm]   = useState(() => initForm(supplier));
  const [errors, setErrors] = useState({});

  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const submit = (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSubmit(form);
  };

  const isEdit = mode === 'edit';

  return (
    <div className="sp-overlay" onClick={onClose}>
      <div className="sp-modal sp-modal--form" onClick={e => e.stopPropagation()}>

        <div className="sp-modal-header">
          <div className="sp-modal-header-left">
            <div className="sp-modal-icon">
              {isEdit ? <Edit3 size={16} /> : <Plus size={16} />}
            </div>
            <h2 className="sp-modal-title">
              {isEdit ? 'Editar proveedor' : 'Nuevo proveedor'}
            </h2>
          </div>
          <button className="sp-icon-btn" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={submit} className="sp-form-body">

          <div className={`sp-field ${errors.name ? 'sp-field--error' : ''}`}>
            <label className="sp-label">
              Nombre de la empresa <span className="sp-required">*</span>
            </label>
            <div className="sp-input-wrap">
              <Building2 size={14} className="sp-input-icon" />
              <input
                className="sp-input"
                placeholder="Ej. Distribuidora Nacional S.A."
                value={form.name}
                onChange={e => set('name', e.target.value)}
                maxLength={80}
              />
            </div>
            {errors.name && <span className="sp-error-msg">{errors.name}</span>}
          </div>

          <div className="sp-field">
            <label className="sp-label">
              ¿Qué provee? <span className="sp-optional">(opcional)</span>
            </label>
            <div className="sp-input-wrap">
              <Tag size={14} className="sp-input-icon" />
              <input
                className="sp-input"
                placeholder="Ej. Ropa deportiva, Calzado, Electrónicos…"
                value={form.tipo}
                onChange={e => set('tipo', e.target.value)}
                maxLength={60}
              />
            </div>
            <span className="sp-field-hint">Aparecerá como etiqueta en la lista de proveedores</span>
          </div>

          <div className="sp-field">
            <label className="sp-label">
              Nombre de contacto <span className="sp-optional">(opcional)</span>
            </label>
            <div className="sp-input-wrap">
              <User size={14} className="sp-input-icon" />
              <input
                className="sp-input"
                placeholder="Ej. Carlos Ruiz"
                value={form.contactName}
                onChange={e => set('contactName', e.target.value)}
                maxLength={80}
              />
            </div>
          </div>

          <div className="sp-field-row">
            <div className={`sp-field ${errors.email ? 'sp-field--error' : ''}`}>
              <label className="sp-label">
                Correo <span className="sp-optional">(opcional)</span>
              </label>
              <div className="sp-input-wrap">
                <Mail size={14} className="sp-input-icon" />
                <input
                  className="sp-input"
                  type="email"
                  placeholder="proveedor@correo.com"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                />
              </div>
              {errors.email && <span className="sp-error-msg">{errors.email}</span>}
            </div>

            <div className={`sp-field ${errors.phone ? 'sp-field--error' : ''}`}>
              <label className="sp-label">
                Teléfono <span className="sp-optional">(opcional)</span>
              </label>
              <div className="sp-input-wrap">
                <Phone size={14} className="sp-input-icon" />
                <input
                  className="sp-input"
                  placeholder="+57 300 123 4567"
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                />
              </div>
              {errors.phone && <span className="sp-error-msg">{errors.phone}</span>}
            </div>
          </div>

          <div className="sp-form-actions">
            <button type="button" className="sp-btn-ghost" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="sp-btn-primary" disabled={loading}>
              {loading
                ? <Loader size={14} className="sp-spin" />
                : isEdit ? <Edit3 size={14} /> : <Plus size={14} />}
              {isEdit ? 'Guardar cambios' : 'Crear proveedor'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// SUPPLIER ROW
// ══════════════════════════════════════════════════════════

function SupplierRow({ supplier, onView, onEdit, onUnlink, onDeactivate }) {
  const avatar = supplier.name?.[0]?.toUpperCase() ?? 'P';

  return (
    <tr className="sp-row">
      <td className="sp-cell">
        <div className="sp-supplier-identity">
          <div className="sp-row-avatar">{avatar}</div>
          <div>
            <p className="sp-row-name">{supplier.name}</p>
            <p className="sp-row-id">{supplier.supplierId?.slice(0, 8)}…</p>
          </div>
        </div>
      </td>
      <td className="sp-cell">
        {supplier._tipo
          ? <span className="sp-tipo-badge"><Tag size={10} />{supplier._tipo}</span>
          : <span className="sp-cell--sub">—</span>}
      </td>
      <td className="sp-cell sp-cell--sub">{supplier.contactName || '—'}</td>
      <td className="sp-cell sp-cell--sub">{supplier.email || '—'}</td>
      <td className="sp-cell sp-cell--sub">{supplier.phone || '—'}</td>
      <td className="sp-cell sp-cell--sub">{formatDate(supplier.createdAt)}</td>
      <td className="sp-cell">
        <div className="sp-actions">
          <button className="sp-action-btn sp-action-btn--view"   onClick={() => onView(supplier)}       title="Ver detalle">
            <Eye size={14} />
          </button>
          <button className="sp-action-btn sp-action-btn--edit"   onClick={() => onEdit(supplier)}       title="Editar proveedor">
            <Edit3 size={14} />
          </button>
          <button className="sp-action-btn sp-action-btn--unlink" onClick={() => onUnlink(supplier)}     title="Desvincular">
            <Unlink size={14} />
          </button>
          <button className="sp-action-btn sp-action-btn--danger" onClick={() => onDeactivate(supplier)} title="Desactivar (Admin)">
            <PowerOff size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ══════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════

export default function SuppliersPage() {
  const { slug }  = useParams();
  const adminBase = slug ? `/tienda/${slug}/admin` : '/admin';

  const [suppliers,     setSuppliers]     = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error,         setError]         = useState(null);
  const [search,        setSearch]        = useState('');
  const [toast,         setToast]         = useState(null);
  const [modalMode,     setModalMode]     = useState(null); // 'create' | 'edit' | 'detail'
  const [selected,      setSelected]      = useState(null);
  const [confirm,       setConfirm]       = useState(null); // { type, id, name }

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  // ── Carga ─────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSuppliersByStore();
      // Enriquecer con tipo guardado localmente
      setSuppliers(data.map(s => ({ ...s, _tipo: getSupplierTipo(s.supplierId) })));
    } catch (err) {
      setError(extractErrorMsg(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Modales ───────────────────────────────────────────────────────────────
  const openCreate = () => { setSelected(null); setModalMode('create'); };
  const openEdit   = (s)  => { setSelected(s);  setModalMode('edit');   };

  const openDetail = async (s) => {
    try {
      const detail = await getSupplierById(s.supplierId);
      setSelected(detail ?? s);
      setModalMode('detail');
    } catch {
      // Si falla el GET por id, usamos los datos que ya tenemos
      setSelected(s);
      setModalMode('detail');
    }
  };

  const closeModal = () => { setModalMode(null); setSelected(null); };

  // ── Envío del formulario ──────────────────────────────────────────────────
  const handleSubmit = async (form) => {
    try {
      setActionLoading(true);
      const { tipo, ...apiForm } = form; // tipo no va al backend
      if (modalMode === 'create') {
        const created = await createSupplier(apiForm);
        saveMeta(created.supplierId, { tipo: tipo.trim() });
        setSuppliers(prev => [{ ...created, _tipo: tipo.trim() }, ...prev]);
        showToast('Proveedor creado exitosamente');
      } else if (modalMode === 'edit' && selected) {
        const updated = await updateSupplier(selected.supplierId, apiForm);
        saveMeta(updated.supplierId, { tipo: tipo.trim() });
        setSuppliers(prev =>
          prev.map(s => s.supplierId === updated.supplierId
            ? { ...updated, _tipo: tipo.trim() }
            : s
          )
        );
        showToast('Proveedor actualizado exitosamente');
      }
      closeModal();
    } catch (err) {
      showToast(extractErrorMsg(err), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Confirmar acciones ────────────────────────────────────────────────────
  const askUnlink     = (s) => setConfirm({ type: 'unlink',     id: s.supplierId, name: s.name });
  const askDeactivate = (s) => setConfirm({ type: 'deactivate', id: s.supplierId, name: s.name });

  const handleConfirm = async () => {
    if (!confirm) return;
    try {
      setActionLoading(true);
      if (confirm.type === 'unlink')     await unlinkSupplier(confirm.id);
      if (confirm.type === 'deactivate') await deactivateSupplier(confirm.id);
      setSuppliers(prev => prev.filter(s => s.supplierId !== confirm.id));
      showToast(
        confirm.type === 'unlink'
          ? 'Proveedor desvinculado de la tienda'
          : 'Proveedor desactivado del sistema'
      );
    } catch (err) {
      showToast(extractErrorMsg(err), 'error');
    } finally {
      setActionLoading(false);
      setConfirm(null);
    }
  };

  // ── Filtro ────────────────────────────────────────────────────────────────
  const filtered = suppliers.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.contactName?.toLowerCase().includes(search.toLowerCase())
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="sp-root">

      {/* ── Cabecera ──────────────────────────────────────────────────────── */}
      <div className="sp-page-header">
        <div>
          <h1 className="sp-page-title">Proveedores</h1>
          <p className="sp-page-sub">
            {suppliers.length} proveedor{suppliers.length !== 1 ? 'es' : ''} registrado{suppliers.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="sp-page-actions">
          <button className="sp-btn-ghost sp-btn-icon" onClick={load} title="Actualizar" disabled={loading}>
            <RefreshCw size={15} className={loading ? 'sp-spin' : ''} />
          </button>
          <button className="sp-btn-primary" onClick={openCreate}>
            <Plus size={14} /> Nuevo proveedor
          </button>
        </div>
      </div>

      {/* ── Búsqueda ──────────────────────────────────────────────────────── */}
      <div className="sp-toolbar">
        <div className="sp-search-box">
          <Search size={14} className="sp-search-icon" />
          <input
            className="sp-search-input"
            placeholder="Buscar por nombre, correo o contacto..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="sp-search-clear" onClick={() => setSearch('')}>
              <X size={13} />
            </button>
          )}
        </div>
        {search && (
          <span className="sp-results-count">
            {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* ── Error ─────────────────────────────────────────────────────────── */}
      {error && (
        <div className="sp-error-banner">
          <AlertCircle size={15} />
          <span>{error}</span>
          <button className="sp-btn-ghost sp-btn-sm" onClick={load}>Reintentar</button>
        </div>
      )}

      {/* ── Skeleton ──────────────────────────────────────────────────────── */}
      {loading && (
        <div className="sp-skeleton-wrap">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="sp-skeleton-row">
              <div className="sp-skeleton sp-skeleton--avatar" />
              <div className="sp-skeleton sp-skeleton--text" />
              <div className="sp-skeleton sp-skeleton--text sp-skeleton--short" />
              <div className="sp-skeleton sp-skeleton--text sp-skeleton--short" />
            </div>
          ))}
        </div>
      )}

      {/* ── Tabla ─────────────────────────────────────────────────────────── */}
      {!loading && !error && (
        <>
          {filtered.length === 0 ? (
            <div className="sp-empty">
              <Building2 size={40} className="sp-empty-icon" />
              <p className="sp-empty-title">
                {search ? 'Sin resultados para tu búsqueda' : 'Aún no tienes proveedores'}
              </p>
              <p className="sp-empty-sub">
                {search
                  ? 'Prueba con otro término'
                  : 'Agrega tu primer proveedor para comenzar'}
              </p>
              {!search && (
                <button className="sp-btn-primary" onClick={openCreate}>
                  <Plus size={14} /> Agregar proveedor
                </button>
              )}
            </div>
          ) : (
            <div className="sp-table-wrap">
              <table className="sp-table">
                <thead>
                  <tr>
                    <th className="sp-th">Proveedor</th>
                    <th className="sp-th">Provee</th>
                    <th className="sp-th">Contacto</th>
                    <th className="sp-th">Correo</th>
                    <th className="sp-th">Teléfono</th>
                    <th className="sp-th">Registrado</th>
                    <th className="sp-th sp-th--actions">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(s => (
                    <SupplierRow
                      key={s.supplierId}
                      supplier={s}
                      onView={openDetail}
                      onEdit={openEdit}
                      onUnlink={askUnlink}
                      onDeactivate={askDeactivate}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── Modales ───────────────────────────────────────────────────────── */}
      {(modalMode === 'create' || modalMode === 'edit') && (
        <FormModal
          mode={modalMode}
          supplier={selected}
          onSubmit={handleSubmit}
          onClose={closeModal}
          loading={actionLoading}
        />
      )}

      {modalMode === 'detail' && selected && (
        <DetailModal
          supplier={selected}
          onClose={closeModal}
          onEdit={(s) => { closeModal(); setTimeout(() => openEdit(s), 50); }}
          adminBase={adminBase}
        />
      )}

      {confirm && (
        <ConfirmModal
          action={confirm}
          onConfirm={handleConfirm}
          onCancel={() => setConfirm(null)}
          loading={actionLoading}
        />
      )}

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

    </div>
  );
}
