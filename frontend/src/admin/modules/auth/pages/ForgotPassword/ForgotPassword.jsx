import React, { useState, useEffect } from 'react';
import { Mail, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/Authservice';
import Logo from '../../../../../assets/LogoVexios/banervexio.png';
import '../../pages/Login/login.css';

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

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [toast, setToast]     = useState({ message: '', type: 'error' });

  useEffect(() => {
    const saved = localStorage.getItem('last_email');
    if (saved) setEmail(saved);
  }, []);

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
    if (type === 'success') setTimeout(() => setToast({ message: '', type: 'error' }), 3000);
  };
  const clearToast = () => setToast({ message: '', type: 'error' });

  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim())           { setError('El correo es requerido'); return false; }
    if (!emailRegex.test(email)) { setError('Email no válido');        return false; }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearToast();
    if (!validate()) return;

    setLoading(true);
    try {
      await authService.forgotPassword({ email });
      showToast('Código enviado a tu correo', 'success');
      setTimeout(() => navigate('/verificar-codigo'), 1500); // ← fix
    } catch (err) {
      showToast(err.message);
    } finally {
      setLoading(false);
    }
  };

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

        <h2 className="vp-title">RECUPERAR CONTRASEÑA</h2>
        <p style={{ fontSize: '0.85rem', color: 'rgba(200,200,220,0.5)', marginBottom: 28, lineHeight: 1.5 }}>
          Ingresa tu correo y te enviaremos un código de verificación
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="vp-field-group">
            <div className={`vp-input-wrapper ${error ? 'vp-input-error' : ''}`}>
              <span className="vp-field-icon"><Mail size={18} /></span>
              <input
                className="vp-input-main"
                type="email"
                placeholder="Correo Electrónico"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
              />
            </div>
            {error && <span className="vp-error-text">{error}</span>}
          </div>

          <button className="vp-submit-btn" type="submit" disabled={loading}>
            {loading ? <Loader2 className="vp-spin" size={20} /> : 'ENVIAR CÓDIGO'}
          </button>
        </form>

        <p className="vp-switch-auth">
          ¿Recordaste tu contraseña?
          <span className="vp-link" onClick={() => navigate('/login')}> Inicia Sesión</span>
        </p>
      </div>
    </div>
  );
}