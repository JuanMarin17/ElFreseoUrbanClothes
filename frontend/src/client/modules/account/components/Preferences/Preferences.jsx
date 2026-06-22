import React, { useState, useEffect } from 'react';
import { Bell, Tag, Calendar, BookOpen, Save, CheckCircle, Sparkles, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import accountService from '../../services/accountService';
import { REOPEN_KEY } from '../../../MainPage/components/ModalTastes/ModalTastes.jsx';
import './Preferences.css';

const STORAGE_KEY = "vexio_tastes_completed";

const TASTE_LABELS = {
  categorias: "Categorías",
  estilos:    "Estilos",
  colores:    "Colores",
  presupuesto:"Presupuesto",
  frecuencia: "Frecuencia",
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

const PREFS_CONFIG = [
  { key: 'newCollections', label: 'NUEVAS COLECCIONES',    icon: <Bell size={16} />,     desc: 'Alertas de lanzamientos y drops exclusivos.' },
  { key: 'offers',         label: 'OFERTAS Y DESCUENTOS',  icon: <Tag size={16} />,      desc: 'Notificaciones de promociones temporales.' },
  { key: 'events',         label: 'EVENTOS DE VEXIO',     icon: <Calendar size={16} />, desc: 'Invitaciones a activaciones y pop-up stores.' },
  { key: 'blog',           label: 'CONTENIDO URBANO',      icon: <BookOpen size={16} />, desc: 'Tendencias, estilo y cultura callejera.' },
];

export default function Preferences() {
  const navigate            = useNavigate();
  const [prefs, setPrefs]   = useState({});
  const [saved, setSaved]   = useState(false);

  const handleUpdateTastes = () => {
    // Marcar que el usuario quiere reabrir el cuestionario y navegar al catálogo
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(REOPEN_KEY, "true");
    navigate("/catalogo");
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

      {/* Sección de gustos de compra */}
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
                <div className="switch-rail">
                  <div className="switch-thumb" />
                </div>
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