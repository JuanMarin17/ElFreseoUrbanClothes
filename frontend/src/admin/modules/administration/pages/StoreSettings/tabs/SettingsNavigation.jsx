import React, { useState, useEffect } from 'react';
import { Save, Plus, X, GripVertical } from 'lucide-react';
import './TabShared.css';

const FONTS = ['Inter', 'Montserrat', 'Roboto', 'Bebas Neue', 'Poppins', 'Raleway', 'Open Sans'];

const DEFAULT_HEADER = { logo: '', items: ['HOME', 'SHOP', 'CONTACTO'], font: 'Inter', size: 16, color: '#ffffff', bg: '#000000' };
const DEFAULT_FOOTER = { text: '© 2026 Mi Tienda', font: 'Montserrat', size: '14', color: '#888888', bg: '#080808' };

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

export default function SettingsNavigation({ settings, onSave }) {
  const [header,  setHeader]  = useState(DEFAULT_HEADER);
  const [footer,  setFooter]  = useState(DEFAULT_FOOTER);
  const [newItem, setNewItem] = useState('');
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState(null);

  useEffect(() => {
    if (!settings) return;
    if (settings.components?.header)
      setHeader(h => ({ ...DEFAULT_HEADER, ...settings.components.header }));
    if (settings.components?.footer)
      setFooter(f => ({ ...DEFAULT_FOOTER, ...settings.components.footer }));
  }, [settings]);

  const setH = (k, v) => setHeader(h => ({ ...h, [k]: v }));
  const setF = (k, v) => setFooter(f => ({ ...f, [k]: v }));

  const addItem = () => {
    const item = newItem.trim().toUpperCase();
    if (!item || header.items.includes(item)) return;
    setH('items', [...header.items, item]);
    setNewItem('');
  };

  const removeItem = (i) => setH('items', header.items.filter((_, idx) => idx !== i));

  const showMsg = (text, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3500);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        components: { ...(settings?.components ?? {}), header, footer },
      });
      showMsg('Navegación guardada.');
    } catch (err) {
      showMsg(err.message ?? 'Error al guardar.', false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="tab-root">
      {/* Header */}
      <div className="tab-card">
        <p className="tab-card-title">Header</p>

        <div className="tab-field">
          <label>Logo / Nombre en el header</label>
          <input
            className="tab-input"
            placeholder="Ej: MiTienda o URL de imagen"
            value={header.logo}
            onChange={e => setH('logo', e.target.value)}
          />
        </div>

        <div className="tab-field">
          <label>Ítems del menú</label>
          <div className="nav-items-list">
            {header.items.map((item, i) => (
              <div key={i} className="nav-item-row">
                <GripVertical size={14} className="nav-item-drag" />
                <span className="nav-item-label">{item}</span>
                <button className="nav-item-remove" onClick={() => removeItem(i)}>
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
          <div className="nav-item-add">
            <input
              className="tab-input"
              placeholder="Nuevo ítem (Ej: NOVEDADES)"
              value={newItem}
              onChange={e => setNewItem(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addItem()}
            />
            <button className="nav-add-btn" onClick={addItem}>
              <Plus size={14} />
            </button>
          </div>
        </div>

        <div className="tab-grid-2">
          <div className="tab-field">
            <label>Fuente</label>
            <select className="tab-select" value={header.font} onChange={e => setH('font', e.target.value)}>
              {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="tab-field">
            <label>Tamaño texto (px)</label>
            <input type="number" min="10" max="24" className="tab-input" value={header.size} onChange={e => setH('size', Number(e.target.value))} />
          </div>
        </div>

        <div className="tab-grid-2">
          <ColorField label="Color del texto" value={header.color} onChange={v => setH('color', v)} />
          <ColorField label="Color de fondo"  value={header.bg}    onChange={v => setH('bg', v)} />
        </div>

        {/* Header preview */}
        <div className="nav-header-preview" style={{ background: header.bg }}>
          <span style={{ color: header.color, fontFamily: header.font, fontSize: `${header.size}px`, fontWeight: 700 }}>
            {header.logo || 'LOGO'}
          </span>
          <nav>
            {header.items.map((item, i) => (
              <span key={i} style={{ color: header.color, fontFamily: header.font, fontSize: `${header.size}px` }}>
                {item}
              </span>
            ))}
          </nav>
        </div>
      </div>

      {/* Footer */}
      <div className="tab-card">
        <p className="tab-card-title">Footer</p>

        <div className="tab-field">
          <label>Texto del footer</label>
          <input
            className="tab-input"
            placeholder="Ej: © 2026 Mi Tienda. Todos los derechos reservados."
            value={footer.text}
            onChange={e => setF('text', e.target.value)}
          />
        </div>

        <div className="tab-grid-2">
          <div className="tab-field">
            <label>Fuente</label>
            <select className="tab-select" value={footer.font} onChange={e => setF('font', e.target.value)}>
              {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="tab-field">
            <label>Tamaño texto (px)</label>
            <input type="number" min="10" max="20" className="tab-input" value={footer.size} onChange={e => setF('size', e.target.value)} />
          </div>
        </div>

        <div className="tab-grid-2">
          <ColorField label="Color del texto" value={footer.color} onChange={v => setF('color', v)} />
          <ColorField label="Color de fondo"  value={footer.bg}    onChange={v => setF('bg', v)} />
        </div>

        <div className="nav-footer-preview" style={{ background: footer.bg }}>
          <span style={{ color: footer.color, fontFamily: footer.font, fontSize: `${footer.size}px` }}>
            {footer.text || '© Footer'}
          </span>
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
          <span>{saving ? 'Guardando…' : 'Guardar navegación'}</span>
        </button>
      </div>
    </div>
  );
}
