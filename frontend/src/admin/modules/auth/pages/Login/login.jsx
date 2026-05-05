
import React, { useState } from "react";
import "./Login.css";
import {
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import logo from "../../../../../assets/logo.png";

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hook/Useauth";

// ── Componentes Internos (Mantienen tu lógica original) ─────────────────

const RULES = {
  userName: (v) => {
    if (!v.trim()) return "El userName es obligatorio.";
    if (v.trim().length < 2) return "Mínimo 2 caracteres.";
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s'-]+$/.test(v.trim())) return "Solo letras.";
    return null;
  },
  email: (v) => {
    if (!v.trim()) return "El email es obligatorio.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return "Correo inválido.";
    return null;
  },
  password: (v, minLen = 6) => {
    if (!v) return "La contraseña es obligatoria.";
    if (v.length < minLen) return `Mínimo ${minLen} caracteres.`;
    return null;
  },
};

function validate(fields, isRegister) {
  const errors = {};
  if (isRegister) {
    const n = RULES.userName(fields.userName ?? "");
    if (n) errors.userName = n;
  }
  const c = RULES.email(fields.email ?? "");
  if (c) errors.email = c;
  const p = RULES.password(fields.password ?? "", isRegister ? 8 : 6);
  if (p) errors.password = p;
  return errors;
}

function useField(initial = "") {
  const [value, setValue] = useState(initial);
  const [touched, setTouched] = useState(false);
  const [show, setShow] = useState(false);
  return {
    value,
    touched,
    show,
    onChange: (e) => setValue(e.target.value),
    onBlur: () => setTouched(true),
    toggleShow: () => setShow((s) => !s),
    // reset: () => {
    //   setValue("");
    //   setTouched(false);
  };
}

function Field({
  icon,
  type = "text",
  placeholder,
  fieldProps,
  showToggle,
  error,
  touched,
}) {
  const showError = touched && error;
  return (
    <div className={`field ${showError ? "field--error" : ""}`}>
      <span className="field-icon">{icon}</span>
      <input
        type={showToggle ? (fieldProps.show ? "text" : "password") : type}
        placeholder={placeholder}
        value={fieldProps.value}
        onChange={fieldProps.onChange}
        onBlur={fieldProps.onBlur}
      />
      {showToggle && (
        <button
          type="button"
          className="field-eye"
          onClick={fieldProps.toggleShow}
        >
          {fieldProps.show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      )}
      {showError && <span className="field-hint">{error}</span>}
    </div>
  );
}
// ── Vistas de Formularios ─────────────────────────────────────────────

function RegisterForm({ onSwitch, onSuccess }) {
  const { register, loading, error: authError, clearError } = useAuth();
  const userName = useField();
  const email = useField();
  const password = useField();
  const phone = useField();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    const errors = validate(
      {
        userName: userName.value,
        email: email.value,
        password: password.value,
        phone: phone.value,
      },
      true,
    );
    if (Object.keys(errors).length > 0) return;
    clearError();

    const result = await register({
      userName: userName.value,
      email: email.value,
      password: password.value,
      phone: phone.value,
    });
    if (result.success) onSuccess("register", result.user);
  };

  return (
    <div className="form-content">
      <h2 className="auth-title">Crear Cuenta</h2>
      <p className="auth-subtitle">Únete a la experiencia de El Freseo</p>
      {authError && <p className="error">{authError.message}</p>}

      <form onSubmit={handleSubmit}>
        <Field
          icon={<User size={16} />}
          placeholder="Nombre"
          fieldProps={userName}
          touched={submitted || userName.touched}
          error={validate({ userName: userName.value }, true).userName}
        />

        <Field
          icon={<Mail size={16} />}
          placeholder="Correo"
          fieldProps={email}
          touched={submitted || email.touched}
          error={validate({ email: email.value }, true).email}
        />

        <Field
          icon={<Phone size={16} />}
          placeholder="Telefono"
          fieldProps={phone}
          touched={submitted || phone.touched}
          error={validate({ phone: phone.value }, true).phone}
        />

        <Field
          icon={<Lock size={16} />}
          placeholder="Contraseña"
          fieldProps={password}
          showToggle
          touched={submitted || password.touched}
          error={validate({ password: password.value }, true).password}
        />

        <button className="btn-submit" disabled={loading}>
          {loading ? "Cargando..." : "Registrarse"}
        </button>
      </form>

      <p className="switch">
        ¿Ya tienes cuenta? <button onClick={onSwitch}>Login</button>
      </p>
    </div>
  );

  <form onSubmit={handleSubmit}>
    <Field
      icon={<User size={16} />}
      placeholder="Nombre"
      fieldProps={userName}
      touched={submitted || userName.touched}
      error={validate({ userName: userName.value }, true).userName}
    />
    <Field
      icon={<Mail size={16} />}
      placeholder="Correo"
      fieldProps={email}
      touched={submitted || email.touched}
      error={validate({ email: email.value }, true).email}
    />
    <Field
      icon={<Lock size={16} />}
      placeholder="Contraseña"
      fieldProps={password}
      showToggle
      touched={submitted || password.touched}
      error={validate({ password: password.value }, true).password}
    />
    <button type="submit" className="btn-submit" disabled={loading}>
      {loading ? "Procesando..." : "Registrarse"}
    </button>
  </form>;
  //     <p className="switch">
  //       ¿Ya tienes cuenta? <button onClick={onSwitch}>Inicia sesión</button>
  //     </p>
  //   </div>
  // );
}

function LoginForm({ onSwitch, onSuccess }) {
  const {
    login,
    loginWithGoogle,
    loading,
    error: authError,
    clearError,
  } = useAuth();
  const email = useField();
  const password = useField();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    const errors = validate(
      { email: email.value, password: password.value },
      false,
    );
    if (Object.keys(errors).length > 0) return;
    clearError();
    const result = await login({
      email: email.value,
      password: password.value,
    });
    if (result.success) onSuccess("login", result.user);
  };

  return (
    <div className="form-content">
      <h2 className="auth-title">Bienvenido</h2>
      <p className="auth-subtitle">Ingresa tus credenciales para continuar</p>

      <button
        className="btn-google"
        onClick={loginWithGoogle}
        disabled={loading}
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Entrar con Google
      </button>

      <div className="auth-divider">
        <span></span>
        <p>o con tu cuenta</p>
        <span></span>
      </div>

      {authError && <p className="error">{authError.message}</p>}

      <form onSubmit={handleSubmit}>
        <Field
          icon={<Mail size={16} />}
          placeholder="Email"
          fieldProps={email}
          touched={submitted || email.touched}
          error={validate({ email: email.value }, false).email}
        />
        <Field
          icon={<Lock size={16} />}
          placeholder="Contraseña"
          fieldProps={password}
          showToggle
          touched={submitted || password.touched}
          error={validate({ password: password.value }, false).password}
        />
        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? "Cargando..." : "Ingresar"}
        </button>
      </form>
      <p className="switch">
        ¿No tienes cuenta? <button onClick={onSwitch}>Regístrate</button>
      </p>
    </div>
  );
}

