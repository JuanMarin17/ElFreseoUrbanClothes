import React, { useState } from "react";
import "./NewPassword.css";
import vexio from "../../../../assets/vexio.png";
const NewPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Validación de requisitos
  const requirements = [
    { label: "MÍNIMO 8 CARACTERES", met: password.length >= 8 },
    {
      label: "UN CARÁCTER ESPECIAL",
      met: /[!@#$%^&*(),.?":{}|<>|-]/.test(password),
    },
    { label: "UNA LETRA MAYÚSCULA", met: /[A-Z]/.test(password) },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === confirmPassword && requirements.every((r) => r.met)) {
      console.log("Contraseña actualizada con éxito");
    } else {
      alert(
        "Por favor, verifica los requisitos y que las contraseñas coincidan.",
      );
    }
  };

  return (
    <div className="container">
      <div className="card">
        <header className="header">
           <img
           src={vexio}
           alt="logo vexio"
          className="logo-placeholder"></img>
          <h1>REESTABLECER CONTRASEÑA</h1>
          <p>Ingresa tu nueva clave de acceso</p>
        </header>

        <form onSubmit={handleSubmit} className="form">
          <div className="input-group">
            <label>NUEVA CONTRASEÑA</label>
            <div className="input-wrapper">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="........"
              />
              <button
                type="button"
                className="eye-icon"
                onClick={() => setShowPass(!showPass)}
              >
                👁
              </button>
            </div>
          </div>

          <div className="input-group">
            <label>CONFIRMAR CONTRASEÑA</label>
            <div className="input-wrapper">
              <input
                type={showPass ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="........"
              />
              <button
                type="button"
                className="eye-icon"
                onClick={() => setShowPass(!showPass)}
              >
                👁
              </button>
            </div>
          </div>

          <div className="requirements-box">
            <p className="req-title">REQUERIMIENTOS TÉCNICOS</p>
            <ul>
              {requirements.map((req, index) => (
                <li key={index} className={req.met ? "met" : ""}>
                  <span className="check-circle">{req.met ? "✓" : "○"}</span>
                  {req.label}
                </li>
              ))}
            </ul>
          </div>

          <button type="submit" className="submit-btn">
            ACTUALIZAR CONTRASEÑA <span>→</span>
          </button>
        </form>

        <footer className="footer">
          <a href="/login">← VOLVER AL INICIO DE SESIÓN</a>
        </footer>
      </div>
    </div>
  );
};

export default NewPassword;
