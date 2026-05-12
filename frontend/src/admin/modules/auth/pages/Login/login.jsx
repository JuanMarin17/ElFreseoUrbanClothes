import React, { useState } from 'react';
import { Mail, Lock, User, Phone, Eye, EyeOff, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hook/Useauth';
import VerificationPage from '../VerificationPage';
import Logo from '../../../../../assets/LogoVexios/banervexio.png';
import './login.css';

/* ─── UUID del rol admin (de la BD) ─── */
const ADMIN_ROL_ID = '04b2b854-05b6-488c-9fe9-afeabf32ed41';

/* ─── Logo ─── */
const VexioLogo = () => (
  <div className="vp-logo-wrapper">
    <img src={Logo} alt="vexio logo" className="vp-logo" />
  </div>
);

/* ─── Toast ─── */
function Toast({ message, type, onClose }) {
  if (!message) return null;
  return (
    <div className={`vp-toast vp-toast--${type}`}>
      <span className="vp-toast-icon">
        {type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
      </span>
      <span className="vp-toast-msg">{message}</span>
      <button className="vp-toast-close" onClick={onClose}>✕</button>
    </div>
  );
}

/* ─── useField ─── */
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

/* ─── Field ─── */
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

/* ─── Componente principal ─── */
export default function Login({ mode }) {
  const navigate = useNavigate();
  const { login, verifyLoginOTP, register, verifyRegisterOTP, loading } = useAuth();

  const [step, setStep] = useState('form');
  const [emailForOTP, setEmailForOTP] = useState('');
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ message: '', type: 'error' });
  const [showRecovery, setShowRecovery] = useState(false);

  const userName = useField();
  const email = useField();
  const phone = useField();
  const password = useField();
  const confirmPassword = useField();

  /* ─── Toast helpers ─── */
  const showToast = (message, type = 'error') => {
    setToast({ message, type });
    if (type === 'success') setTimeout(() => setToast({ message: '', type: 'error' }), 3000);
  };
  const clearToast = () => setToast({ message: '', type: 'error' });

  /* ─── Validación ─── */
  const validate = () => {
    const tempErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.value.trim()) tempErrors.email = 'El correo es requerido';
    else if (!emailRegex.test(email.value)) tempErrors.email = 'Email no válido';

    if (!password.value) tempErrors.password = 'La contraseña es requerida';
    else if (password.value.length < 6) tempErrors.password = 'Mínimo 6 caracteres';

    if (mode === 'register') {
      if (!userName.value.trim()) tempErrors.userName = 'El nombre es requerido';
      if (!phone.value.trim()) tempErrors.phone = 'El teléfono es requerido';
      if (password.value !== confirmPassword.value)
        tempErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  /* ─── Login paso 1 ─── */
  const handleLogin = async (e) => {
    e.preventDefault();
    clearToast();
    setShowRecovery(false);
    if (!validate()) return;

    try {
      const result = await login({ email: email.value, password: password.value });
      if (result.success) {
        showToast('Código enviado a tu correo', 'success');
        setEmailForOTP(result.email);
        setTimeout(() => setStep('otp'), 1000);
      }
    } catch (err) {
      showToast(err.message);
      setShowRecovery(true);
    }
  };

  /* ─── Register paso 1 ─── */
  const handleRegister = async (e) => {
    e.preventDefault();
    clearToast();
    if (!validate()) return;

    try {
      const result = await register({
        userName: userName.value,
        email: email.value,
        password: password.value,
        phone: phone.value,
      });
      if (result.success) {
        showToast('Código de verificación enviado a tu correo', 'success');
        setEmailForOTP(result.email);
        setTimeout(() => setStep('otp'), 1000);
      }
    } catch (err) {
      showToast(err.message);
    }
  };

  /* ─── OTP paso 2 ─── */
  const handleVerify = async (code) => {
    try {
      const fn = mode === 'login' ? verifyLoginOTP : verifyRegisterOTP;
      const result = await fn({ email: emailForOTP, code });
      if (result.success) {
        showToast(
          mode === 'login' ? '¡Bienvenido de vuelta!' : '¡Cuenta creada exitosamente!',
          'success'
        );
        const isAdmin = result.user?.rolId === ADMIN_ROL_ID;
        setTimeout(() => navigate(isAdmin ? '/admin' : '/'), 1200);
      }
    } catch (err) {
      showToast(err.message);
    }
  };

  /* ─── Render OTP ─── */
  if (step === 'otp') {
    return (
      <>
        <Toast message={toast.message} type={toast.type} onClose={clearToast} />
        <VerificationPage
          email={emailForOTP}
          loading={loading}
          onVerify={handleVerify}
          onBack={() => { setStep('form'); clearToast(); }}
        />
      </>
    );
  }

  /* ─── Render Form ─── */
  return (
    <div className="vp-body">
      <div className="vp-bg">
        <div className="vp-bg-orb vp-bg-orb--1" />
        <div className="vp-bg-orb vp-bg-orb--2" />
        <div className="vp-bg-orb vp-bg-orb--3" />
      </div>

      <Toast message={toast.message} type={toast.type} onClose={clearToast} />

      <div className="vp-card">
        <VexioLogo />

        <h2 className="vp-title">
          {mode === 'login' ? 'INICIA SESIÓN' : 'CREAR CUENTA'}
        </h2>

        <form onSubmit={mode === 'login' ? handleLogin : handleRegister} noValidate>
          {mode === 'register' && (
            <>
              <Field
                icon={<User size={18} />}
                placeholder="Nombre de usuario"
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
            {loading
              ? <Loader2 className="vp-spin" size={20} />
              : mode === 'login' ? 'ENTRAR' : 'REGISTRARME'}
          </button>
        </form>

        {showRecovery && (
          <p className="vp-switch-auth">
            <span className="vp-link" onClick={() => navigate('/nueva-contraseña')}>
              ¿Olvidaste tu contraseña?
            </span>
          </p>
        )}

        <p className="vp-switch-auth">
          {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
          <span
            className="vp-link"
            onClick={() => {
              clearToast();
              setErrors({});
              navigate(mode === 'login' ? '/login/register' : '/login');
            }}
          >
            {mode === 'login' ? ' Regístrate' : ' Inicia Sesión'}
          </span>
        </p>
      </div>
    </div>
  );
}