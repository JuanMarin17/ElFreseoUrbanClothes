import { useState, useEffect } from 'react';

const STORAGE_KEY = 'vexio_ui_prefs';

export const UI_DEFAULTS = {
  theme:      'dark',    // 'dark' | 'light' | 'system'
  fontSize:   'medium',  // 'small' | 'medium' | 'large'
  animations: true,
  density:    'normal',  // 'compact' | 'normal' | 'comfortable'
};

function resolveTheme(pref) {
  if (pref !== 'system') return pref;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyUIPrefs(prefs) {
  const root = document.documentElement;
  root.setAttribute('data-theme',   resolveTheme(prefs.theme));
  root.setAttribute('data-fs',      prefs.fontSize);
  root.setAttribute('data-anim',    prefs.animations ? '1' : '0');
  root.setAttribute('data-density', prefs.density);
}

export function initUIPrefs() {
  try {
    const raw  = localStorage.getItem(STORAGE_KEY);
    const prefs = raw ? { ...UI_DEFAULTS, ...JSON.parse(raw) } : UI_DEFAULTS;
    applyUIPrefs(prefs);
  } catch {
    applyUIPrefs(UI_DEFAULTS);
  }
}

export function useUIPrefs() {
  const [prefs, setPrefsState] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...UI_DEFAULTS, ...JSON.parse(raw) } : { ...UI_DEFAULTS };
    } catch {
      return { ...UI_DEFAULTS };
    }
  });

  useEffect(() => {
    applyUIPrefs(prefs);
  }, [prefs]);

  // Re-apply on system theme change when pref === 'system'
  useEffect(() => {
    if (prefs.theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyUIPrefs(prefs);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [prefs]);

  const setPrefs = (patch) => {
    setPrefsState(prev => {
      const next = typeof patch === 'function' ? patch(prev) : { ...prev, ...patch };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  return { prefs, setPrefs };
}
