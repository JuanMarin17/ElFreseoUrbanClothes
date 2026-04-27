import React, { useState } from 'react';
import './Login.css';
import { User, Mail, Lock, Eye, EyeOff, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import logo from '../../../../../assets/logo.png';
import { User, Mail, Lock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hook/Useauth';

// ── Componentes Internos (Mantienen tu lógica original) ─────────────────

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
  password: (v, minLen = 6) => {
    if (!v) return 'La contraseña es obligatoria.';
    if (v.length < minLen) return `Mínimo ${minLen} caracteres.`;
    return null;
  },
};

function validate(fields, isRegister) {
  const errors = {};
  if (isRegister) {
    const n = RULES.nombre(fields.nombre ?? '');
    if (n) errors.nombre = n;
  }
  const c = RULES.correo(fields.correo ?? '');
  if (c) errors.correo = c;
  const p = RULES.password(fields.password ?? '', isRegister ? 8 : 6);
  if (p) errors.password = p;
  return errors;
}

function useField(initial = '') {
  const [value, setValue] = useState(initial);
  const [touched, setTouched] = useState(false);
  const [show, setShow] = useState(false);
  return { 
    value, touched, show, 
    onChange: (e) => setValue(e.target.value), 
    onBlur: () => setTouched(true), 
    toggleShow: () => setShow(s => !s), 
    reset: () => { setValue(''); setTouched(false); } 
  };
}

function Field({ icon, type = 'text', placeholder, fieldProps, showToggle, error, touched }) {
  const showError = touched && error;
  return (
    <div className={`field ${showError ? 'field--error' : ''}`}>
      <span className="field-icon">{icon}</span>
      <input
        type={showToggle ? (fieldProps.show ? 'text' : 'password') : type}
        placeholder={placeholder}
        value={fieldProps.value}
        onChange={fieldProps.onChange}
        onBlur={fieldProps.onBlur}
      />
      {showToggle && (
        <button type="button" className="field-eye" onClick={fieldProps.toggleShow}>
          {fieldProps.show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      )}
      {showError && <span className="field-hint">{error}</span>}
    </div>
  );
}

// ── Vistas de Formularios ─────────────────────────────────────────────

function RegisterForm({ onSwitch, onSuccess }) {
  const { register, loginWithGoogle, loading, error: authError, clearError } = useAuth();
  const nombre = useField();
  const correo = useField();
  const password = useField();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    const errors = validate({ nombre: nombre.value, correo: correo.value, password: password.value }, true);
    if (Object.keys(errors).length > 0) return;
    clearError();
    const result = await register({ nombre: nombre.value, correo: correo.value, password: password.value });
    if (result.success) onSuccess('register', result.user);
  };

  return (
    <div className="form-content">
      <h2 className="auth-title">Crear Cuenta</h2>
      <p className="auth-subtitle">Únete a la experiencia de El Freseo</p>
      
      <button className="btn-google" onClick={loginWithGoogle} disabled={loading}>
        <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
        Registrarse con Google
      </button>

      <div className="auth-divider"><span></span><p>o con email</p><span></span></div>

      <form onSubmit={handleSubmit}>
        <Field icon={<User size={16}/>} placeholder="Nombre" fieldProps={nombre} touched={submitted || nombre.touched} error={validate({nombre: nombre.value}, true).nombre} />
        <Field icon={<Mail size={16}/>} placeholder="Correo" fieldProps={correo} touched={submitted || correo.touched} error={validate({correo: correo.value}, true).correo} />
        <Field icon={<Lock size={16}/>} placeholder="Contraseña" fieldProps={password} showToggle touched={submitted || password.touched} error={validate({password: password.value}, true).password} />
        <button type="submit" className="btn-submit" disabled={loading}>{loading ? 'Procesando...' : 'Registrarse'}</button>
      </form>
      <p className="switch">¿Ya tienes cuenta? <button onClick={onSwitch}>Inicia sesión</button></p>
    </div>
  );
}

function LoginForm({ onSwitch, onSuccess }) {
  const { login, loginWithGoogle, loading, error: authError, clearError } = useAuth();
  const correo = useField();
  const password = useField();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    const errors = validate({ correo: correo.value, password: password.value }, false);
    if (Object.keys(errors).length > 0) return;
    clearError();
    const result = await login({ correo: correo.value, password: password.value });
    if (result.success) onSuccess('login', result.user);
  };

  return (
    <div className="form-content">
      <h2 className="auth-title">Bienvenido</h2>
      <p className="auth-subtitle">Ingresa tus credenciales para continuar</p>
      
      <button className="btn-google" onClick={loginWithGoogle} disabled={loading}>
        <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
        Entrar con Google
      </button>

      <div className="auth-divider"><span></span><p>o con tu cuenta</p><span></span></div>

      <form onSubmit={handleSubmit}>
        <Field icon={<Mail size={16}/>} placeholder="Email" fieldProps={correo} touched={submitted || correo.touched} error={validate({correo: correo.value}, false).correo} />
        <Field icon={<Lock size={16}/>} placeholder="Contraseña" fieldProps={password} showToggle touched={submitted || password.touched} error={validate({password: password.value}, false).password} />
        <button type="submit" className="btn-submit" disabled={loading}>{loading ? 'Cargando...' : 'Ingresar'}</button>
      </form>
      <p className="switch">¿No tienes cuenta? <button onClick={onSwitch}>Regístrate</button></p>
    </div>
  );
}

