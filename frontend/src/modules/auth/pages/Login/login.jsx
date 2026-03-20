import React, { useState, useRef, useEffect } from 'react';
import './Login.css';
import logo from '../../../../assets/logo.png';
import { User, Mail, Lock, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Login() {
  const [isFlipped, setIsFlipped]   = useState(false);
  const [loading, setLoading]       = useState(false);
  const [cardHeight, setCardHeight] = useState(500);
  const [isMobile, setIsMobile]     = useState(window.innerWidth <= 700);
  const [animDir, setAnimDir]       = useState(null); // 'in' | 'out'
  const [alert, setAlert] = useState({ show: false, title: '', text: '', type: 'success' });

  const frontRef = useRef(null);
  const backRef  = useRef(null);

  // Detecta cambios de tamaño
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 700);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Mide altura para el flip 3D en desktop
  useEffect(() => {
    if (isMobile) return;
    const updateHeight = () => {
      const front = frontRef.current;
      const back  = backRef.current;
      if (!front || !back) return;

      back.style.visibility = 'hidden';
      back.style.position   = 'relative';
      back.style.transform  = 'none';
      const backH = back.scrollHeight;
      back.style.visibility = '';
      back.style.position   = '';
      back.style.transform  = '';

      front.style.visibility = 'hidden';
      front.style.position   = 'relative';
      const frontH = front.scrollHeight;
      front.style.visibility = '';
      front.style.position   = '';

      setCardHeight(Math.max(isFlipped ? backH : frontH, 420));
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [isFlipped, isMobile]);

  const toggleForm = () => {
    if (isMobile) {
      // Animación slide en móvil
      setAnimDir('out');
      setTimeout(() => {
        setIsFlipped(f => !f);
        setAnimDir('in');
        setTimeout(() => setAnimDir(null), 420);
      }, 320);
    } else {
      setIsFlipped(f => !f);
    }
  };

  const closeAlert = () => setAlert(a => ({ ...a, show: false }));

  const fakeLoading = (cb) => {
    setLoading(true);
    setTimeout(() => { setLoading(false); cb(); }, 1000);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const correo = new FormData(e.target).get('logCorreo');
    fakeLoading(() => {
      const raw  = correo.split('@')[0];
      const name = raw.charAt(0).toUpperCase() + raw.slice(1);
      setAlert({ show: true, title: 'Ingreso exitoso', text: `¡Qué bueno verte de nuevo, ${name}!`, type: 'success' });
    });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    const nombre = new FormData(e.target).get('regNombre');
    fakeLoading(() => {
      setAlert({ show: true, title: 'Cuenta creada', text: `¡Bienvenido a El Freseo, ${nombre.split(' ')[0]}!`, type: 'success' });
    });
  };

  const iconMap = {
    success: <CheckCircle size={28} />,
    error:   <XCircle size={28} />,
    warning: <XCircle size={28} />,
  };

  // En móvil usamos un layout plano sin flip 3D
  if (isMobile) {
    const mobileClass = `mobile-face ${animDir === 'out' ? 'slide-out' : ''} ${animDir === 'in' ? 'slide-in' : ''}`;
    return (
      <div className="auth-body">
        <div className="card-container">
          <div className={`mobile-card ${mobileClass}`}>
            <div className="left">
              <img src={logo} className="Logo" alt="Logo" />
              <span className="logo-tagline">El Freseo</span>
            </div>
            <div className="right">
              {!isFlipped ? (
                <>
                  <h1>Únete a El Freseo</h1>
                  <p className="sub">La cremoletta llegó a la web </p>
                  <form onSubmit={handleRegister}>
                    <div className="field">
                      <span className="field-icon"><User size={15} /></span>
                      <input type="text" name="regNombre" placeholder="Nombre completo" required />
                    </div>
                    <div className="field">
                      <span className="field-icon"><Mail size={15} /></span>
                      <input type="email" name="regCorreo" placeholder="Correo electrónico" required />
                    </div>
                    <div className="field">
                      <span className="field-icon"><Lock size={15} /></span>
                      <input type="password" name="regPassword" placeholder="Contraseña" required />
                    </div>
                    <button type="submit" className={`btn-submit ${loading ? 'loading' : ''}`}>
                      {loading ? <><span className="spinner" />Creando cuenta…</> : 'Registrarse'}
                    </button>
                  </form>
                  <p className="switch">¿Ya tienes cuenta? <span onClick={toggleForm}>Inicia sesión</span></p>
                  <p className="help-link"><Link to="/ayuda">¿Necesitas ayuda?</Link></p>
                </>
              ) : (
                <>
                  <h1>Iniciar Sesión</h1>
                  <p className="sub">Bienvenido de nuevo ✦</p>
                  <form onSubmit={handleLogin}>
                    <div className="field">
                      <span className="field-icon"><Mail size={15} /></span>
                      <input type="email" name="logCorreo" placeholder="Correo electrónico" required />
                    </div>
                    <div className="field">
                      <span className="field-icon"><Lock size={15} /></span>
                      <input type="password" name="logPassword" placeholder="Contraseña" required />
                    </div>
                    <button type="submit" className={`btn-submit ${loading ? 'loading' : ''}`}>
                      {loading ? <><span className="spinner" />Verificando…</> : 'Ingresar'}
                    </button>
                  </form>
                  <p className="switch">¿No tienes cuenta? <span onClick={toggleForm}>Regístrate</span></p>
                  <p className="help-link"><Link to="/ayuda">¿Necesitas ayuda?</Link></p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ALERTA */}
        <div className={`alert-overlay ${alert.show ? 'active' : ''}`} onClick={closeAlert}>
          <div className="alert-box" onClick={e => e.stopPropagation()}>
            <div className={`alert-icon-wrap ${alert.type}`}>{iconMap[alert.type]}</div>
            <h3>{alert.title}</h3>
            <p>{alert.text}</p>
            <button onClick={closeAlert}>Aceptar</button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop: flip 3D original
  return (
    <div className="auth-body">
      <div className="card-container">
        <div className={`card ${isFlipped ? 'active' : ''}`} style={{ height: cardHeight }}>

          {/* FRONT — REGISTRO */}
          <div className="face front" ref={frontRef}>
            <div className="left">
              <img src={logo} className="Logo" alt="Logo" />
              <span className="logo-tagline">El Freseo</span>
            </div>
            <div className="right">
              <h1>Únete a El Freseo</h1>
              <p className="sub">La cremoletta llegó a la web ✦</p>
              <form onSubmit={handleRegister}>
                <div className="field">
                  <span className="field-icon"><User size={15} /></span>
                  <input type="text" name="regNombre" placeholder="Nombre completo" required />
                </div>
                <div className="field">
                  <span className="field-icon"><Mail size={15} /></span>
                  <input type="email" name="regCorreo" placeholder="Correo electrónico" required />
                </div>
                <div className="field">
                  <span className="field-icon"><Lock size={15} /></span>
                  <input type="password" name="regPassword" placeholder="Contraseña" required />
                </div>
                <button type="submit" className={`btn-submit ${loading ? 'loading' : ''}`}>
                  {loading ? <><span className="spinner" />Creando cuenta…</> : 'Registrarse'}
                </button>
              </form>
              <p className="switch">¿Ya tienes cuenta? <span onClick={toggleForm}>Inicia sesión</span></p>
              <p className="help-link"><Link to="/ayuda">¿Necesitas ayuda?</Link></p>
            </div>
          </div>

          {/* BACK — LOGIN */}
          <div className="face back" ref={backRef}>
            <div className="left">
              <img src={logo} className="Logo" alt="Logo" />
              <span className="logo-tagline">El Freseo</span>
            </div>
            <div className="right">
              <h1>Iniciar Sesión</h1>
              <p className="sub">Bienvenido de nuevo </p>
              <form onSubmit={handleLogin}>
                <div className="field">
                  <span className="field-icon"><Mail size={15} /></span>
                  <input type="email" name="logCorreo" placeholder="Correo electrónico" required />
                </div>
                <div className="field">
                  <span className="field-icon"><Lock size={15} /></span>
                  <input type="password" name="logPassword" placeholder="Contraseña" required />
                </div>
                <button type="submit" className={`btn-submit ${loading ? 'loading' : ''}`}>
                  {loading ? <><span className="spinner" />Verificando…</> : 'Ingresar'}
                </button>
              </form>
              <p className="switch">¿No tienes cuenta? <span onClick={toggleForm}>Regístrate</span></p>
              <p className="help-link"><Link to="/ayuda">¿Necesitas ayuda?</Link></p>
            </div>
          </div>
        </div>
      </div>

      {/* ALERTA */}
      <div className={`alert-overlay ${alert.show ? 'active' : ''}`} onClick={closeAlert}>
        <div className="alert-box" onClick={e => e.stopPropagation()}>
          <div className={`alert-icon-wrap ${alert.type}`}>{iconMap[alert.type]}</div>
          <h3>{alert.title}</h3>
          <p>{alert.text}</p>
          <button onClick={closeAlert}>Aceptar</button>
        </div>
      </div>
    </div>
  );
}