import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import accountService from '../../services/accountService';
import './AddressBook.css';

const EMPTY = { alias: '', street: '', city: '', state: '', zip: '', country: '' };

export default function AddressBook() {
  const [addresses, setAddresses] = useState([]);
  const [form, setForm]           = useState(EMPTY);
  const [editing, setEditing]     = useState(null);
  const [showForm, setShowForm]   = useState(false);

  useEffect(() => {
    accountService.getAddresses()
      .then(({ data }) => setAddresses(data))
      .catch(() => {});
  }, []);

  const handleChange = e =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    try {
      if (editing) {
        await accountService.updateAddress(editing, form);
        setAddresses(a => a.map(ad => ad.id === editing ? { ...form, id: editing } : ad));
      } else {
        const { data } = await accountService.addAddress(form);
        setAddresses(a => [...a, data]);
      }
      setForm(EMPTY);
      setEditing(null);
      setShowForm(false);
    } catch (error) {
      console.error("Error al guardar dirección");
    }
  };

  const handleEdit = (addr) => {
    setForm(addr);
    setEditing(addr.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    await accountService.deleteAddress(id);
    setAddresses(a => a.filter(ad => ad.id !== id));
  };

  return (
    <div className="address-section">
      <div className="addr-header">
        <div className="header-text">
          <span className="info-tag">UBICACIONES_REGISTRADAS</span>
          <h2 className="section-title">LIBRETA DE DIRECCIONES</h2>
        </div>
        <button className="add-main-btn" onClick={() => { setShowForm(!showForm); setEditing(null); setForm(EMPTY); }}>
          {showForm ? <X size={16} /> : <Plus size={16} />}
          <span>{showForm ? 'CANCELAR' : 'NUEVA DIRECCIÓN'}</span>
        </button>
      </div>

      {showForm && (
        <div className="addr-form-container">
          <h3 className="form-subtitle">{editing ? 'MODIFICAR REGISTRO' : 'AÑADIR REGISTRO'}</h3>
          <div className="addr-grid">
            {Object.keys(EMPTY).map(key => (
              <div className="field-group" key={key}>
                <label className="field-label">{key.toUpperCase()}</label>
                <input
                  name={key}
                  value={form[key]}
                  onChange={handleChange}
                  placeholder={`Ingrese ${key}...`}
                  className="addr-input"
                />
              </div>
            ))}
          </div>
          <div className="form-actions">
            <button className="save-btn" onClick={handleSave}>
              <Save size={16} /> <span>CONFIRMAR CAMBIOS</span>
            </button>
          </div>
        </div>
      )}

      <div className="addr-list">
        {addresses.length === 0 ? (
          <div className="empty-msg">No hay ubicaciones vinculadas a esta sesión.</div>
        ) : (
          addresses.map(addr => (
            <div className="addr-card" key={addr.id}>
              <div className="card-accent" />
              <div className="addr-icon-box">
                <MapPin size={18} />
              </div>
              <div className="addr-body">
                <p className="addr-alias">{addr.alias || 'SIN ALIAS'}</p>
                <p className="addr-detail">{addr.street}, {addr.city}</p>
                <p className="addr-detail-sub">{addr.state} {addr.zip} | {addr.country}</p>
              </div>
              <div className="addr-controls">
                <button className="control-btn" onClick={() => handleEdit(addr)}>
                  <Edit2 size={14} />
                </button>
                <button className="control-btn delete" onClick={() => handleDelete(addr.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}