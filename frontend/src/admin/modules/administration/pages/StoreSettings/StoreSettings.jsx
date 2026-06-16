import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Settings, Palette, Image, Navigation, FileText, BookOpen } from 'lucide-react';
import { getSettings, saveSettings } from '../../services/storeSettingsService';
import { getCms, patchCms } from '../../../../../multi-tenant/pages/services/cmsService';
import './StoreSettings.css';

const SettingsBasic      = lazy(() => import('./tabs/SettingsBasic'));
const SettingsAppearance = lazy(() => import('./tabs/SettingsAppearance'));
const SettingsBanner     = lazy(() => import('./tabs/SettingsBanner'));
const SettingsNavigation = lazy(() => import('./tabs/SettingsNavigation'));
const SettingsLegal      = lazy(() => import('./tabs/SettingsLegal'));
const SettingsCMS        = lazy(() => import('./tabs/SettingsCMS'));

const TABS = [
  { key: 'basic',      label: 'General',    Icon: Settings    },
  { key: 'appearance', label: 'Apariencia', Icon: Palette     },
  { key: 'banner',     label: 'Banner',     Icon: Image       },
  { key: 'navigation', label: 'Navegación', Icon: Navigation  },
  { key: 'legal',      label: 'Legal',      Icon: FileText    },
  { key: 'cms',        label: 'Contenido',  Icon: BookOpen    },
];

export default function StoreSettings() {
  const [activeTab,    setActiveTab]    = useState('basic');
  const [settings,     setSettings]     = useState(null);
  const [cms,          setCms]          = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  const storeId = localStorage.getItem('storeId');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    Promise.all([
      getSettings().catch(() => null),
      storeId ? getCms(storeId).catch(() => null) : Promise.resolve(null),
    ]).then(([s, c]) => {
      if (!alive) return;
      setSettings(s);
      setCms(c);
      setLoading(false);
    }).catch(err => {
      if (!alive) return;
      setError(err.message ?? 'Error al cargar la configuración.');
      setLoading(false);
    });

    return () => { alive = false; };
  }, [storeId]);

  const handleSettingsSave = async (patch) => {
    const current     = settings ?? {};
    const completedStep = current.completedStep ?? 0;
    const merged      = deepMerge(current, patch);
    const payload     = { ...merged, completedStep };
    const updated     = await saveSettings(payload);
    setSettings(updated ?? merged);
  };

  const handleCmsSave = async (patch) => {
    if (!storeId) throw new Error('No hay tienda seleccionada.');
    const updated = await patchCms(storeId, patch);
    setCms(prev => ({ ...(prev ?? {}), ...(updated ?? patch) }));
  };

  if (loading) {
    return (
      <div className="ss-page">
        <div className="ss-loading">
          <span className="ss-loading-spin" />
          Cargando configuración…
        </div>
      </div>
    );
  }

  return (
    <div className="ss-page">
      <div className="ss-header">
        <h1 className="ss-title">Configuración de tienda</h1>
        <p className="ss-subtitle">Personalizá cómo se ve y cómo funciona tu tienda.</p>
      </div>

      {error && <div className="ss-error">{error}</div>}

      <nav className="ss-tabs">
        {TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            className={`ss-tab ${activeTab === key ? 'ss-tab--active' : ''}`}
            onClick={() => setActiveTab(key)}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </nav>

      <Suspense fallback={<div className="ss-loading"><span className="ss-loading-spin" /></div>}>
        {activeTab === 'basic'      && <SettingsBasic      settings={settings} onSave={handleSettingsSave} />}
        {activeTab === 'appearance' && <SettingsAppearance settings={settings} onSave={handleSettingsSave} />}
        {activeTab === 'banner'     && <SettingsBanner     settings={settings} onSave={handleSettingsSave} />}
        {activeTab === 'navigation' && <SettingsNavigation settings={settings} onSave={handleSettingsSave} />}
        {activeTab === 'legal'      && <SettingsLegal      settings={settings} onSave={handleSettingsSave} />}
        {activeTab === 'cms'        && <SettingsCMS        cms={cms}           onSave={handleCmsSave} />}
      </Suspense>
    </div>
  );
}

function deepMerge(target, source) {
  const out = { ...target };
  for (const key of Object.keys(source)) {
    const sv = source[key];
    if (sv && typeof sv === 'object' && !Array.isArray(sv) && typeof out[key] === 'object' && !Array.isArray(out[key])) {
      out[key] = deepMerge(out[key], sv);
    } else {
      out[key] = sv;
    }
  }
  return out;
}
