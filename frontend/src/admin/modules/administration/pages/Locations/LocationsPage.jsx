import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Plus, Edit2, Trash2, X, Loader2, Check, AlertCircle } from 'lucide-react';
import {
  getLocations, createLocation, updateLocation, deleteLocation,
} from '../../services/locationsService';
import './LocationsPage.css';

const EMPTY_FORM = { name: '', address: '', description: '' };

function LocationModal({ location, onClose, onSave }) {
  const [form, setForm]       = useState(location ?? EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const isEdit = !!location?.id;

  const handleSave = async () => {
    if (!form.name.trim()) { setError('El nombre es obligatorio.'); return; }
    setLoading(true);
    setError('');
    try {
      let saved;
      if (isEdit) {
        saved = await updateLocation(location.id, form);
      } else {
        saved = await createLocation(form);
      }
      onSave(saved?.data ?? saved, isEdit);
    } catch (e) {
      setError(e.message ?? 'Error al guardar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="loc-modal-overlay" onClick={onClose}>
      <div className="loc-modal" onClick={e => e.stopPropagation()}>
        <div className="loc-modal-header">
          <h3>{isEdit ? 'Editar ubicación' : 'Nueva ubicación'}</h3>
          <button onClick={onClose} className="loc-modal-close"><X size={16} /></button>
        </div>

        <div className="loc-modal-body">
          <div className="loc-field">
            <label>Nombre *</label>
            <input
              className="loc-input"
              placeholder="Ej: Depósito Central"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="loc-field">
            <label>Dirección</label>
            <input
              className="loc-input"
              placeholder="Ej: Calle 80 #12-34, Bogotá"
              value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
            />
          </div>
          <div className="loc-field">
            <label>Descripción</label>
            <textarea
              className="loc-input loc-textarea"
              placeholder="Detalles adicionales sobre esta ubicación..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>

          {error && (
            <div className="loc-error">
              <AlertCircle size={13} /> {error}
            </div>
          )}
        </div>

        <div className="loc-modal-footer">
          <button className="loc-btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="loc-btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? <Loader2 size={14} className="loc-spin" /> : <Check size={14} />}
            <span>{loading ? 'Guardando…' : 'Guardar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({ location, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteLocation(location.id);
      onConfirm(location.id);
    } catch (e) {
      setError(e.message ?? 'No se pudo eliminar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="loc-modal-overlay" onClick={onClose}>
      <div className="loc-modal loc-modal--sm" onClick={e => e.stopPropagation()}>
        <div className="loc-modal-header">
          <h3>Eliminar ubicación</h3>
          <button onClick={onClose} className="loc-modal-close"><X size={16} /></button>
        </div>
        <div className="loc-modal-body">
          <p className="loc-delete-text">
            ¿Estás seguro de que querés eliminar <strong>"{location.name}"</strong>?
            Esta acción no se puede deshacer.
          </p>
          {error && <div className="loc-error"><AlertCircle size={13} /> {error}</div>}
        </div>
        <div className="loc-modal-footer">
          <button className="loc-btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="loc-btn-danger" onClick={handleDelete} disabled={loading}>
            {loading ? <Loader2 size={14} className="loc-spin" /> : <Trash2 size={14} />}
            <span>{loading ? 'Eliminando…' : 'Eliminar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LocationsPage() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [modal, setModal]         = useState(null); // null | 'create' | { location }
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getLocations();
      const list = Array.isArray(data) ? data
        : Array.isArray(data?.data)    ? data.data
        : Array.isArray(data?.content) ? data.content
        : [];
      setLocations(list);
    } catch (e) {
      setError(e.message ?? 'No se pudieron cargar las ubicaciones.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = (saved, isEdit) => {
    if (isEdit) {
      setLocations(list => list.map(l => l.id === saved.id ? saved : l));
    } else {
      setLocations(list => [saved, ...list]);
    }
    setModal(null);
  };

  const handleDelete = (id) => {
    setLocations(list => list.filter(l => l.id !== id));
    setDeleteTarget(null);
  };

  return (
    <div className="loc-root">
      <div className="loc-header">
        <div>
          <p className="loc-eyebrow">Gestión de inventario</p>
          <h1 className="loc-title">Ubicaciones</h1>
          <p className="loc-subtitle">Administrá los depósitos y puntos de almacenamiento de tu tienda.</p>
        </div>
        <button className="loc-new-btn" onClick={() => setModal('create')}>
          <Plus size={15} />
          <span>Nueva ubicación</span>
        </button>
      </div>

      {error && <div className="loc-error-banner">{error}</div>}

      <div className="loc-grid">
        {loading ? (
          <div className="loc-loading">
            <Loader2 size={22} className="loc-spin" />
            <span>Cargando ubicaciones...</span>
          </div>
        ) : locations.length === 0 ? (
          <div className="loc-empty">
            <div className="loc-empty-icon-wrap">
              <MapPin size={36} />
            </div>
            <p className="loc-empty-title">Sin ubicaciones</p>
            <p className="loc-empty-sub">Agregá tu primer depósito o punto de almacenamiento.</p>
            <button className="loc-empty-cta" onClick={() => setModal('create')}>
              <Plus size={14} /> Agregar ubicación
            </button>
          </div>
        ) : (
          locations.map((loc) => (
            <div key={loc.id} className="loc-card">
              <div className="loc-card-icon">
                <MapPin size={18} />
              </div>
              <div className="loc-card-body">
                <p className="loc-card-name">{loc.name}</p>
                {loc.address && <p className="loc-card-address">{loc.address}</p>}
                {loc.description && <p className="loc-card-desc">{loc.description}</p>}
              </div>
              <div className="loc-card-actions">
                <button
                  className="loc-icon-btn"
                  title="Editar"
                  onClick={() => setModal({ location: loc })}
                >
                  <Edit2 size={14} />
                </button>
                <button
                  className="loc-icon-btn loc-icon-btn--danger"
                  title="Eliminar"
                  onClick={() => setDeleteTarget(loc)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {modal === 'create' && (
        <LocationModal onClose={() => setModal(null)} onSave={handleSave} />
      )}
      {modal?.location && (
        <LocationModal
          location={modal.location}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          location={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
