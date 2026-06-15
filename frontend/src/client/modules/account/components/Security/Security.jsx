import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, Loader2, Monitor, Smartphone, Globe, Power } from 'lucide-react';
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

function formatTs(unix) {
  if (!unix) return '—';
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(unix * 1000));
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

export default function Security() {
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [show, setShow]           = useState({ current: false, newPass: false, confirm: false });
  const [sessions, setSessions]   = useState([]);
  const [twoFA, setTwoFA]         = useState(false);
  const [loading, setLoading]     = useState(false);
  const [msg, setMsg]             = useState('');

  useEffect(() => {
    const current = buildCurrentSession();
    accountService.getSessions()
      .then(({ data }) => {
        const remote = Array.isArray(data) ? data : [];
        setSessions([current, ...remote]);
      })
      .catch(() => setSessions([current]));
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

  const handleCloseSession = async (id) => {
    try {
      await accountService.closeSession(id);
      setSessions(s => s.filter(ses => ses.id !== id));
    } catch (e) {
      console.error("No se pudo cerrar la sesión");
    }
  };

  return (
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
            <h3 className="card-subtitle">SESIONES_ACTIVAS</h3>
            <p className="sessions-note">
            Solo se muestra la sesión del dispositivo actual. Para ver todas las sesiones activas se requiere soporte del servidor.
          </p>
          <div className="sessions-list">
              {sessions.map(ses => (
                <div className={`session-item ${ses.isCurrent ? 'session-item--current' : ''}`} key={ses.id}>
                  <div className="session-icon">
                    {ses.device === 'Mobile' ? <Smartphone size={16} /> : ses.device === 'Desktop' ? <Monitor size={16} /> : <Globe size={16} />}
                  </div>
                  <div className="session-info">
                    <div className="session-device-row">
                      <p className="session-device">
                        {ses.browser ?? ses.device ?? 'Dispositivo'} · {ses.os ?? ''}
                      </p>
                      {ses.isCurrent && <span className="session-current-badge">sesión actual</span>}
                    </div>
                    <p className="session-meta">
                      <span>{ses.location ?? '—'}</span>
                      {ses.startedAt && <> · Inicio: {ses.startedAt}</>}
                    </p>
                    {ses.expiresAt && (
                      <p className="session-meta">Expira: {ses.expiresAt}</p>
                    )}
                  </div>
                  {!ses.isCurrent && (
                    <button className="close-session-btn" onClick={() => handleCloseSession(ses.id)} title="Cerrar sesión">
                      <Power size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}