import React, { useState } from 'react';
import { Mail, Lock, User, Phone, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useNavigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../hook/Useauth';
import VerificationPage from '../VerificationPage';
import PasswordForm from '../PasswordForm';
import Logo from '../../../../../assets/LogoVexios/banervexio.png';
import './login.css';

/* ─── Logo Vexio ─── */
const VexioLogo = () => (
  <div className="vp-logo-wrapper">
    <img src={Logo} alt="vexio logo" className="vp-logo" />

  </div>
);

/* ─── Hook de Campo Personalizado ─── */
function useField(initialValue = '') {
  const [value, setValue] = useState(initialValue);
  const [show, setShow] = useState(false);
  return {
    value,
    show,
    onChange: (e) => setValue(e.target.value),
    onToggle: () => setShow(s => !s),
    reset: () => setValue(''),
  };
}

/* ─── Componente de Campo de Entrada ─── */
function Field({ icon, type = 'text', placeholder, value, onChange, showToggle, show, onToggle, error }) {
  return (
    <div className="vp-field-group">
      <div className={`vp-input-wrapper ${error ? 'vp-input-error' : ''}`}>
        <span className="vp-field-icon">{icon}</span>
        <input
          className="vp-input-main"
          type={showToggle ? (show ? 'text' : 'password') : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
        {showToggle && (
          <button type="button" className="vp-eye-btn" onClick={onToggle}>
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <span className="vp-error-text">{error}</span>}
    </div>
  );
}

function LoginForm({ mode }) {
  const navigate = useNavigate();
  const { login, verifyLoginOTP, register, verifyRegisterOTP, loading } = useAuth();

  const [step, setStep] = useState('form');
  const [emailForOTP, setEmailForOTP] = useState('');
  const [serverError, setServerError] = useState('');
  const [errors, setErrors] = useState({});
  const [showRecovery, setShowRecovery] = useState(false);
  const [showPasswordRecoveryForm, setShowPasswordRecoveryForm] = useState(false);

  const userName = useField();
  const email = useField();
  const phone = useField();
  const password = useField();
  const confirmPassword = useField();

  // Lógica de validación manual
  const validate = () => {
    let tempErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.value.trim()) tempErrors.email = "El correo es requerido";
    else if (!emailRegex.test(email.value)) tempErrors.email = "Email no válido";

    if (!password.value) tempErrors.password = "La contraseña es requerida";
    else if (password.value.length < 6) tempErrors.password = "Mínimo 6 caracteres";

    if (mode === 'register') {
      if (!userName.value.trim()) tempErrors.userName = "El nombre es requerido";
      if (!phone.value.trim()) tempErrors.phone = "El teléfono es requerido";
      if (password.value !== confirmPassword.value) {
        tempErrors.confirmPassword = "Las contraseñas no coinciden";
      }
    }


    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };


export default function Login() {
  const navigate = useNavigate();
  const [panel, setPanel] = useState("login");
  const [animState, setAnimState] = useState(null);
  const [alert, setAlert] = useState({
    show: false,
    title: "",
    text: "",
    type: "success",
  });

  const switchPanel = () => {
    setAnimState("switching");
    setTimeout(() => {
      setPanel((p) => (p === "login" ? "register" : "login"));
      setAnimState("switching-in");
      setTimeout(() => setAnimState(null), 300);
    }, 200);
  };

  const handleSuccess = (mode, user) => {
    const firstName = user?.userName?.split(" ")[0] ?? "Usuario";
    setAlert({
      show: true,
      type: "success",
      title: "¡Éxito!",
      text: `Bienvenido a El Freseo, ${firstName}.`,
    });
    // Redirección lógica basada en el usuario si fuera necesario
    setTimeout(() => {
      if (user.email === "admin@freseo.com") navigate("/admin");
      else navigate("/");
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
        <div className={`auth-form-side ${animState ?? ""}`}>
          {panel === "login" ? (
            <LoginForm onSwitch={switchPanel} onSuccess={handleSuccess} />
          ) : (
            <RegisterForm onSwitch={switchPanel} onSuccess={handleSuccess} />
          )}
        </div>
      </div>

      {/* Alerta Modal */}
      <div
        className={`alert-overlay ${alert.show ? "active" : ""}`}
        onClick={() => setAlert({ ...alert, show: false })}
      >
        <div className="alert-box" onClick={(e) => e.stopPropagation()}>
          <div className={`alert-icon ${alert.type}`}>
            {alert.type === "success" ? (
              <CheckCircle size={30} />
            ) : (
              <XCircle size={30} />
            )}
          </div>
          <h3>{alert.title}</h3>
          <p>{alert.text}</p>
          <button onClick={() => setAlert({ ...alert, show: false })}>
            Continuar
          </button>
        </div>

  const handleLogin = async (e) => {
    e.preventDefault();
    setServerError('');
    setShowRecovery(false);
    setShowPasswordRecoveryForm(false);
    if (!validate()) return;

    try {
      const result = await login({ email: email.value, password: password.value });
      if (result.success) {
        setEmailForOTP(result.email);
        setStep('otp');
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.message || 'Correo o contraseña incorrectos';
      setServerError(errorMsg);
      setShowRecovery(true);
      setShowPasswordRecoveryForm(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    try {
      const result = await register({
        userName: userName.value,
        email: email.value,
        password: password.value,
        phone: phone.value,
      });
      if (result.success) {
        setEmailForOTP(result.email);
        setStep('otp');
      }
    } catch (err) {
      setServerError(err?.response?.data?.message || 'Error en el registro');
    }
  };

  if (step === 'otp') {
    return (
      <VerificationPage
        email={emailForOTP}
        loading={loading}
        onVerify={async (code) => {
          try {
            const fn = mode === 'login' ? verifyLoginOTP : verifyRegisterOTP;
            const result = await fn({ email: emailForOTP, code });
            if (result.success) navigate(result.user?.role === 'admin' ? '/admin' : '/');
          } catch (err) { setServerError('Código inválido'); }
        }}
        onBack={() => setStep('form')}
      />
    );
  }

  return (
    <div className="vp-body">
      <div className="vp-bg">
        <div className="vp-bg-orb vp-bg-orb--1"></div>
        <div className="vp-bg-orb vp-bg-orb--2"></div>
        <div className="vp-bg-orb vp-bg-orb--3"></div>
      </div>

      <div className="vp-card">
        <VexioLogo />
        <h2 className="vp-title">{mode === 'login' ? 'INICIA SESIÓN' : 'CREAR CUENTA'}</h2>

        {serverError && <div className="vp-server-error">{serverError}</div>}

        <form onSubmit={mode === 'login' ? handleLogin : handleRegister} noValidate>
          {mode === 'register' && (
            <>
              <Field
                icon={<User size={18} />}
                placeholder="Nombre Completo"
                value={userName.value}
                onChange={userName.onChange}
                error={errors.userName}
              />
              <Field
                icon={<Phone size={18} />}
                placeholder="Teléfono"
                value={phone.value}
                onChange={phone.onChange}
                error={errors.phone}
              />
            </>
          )}

          <Field
            icon={<Mail size={18} />}
            placeholder="Correo Electrónico"
            value={email.value}
            onChange={email.onChange}
            error={errors.email}
          />

          <Field
            icon={<Lock size={18} />}
            placeholder="Contraseña"
            value={password.value}
            onChange={password.onChange}
            showToggle
            show={password.show}
            onToggle={password.onToggle}
            error={errors.password}
          />

          {mode === 'register' && (
            <Field
              icon={<Lock size={18} />}
              placeholder="Confirmar Contraseña"
              value={confirmPassword.value}
              onChange={confirmPassword.onChange}
              showToggle
              show={confirmPassword.show}
              onToggle={confirmPassword.onToggle}
              error={errors.confirmPassword}
            />
          )}

          <button className="vp-submit-btn" type="submit" disabled={loading}>
            {loading ? <Loader2 className="vp-spin" size={20} /> : (mode === 'login' ? 'ENTRAR' : 'REGISTRARME')}
          </button>
        </form>

        {showRecovery && !showPasswordRecoveryForm && (
          <p className="vp-switch-auth">
            <span className="vp-link" onClick={() => setShowPasswordRecoveryForm(true)}>
              Recuperar contraseña
            </span>
          </p>
        )}

        {showPasswordRecoveryForm && <PasswordForm />}

        <p className="vp-switch-auth">
          {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
          <span className="vp-link" onClick={() => navigate(mode === 'login' ? '/login/register' : '/login')}>
            {mode === 'login' ? ' Regístrate' : ' Inicia Sesión'}
          </span>
        </p>

      </div>
    </div>
  );
}



export default function Login() {
  return (
    <Routes>
      <Route path="/" element={<LoginForm mode="login" />} />
      <Route path="register" element={<LoginForm mode="register" />} />
    </Routes>
  );
}

