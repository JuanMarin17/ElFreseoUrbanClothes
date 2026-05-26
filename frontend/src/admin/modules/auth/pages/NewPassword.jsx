import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/Authservice';
import Logo from '../../../../assets/LogoVexios/banervexio.png';
import './Login/login.css';

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

export default function NewPassword() {
  const navigate = useNavigate();

  const [email, setEmail]             = useState('');
  const [code, setCode]               = useState('');
  const [password, setPassword]       = useState('');
  const [confirmPassword, setConfirm] = useState('');
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [errors, setErrors]           = useState({});
  const [toast, setToast]             = useState({ message: '', type: 'error' });

  useEffect(() => {
    const savedEmail = localStorage.getItem('recovery_email');
    const savedCode  = localStorage.getItem('recovery_code');

    /* Si no hay email o código redirige al inicio del flujo */
    if (!savedEmail || !savedCode) {
      navigate('/recuperar-contraseña');
      return;
    }
    setEmail(savedEmail);
    setCode(savedCode);
  }, []);

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
    if (type === 'success') setTimeout(() => setToast({ message: '', type: 'error' }), 3000);
  };
  const clearToast = () => setToast({ message: '', type: 'error' });

  const validate = () => {
    const tempErrors = {};
    if (!password)              tempErrors.password = 'La contraseña es requerida';
    else if (password.length < 8) tempErrors.password = 'Mínimo 8 caracteres';
    if (!confirmPassword)         tempErrors.confirmPassword = 'Confirma tu contraseña';
    else if (password !== confirmPassword) tempErrors.confirmPassword = 'Las contraseñas no coinciden';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearToast();
    if (!validate()) return;

    setLoading(true);
    try {
      await authService.forgotPasswordSecondStep({ email, code, password });
      showToast('¡Contraseña actualizada exitosamente!', 'success');

      /* Limpiar datos temporales */
      localStorage.removeItem('recovery_email');
      localStorage.removeItem('recovery_code');

      setTimeout(() => navigate('/login'), 1500);
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

        <h2 className="vp-title">NUEVA CONTRASEÑA</h2>
        <p style={{ fontSize: '0.85rem', color: 'rgba(200,200,220,0.5)', marginBottom: 28, lineHeight: 1.5 }}>
          Crea una nueva contraseña segura para tu cuenta
        </p>

        <form onSubmit={handleSubmit} noValidate>

          {/* ─── Nueva contraseña ─── */}
          <div className="vp-field-group">
            <div className={`vp-input-wrapper ${errors.password ? 'vp-input-error' : ''}`}>
              <span className="vp-field-icon"><Lock size={18} /></span>
              <input
                className="vp-input-main"
                type={showPass ? 'text' : 'password'}
                placeholder="Nueva Contraseña"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors(er => ({ ...er, password: '' })); }}
              />
              <button type="button" className="vp-eye-btn" onClick={() => setShowPass(s => !s)}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <span className="vp-error-text">{errors.password}</span>}
          </div>

          {/* ─── Confirmar contraseña ─── */}
          <div className="vp-field-group">
            <div className={`vp-input-wrapper ${errors.confirmPassword ? 'vp-input-error' : ''}`}>
              <span className="vp-field-icon"><Lock size={18} /></span>
              <input
                className="vp-input-main"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirmar Contraseña"
                value={confirmPassword}
                onChange={(e) => { setConfirm(e.target.value); setErrors(er => ({ ...er, confirmPassword: '' })); }}
              />
              <button type="button" className="vp-eye-btn" onClick={() => setShowConfirm(s => !s)}>
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && <span className="vp-error-text">{errors.confirmPassword}</span>}
          </div>

          <button className="vp-submit-btn" type="submit" disabled={loading}>
            {loading ? <Loader2 className="vp-spin" size={20} /> : 'CAMBIAR CONTRASEÑA'}
          </button>
        </form>

        <p className="vp-switch-auth">
          <span className="vp-link" onClick={() => navigate('/login')}>
            ← Volver al inicio de sesión
          </span>
        </p>
      </div>
    </div>
  );
}