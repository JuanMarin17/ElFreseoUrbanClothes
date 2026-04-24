import React, { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";

import "./PasswordForm.css";

function NewPassword() {
const [showPass, setShowPass] = useState(false);

const [passwords, setPasswords] = useState({
  password: "",
  confirm: "",
});

const handleChange = (e) => {
  setPasswords({
    ...passwords,
    [e.target.name]: e.target.value,
  });
};

const isMatch =
  passwords.password === passwords.confirm && passwords.password !== "";

// 🔐 Nivel de seguridad
const getStrength = () => {
  const pass = passwords.password;
  let strength = 0;

  if (pass.length > 5) strength++;
  if (/[A-Z]/.test(pass)) strength++;
  if (/[0-9]/.test(pass)) strength++;
  if (/[^A-Za-z0-9]/.test(pass)) strength++;

  return strength;
};

const strength = getStrength();

return (
  <div className="upload-page">
    <div className="upload-container password-card">
      {/* HEADER */}
      <div className="header-security">
        <h2 className="upload-title">Nueva Contraseña</h2>
      </div>

      {/* FORM */}
      <form className="upload-form">
        {/* Password */}
        <div className="field">
          <label>Nueva Contraseña</label>

          <div
            className={`custom-number-input pass-field ${passwords.password ? "active-neon" : ""}`}
          >
            <Lock size={18} className="prefix-icon" />

            <input
              type={showPass ? "text" : "password"}
              name="password"
              placeholder="Escribe tu nueva contraseña"
              className="input-count"
              onChange={handleChange}
            />

            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowPass(!showPass)}
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* 🔥 Barra de seguridad */}
          <div className="strength-bar">
            <div className={`strength-fill level-${strength}`}></div>
          </div>
        </div>

        {/* Confirm */}
        <div className="field">
          <label>Confirmar Contraseña</label>

          <div
            className={`custom-number-input pass-field ${isMatch ? "match-success" : ""}`}
          >
            <Lock size={18} className="prefix-icon" />

            <input
              type={showPass ? "text" : "password"}
              name="confirm"
              placeholder="Repite la contraseña"
              className="input-count"
              onChange={handleChange}
            />
          </div>

          {passwords.confirm && !isMatch && (
            <span className="error-text">Las contraseñas no coinciden</span>
          )}
        </div>

        <button className="save-btn neon-btn-heavy" type="submit">
          Guardar Nueva Contraseña
        </button>
      </form>
    </div>
  </div>
);
}

export default NewPassword;
