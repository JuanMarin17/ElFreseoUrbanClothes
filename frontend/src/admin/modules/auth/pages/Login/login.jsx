import React, { useState } from 'react';
import { Mail, Lock, User, Phone, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useNavigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../hook/Useauth';
import VerificationPage from '../VerificationPage';
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    try {
      const result = await login({ email: email.value, password: password.value });
      if (result.success) {
        setEmailForOTP(result.email);
        setStep('otp');
      }
    } catch (err) {
      setServerError(err?.response?.data?.message || 'Error al iniciar sesión');
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