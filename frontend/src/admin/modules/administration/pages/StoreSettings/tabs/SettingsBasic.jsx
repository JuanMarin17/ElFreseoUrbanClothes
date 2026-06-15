import React, { useState, useEffect, useRef } from 'react';
import { Upload, Image, Save, Loader2 } from 'lucide-react';
import { uploadLogo } from '../../../services/storeSettingsService';
import './TabShared.css';

export default function SettingsBasic({ settings, onSave }) {
  const [name,        setName]        = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl,     setLogoUrl]     = useState('');
  const [uploading,   setUploading]   = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [msg,         setMsg]         = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    if (!settings) return;
    setName(settings.basic?.name ?? '');
    setDescription(settings.basic?.description ?? '');
    setLogoUrl(settings.logoUrl ?? '');
  }, [settings]);

  const showMsg = (text, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3500);
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadLogo(file);
      const url    = result?.logoUrl ?? result?.url ?? result;
      if (url && typeof url === 'string') {
        setLogoUrl(url);
        showMsg('Logo subido. Guardá para aplicar los cambios.');
      }
    } catch (err) {
      showMsg(err.message ?? 'Error al subir el logo.', false);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        basic:   { name, description },
        logoUrl,
      });
      showMsg('Cambios guardados.');
    } catch (err) {
      showMsg(err.message ?? 'Error al guardar.', false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="tab-root">
      <div className="tab-card">
        <p className="tab-card-title">Información de la tienda</p>

        <div className="tab-field">
          <label>Nombre de la tienda</label>
          <input
            className="tab-input"
            placeholder="Ej: Mi Tienda Urbana"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        <div className="tab-field">
          <label>Descripción</label>
          <textarea
            className="tab-textarea"
            placeholder="Contá de qué trata tu tienda..."
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>
      </div>

      <div className="tab-card">
        <p className="tab-card-title">Logo de la tienda</p>

        <div className="basic-logo-wrap">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="basic-logo-preview" />
          ) : (
            <div className="basic-logo-placeholder">
              <Image size={32} />
            </div>
          )}

          <div className="basic-logo-actions">
            <p className="tab-field-hint">
              Formato: PNG, JPG o SVG. Tamaño recomendado: 200 × 60 px
            </p>
            <button
              className="basic-upload-btn"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              {uploading
                ? <><span className="tab-spinner" /> Subiendo...</>
                : <><Upload size={14} /> Subir logo</>
              }
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleLogoChange}
            />
          </div>
        </div>
      </div>

      <div className="tab-save-bar">
        {msg && (
          <span className={`tab-save-msg ${msg.ok ? 'tab-save-msg--ok' : 'tab-save-msg--err'}`}>
            {msg.text}
          </span>
        )}
        <button className="tab-save-btn" onClick={handleSave} disabled={saving}>
          {saving ? <span className="tab-spinner" /> : <Save size={14} />}
          <span>{saving ? 'Guardando…' : 'Guardar cambios'}</span>
        </button>
      </div>
    </div>
  );
}
