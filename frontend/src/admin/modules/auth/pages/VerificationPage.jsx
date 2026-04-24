import "./VerificationPage.css";
import logo from "../../../assets/logo.png";

export default function VerificationPage() {
  return (
    <div className="verification-container">
      <div className="verification-content">
        <h1 className="verification-title">
          Ingresa el codigo de verificación
        </h1>
        <p className="verification-subtitle">
          Hemos enviado un código a tu correo.
        </p>
        <div className="code-inputs-wrapper">
          <div className="code-inputs">
            <input className="code-input" type="text" maxLength={1} />
            <input className="code-input" type="text" maxLength={1} />
            <input className="code-input" type="text" maxLength={1} />
            <input className="code-input" type="text" maxLength={1} />
          </div>
        </div>
        <p className="verification-subtitle">Reenvío disponible en 2:00MIN</p>
        <div class="auth-options">
          <div class="option">
            <span class="icon">💬</span>
            <span>via Text Message</span>
          </div>
          <div class="divider"></div>

          <div class="option">
            <span class="icon">✉️</span>
            <span>via Email</span>
          </div>
        </div>
        <button className="verify-button">Verificar</button>
      </div>

      <div className="verification-illustration">
        <img src={logo} />
      </div>
    </div>
  );
}
