import React from "react";
import { MailCheck } from "lucide-react";
import "./NotificationSent.css";
 
const NotificationSent = ({ visible, onConfirm }) => {
  if (!visible) return null;

  return (
    <div className="notification-overlay">
      <div className="notification-card">
        <div className="accent-line"></div>

        <div className="icon-wrapper">
          <div className="icon-border">
            <MailCheck size={42} className="check-icon" />
          </div>
        </div>

        <div className="text-content">
          <h1 className="title">CÓDIGO ENVIADO</h1>
          <p className="description">
            Hemos enviado un código de seguridad de{" "}
            <span className="highlight">6 dígitos</span> a tu dirección de
            correo electrónico vinculada.
          </p>
        </div>

        <button className="action-btn" onClick={onConfirm}>
          INGRESAR CÓDIGO
        </button>

        <div className="notification-footer">
          <p>
            ¿NO RECIBISTE NADA?{" "}
            <button className="inline-link">REENVIAR</button>
          </p>
          <span className="metadata">PROTO_ID: 992-SECURE</span>
        </div>
      </div>
    </div>
  );
};

export default NotificationSent;
