import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, Loader2, Monitor, Smartphone, Globe, Power, LogOut, MapPin, Clock, Activity, Timer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import accountService from '../../services/accountService';
import './Security.css';

/* ── Helpers para derivar la sesión actual ───────────────────────────────── */
function parseJwt(token) {
  try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
}

function detectDevice(ua) {
  if (/Mobi|Android|iPhone|iPad/i.test(ua)) return 'Mobile';
  return 'Desktop';
}

function detectBrowser(ua) {
  if (/Edg\//i.test(ua))     return 'Edge';
  if (/OPR\//i.test(ua))     return 'Opera';
  if (/Chrome\//i.test(ua))  return 'Chrome';
  if (/Firefox\//i.test(ua)) return 'Firefox';
  if (/Safari\//i.test(ua))  return 'Safari';
  return 'Navegador desconocido';
}

function detectOS(ua) {
  if (/Windows NT/i.test(ua))   return 'Windows';
  if (/Mac OS X/i.test(ua))     return 'macOS';
  if (/Android/i.test(ua))      return 'Android';
  if (/iPhone|iPad/i.test(ua))  return 'iOS';
  if (/Linux/i.test(ua))        return 'Linux';
  return 'SO desconocido';
}

function formatTs(value) {
  if (!value) return '—';
  try {
    const d = typeof value === 'number' ? new Date(value * 1000) : new Date(value);
    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(d);
  } catch { return '—'; }
}

/* Tiempo relativo para "última actividad" — más fácil de escanear que la fecha completa */
function formatRelative(value) {
  if (!value) return null;
  try {
    const d = typeof value === 'number' ? new Date(value * 1000) : new Date(value);
    const diffMs = Date.now() - d.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Hace un momento';
    if (mins < 60) return `Hace ${mins} min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `Hace ${hrs} h`;
    const days = Math.floor(hrs / 24);
    return `Hace ${days} día${days !== 1 ? 's' : ''}`;
  } catch { return null; }
}

function buildCurrentSession() {
  const token = localStorage.getItem('jwt');
  const payload = token ? parseJwt(token) : null;
  const ua = navigator.userAgent;
  return {
    id:         'current',
    device:     detectDevice(ua),
    browser:    detectBrowser(ua),
    os:         detectOS(ua),
    isCurrent:  true,
    startedAt:  payload?.iat  ? formatTs(payload.iat)  : '—',
    expiresAt:  payload?.exp  ? formatTs(payload.exp)  : '—',
    location:   Intl?.DateTimeFormat()?.resolvedOptions()?.timeZone ?? '—',
  };
}

/* Normaliza la respuesta del backend al formato que usa el componente */
function normalizeSession(raw) {
  return {
    id:         raw.id,
    device:     raw.device  ?? 'Desktop',
    browser:    raw.browser ?? 'Navegador desconocido',
    os:         raw.os      ?? 'SO desconocido',
    isCurrent:  raw.current ?? false,
    startedAt:  formatTs(raw.createdAt),
    lastSeenAt: formatTs(raw.lastSeenAt),
    lastSeenRelative: formatRelative(raw.lastSeenAt),
    expiresAt:  formatTs(raw.expiresAt),
    location:   raw.ipAddress ?? '—',
    active:     raw.active ?? true,
  };
}

export default function Security() {
  const navigate = useNavigate();
  const [passwords, setPasswords]             = useState({ current: '', newPass: '', confirm: '' });
  const [show, setShow]                       = useState({ current: false, newPass: false, confirm: false });
  const [sessions, setSessions]               = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [closingId, setClosingId]             = useState(null);
  const [sessionMsg, setSessionMsg]           = useState('');
  const [closingAll, setClosingAll]           = useState(false);
  const [twoFA, setTwoFA]                     = useState(false);
  const [loading, setLoading]                 = useState(false);
  const [msg, setMsg]                         = useState('');
  const [confirmOpen, setConfirmOpen]         = useState(false);
  const [confirmSessionId, setConfirmSessionId] = useState(null);

  useEffect(() => {
    const current = buildCurrentSession();
    setSessionsLoading(true);
    accountService.getSessions()
      .then(({ data }) => {
        const remote = Array.isArray(data) ? data : [];
        if (remote.length === 0) { setSessions([current]); return; }
        const normalized = remote.map(normalizeSession);
        // Sesión actual primero, luego el resto
        setSessions([
          ...normalized.filter(s => s.isCurrent),
          ...normalized.filter(s => !s.isCurrent),
        ]);
      })
      .catch(() => setSessions([current]))
      .finally(() => setSessionsLoading(false));
  }, []);

  const toggleShow = (field) => setShow(s => ({ ...s, [field]: !s[field] }));

  const handleChangePassword = async () => {
    if (passwords.newPass !== passwords.confirm) {
      setMsg('MISMATCH_ERROR: Las contraseñas no coinciden'); return;
    }
    setLoading(true);
    try {
      await accountService.changePassword({
        currentPassword: passwords.current,
        newPassword: passwords.newPass,
      });
      setMsg('STATUS_OK: Credenciales actualizadas');
      setPasswords({ current: '', newPass: '', confirm: '' });
    } catch {
      setMsg('FATAL_ERROR: Fallo en la sincronización');
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(''), 4000);
    }
  };

  const showSessionMsg = (text, isErr = false) => {
    setSessionMsg({ text, isErr });
    setTimeout(() => setSessionMsg(''), 4000);
  };

  const handleCloseSession = async (id) => {
    setClosingId(id);
    try {
      await accountService.closeSession(id);
      setSessions(s => s.filter(ses => ses.id !== id));
      showSessionMsg('Sesión cerrada correctamente.');
    } catch {
      showSessionMsg('No se pudo cerrar la sesión. Intenta de nuevo.', true);
    } finally {
      setClosingId(null);
    }
  };

  return (
    <>
    <div className="security-section">
      <div className="sec-header-main">
        <span className="info-tag">PROTOCOLO_PROTECCION</span>
        <h2 className="section-title">SEGURIDAD</h2>
      </div>

      <div className="sec-grid">
        {/* Cambiar contraseña */}
        <div className="sec-card shadow-card">
          <h3 className="card-subtitle">GESTIÓN DE CREDENCIALES</h3>
          <div className="sec-form">
            {[
              { key: 'current', label: 'PASSWORD_ACTUAL' },
              { key: 'newPass', label: 'NUEVO_PASSWORD' },
              { key: 'confirm', label: 'CONFIRMAR_PASSWORD' },
            ].map(({ key, label }) => (
              <div className="field-box" key={key}>
                <label className="field-label">{label}</label>
                <div className="sec-input-wrapper">
                  <input
                    type={show[key] ? 'text' : 'password'}
                    value={passwords[key]}
                    onChange={e => setPasswords(p => ({ ...p, [key]: e.target.value }))}
                    placeholder="••••••••"
                    className="tech-input"
                  />
                  <button className="eye-btn" onClick={() => toggleShow(key)}>
                    {show[key] ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {msg && (
            <div className={`status-msg ${msg.includes('ERROR') ? 'err' : 'ok'}`}>
              {msg}
            </div>
          )}

          <button className="sec-action-btn" onClick={handleChangePassword} disabled={loading}>
            {loading ? <Loader2 size={16} className="spin" /> : <><Lock size={14} /> <span>ACTUALIZAR LLAVES</span></>}
          </button>
        </div>

        {/* 2FA y Sesiones */}
        <div className="sec-column-right">
          <div className="sec-card compact">
            <div className="two-fa-header">
              <div className="two-fa-info">
                <h3 className="card-subtitle">AUTENTICACIÓN 2FA</h3>
                <span className={`status-tag ${twoFA ? 'active' : 'inactive'}`}>
                  {twoFA ? 'SHIELD_ENABLED' : 'SHIELD_DISABLED'}
                </span>
              </div>
              <button 
                className={`toggle-2fa-btn ${twoFA ? 'active' : ''}`}
                onClick={() => {
                  accountService.toggle2FA(!twoFA);
                  setTwoFA(f => !f);
                }}
              >
                {twoFA ? 'DESACTIVAR' : 'CONFIGURAR'}
              </button>
            </div>
          </div>

          <div className="sec-card sessions-card">
            <div className="sessions-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h3 className="card-subtitle" style={{ margin: 0 }}>SESIONES_ACTIVAS</h3>
                <span className="sessions-count">{sessions.length} activa{sessions.length !== 1 ? 's' : ''}</span>
              </div>
              {sessions.filter(s => !s.isCurrent).length > 0 && (
                <button
                  className="close-all-btn"
                  disabled={closingAll}
                  onClick={() => setConfirmOpen(true)}
                >
                  {closingAll ? <Loader2 size={12} className="spin" /> : <LogOut size={12} />}
                  Cerrar todas
                </button>
              )}
            </div>

            {sessionMsg && (
              <div className={`session-feedback ${sessionMsg.isErr ? 'session-feedback--err' : 'session-feedback--ok'}`}>
                {sessionMsg.text}
              </div>
            )}

            {sessionsLoading ? (
              <div className="sessions-loading">
                <Loader2 size={20} className="spin" />
                <span>Cargando sesiones…</span>
              </div>
            ) : (
              <div className="sessions-list">
                {sessions.map(ses => (
                  <div className={`session-item ${ses.isCurrent ? 'session-item--current' : ''}`} key={ses.id}>
                    <div className="session-icon">
                      {ses.device === 'Mobile' ? <Smartphone size={16} /> : ses.device === 'Desktop' ? <Monitor size={16} /> : <Globe size={16} />}
                      {ses.isCurrent && <span className="session-icon-dot" />}
                    </div>
                    <div className="session-info">
                      <div className="session-device-row">
                        <p className="session-device">
                          {ses.browser ?? ses.device ?? 'Dispositivo'} · {ses.os ?? ''}
                        </p>
                        {ses.isCurrent && <span className="session-current-badge">SESIÓN ACTUAL</span>}
                      </div>
                      <div className="session-meta-list">
                        <span className="session-meta-row">
                          <MapPin size={11} /> {ses.location ?? '—'}
                        </span>
                        {ses.startedAt && ses.startedAt !== '—' && (
                          <span className="session-meta-row">
                            <Clock size={11} /> Inicio: {ses.startedAt}
                          </span>
                        )}
                        {ses.lastSeenAt && ses.lastSeenAt !== '—' && (
                          <span className="session-meta-row" title={ses.lastSeenAt}>
                            <Activity size={11} /> Última actividad: {ses.lastSeenRelative ?? ses.lastSeenAt}
                          </span>
                        )}
                        {ses.expiresAt && ses.expiresAt !== '—' && (
                          <span className="session-meta-row">
                            <Timer size={11} /> Expira: {ses.expiresAt}
                          </span>
                        )}
                      </div>
                    </div>
                    {!ses.isCurrent && (
                      <button
                        className="close-session-btn"
                        onClick={() => setConfirmSessionId(ses.id)}
                        disabled={closingId === ses.id}
                        title="Cerrar sesión"
                      >
                        {closingId === ses.id
                          ? <Loader2 size={12} className="spin" />
                          : <Power size={12} />}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Modal de confirmación para cerrar una sesión */}
    {confirmSessionId && (
      <div className="confirm-overlay" onClick={() => setConfirmSessionId(null)}>
        <div className="confirm-modal" onClick={e => e.stopPropagation()}>
          <div className="confirm-icon"><Power size={22} /></div>
          <h3 className="confirm-title">Cerrar esta sesión</h3>
          <p className="confirm-body">
            El dispositivo asociado a esta sesión perderá el acceso de inmediato.
          </p>
          <div className="confirm-actions">
            <button className="confirm-cancel" onClick={() => setConfirmSessionId(null)}>
              Cancelar
            </button>
            <button
              className="confirm-danger"
              disabled={closingId === confirmSessionId}
              onClick={async () => {
                const id = confirmSessionId;
                setConfirmSessionId(null);
                await handleCloseSession(id);
              }}
            >
              {closingId === confirmSessionId
                ? <Loader2 size={14} className="spin" />
                : 'Sí, cerrar sesión'}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Modal de confirmación para cerrar todas las sesiones */}
    {confirmOpen && (
      <div className="confirm-overlay" onClick={() => setConfirmOpen(false)}>
        <div className="confirm-modal" onClick={e => e.stopPropagation()}>
          <div className="confirm-icon"><LogOut size={22} /></div>
          <h3 className="confirm-title">Cerrar todas las sesiones</h3>
          <p className="confirm-body">
            Se cerrarán todas las sesiones activas, incluida la actual.
            Tendrás que iniciar sesión de nuevo.
          </p>
          <div className="confirm-actions">
            <button className="confirm-cancel" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </button>
            <button
              className="confirm-danger"
              disabled={closingAll}
              onClick={async () => {
                setConfirmOpen(false);
                setClosingAll(true);
                try {
                  await accountService.closeAllSessions();
                  localStorage.removeItem('jwt');
                  localStorage.removeItem('userRole');
                  navigate('/login');
                } catch {
                  setClosingAll(false);
                }
              }}
            >
              {closingAll ? <Loader2 size={14} className="spin" /> : 'Sí, cerrar todo'}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}