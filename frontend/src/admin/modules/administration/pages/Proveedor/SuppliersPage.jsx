import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search, Plus, Eye, Edit3, Unlink, PowerOff,
  X, Loader, CheckCircle, AlertCircle, ChevronRight,
  Mail, Phone, User, Building2, Calendar, RefreshCw,
} from 'lucide-react';
import './Suppliers.css';

// ══════════════════════════════════════════════════════════
// MOCK DATA — quitar cuando el backend esté listo
// ══════════════════════════════════════════════════════════

const MOCK_SUPPLIERS = [
  {
    supplierId: "a1b2c3d4-0001",
    name: "Acme Corporation",
    contactName: "John Smith",
    phone: "+1 555 000 1111",
    email: "john@acme.com",
    createdAt: "2024-03-15T10:00:00Z",
  },
  {
    supplierId: "a1b2c3d4-0002",
    name: "Global Supplies Co.",
    contactName: "Maria García",
    phone: "+57 300 123 4567",
    email: "maria@globalsupplies.com",
    createdAt: "2024-05-20T08:30:00Z",
  },
  {
    supplierId: "a1b2c3d4-0003",
    name: "Tech Parts Ltd.",
    contactName: "Carlos Ruiz",
    phone: "+34 91 234 5678",
    email: "carlos@techparts.com",
    createdAt: "2024-07-10T14:00:00Z",
  },
  {
    supplierId: "a1b2c3d4-0004",
    name: "FastShip Logistics",
    contactName: "",
    phone: "",
    email: "contact@fastship.io",
    createdAt: "2024-09-01T09:00:00Z",
  },
  {
    supplierId: "a1b2c3d4-0005",
    name: "Premium Materials SA",
    contactName: "Laura Torres",
    phone: "+57 310 987 6543",
    email: "",
    createdAt: "2025-01-12T11:00:00Z",
  },
];

// ══════════════════════════════════════════════════════════
// MOCK API — simula delay de red
// ══════════════════════════════════════════════════════════

let mockDb = [...MOCK_SUPPLIERS];

const delay = (ms = 600) => new Promise(res => setTimeout(res, ms));