// ── Componente Principal ──────────────────────────────────────────────

export default function Login() {
  const navigate = useNavigate();
  const [panel, setPanel] = useState('login');
  const [animState, setAnimState] = useState(null);
  const [alert, setAlert] = useState({ show: false, title: '', text: '', type: 'success' });

  const switchPanel = () => {
    setAnimState('switching');
    setTimeout(() => {
      setPanel(p => p === 'login' ? 'register' : 'login');
      setAnimState('switching-in');
      setTimeout(() => setAnimState(null), 300);
    }, 200);
  };

  const handleSuccess = (mode, user) => {
    const firstName = user?.nombre?.split(' ')[0] ?? 'Usuario';
    setAlert({
      show: true,
      type: 'success',
      title: '¡Éxito!',
      text: `Bienvenido a El Freseo, ${firstName}.`,
    });
    // Redirección lógica basada en el usuario si fuera necesario
    setTimeout(() => {
        if (user.correo === 'admin@freseo.com') navigate('/admin');
        else navigate('/');
    }, 2000);
  };

  return (
    <div className="auth-body">
      <div className="auth-main-container">
        
        {/* Lado Izquierdo: Branding */}
        <div className="auth-visual-side">
          <div className="visual-content">
             <div className="logo-glow">🍧</div>
             <h1 className="brand-text">EL FRESEO</h1>
             <p className="brand-slogan">THE BEST CREMOLETAS IN TOWN</p>
          </div>
          <div className="visual-overlay"></div>
        </div>

        {/* Lado Derecho: Formulario */}
        <div className={`auth-form-side ${animState ?? ''}`}>
          {panel === 'login' 
            ? <LoginForm onSwitch={switchPanel} onSuccess={handleSuccess} /> 
            : <RegisterForm onSwitch={switchPanel} onSuccess={handleSuccess} />
          }
        </div>

      </div>

      {/* Alerta Modal */}
      <div className={`alert-overlay ${alert.show ? 'active' : ''}`} onClick={() => setAlert({...alert, show: false})}>
        <div className="alert-box" onClick={e => e.stopPropagation()}>
          <div className={`alert-icon ${alert.type}`}>
            {alert.type === 'success' ? <CheckCircle size={30} /> : <XCircle size={30} />}
          </div>
          <h3>{alert.title}</h3>
          <p>{alert.text}</p>
          <button onClick={() => setAlert({...alert, show: false})}>Continuar</button>
        </div>
      </div>
    </div>
  );
}