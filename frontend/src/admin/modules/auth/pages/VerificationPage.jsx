import React, { useState, useRef } from "react";
import { Lock, ArrowRight } from "lucide-react";
import "./VerificationPage.css";
import vexio from "../../../../assets/vexio.png";

const VerificationPage = () => {
  const [code, setCode] = useState(new Array(6).fill(""));
  const inputRefs = useRef([]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    const newCode = [...code];
    newCode[index] = element.value;
    setCode(newCode);

    // Mover al siguiente input automáticamente
    if (element.value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Volver al input anterior al borrar
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  return (
    <div className="verify-wrapper">
      <div className="grid-background"></div>

      <div className="verify-card">
        <header className="verify-header">
          <img src={vexio} alt="logo" className="logo" />

          <h1>VERIFICAR CÓDIGO</h1>
          <p>Ingresa el código de 6 dígitos enviado a tu correo electrónico</p>
        </header>

        <div className="otp-container">
          {code.map((data, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              ref={(el) => (inputRefs.current[index] = el)}
              value={data}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={data ? "input-active" : ""}
            />
          ))}
        </div>

        <button className="verify-btn">
          VERIFICAR CÓDIGO <Lock size={18} />
        </button>

        <footer className="verify-footer">
          <p>¿No recibiste el código?</p>
          <button className="resend-link">REENVIAR CÓDIGO</button>
        </footer>
      </div>
    </div>
  );
};

export default VerificationPage;
