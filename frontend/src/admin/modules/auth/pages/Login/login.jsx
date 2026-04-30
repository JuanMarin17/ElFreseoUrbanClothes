import React, { useState } from 'react';
import { Mail, Lock, User, Phone, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hook/Useauth';
import './login.css';

/* ─── useField ───────────────────────── */
function useField() {
  const [value, setValue] = useState('');
  const [show, setShow] = useState(false);
  return {
    value,
    show,
    onChange: (e) => setValue(e.target.value),
    onToggle: () => setShow(s => !s),
  };
}

/* ─── Field ─────────────────────────── */
function Field({ icon, type = 'text', placeholder, value, onChange, showToggle, show, onToggle }) {
  return (
    <div className="lf-field">
      <span className="lf-field-icon">{icon}</span>
      <input
        className="lf-field-input"
        type={showToggle ? (show ? 'text' : 'password') : type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      {showToggle && (
        <button type="button" className="lf-eye-btn" onClick={onToggle}>
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      )}
    </div>
  );
}

/* ─── COMPONENTE PRINCIPAL ───────────────── */
export default function Login() {
  const navigate = useNavigate();
  const { login, verifyLoginOTP, register, verifyRegisterOTP, loading } = useAuth();

  const [mode, setMode] = useState('login');       // 'login' | 'register'
  const [step, setStep] = useState('form');        // 'form' | 'otp'
  const [emailForOTP, setEmailForOTP] = useState('');
  const [error, setError] = useState('');

  const userName   = useField();
  const email   = useField();
  const phone = useField();
  const password = useField();
  const code   = useField();

  /* ─── Redirige según el rol del usuario ─── */
  const redirect = (user) => {
    if (user?.role === 'admin') navigate('/admin');
    else navigate('/');
  };

  /* ─── LOGIN paso 1 ───────────────────── */
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const result = await login({ email: email.value, password: password.value });
      if (result.success) {
        setEmailForOTP(result.email);
        setStep('otp');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  /* ─── REGISTER paso 1 ───────────────── */
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const result = await register({
        userName:  userName.value,
        email:  email.value,
        password: password.value,
        phone:   phone.value,
      });
      if (result.success) {
        setEmailForOTP(result.email);
        setStep('otp');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  /* ─── OTP LOGIN paso 2 ──────────────── */
  const handleVerifyLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const result = await verifyLoginOTP({ email: emailForOTP, code: code.value });
      if (result.success) redirect(result.user);
      else setError('Código inválido');
    } catch (err) {
      setError(err.message);
    }
  };

  /* ─── OTP REGISTER paso 2 ───────────── */
  const handleVerifyRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const result = await verifyRegisterOTP({ email: emailForOTP, code: code.value });
      if (result.success) redirect(result.user);
      else setError('Código inválido');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="lf-body">
      <div className="lf-card">

        <h2 className="lf-title">
          {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
        </h2>

        {error && <div className="lf-error-banner">{error}</div>}

        {/* ─── FORMULARIO ─── */}
        {step === 'form' && (
          <form onSubmit={mode === 'login' ? handleLogin : handleRegister}>

            {mode === 'register' && (
              <>
                <Field
                  icon={<User size={16} />}
                  placeholder="Nombre de usuario"
                  value={userName.value}
                  onChange={userName.onChange}
                />
                <Field
                  icon={<Phone size={16} />}
                  placeholder="Teléfono"
                  value={phone.value}
                  onChange={phone.onChange}
                />
              </>
            )}

            <Field
              icon={<Mail size={16} />}
              placeholder="Correo"
              value={email.value}
              onChange={email.onChange}
            />

            <Field
              icon={<Lock size={16} />}
              placeholder="Contraseña"
              value={password.value}
              onChange={password.onChange}
              showToggle
              show={password.show}
              onToggle={password.onToggle}
            />

            <button className="lf-submit-btn" type="submit" disabled={loading}>
              {loading
                ? <><Loader2 size={16} className="lf-spin" /> Procesando…</>
                : mode === 'login' ? 'Ingresar' : 'Registrarse'}
            </button>

          </form>
        )}

        {/* ─── OTP ─── */}
        {step === 'otp' && (
          <form onSubmit={mode === 'login' ? handleVerifyLogin : handleVerifyRegister}>

            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
              Se envió un código a <strong>{emailForOTP}</strong>
            </p>

            <Field
              icon={<Lock size={16} />}
              placeholder="Código OTP"
              value={code.value}
              onChange={code.onChange}
            />

            <button className="lf-submit-btn" type="submit" disabled={loading}>
              {loading
                ? <><Loader2 size={16} className="lf-spin" /> Verificando…</>
                : 'Verificar código'}
            </button>

            <button
              type="button"
              className="lf-switch-btn"
              style={{ marginTop: '8px', display: 'block', width: '100%', textAlign: 'center' }}
              onClick={() => setStep('form')}
            >
              ← Volver
            </button>

          </form>
        )}

        {/* ─── SWITCH LOGIN / REGISTER ─── */}
        {step === 'form' && (
          <p className="lf-switch">
            {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
            <button
              className="lf-switch-btn"
              type="button"
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            >
              {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
            </button>
          </p>
        )}

      </div>
    </div>
  );
}