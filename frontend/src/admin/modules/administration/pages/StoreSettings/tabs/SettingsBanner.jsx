import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import './TabShared.css';

const FONTS = ['Inter', 'Montserrat', 'Roboto', 'Bebas Neue', 'Poppins', 'Raleway', 'Open Sans', 'Lato'];

const DEFAULT = { title: '', font: 'Bebas Neue', size: '72', color: '#ffffff', bg: '#000000', image: '' };

function ColorField({ label, value, onChange }) {
  return (
    <div className="tab-field">
      <label>{label}</label>
      <div className="tab-color-row">
        <div className="tab-color-swatch" style={{ background: value }}>
          <input type="color" value={value} onChange={e => onChange(e.target.value)} />
        </div>
        <input className="tab-color-value" value={value} onChange={e => onChange(e.target.value)} maxLength={9} />
      </div>
    </div>
  );
}

export default function SettingsBanner({ settings, onSave }) {
  const [banner, setBanner] = useState(DEFAULT);
  const [saving, setSaving] = useState(false);
  const [msg,    setMsg]    = useState(null);

  useEffect(() => {
    if (settings?.components?.banner) {
      setBanner(b => ({ ...b, ...settings.components.banner }));
    }
  }, [settings]);

  const set = (k, v) => setBanner(b => ({ ...b, [k]: v }));

  const showMsg = (text, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3500);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        components: { ...(settings?.components ?? {}), banner },
      });
      showMsg('Banner guardado.');
    } catch (err) {
      showMsg(err.message ?? 'Error al guardar.', false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="tab-root">
      <div className="tab-card">
        <p className="tab-card-title">Texto y tipografía</p>

        <div className="tab-field">
          <label>Texto del banner</label>
          <input
            className="tab-input"
            placeholder="Ej: NUEVA COLECCIÓN VERANO 2026"
            value={banner.title}
            onChange={e => set('title', e.target.value)}
          />
        </div>

        <div className="tab-grid-2">
          <div className="tab-field">
            <label>Fuente</label>
            <select className="tab-select" value={banner.font} onChange={e => set('font', e.target.value)}>
              {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="tab-field">
            <label>Tamaño (px)</label>
            <input
              type="number" min="16" max="200"
              className="tab-input"
              value={banner.size}
              onChange={e => set('size', e.target.value)}
            />
          </div>
        </div>

        <div className="tab-grid-2">
          <ColorField label="Color del texto" value={banner.color} onChange={v => set('color', v)} />
          <ColorField label="Color de fondo"  value={banner.bg}    onChange={v => set('bg', v)} />
        </div>
      </div>

      <div className="tab-card">
        <p className="tab-card-title">Imagen de fondo</p>
        <div className="tab-field">
          <label>URL de la imagen</label>
          <input
            className="tab-input"
            placeholder="https://..."
            value={banner.image}
            onChange={e => set('image', e.target.value)}
          />
          <p className="tab-field-hint">Subí la imagen a Cloudinary/Imgur y pegá el link. Tamaño recomendado: 1440×480 px.</p>
        </div>
      </div>

      {/* Preview */}
      <div className="tab-card">
        <p className="tab-card-title">Preview</p>
        <div
          className="banner-preview"
          style={{
            background: banner.image
              ? `url(${banner.image}) center/cover no-repeat, ${banner.bg}`
              : banner.bg,
          }}
        >
          <p
            style={{
              fontFamily: banner.font,
              fontSize:   Math.min(Number(banner.size), 60) + 'px',
              color:      banner.color,
              margin:     0,
              lineHeight: 1.1,
              textAlign:  'center',
              wordBreak:  'break-word',
            }}
          >
            {banner.title || 'TEXTO DEL BANNER'}
          </p>
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
          <span>{saving ? 'Guardando…' : 'Guardar banner'}</span>
        </button>
      </div>
    </div>
  );
}
