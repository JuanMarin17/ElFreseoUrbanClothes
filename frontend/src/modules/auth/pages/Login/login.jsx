import React, { useState } from 'react';
import './Login.css';
import logo from '../../../../assets/logo.png'; // Asegúrate que la ruta sea correcta
import { User, Mail, Lock, Phone, CreditCard, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Login() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, title: '', text: '', type: 'success' });

  // Función para girar la tarjeta
  const flip = () => {
    if (loading) return; // Evita girar mientras procesa
    setIsFlipped(!isFlipped);
  };

  const closeAlert = () => setAlert(prev => ({ ...prev, show: false }));

  // ── MANEJADOR DE LOGIN (LISTO PARA API) ──
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
      // AQUÍ CONSUMIRÁS TU API:
      // const response = await fetch('http://tu-api.com/login', { 
      //    method: 'POST', body: JSON.stringify(data) 
      // });
      
      // Simulación de espera de red
      await new Promise(res => setTimeout(res, 1500));

      setAlert({
        show: true,
        title: '¡Acceso Correcto!',
        text: `Bienvenido de nuevo a la plataforma.`,
        type: 'success'
      });
    } catch (error) {
      setAlert({ show: true, title: 'Error', text: 'Credenciales incorrectas.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // ── MANEJADOR DE REGISTRO (LISTO PARA API) ──
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
      // AQUÍ CONSUMIRÁS TU API DE REGISTRO
      await new Promise(res => setTimeout(res, 1500));

      setAlert({
        show: true,
        title: 'Cuenta Creada',
        text: `Hola ${data.regNombre}, tu registro fue exitoso.`,
        type: 'success'
      });
      
      // Opcional: Volver al login automáticamente tras registrarse
      // setTimeout(() => setIsFlipped(false), 2000);

    } catch (error) {
      setAlert({ show: true, title: 'Error', text: 'No se pudo completar el registro.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-body">
      <div className="flip-wrapper">
        <div className={`flip-inner ${isFlipped ? 'flipped' : ''}`}>

          {/* ── CARA FRONTAL: LOGIN ── */}
          <div className="flip-face flip-front">
            <div className="face-bg" />
            <div className="face-content">
              <div className="f-left">
                <img src={logo} className="f-logo" alt="El Freseo Logo" />
                <span className="f-tagline">El Freseo</span>
              </div>
              <div className="f-right">
                <h1>Iniciar Sesión</h1>
                <p className="sub">Ingresa tus credenciales para continuar</p>
                
                <form onSubmit={handleLogin}>
                  <div className="field">
                    <span className="field-icon"><Mail size={16} /></span>
                    <input type="email" name="logCorreo" placeholder="Correo electrónico" required autoComplete="email" />
                  </div>
                  <div className="field">
                    <span className="field-icon"><Lock size={16} /></span>
                    <input type="password" name="logPassword" placeholder="Contraseña" required autoComplete="current-password" />
                  </div>
                  
                  <button type="submit" className="btn-submit" disabled={loading}>
                    {loading ? <div className="spinner" /> : 'Entrar'}
                  </button>
                </form>

                <p className="switch">¿No eres miembro? <span onClick={flip}>Regístrate aquí</span></p>
                <p className="help-link"><Link to="/ayuda">¿Problemas para entrar?</Link></p>
              </div>
            </div>
          </div>

          {/* ── CARA TRASERA: REGISTRO ── */}
          <div className="flip-face flip-back">
            <div className="face-bg" />
            <div className="face-content">
              <div className="f-left">
                <img src={logo} className="f-logo" alt="El Freseo Logo" />
                <span className="f-tagline">El Freseo</span>
              </div>
              <div className="f-right">
                <h1>Crear Cuenta</h1>
                <p className="sub">Únete a nuestra comunidad hoy mismo</p>

                <form onSubmit={handleRegister}>
                  <div className="field">
                    <span className="field-icon"><User size={16} /></span>
                    <input type="text" name="regNombre" placeholder="Nombre completo" required />
                  </div>
                  <div className="field">
                    <span className="field-icon"><CreditCard size={16} /></span>
                    <input type="text" name="regIdentificacion" placeholder="ID / Identificación" required />
                  </div>
                  <div className="field">
                    <span className="field-icon"><Phone size={16} /></span>
                    <input type="tel" name="regTelefono" placeholder="Teléfono" required />
                  </div>
                  <div className="field">
                    <span className="field-icon"><Mail size={16} /></span>
                    <input type="email" name="regCorreo" placeholder="Correo electrónico" required />
                  </div>
                  <div className="field">
                    <span className="field-icon"><Lock size={16} /></span>
                    <input type="password" name="regPassword" placeholder="Crear contraseña" required />
                  </div>

                  <button type="submit" className="btn-submit" disabled={loading}>
                    {loading ? <div className="spinner" /> : 'Registrarme'}
                  </button>
                </form>

                <p className="switch">¿Ya tienes cuenta? <span onClick={flip}>Inicia sesión</span></p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── MODAL DE ALERTA PERSONALIZADO ── */}
      <div className={`alert-overlay ${alert.show ? 'active' : ''}`} onClick={closeAlert}>
        <div className="alert-box" onClick={e => e.stopPropagation()}>
          <div className={`alert-icon-wrap ${alert.type}`} style={{ color: alert.type === 'success' ? '#00f2ff' : '#ff4d4d', marginBottom: '15px' }}>
            {alert.type === 'success' ? <CheckCircle size={48} /> : <XCircle size={48} />}
          </div>
          <h2 style={{ color: '#fff', marginBottom: '10px' }}>{alert.title}</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '25px' }}>{alert.text}</p>
          <button className="btn-submit" onClick={closeAlert}>Entendido</button>
        </div>
      </div>
    </div>
  );
}