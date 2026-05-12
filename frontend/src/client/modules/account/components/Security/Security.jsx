import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, Loader2, Monitor, Smartphone, ShieldAlert, ShieldCheck, Power } from 'lucide-react';
import accountService from '../../services/accountService';
import './Security.css';

export default function Security() {
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [show, setShow]           = useState({ current: false, newPass: false, confirm: false });
  const [sessions, setSessions]   = useState([]);
  const [twoFA, setTwoFA]         = useState(false);
  const [loading, setLoading]     = useState(false);
  const [msg, setMsg]             = useState('');

  useEffect(() => {
    accountService.getSessions()
      .then(({ data }) => setSessions(data))
      .catch(() => {});
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
            <div className="sessions-list">
              {sessions.length === 0 ? (
                <p className="empty-log">No hay registros de sesiones externas.</p>
              ) : (
                sessions.map(ses => (
                  <div className="session-item" key={ses.id}>
                    <div className="session-icon">
                      {ses.device?.includes('Mobile') ? <Smartphone size={16} /> : <Monitor size={16} />}
                    </div>
                    <div className="session-info">
                      <p className="session-device">{ses.device.toUpperCase()}</p>
                      <p className="session-meta">{ses.location || 'UBICACIÓN_OCULTA'} • {ses.lastActive}</p>
                    </div>
                    <button className="close-session-btn" onClick={() => handleCloseSession(ses.id)}>
                      <Power size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}