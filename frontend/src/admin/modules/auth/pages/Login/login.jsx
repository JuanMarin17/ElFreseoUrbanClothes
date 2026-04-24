/**
 * Login.jsx
 * ─────────────────────────────────────────────────────────────
 * Pantalla de autenticación con datos quemados.
 * Cuando el backend esté listo → solo authService.js necesita
 * cambiar. Este componente no requiere modificaciones.
 *
 * Datos de prueba (mock):
 *   correo:   carlos@freseo.com
 *   password: 123456
 * ─────────────────────────────────────────────────────────────
 */

import React, { useState, useRef } from 'react';
import './Login.css';
import logo from '../../../../../../assets/logo.png';
import { User, Mail, Lock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hook/Useauth';

// ── Paneles ───────────────────────────────────────────────────

function RegisterForm({ onSwitch, onSuccess }) {
  const { register, loading, error, clearError } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const fd = new FormData(e.target);
    const result = await register({
      nombre: fd.get('regNombre'),
      correo: fd.get('regCorreo'),
      password: fd.get('regPassword'),
    });
    if (result.success) onSuccess('register', result.user);
  };

  return (
    <>
      <h1 className="auth-title">Únete a El Freseo</h1>
      <p className="auth-subtitle">La cremoletta llegó a la web ✦</p>

      {error && (
        <div className="auth-error-banner" role="alert">
          <AlertCircle size={15} style={{ flexShrink: 0 }} />
          {error.message}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="auth-fields">
          <div className="field">
            <span className="field-icon"><User size={15} /></span>
            <input
              type="text"
              name="regNombre"
              placeholder="Nombre completo"
              autoComplete="name"
              required
              onChange={clearError}
            />
          </div>
          <div className="field">
            <span className="field-icon"><Mail size={15} /></span>
            <input
              type="email"
              name="regCorreo"
              placeholder="Correo electrónico"
              autoComplete="email"
              required
              onChange={clearError}
            />
          </div>
          <div className="field">
            <span className="field-icon"><Lock size={15} /></span>
            <input
              type="password"
              name="regPassword"
              placeholder="Contraseña"
              autoComplete="new-password"
              minLength={6}
              required
              onChange={clearError}
            />
          </div>
        </div>

        <button
          type="submit"
          className={`btn-submit ${loading ? 'loading' : ''}`}
          disabled={loading}
        >
          {loading ? <><span className="spinner" />Creando cuenta…</> : 'Registrarse'}
        </button>
      </form>

      <p className="switch">
        ¿Ya tienes cuenta?{' '}
        <button type="button" onClick={onSwitch}>Inicia sesión</button>
      </p>
      <p className="help-link"><Link to="/ayuda">¿Necesitas ayuda?</Link></p>
    </>
  );
}

function LoginForm({ onSwitch, onSuccess }) {
  const { login, loading, error, clearError } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const fd = new FormData(e.target);
    const result = await login({
      correo: fd.get('logCorreo'),
      password: fd.get('logPassword'),
    });
    if (result.success) onSuccess('login', result.user);
  };

  return (
    <>
      <h1 className="auth-title">Iniciar Sesión</h1>
      <p className="auth-subtitle">Bienvenido de nuevo </p>

      {error && (
        <div className="auth-error-banner" role="alert">
          <AlertCircle size={15} style={{ flexShrink: 0 }} />
          {error.message}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="auth-fields">
          <div className="field">
            <span className="field-icon"><Mail size={15} /></span>
            <input
              type="email"
              name="logCorreo"
              placeholder="Correo electrónico"
              autoComplete="email"
              required
              onChange={clearError}
            />
          </div>
          <div className="field">
            <span className="field-icon"><Lock size={15} /></span>
            <input
              type="password"
              name="logPassword"
              placeholder="Contraseña"
              autoComplete="current-password"
              required
              onChange={clearError}
            />
          </div>
        </div>

        <button
          type="submit"
          className={`btn-submit ${loading ? 'loading' : ''}`}
          disabled={loading}
        >
          {loading ? <><span className="spinner" />Verificando…</> : 'Ingresar'}
        </button>
      </form>

      <p className="switch">
        ¿No tienes cuenta?{' '}
        <button type="button" onClick={onSwitch}>Regístrate</button>
      </p>
      <p className="help-link"><Link to="/ayuda">¿Necesitas ayuda?</Link></p>
    </>
  );
}

// ── Componente principal ──────────────────────────────────────

export default function Login() {
  const navigate = useNavigate();

  // Panel activo: 'login' | 'register'
  const [panel, setPanel] = useState('login');
  const [animState, setAnimState] = useState(null); // null | 'out' | 'in'
  const [alert, setAlert] = useState({ show: false, title: '', text: '', type: 'success' });
  const cardRef = useRef(null);

  // ── Transición suave entre paneles ───────────────────────
  const switchPanel = () => {
    setAnimState('switching');
    setTimeout(() => {
      setPanel(p => p === 'login' ? 'register' : 'login');
      setAnimState('switching-in');
      setTimeout(() => setAnimState(null), 350);
    }, 220);
  };

  // ── Callback de éxito ────────────────────────────────────
  const handleSuccess = (mode, user) => {
    const firstName = user?.nombre?.split(' ')[0] ?? 'usuario';
    setAlert({
      show: true,
      type: 'success',
      title: mode === 'login' ? 'Ingreso exitoso' : 'Cuenta creada',
      text: mode === 'login'
        ? `¡Qué bueno verte de nuevo, ${firstName}!`
        : `¡Bienvenido a El Freseo, ${firstName}!`,
    });
    // Redirige después de cerrar la alerta (ver closeAlert)
  };

  const closeAlert = () => {
    setAlert(a => ({ ...a, show: false }));
    // Después de cerrar → navega al inicio (o a donde corresponda)
    if (alert.type === 'success') {
      setTimeout(() => navigate('/'), 200);
    }
  };

  const iconMap = {
    success: <CheckCircle size={26} />,
    error: <XCircle size={26} />,
  };

  // ── Render ───────────────────────────────────────────────
  return (
    <div className="auth-body">
      <div className="auth-wrapper">

        {/* Logo + nombre de marca */}
        <div className="auth-header">
          <img src={logo} className="auth-logo" alt="Logo El Freseo" />
          <span className="auth-brand">El Freseo</span>
        </div>

        {/* Tarjeta con animación fade+slide */}
        <div
          ref={cardRef}
          className={`auth-card ${animState ?? ''}`}
        >
          {panel === 'login'
            ? <LoginForm onSwitch={switchPanel} onSuccess={handleSuccess} />
            : <RegisterForm onSwitch={switchPanel} onSuccess={handleSuccess} />
          }
        </div>

      </div>

      {/* Modal de resultado */}
      <div
        className={`alert-overlay ${alert.show ? 'active' : ''}`}
        onClick={closeAlert}
        role="dialog"
        aria-modal="true"
      >
        <div className="alert-box" onClick={e => e.stopPropagation()}>
          <div className={`alert-icon-wrap ${alert.type}`}>
            {iconMap[alert.type]}
          </div>
          <h3>{alert.title}</h3>
          <p>{alert.text}</p>
          <button onClick={closeAlert}>Aceptar</button>
        </div>
      </div>
    </div>
  );
}