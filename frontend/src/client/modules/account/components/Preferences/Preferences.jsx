import React, { useState, useEffect } from 'react';
import {
  Bell, Tag, Calendar, BookOpen, Save, CheckCircle, Sparkles, RefreshCw,
  Moon, Sun, Monitor, Type, Zap, Layers,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import accountService from '../../services/accountService';
import { REOPEN_KEY } from '../../../MainPage/components/ModalTastes/ModalTastes.jsx';
import { useUIPrefs } from '../../../../hooks/useUIPrefs.js';
import './Preferences.css';

const STORAGE_KEY = "vexio_tastes_completed";

const TASTE_LABELS = {
  categorias:  "Categorías",
  estilos:     "Estilos",
  colores:     "Colores",
  presupuesto: "Presupuesto",
  frecuencia:  "Frecuencia",
};

function TastesSection({ onUpdate }) {
  const saved = (() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw || raw === "skipped") return null;
      return JSON.parse(raw);
    } catch { return null; }
  })();

  return (
    <div className="prefs-card prefs-tastes-card">
      <div className="prefs-card-header">
        <h3 className="card-subtitle" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={15} /> GUSTOS DE COMPRA
        </h3>
        <p className="card-description">
          Tus preferencias personalizan las recomendaciones de productos en el catálogo.
        </p>
      </div>

      {saved ? (
        <div className="prefs-tastes-summary">
          {Object.entries(saved).map(([key, vals]) => (
            <div className="prefs-taste-row" key={key}>
              <span className="prefs-taste-key">{TASTE_LABELS[key] ?? key}</span>
              <span className="prefs-taste-vals">{Array.isArray(vals) ? vals.join(", ") : vals}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="prefs-tastes-empty">
          Aún no has configurado tus gustos. Responde el cuestionario para recibir recomendaciones personalizadas.
        </p>
      )}

      <button className="prefs-tastes-btn" onClick={onUpdate}>
        <RefreshCw size={14} />
        {saved ? "Actualizar mis gustos" : "Configurar mis gustos"}
      </button>
    </div>
  );
}

/* ── Apariencia ──────────────────────────────────────────────── */
const THEMES = [
  { key: 'dark',   label: 'Oscuro',  Icon: Moon    },
  { key: 'light',  label: 'Claro',   Icon: Sun     },
  { key: 'system', label: 'Sistema', Icon: Monitor },
];

const FONT_SIZES = [
  { key: 'small',  label: 'Pequeño', px: 13 },
  { key: 'medium', label: 'Normal',  px: 16 },
  { key: 'large',  label: 'Grande',  px: 20 },
];

const DENSITIES = [
  { key: 'compact',     label: 'Compacta'  },
  { key: 'normal',      label: 'Normal'    },
  { key: 'comfortable', label: 'Espaciosa' },
];

function AppearanceSection() {
  const { prefs, setPrefs } = useUIPrefs();

  return (
    <div className="prefs-card prefs-appear-card">
      <div className="prefs-card-header">
        <h3 className="card-subtitle" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Monitor size={15} /> APARIENCIA
        </h3>
        <p className="card-description">
          Personaliza el aspecto visual de la aplicación. Los cambios se aplican de inmediato.
        </p>
      </div>

      <div className="prefs-appear-body">

        {/* Tema */}
        <div className="prefs-appear-group">
          <span className="prefs-appear-label"><Moon size={12} /> Tema de color</span>
          <div className="prefs-theme-row">
            {THEMES.map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                className={`prefs-theme-card${prefs.theme === key ? ' prefs-theme-card--active' : ''}`}
                onClick={() => setPrefs({ theme: key })}
              >
                <Icon size={20} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tamaño de fuente */}
        <div className="prefs-appear-group">
          <span className="prefs-appear-label"><Type size={12} /> Tamaño de fuente</span>
          <div className="prefs-fs-row">
            {FONT_SIZES.map(({ key, label, px }) => (
              <button
                key={key}
                type="button"
                className={`prefs-fs-btn${prefs.fontSize === key ? ' prefs-fs-btn--active' : ''}`}
                onClick={() => setPrefs({ fontSize: key })}
              >
                <span className="prefs-fs-sample" style={{ fontSize: px }}>{label[0]}</span>
                <span className="prefs-fs-label">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Densidad */}
        <div className="prefs-appear-group">
          <span className="prefs-appear-label"><Layers size={12} /> Densidad de contenido</span>
          <div className="prefs-density-row">
            {DENSITIES.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                className={`prefs-density-btn${prefs.density === key ? ' prefs-density-btn--active' : ''}`}
                onClick={() => setPrefs({ density: key })}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Animaciones */}
        <div className="pref-item prefs-appear-anim-row">
          <div className="pref-icon-box" style={{ color: prefs.animations ? '#3b82f6' : undefined }}>
            <Zap size={16} />
          </div>
          <div className="pref-content">
            <p className="pref-label">ANIMACIONES</p>
            <p className="pref-desc">Transiciones y efectos visuales de la interfaz.</p>
          </div>
          <div
            className={`pref-switch ${prefs.animations ? 'switch--on' : ''}`}
            onClick={() => setPrefs({ animations: !prefs.animations })}
          >
            <div className="switch-rail"><div className="switch-thumb" /></div>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ── Canales de comunicación ────────────────────────────────── */
const PREFS_CONFIG = [
  { key: 'newCollections', label: 'NUEVAS COLECCIONES',   icon: <Bell size={16} />,     desc: 'Alertas de lanzamientos y drops exclusivos.' },
  { key: 'offers',         label: 'OFERTAS Y DESCUENTOS', icon: <Tag size={16} />,      desc: 'Notificaciones de promociones temporales.' },
  { key: 'events',         label: 'EVENTOS DE VEXIO',     icon: <Calendar size={16} />, desc: 'Invitaciones a activaciones y pop-up stores.' },
  { key: 'blog',           label: 'CONTENIDO URBANO',     icon: <BookOpen size={16} />, desc: 'Tendencias, estilo y cultura callejera.' },
];

export default function Preferences() {
  const [prefs, setPrefs] = useState({});
  const [saved, setSaved] = useState(false);

  const handleUpdateTastes = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("vexio:open-tastes"));
  };

  useEffect(() => {
    accountService.getPreferences()
      .then(({ data }) => setPrefs(data))
      .catch(() => {
        const defaults = {};
        PREFS_CONFIG.forEach(p => defaults[p.key] = false);
        setPrefs(defaults);
      });
  }, []);

  const toggle = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  const handleSave = async () => {
    try {
      await accountService.updatePreferences(prefs);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      console.error("Error al sincronizar preferencias " + error);
    }
  };

  return (
    <div className="prefs-section">
      <div className="prefs-header-main">
        <span className="info-tag">CONFIGURACION_SISTEMA</span>
        <h2 className="section-title">PREFERENCIAS</h2>
      </div>

      <AppearanceSection />

      <TastesSection onUpdate={handleUpdateTastes} />

      <div className="prefs-card">
        <div className="prefs-card-header">
          <h3 className="card-subtitle">CANALES DE COMUNICACIÓN</h3>
          <p className="card-description">Define cómo interactúa el sistema con tu terminal personal.</p>
        </div>

        <div className="prefs-list">
          {PREFS_CONFIG.map(({ key, label, icon, desc }) => (
            <div className={`pref-item ${prefs[key] ? 'active-row' : ''}`} key={key}>
              <div className="pref-icon-box">{icon}</div>
              <div className="pref-content">
                <p className="pref-label">{label}</p>
                <p className="pref-desc">{desc}</p>
              </div>
              <div
                className={`pref-switch ${prefs[key] ? 'switch--on' : ''}`}
                onClick={() => toggle(key)}
              >
                <div className="switch-rail"><div className="switch-thumb" /></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="prefs-footer">
        {saved && (
          <div className="save-status">
            <CheckCircle size={14} /> <span>DATOS SINCRONIZADOS</span>
          </div>
        )}
        <button className="save-main-btn" onClick={handleSave}>
          <Save size={16} /> <span>GUARDAR PREFERENCIAS</span>
        </button>
      </div>
    </div>
  );
}
