import React, { useState } from 'react';
import './Login.css';
import logo from '../../../../assets/logo.png';

const Login = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [alert, setAlert] = useState({ show: false, title: '', text: '', type: 'success' });

  const toggleForm = () => setIsFlipped(!isFlipped);

  const showAlert = (title, text, type = 'success') => {
    setAlert({ show: true, title, text, type });
  };

  const closeAlert = () => {
    setAlert({ ...alert, show: false });
  };

  // 1. Manejador de Registro
  const handleRegister = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const nombre = formData.get('regNombre');
    
    // Simulación de éxito
    showAlert('Cuenta creada', `¡Bienvenido a El Freseo, ${nombre}!`, 'success');
  };

  // 2. Manejador de Login CORREGIDO
  const handleLogin = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const correo = formData.get('logCorreo');

    /* LÓGICA DE SALUDO PERSONALIZADO:
       Extraemos lo que está antes del @ y ponemos la primera letra en Mayúscula.
       Ej: "juan.perez@gmail.com" -> "Juan.perez"
    */
    const usuarioExtraido = correo.split('@')[0];
    const nombreParaMostrar = usuarioExtraido.charAt(0).toUpperCase() + usuarioExtraido.slice(1);

    // En el futuro, cuando tengas backend, aquí usarás el nombre que venga de la DB
    showAlert('Ingreso exitoso', `¡Qué bueno verte de nuevo, ${nombreParaMostrar}!`, 'success');
  };

  return (
    <div className="auth-body">
      <div className="container">
        <div className="card-container">
          <div className={`card ${isFlipped ? 'active' : ''}`}>
            
            {/* FRONT: REGISTRO */}
            <div className="face front">
              <div className="left">
                <img src={logo} className="Logo" alt="Logo" />
              </div>
              <div className="right">
                <h1>Únete a El Freseo</h1>
                <p className="sub">La cremoletta llegó a la web</p>
                <form onSubmit={handleRegister}>
                  <input type="text" name="regNombre" placeholder="Nombre completo" required />
                  <input type="email" name="regCorreo" placeholder="Correo electrónico" required />
                  <input type="password" name="regPassword" placeholder="Contraseña" required />
                  <button type="submit">REGISTRARSE</button>
                </form>
                <p className="switch">
                  ¿Ya tienes cuenta? <span onClick={toggleForm}>Inicia sesión</span>
                </p>
              </div>
            </div>

            {/* BACK: LOGIN */}
            <div className="face back">
              <div className="left">
                <img src={logo} className="Logo" alt="Logo" />
              </div>
              <div className="right">
                <h1>Iniciar Sesión</h1>
                <p className="sub">Bienvenido de nuevo</p>
                <form onSubmit={handleLogin}>
                  <input type="email" name="logCorreo" placeholder="Correo electrónico" required />
                  <input type="password" name="logPassword" placeholder="Contraseña" required />
                  <button type="submit">INGRESAR</button>
                </form>
                <p className="switch">
                  ¿No tienes cuenta? <span onClick={toggleForm}>Regístrate</span>
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ALERT OVERLAY */}
      <div className={`alert-overlay ${alert.show ? 'active' : ''}`} onClick={closeAlert}>
        <div 
          className={`alert-animated ${alert.type} ${!alert.show ? 'hide' : ''}`} 
          onClick={(e) => e.stopPropagation()}
        >
          <div className="alert-icon">
            {alert.type === 'error' ? '✖' : alert.type === 'warning' ? '⚠' : '✔'}
          </div>
          <h3>{alert.title}</h3>
          <p>{alert.text}</p>
          <button type="button" onClick={closeAlert}>Aceptar</button>
        </div>
      </div>
    </div>
  );
};

export default Login;