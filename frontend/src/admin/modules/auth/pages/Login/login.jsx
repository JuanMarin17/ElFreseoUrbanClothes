/**
 * Login.jsx
 * ─────────────────────────────────────────────────────────────
 * IMPORTAR EN TU ROUTER (App.jsx):
 *
 *   import Login from './components/auth/Login/Login';
 *   import { ProtectedRoute } from './components/auth/hook/ProtectedRoute';
 *   import AdminDashboard from './pages/AdminDashboard'; // ← tu panel admin
 *   import Home from './pages/Home';                     // ← tu página cliente
 *
 *   <Routes>
 *     <Route path="/login" element={<Login />} />
 *
 *     <Route element={<ProtectedRoute allowedRoles={['user','admin']} />}>
 *       <Route path="/" element={<Home />} />            // ← clientes
 *     </Route>
 *
 *     <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
 *       <Route path="/admin" element={<AdminDashboard />} /> // ← admin
 *     </Route>
 *   </Routes>
 *
 * ─── CREDENCIALES DE PRUEBA ──────────────────────────────────
 *  ADMIN   → admin@freseo.com   / admin123
 *  CLIENTE → carlos@freseo.com  / 123456
 *  GOOGLE  → picker mock (Juan Dev, María Freseo)
 * ─────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  User, Mail, Lock, Eye, EyeOff,
  CheckCircle, XCircle, Loader2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hook/Useauth'; // ← ajusta si cambia la ruta
import './login.css';

/* ─── Validación ─────────────────────────────────────────────── */
const RULES = {
  nombre: (v) => {
    if (!v.trim()) return 'El nombre es obligatorio.';
    if (v.trim().length < 2) return 'Mínimo 2 caracteres.';
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s'-]+$/.test(v.trim())) return 'Solo letras.';
    return null;
  },
  correo: (v) => {
    if (!v.trim()) return 'El correo es obligatorio.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return 'Correo inválido.';
    return null;
  },
  password: (v, min = 6) => {
    if (!v) return 'La contraseña es obligatoria.';
    if (v.length < min) return `Mínimo ${min} caracteres.`;
    return null;
  },
};

function validate(fields, isRegister) {
  const e = {};
  if (isRegister) { const n = RULES.nombre(fields.nombre ?? ''); if (n) e.nombre = n; }
  const c = RULES.correo(fields.correo ?? ''); if (c) e.correo = c;
  const p = RULES.password(fields.password ?? '', isRegister ? 8 : 6); if (p) e.password = p;
  return e;
}

/* ─── useField ───────────────────────────────────────────────── */
function useField(initial = '') {
  const [value, setValue] = useState(initial);
  const [touched, setTouched] = useState(false);
  const [show, setShow] = useState(false);
  return {
    value, touched, show,
    onChange: e => setValue(e.target.value),
    onBlur:   () => setTouched(true),
    onToggle: () => setShow(s => !s),
    reset:    () => { setValue(''); setTouched(false); },
  };
}

/* ─── Google SVG Icon ────────────────────────────────────────── */
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