const api = {
  getAll: async () => {
    await delay();
    return [...mockDb];
  },

  getById: async (id) => {
    await delay(300);
    const found = mockDb.find(s => s.supplierId === id);
    if (!found) throw new Error('Supplier not found');
    return { ...found };
  },

  create: async (body) => {
    await delay();
    const newSupplier = {
      ...body,
      supplierId: `mock-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    mockDb = [newSupplier, ...mockDb];
    return { ...newSupplier };
  },

  update: async (id, body) => {
    await delay();
    mockDb = mockDb.map(s =>
      s.supplierId === id ? { ...s, ...body } : s
    );
    return { ...mockDb.find(s => s.supplierId === id) };
  },

  unlink: async (id) => {
    await delay();
    mockDb = mockDb.filter(s => s.supplierId !== id);
  },

  deactivate: async (id) => {
    await delay();
    mockDb = mockDb.filter(s => s.supplierId !== id);
  },
};

// ══════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Name is required';
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = 'Enter a valid email';
  if (form.phone && !/^[+\d\s\-()]{6,20}$/.test(form.phone))
    errors.phone = 'Enter a valid phone number';
  return errors;
}

function initForm(supplier) {
  return {
    name:        supplier?.name        ?? '',
    contactName: supplier?.contactName ?? '',
    phone:       supplier?.phone       ?? '',
    email:       supplier?.email       ?? '',
  };
}

// ══════════════════════════════════════════════════════════
// TOAST
// ══════════════════════════════════════════════════════════

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
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
            {isUnlink ? 'Unlink Supplier' : 'Deactivate Supplier'}
          </h3>
          <p className="sp-confirm-desc">
            {isUnlink
              ? <>Are you sure you want to unlink <strong>{action.name}</strong> from this store? This action can be reversed.</>
              : <>Are you sure you want to deactivate <strong>{action.name}</strong>? This will perform a logical deletion.</>}
          </p>
        </div>

        <div className="sp-confirm-actions">
          <button className="sp-btn-ghost" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button
            className={`sp-btn-danger ${loading ? 'sp-btn--loading' : ''}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading
              ? <Loader size={14} className="sp-spin" />
              : isUnlink ? <Unlink size={14} /> : <PowerOff size={14} />}
            {isUnlink ? 'Unlink' : 'Deactivate'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// DETAIL MODAL
// ══════════════════════════════════════════════════════════

function DetailModal({ supplier, onClose, onEdit }) {
  const avatar = supplier.name?.[0]?.toUpperCase() ?? 'S';

  return (
    <div className="sp-overlay" onClick={onClose}>
      <div className="sp-modal sp-modal--detail" onClick={e => e.stopPropagation()}>

        <div className="sp-modal-header">
          <h2 className="sp-modal-title">Supplier Details</h2>
          <button className="sp-icon-btn" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Avatar hero */}
        <div className="sp-detail-hero">
          <div className="sp-detail-avatar">{avatar}</div>
          <div className="sp-detail-hero-info">
            <h3 className="sp-detail-name">{supplier.name}</h3>
            <span className="sp-detail-id">ID: {supplier.supplierId}</span>
          </div>
          <button className="sp-btn-primary sp-btn-sm" onClick={() => onEdit(supplier)}>
            <Edit3 size={13} /> Edit
          </button>
        </div>

        {/* Info rows */}
        <div className="sp-detail-body">
          <div className="sp-detail-row">
            <div className="sp-detail-icon-wrap"><User size={14} /></div>
            <div>
              <p className="sp-detail-label">Contact Name</p>
              <p className="sp-detail-value">{supplier.contactName || '—'}</p>
            </div>
          </div>
          <div className="sp-detail-row">
            <div className="sp-detail-icon-wrap"><Mail size={14} /></div>
            <div>
              <p className="sp-detail-label">Email</p>
              <p className="sp-detail-value">{supplier.email || '—'}</p>
            </div>
          </div>
          <div className="sp-detail-row">
            <div className="sp-detail-icon-wrap"><Phone size={14} /></div>
            <div>
              <p className="sp-detail-label">Phone</p>
              <p className="sp-detail-value">{supplier.phone || '—'}</p>
            </div>
          </div>
          <div className="sp-detail-row">
            <div className="sp-detail-icon-wrap"><Calendar size={14} /></div>
            <div>
              <p className="sp-detail-label">Created At</p>
              <p className="sp-detail-value">{formatDate(supplier.createdAt)}</p>
            </div>
          </div>
        </div>

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
              {isEdit ? 'Edit Supplier' : 'New Supplier'}
            </h2>
          </div>
          <button className="sp-icon-btn" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={submit} className="sp-form-body">

          {/* Name */}
          <div className={`sp-field ${errors.name ? 'sp-field--error' : ''}`}>
            <label className="sp-label">
              Company Name <span className="sp-required">*</span>
            </label>
            <div className="sp-input-wrap">
              <Building2 size={14} className="sp-input-icon" />
              <input
                className="sp-input"
                placeholder="e.g. Acme Corp"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                maxLength={80}
              />
            </div>
            {errors.name && <span className="sp-error-msg">{errors.name}</span>}
          </div>

          {/* Contact Name */}
          <div className="sp-field">
            <label className="sp-label">
              Contact Name <span className="sp-optional">(optional)</span>
            </label>
            <div className="sp-input-wrap">
              <User size={14} className="sp-input-icon" />
              <input
                className="sp-input"
                placeholder="e.g. John Smith"
                value={form.contactName}
                onChange={e => set('contactName', e.target.value)}
                maxLength={80}
              />
            </div>
          </div>

          {/* Email + Phone side by side */}
          <div className="sp-field-row">
            <div className={`sp-field ${errors.email ? 'sp-field--error' : ''}`}>
              <label className="sp-label">
                Email <span className="sp-optional">(optional)</span>
              </label>
              <div className="sp-input-wrap">
                <Mail size={14} className="sp-input-icon" />
                <input
                  className="sp-input"
                  type="email"
                  placeholder="supplier@email.com"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                />
              </div>
              {errors.email && <span className="sp-error-msg">{errors.email}</span>}
            </div>

            <div className={`sp-field ${errors.phone ? 'sp-field--error' : ''}`}>
              <label className="sp-label">
                Phone <span className="sp-optional">(optional)</span>
              </label>
              <div className="sp-input-wrap">
                <Phone size={14} className="sp-input-icon" />
                <input
                  className="sp-input"
                  placeholder="+1 555 000 0000"
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                />
              </div>
              {errors.phone && <span className="sp-error-msg">{errors.phone}</span>}
            </div>
          </div>

          <div className="sp-form-actions">
            <button type="button" className="sp-btn-ghost" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="sp-btn-primary" disabled={loading}>
              {loading
                ? <Loader size={14} className="sp-spin" />
                : isEdit ? <Edit3 size={14} /> : <Plus size={14} />}
              {isEdit ? 'Save Changes' : 'Create Supplier'}
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
  const avatar = supplier.name?.[0]?.toUpperCase() ?? 'S';

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
      <td className="sp-cell sp-cell--sub">{supplier.contactName || '—'}</td>
      <td className="sp-cell sp-cell--sub">{supplier.email || '—'}</td>
      <td className="sp-cell sp-cell--sub">{supplier.phone || '—'}</td>
      <td className="sp-cell sp-cell--sub">{formatDate(supplier.createdAt)}</td>
      <td className="sp-cell">
        <div className="sp-actions">
          <button className="sp-action-btn sp-action-btn--view"    onClick={() => onView(supplier)}       title="View details">
            <Eye size={14} />
          </button>
          <button className="sp-action-btn sp-action-btn--edit"    onClick={() => onEdit(supplier)}       title="Edit supplier">
            <Edit3 size={14} />
          </button>
          <button className="sp-action-btn sp-action-btn--unlink"  onClick={() => onUnlink(supplier)}     title="Unlink supplier">
            <Unlink size={14} />
          </button>
          <button className="sp-action-btn sp-action-btn--danger"  onClick={() => onDeactivate(supplier)} title="Deactivate supplier">
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

  // ── Load ──────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getAll();
      setSuppliers(Array.isArray(data) ? data : data?.content ?? data?.data ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Modal handlers ────────────────────────────────────────────────────────
  const openCreate = () => { setSelected(null); setModalMode('create'); };
  const openEdit   = (s)  => { setSelected(s);  setModalMode('edit');   };

  const openDetail = async (s) => {
    try {
      const detail = await api.getById(s.supplierId);
      setSelected(detail);
      setModalMode('detail');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const closeModal = () => { setModalMode(null); setSelected(null); };

  // ── Submit form ───────────────────────────────────────────────────────────
  const handleSubmit = async (form) => {
    try {
      setActionLoading(true);
      if (modalMode === 'create') {
        const created = await api.create(form);
        setSuppliers(prev => [created, ...prev]);
        showToast('Supplier created successfully');
      } else if (modalMode === 'edit' && selected) {
        const updated = await api.update(selected.supplierId, form);
        setSuppliers(prev => prev.map(s => s.supplierId === updated.supplierId ? updated : s));
        showToast('Supplier updated successfully');
      }
      closeModal();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Confirm actions ───────────────────────────────────────────────────────
  const askUnlink     = (s) => setConfirm({ type: 'unlink',     id: s.supplierId, name: s.name });
  const askDeactivate = (s) => setConfirm({ type: 'deactivate', id: s.supplierId, name: s.name });

  const handleConfirm = async () => {
    if (!confirm) return;
    try {
      setActionLoading(true);
      if (confirm.type === 'unlink')     await api.unlink(confirm.id);
      if (confirm.type === 'deactivate') await api.deactivate(confirm.id);
      setSuppliers(prev => prev.filter(s => s.supplierId !== confirm.id));
      showToast(
        confirm.type === 'unlink'
          ? 'Supplier unlinked successfully'
          : 'Supplier deactivated successfully'
      );
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
      setConfirm(null);
    }
  };

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = suppliers.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.contactName?.toLowerCase().includes(search.toLowerCase())
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="sp-root">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="sp-page-header">
        <div>
          <h1 className="sp-page-title">Suppliers</h1>
          <p className="sp-page-sub">
            {suppliers.length} supplier{suppliers.length !== 1 ? 's' : ''} registered
          </p>
        </div>
        <div className="sp-page-actions">
          <button className="sp-btn-ghost sp-btn-icon" onClick={load} title="Refresh" disabled={loading}>
            <RefreshCw size={15} className={loading ? 'sp-spin' : ''} />
          </button>
          <button className="sp-btn-primary" onClick={openCreate}>
            <Plus size={14} /> New Supplier
          </button>
        </div>
      </div>

      {/* ── Search ──────────────────────────────────────────────────────── */}
      <div className="sp-toolbar">
        <div className="sp-search-box">
          <Search size={14} className="sp-search-icon" />
          <input
            className="sp-search-input"
            placeholder="Search by name, email or contact..."
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
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* ── Error ───────────────────────────────────────────────────────── */}
      {error && (
        <div className="sp-error-banner">
          <AlertCircle size={15} />
          <span>{error}</span>
          <button className="sp-btn-ghost sp-btn-sm" onClick={load}>Retry</button>
        </div>
      )}

      {/* ── Loading skeleton ────────────────────────────────────────────── */}
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

      {/* ── Table ───────────────────────────────────────────────────────── */}
      {!loading && !error && (
        <>
          {filtered.length === 0 ? (
            <div className="sp-empty">
              <Building2 size={40} className="sp-empty-icon" />
              <p className="sp-empty-title">
                {search ? 'No suppliers match your search' : 'No suppliers yet'}
              </p>
              <p className="sp-empty-sub">
                {search
                  ? 'Try a different keyword'
                  : 'Add your first supplier to get started'}
              </p>
              {!search && (
                <button className="sp-btn-primary" onClick={openCreate}>
                  <Plus size={14} /> Add Supplier
                </button>
              )}
            </div>
          ) : (
            <div className="sp-table-wrap">
              <table className="sp-table">
                <thead>
                  <tr>
                    <th className="sp-th">Supplier</th>
                    <th className="sp-th">Contact</th>
                    <th className="sp-th">Email</th>
                    <th className="sp-th">Phone</th>
                    <th className="sp-th">Created</th>
                    <th className="sp-th sp-th--actions">Actions</th>
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

      {/* ── Modals ──────────────────────────────────────────────────────── */}
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

      {/* ── Toast ───────────────────────────────────────────────────────── */}
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