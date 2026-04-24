import React, { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import logoescudo from "../../../assets/logoescudo.png";

import "./PasswordForm.css";

const PasswordForm = () => {
  const [showPass, setShowPass] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const isMatch = passwords.new === passwords.confirm && passwords.new !== "";

  return (
    <div className="upload-page">
      <h2 className="upload-title">Cambiar Contraseña</h2>
      <div className="upload-container password-card">
        {/* HEADER */}
        <div className="header-security">
          <img
            src={logoescudo}
            alt="Security Logo"
            className="security-logo"
          />
        </div>

        {/* FORM */}
        <form className="upload-form">
          {/* Contraseña Actual */}
          <div className="field">
            <label>Contraseña Actual</label>
            <div className="custom-number-input pass-field">
              <Lock size={18} className="prefix-icon" />
              <input
                type={showPass ? "text" : "password"}
                name="current"
                required
                placeholder="••••••••"
                className="input-count text-left"
                onChange={handleChange}

              />
            </div>
          </div>

          <div className="divider-neon" />

          {/* Nueva Contraseña */}
          <div className="field">
            <label>Nueva Contraseña</label>
            <div
              className={`custom-number-input pass-field ${
                passwords.new ? "active-neon" : ""

              }`}
            >
              <Lock size={18} className="prefix-icon" />
              <input
                type={showPass ? "text" : "password"}
                name="new"
                required 
                placeholder="Nueva contraseña"
                className="input-count text-left"
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
          </div>

          {/* Confirmar */}
          <div className="field">
            <label>Confirmar Nueva Contraseña</label>
            <div
              className={`custom-number-input pass-field ${
                isMatch ? "match-success" : ""
              }`}
            >
              <Lock size={18} className="prefix-icon" />
              <input
                type={showPass ? "text" : "password"}
                name="confirm"
                required
                placeholder="Repite la contraseña"
                className="input-count text-left"
                onChange={handleChange}
              />
            </div>

            {passwords.confirm && !isMatch && (
              <span className="error-text">Las contraseñas no coinciden</span>
            )}
          </div>

          <button className="save-btn neon-btn-heavy" type="submit">
            Actualizar Contraseña
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordForm;
