import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/Authservice';
import Logo from '../../../../../assets/LogoVexios/banervexio.png';
import '../../pages/Login/login.css';

const MAX_ATTEMPTS = 3;
const TIMER_SECONDS = 60;

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

export default function VerifyCode() {
  const navigate = useNavigate();

  const [digits, setDigits]       = useState(['', '', '', '', '', '']);
  const [toast, setToast]         = useState({ message: '', type: 'error' });
  const [email, setEmail]         = useState('');
  const [timer, setTimer]         = useState(TIMER_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);

  const ref0 = useRef(); const ref1 = useRef(); const ref2 = useRef();
  const ref3 = useRef(); const ref4 = useRef(); const ref5 = useRef();
  const refs = [ref0, ref1, ref2, ref3, ref4, ref5];

  /* ─── Cargar email ─── */
  useEffect(() => {
    const saved = localStorage.getItem('recovery_email');
    if (!saved) { navigate('/recuperar-contraseña'); return; }
    setEmail(saved);
    setTimeout(() => refs[0].current?.focus(), 100);
  }, []);

  /* ─── Countdown ─── */
  useEffect(() => {
    if (timer <= 0) { setCanResend(true); return; }
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
    if (type === 'success') setTimeout(() => setToast({ message: '', type: 'error' }), 3000);
  };
  const clearToast = () => setToast({ message: '', type: 'error' });

  /* ─── Input handlers ─── */
  const handleChange = (i, e) => {
    const val = e.target.value.replace(/\D/, '');
    if (!val) return;
    const updated = [...digits];
    updated[i] = val;
    setDigits(updated);
    if (i < 5) refs[i + 1].current?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
      return;
    }
    if (e.key === 'Backspace') {
      const updated = [...digits];
      if (updated[i]) { updated[i] = ''; setDigits(updated); }
      else if (i > 0) refs[i - 1].current?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const updated = [...digits];
    pasted.split('').forEach((char, i) => { if (i < 6) updated[i] = char; });
    setDigits(updated);
    refs[Math.min(pasted.length, 5)].current?.focus();
  };

  /* ─── Reenviar código — usa /auth/forgotPassword ─── */
  const handleResend = async () => {
    setResending(true);
    try {
      await authService.forgotPassword({ email });
      setTimer(TIMER_SECONDS);
      setCanResend(false);
      setDigits(['', '', '', '', '', '']);
      /* Resetear intentos al reenviar */
      localStorage.removeItem('recovery_attempts');
      showToast('Nuevo código enviado a tu correo', 'success');
      setTimeout(() => refs[0].current?.focus(), 100);
    } catch (err) {
      showToast(err.message);
    } finally {
      setResending(false);
    }
  };

  /* ─── Submit ─── */
  const handleSubmit = (e) => {
    e.preventDefault();
    clearToast();

    const isComplete = digits.every(d => d !== '');
    if (!isComplete) { showToast('Ingresa los 6 dígitos del código'); return; }

    /* Guardar código y navegar — los intentos se cuentan en NewPassword */
    localStorage.setItem('recovery_code', digits.join(''));
    showToast('Verificando...', 'success');
    setTimeout(() => navigate('/nueva-contraseña'), 800);
  };

  const isComplete = digits.every(d => d !== '');

  return (
    <div className="vp-body">
      <div className="vp-bg">
        <div className="vp-bg-orb vp-bg-orb--1" />
        <div className="vp-bg-orb vp-bg-orb--2" />
        <div className="vp-bg-orb vp-bg-orb--3" />
      </div>

      <Toast message={toast.message} type={toast.type} onClose={clearToast} />

      <div className="vp-card">
        <div className="vp-logo-wrapper">
          <img src={Logo} alt="vexio logo" className="vp-logo" />
        </div>

        <h2 className="vp-title">VERIFICAR CÓDIGO</h2>
        <p style={{ fontSize: '0.85rem', color: 'rgba(200,200,220,0.5)', marginBottom: 8, lineHeight: 1.5 }}>
          Código enviado a <strong style={{ color: 'rgba(200,200,220,0.8)' }}>{email}</strong>
        </p>

        {/* ─── Timer / Reenviar ─── */}
        <div style={{ marginBottom: 24, fontSize: '0.8rem' }}>
          {canResend ? (
            <button
              onClick={handleResend}
              disabled={resending}
              style={{
                background: 'transparent',
                border: '1px solid rgba(79,110,247,0.3)',
                color: '#4f6ef7',
                padding: '6px 16px',
                borderRadius: 20,
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                transition: '0.2s',
              }}
            >
              <RefreshCw size={13} />
              {resending ? 'ENVIANDO...' : 'REENVIAR CÓDIGO'}
            </button>
          ) : (
            <span style={{ color: 'rgba(200,200,220,0.4)', fontWeight: 600, letterSpacing: 1 }}>
              Reenvío disponible en{' '}
              <span style={{ color: '#4f6ef7' }}>{formatTime(timer)}</span>
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="vc-otp-row" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={refs[i]}
                className={`vc-otp-input ${d ? 'vc-otp-input--filled' : ''}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleChange(i, e)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                autoFocus={i === 0}
              />
            ))}
          </div>

          <button className="vp-submit-btn" type="submit" disabled={!isComplete}>
            CONTINUAR
          </button>
        </form>

        <p className="vp-switch-auth">
          <span className="vp-link" onClick={() => navigate('/recuperar-contraseña')}>
            ← Volver
          </span>
        </p>
      </div>
    </div>
  );
}