/* ─── Field ──────────────────────────────────────────────────── */
function Field({ icon, type = 'text', placeholder, value, onChange, onBlur,
  showToggle, show, onToggle, error, touched }) {
  const [focused, setFocused] = useState(false);
  const hasError = touched && error;
  return (
    <div className={`lf-field${hasError ? ' lf-field--error' : ''}${focused ? ' lf-field--focused' : ''}`}>
      <span className="lf-field-icon">{icon}</span>
      <input
        className="lf-field-input"
        type={showToggle ? (show ? 'text' : 'password') : type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={() => { onBlur(); setFocused(false); }}
        onFocus={() => setFocused(true)}
        autoComplete={type === 'password' ? 'current-password' : 'off'}
      />
      {showToggle && (
        <button type="button" className="lf-eye-btn" onClick={onToggle} aria-label="Mostrar/ocultar">
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      )}
      {hasError && <p className="lf-hint">{error}</p>}
    </div>
  );
}

/* ─── Google Account Picker ──────────────────────────────────── */
const MOCK_GOOGLE_ACCOUNTS = [
  { id: 'g-001', nombre: 'Juan Dev',     correo: 'juandev@gmail.com', role: 'user', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=juandev', provider: 'google' },
  { id: 'g-002', nombre: 'María Freseo', correo: 'maria@gmail.com',   role: 'user', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=maria',   provider: 'google' },
];

function GooglePicker({ onSelect, onCancel }) {
  return createPortal(
    <div className="gp-overlay" onClick={onCancel} role="dialog" aria-modal="true">
      <div className="gp-card" onClick={e => e.stopPropagation()}>
        <div className="gp-header">
          <GoogleIcon />
          <span>Elige una cuenta de Google</span>
        </div>

        {MOCK_GOOGLE_ACCOUNTS.map(acc => (
          <button key={acc.id} className="gp-account" onClick={() => onSelect(acc)} type="button">
            <img
              src={acc.avatar} alt="" width={38} height={38}
              className="gp-avatar"
              onError={e => { e.target.style.display = 'none'; }}
            />
            <div className="gp-account-info">
              <span className="gp-account-name">{acc.nombre}</span>
              <span className="gp-account-email">{acc.correo}</span>
            </div>
          </button>
        ))}

        <button className="gp-cancel" onClick={onCancel} type="button">Cancelar</button>
      </div>
    </div>,
    document.body
  );
}

/* ─── Alert Modal ────────────────────────────────────────────── */
function AlertModal({ show, type, title, text, onClose }) {
  if (!show) return null;
  return createPortal(
    <div className="am-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className={`am-card am-card--${type}`} onClick={e => e.stopPropagation()}>
        <div className={`am-icon am-icon--${type}`}>
          {type === 'success' ? <CheckCircle size={44} /> : <XCircle size={44} />}
        </div>
        <h3 className="am-title">{title}</h3>
        <p className="am-text">{text}</p>
        <button className={`am-btn am-btn--${type}`} onClick={onClose} type="button">
          Continuar
        </button>
      </div>
    </div>,
    document.body
  );
}

/* ─── Error Banner ───────────────────────────────────────────── */
function ErrorBanner({ msg }) {
  if (!msg) return null;
  return <div className="lf-error-banner">{msg}</div>;
}

/* ─── LoginForm ──────────────────────────────────────────────── */
function LoginForm({ onSwitch, onSuccess }) {
  const { login, loginWithGoogle, loading } = useAuth();
  const correo   = useField();
  const password = useField();
  const [submitted, setSubmitted] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [authError, setAuthError] = useState('');

  const errors = validate({ correo: correo.value, password: password.value }, false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length > 0) return;
    setAuthError('');
    const result = await login({ correo: correo.value, password: password.value });
    if (result.success) onSuccess('login', result.user);
    else setAuthError('Correo o contraseña incorrectos.');
  };

  /* FIX: loginWithGoogle devuelve el resultado; si hay éxito llamamos onSuccess */
  const handleGoogleSelect = async () => {
    setShowPicker(false);
    const result = await loginWithGoogle();
    if (result && result.success) onSuccess('login', result.user);
    else setAuthError('Inicio de sesión con Google cancelado o fallido.');
  };

  return (
    <>
      {showPicker && <GooglePicker onSelect={handleGoogleSelect} onCancel={() => setShowPicker(false)} />}

      <div className="lf-badge">🧊 EL FRESEO</div>
      <h2 className="lf-title">Bienvenido de vuelta</h2>
      <p className="lf-subtitle">Ingresa tus credenciales para continuar</p>

      <ErrorBanner msg={authError} />

      <button className="lf-google-btn" onClick={() => setShowPicker(true)} disabled={loading} type="button">
        <GoogleIcon /> Continuar con Google
      </button>

      <div className="lf-divider">
        <span className="lf-divider-line" />
        <span className="lf-divider-text">o con tu cuenta</span>
        <span className="lf-divider-line" />
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <Field icon={<Mail size={16} />} placeholder="Correo electrónico"
          value={correo.value} onChange={correo.onChange} onBlur={correo.onBlur}
          touched={submitted || correo.touched} error={errors.correo} />
        <Field icon={<Lock size={16} />} placeholder="Contraseña"
          value={password.value} onChange={password.onChange} onBlur={password.onBlur}
          showToggle show={password.show} onToggle={password.onToggle}
          touched={submitted || password.touched} error={errors.password} />
        <button type="submit" className={`lf-submit-btn${loading ? ' lf-submit-btn--loading' : ''}`} disabled={loading}>
          {loading
            ? <><Loader2 size={16} className="lf-spin" /> Procesando…</>
            : 'Ingresar'}
        </button>
      </form>

      <p className="lf-switch">
        ¿No tienes cuenta?{' '}
        <button className="lf-switch-btn" onClick={onSwitch} type="button">Regístrate</button>
      </p>
    </>
  );
}

/* ─── RegisterForm ───────────────────────────────────────────── */
function RegisterForm({ onSwitch, onSuccess }) {
  const { register, loginWithGoogle, loading } = useAuth();
  const nombre   = useField();
  const correo   = useField();
  const password = useField();
  const [submitted, setSubmitted] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [authError, setAuthError] = useState('');

  const errors = validate({ nombre: nombre.value, correo: correo.value, password: password.value }, true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length > 0) return;
    setAuthError('');
    const result = await register({ nombre: nombre.value, correo: correo.value, password: password.value });
    if (result.success) onSuccess('register', result.user);
    else setAuthError('Este correo ya está registrado.');
  };

  const handleGoogleSelect = async () => {
    setShowPicker(false);
    const result = await loginWithGoogle();
    if (result && result.success) onSuccess('register', result.user);
    else setAuthError('Registro con Google cancelado o fallido.');
  };

  return (
    <>
      {showPicker && <GooglePicker onSelect={handleGoogleSelect} onCancel={() => setShowPicker(false)} />}

      <div className="lf-badge">🧊 EL FRESEO</div>
      <h2 className="lf-title">Crear cuenta</h2>
      <p className="lf-subtitle">Únete a la experiencia de El Freseo</p>

      <ErrorBanner msg={authError} />

      <button className="lf-google-btn" onClick={() => setShowPicker(true)} disabled={loading} type="button">
        <GoogleIcon /> Registrarse con Google
      </button>

      <div className="lf-divider">
        <span className="lf-divider-line" />
        <span className="lf-divider-text">o con email</span>
        <span className="lf-divider-line" />
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <Field icon={<User size={16} />} placeholder="Nombre completo"
          value={nombre.value} onChange={nombre.onChange} onBlur={nombre.onBlur}
          touched={submitted || nombre.touched} error={errors.nombre} />
        <Field icon={<Mail size={16} />} placeholder="Correo electrónico"
          value={correo.value} onChange={correo.onChange} onBlur={correo.onBlur}
          touched={submitted || correo.touched} error={errors.correo} />
        <Field icon={<Lock size={16} />} placeholder="Contraseña (mín. 8 caracteres)"
          value={password.value} onChange={password.onChange} onBlur={password.onBlur}
          showToggle show={password.show} onToggle={password.onToggle}
          touched={submitted || password.touched} error={errors.password} />
        <button type="submit" className={`lf-submit-btn${loading ? ' lf-submit-btn--loading' : ''}`} disabled={loading}>
          {loading
            ? <><Loader2 size={16} className="lf-spin" /> Procesando…</>
            : 'Crear cuenta'}
        </button>
      </form>

      <p className="lf-switch">
        ¿Ya tienes cuenta?{' '}
        <button className="lf-switch-btn" onClick={onSwitch} type="button">Inicia sesión</button>
      </p>
    </>
  );
}

/* ─── Login (componente raíz) ────────────────────────────────── */
export default function Login() {
  const navigate = useNavigate();
  const [panel, setPanel] = useState('login');
  const [animating, setAnimating] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: 'success', title: '', text: '' });

  const switchPanel = () => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setPanel(p => p === 'login' ? 'register' : 'login');
      setAnimating(false);
    }, 220);
  };

  /* FIX PRINCIPAL: redirección por role, no por correo */
  const handleSuccess = (mode, user) => {
    const firstName = user?.nombre?.split(' ')[0] ?? 'Usuario';
    setAlert({ show: true, type: 'success', title: '¡Acceso concedido!', text: `Bienvenido, ${firstName}.` });
    setTimeout(() => {
      // ── REDIRECCIÓN POR ROL ─────────────────────────────────
      // Admin   → /admin  (importa AdminDashboard en App.jsx)
      // Cliente → /       (importa Home en App.jsx)
      if (user?.role === 'admin') navigate('/admin');
      else navigate('/');
    }, 1800);
  };

  return (
    <div className="lf-body">
      {/* Fondos decorativos */}
      <div className="lf-bg-glow lf-bg-glow--tl" />
      <div className="lf-bg-glow lf-bg-glow--br" />

      <div className={`lf-card${animating ? ' lf-card--exit' : ' lf-card--enter'}`}>
        <div className="lf-card-glow" />
        {panel === 'login'
          ? <LoginForm    onSwitch={switchPanel} onSuccess={handleSuccess} />
          : <RegisterForm onSwitch={switchPanel} onSuccess={handleSuccess} />
        }
      </div>

      <AlertModal
        show={alert.show}
        type={alert.type}
        title={alert.title}
        text={alert.text}
        onClose={() => setAlert(a => ({ ...a, show: false }))}
      />
    </div>
  );
}