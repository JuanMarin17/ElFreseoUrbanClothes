import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import './TabShared.css';

const LAYOUTS = [
  { id: 'clasico',  title: 'CLÁSICO',  desc: 'Grid tradicional con sidebar de filtros' },
  { id: 'moderno',  title: 'MODERNO',  desc: 'Cards grandes, estética minimalista' },
  { id: 'bold',     title: 'BOLD',     desc: 'Hero de pantalla completa y tipografía grande' },
  { id: 'minimal',  title: 'MINIMAL',  desc: 'Máximo espacio blanco, sin ruido visual' },
];

const STYLE_COLORS = [
  { key: 'cardBg',          label: 'Fondo de card'      },
  { key: 'cardBorderColor1',label: 'Borde card (1)'     },
  { key: 'cardBorderColor2',label: 'Borde card (2)'     },
  { key: 'colorBoton',      label: 'Color de botones'   },
  { key: 'colorParrafo',    label: 'Color de párrafos'  },
  { key: 'colorTitulo',     label: 'Color de títulos'   },
];

const DEFAULTS = {
  cardBg: '#111111', cardBorderColor1: '#333333', cardBorderColor2: '#555555',
  cardBorderWidth: '1', cardRadius: '12',
  colorBoton: '#ffffff', colorParrafo: '#cccccc', colorTitulo: '#ffffff',
};

function ColorField({ label, value, onChange }) {
  return (
    <div className="tab-field">
      <label>{label}</label>
      <div className="tab-color-row">
        <div className="tab-color-swatch" style={{ background: value }}>
          <input type="color" value={value} onChange={e => onChange(e.target.value)} />
        </div>
        <input
          className="tab-color-value"
          value={value}
          onChange={e => onChange(e.target.value)}
          maxLength={9}
        />
      </div>
    </div>
  );
}

export default function SettingsAppearance({ settings, onSave }) {
  const [layoutId, setLayoutId] = useState('clasico');
  const [styles,   setStyles]   = useState(DEFAULTS);
  const [headerBg, setHeaderBg] = useState('#000000');
  const [headerColor, setHeaderColor] = useState('#ffffff');
  const [footerBg,  setFooterBg]  = useState('#080808');
  const [footerColor, setFooterColor] = useState('#888888');
  const [saving,   setSaving]   = useState(false);
  const [msg,      setMsg]      = useState(null);

  useEffect(() => {
    if (!settings) return;
    if (settings.layout?.id)      setLayoutId(settings.layout.id);
    if (settings.styles)          setStyles(s => ({ ...s, ...settings.styles }));
    if (settings.components?.header) {
      setHeaderBg(settings.components.header.bg ?? '#000000');
      setHeaderColor(settings.components.header.color ?? '#ffffff');
    }
    if (settings.components?.footer) {
      setFooterBg(settings.components.footer.bg ?? '#080808');
      setFooterColor(settings.components.footer.color ?? '#888888');
    }
  }, [settings]);

  const setStyle = (key, val) => setStyles(s => ({ ...s, [key]: val }));

  const showMsg = (text, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3500);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        layout:     { id: layoutId, title: LAYOUTS.find(l => l.id === layoutId)?.title ?? layoutId },
        styles,
        components: {
          ...(settings?.components ?? {}),
          header: { ...(settings?.components?.header ?? {}), bg: headerBg, color: headerColor },
          footer: { ...(settings?.components?.footer ?? {}), bg: footerBg, color: footerColor },
        },
      });
      showMsg('Apariencia guardada.');
    } catch (err) {
      showMsg(err.message ?? 'Error al guardar.', false);
    } finally {
      setSaving(false);
    }
  };

  // Preview card
  const previewStyle = {
    background:  styles.cardBg,
    border:      `${styles.cardBorderWidth}px solid ${styles.cardBorderColor1}`,
    borderRadius:`${styles.cardRadius}px`,
    padding:     '14px',
    maxWidth:    '180px',
  };

  return (
    <div className="tab-root">
      {/* Layout */}
      <div className="tab-card">
        <p className="tab-card-title">Layout de la tienda</p>
        <div className="layout-grid">
          {LAYOUTS.map(l => (
            <button
              key={l.id}
              className={`layout-opt ${layoutId === l.id ? 'layout-opt--active' : ''}`}
              onClick={() => setLayoutId(l.id)}
            >
              <div className="layout-opt-preview">
                <div className="lp-bar" />
                <div className="lp-cols">
                  <div className="lp-side" />
                  <div className="lp-grid">
                    {[0,1,2,3].map(i => <div key={i} className="lp-card" />)}
                  </div>
                </div>
              </div>
              <p className="layout-opt-title">{l.title}</p>
              <p className="layout-opt-desc">{l.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Colores de cards */}
      <div className="tab-card">
        <p className="tab-card-title">Estilos de cards</p>
        <div className="tab-grid-3">
          {STYLE_COLORS.map(({ key, label }) => (
            <ColorField key={key} label={label} value={styles[key] ?? '#000000'} onChange={v => setStyle(key, v)} />
          ))}
        </div>

        <div className="tab-grid-2">
          <div className="tab-field">
            <label>Grosor de borde (px)</label>
            <input
              type="number" min="0" max="20"
              className="tab-input"
              value={styles.cardBorderWidth}
              onChange={e => setStyle('cardBorderWidth', e.target.value)}
            />
          </div>
          <div className="tab-field">
            <label>Radio de bordes (px)</label>
            <input
              type="number" min="0" max="99"
              className="tab-input"
              value={styles.cardRadius}
              onChange={e => setStyle('cardRadius', e.target.value)}
            />
          </div>
        </div>

        {/* Preview */}
        <div className="appearance-preview">
          <p className="appearance-preview-label">Preview</p>
          <div style={previewStyle}>
            <div style={{ height: 80, background: 'rgba(255,255,255,0.07)', borderRadius: 6, marginBottom: 8 }} />
            <p style={{ fontSize: 13, fontWeight: 700, color: styles.colorTitulo, margin: '0 0 4px' }}>
              Producto ejemplo
            </p>
            <p style={{ fontSize: 11, color: styles.colorParrafo, margin: '0 0 10px' }}>
              Descripción breve
            </p>
            <div style={{
              display: 'inline-block', background: styles.colorBoton,
              borderRadius: 6, padding: '6px 14px', fontSize: 11, fontWeight: 700,
              color: '#000',
            }}>
              Comprar
            </div>
          </div>
        </div>
      </div>

      {/* Header / Footer colors */}
      <div className="tab-card">
        <p className="tab-card-title">Header y Footer</p>
        <div className="tab-grid-2">
          <ColorField label="Fondo del header"   value={headerBg}    onChange={setHeaderBg} />
          <ColorField label="Texto del header"   value={headerColor} onChange={setHeaderColor} />
          <ColorField label="Fondo del footer"   value={footerBg}    onChange={setFooterBg} />
          <ColorField label="Texto del footer"   value={footerColor} onChange={setFooterColor} />
        </div>

        <div className="hf-preview">
          <div className="hf-header" style={{ background: headerBg, color: headerColor }}>
            ■ Header de tienda
          </div>
          <div className="hf-body">contenido</div>
          <div className="hf-footer" style={{ background: footerBg, color: footerColor }}>
            © Footer
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
          <span>{saving ? 'Guardando…' : 'Guardar apariencia'}</span>
        </button>
      </div>
    </div>
  );
}
