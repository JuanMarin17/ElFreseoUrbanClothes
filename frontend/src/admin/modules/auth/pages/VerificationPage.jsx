import { useRef, useState, useEffect } from "react";
import "./VerificationPage.css";
// import logo from "../../assets/logo.png";

export default function VerificationPage({ email, onVerify, onBack, loading }) {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const ref0 = useRef();
  const ref1 = useRef();
  const ref2 = useRef();
  const ref3 = useRef();
  const ref4 = useRef();
  const ref5 = useRef();
  const refs = [ref0, ref1, ref2, ref3, ref4, ref5];

  /* ─── Countdown timer ─── */
  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const handleResend = () => {
    setTimer(120);
    setCanResend(false);
    setDigits(["", "", "", "", "", ""]);
    refs[0].current.focus();
  };

  /* ─── Input handlers ─── */
  const handleChange = (i, e) => {
    const val = e.target.value.replace(/\D/, "");
    if (!val) return;
    const updated = [...digits];
    updated[i] = val;
    setDigits(updated);
    if (i < 5) {
      refs[i + 1].current.focus();
      setActiveIndex(i + 1);
    }
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace") {
      const updated = [...digits];
      if (updated[i]) {
        updated[i] = "";
        setDigits(updated);
      } else if (i > 0) {
        refs[i - 1].current.focus();
        setActiveIndex(i - 1);
      }
    }
  };

  const handleFocus = (i) => setActiveIndex(i);

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const updated = [...digits];
    pasted.split("").forEach((char, i) => {
      if (i < 6) updated[i] = char;
    });
    setDigits(updated);
    const nextIndex = Math.min(pasted.length, 5);
    refs[nextIndex].current.focus();
    setActiveIndex(nextIndex);
  };

  /* ─── Submit ─── */
  const handleSubmit = () => {
    const code = digits.join("");
    if (code.length < 6) return;
    onVerify(code);
  };

  const isComplete = digits.every((d) => d !== "");

  return (
    <div className="vp-body">
      <div className="vp-bg">
        <div className="vp-bg-orb vp-bg-orb--1" />
        <div className="vp-bg-orb vp-bg-orb--2" />
        <div className="vp-bg-orb vp-bg-orb--3" />
      </div>

      <div className="vp-card">
        <h1 className="vp-title">Ingresa el código de verificación</h1>
        <p className="vp-subtitle">
          Hemos enviado un código a{" "}
          <span className="vp-email">{email}</span>
        </p>

        <div className="vp-inputs-row" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={refs[i]}
              className={`vp-input ${d ? "vp-input--filled" : ""} ${activeIndex === i ? "vp-input--active" : ""}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onFocus={() => handleFocus(i)}
              autoFocus={i === 0}
            />
          ))}
        </div>

        <div className="vp-timer">
          {canResend ? (
            <button className="vp-resend-btn" onClick={handleResend}>
              Reenviar código
            </button>
          ) : (
            <span>
              Reenvío disponible en{" "}
              <span className="vp-timer-value">{formatTime(timer)}</span>
            </span>
          )}
        </div>

        <div className="vp-auth-options">
          <button className="vp-option">
            <span className="vp-option-icon">💬</span>
            <span>mediante mensaje de texto</span>
          </button>
          <div className="vp-divider" />
          <button className="vp-option">
            <span className="vp-option-icon">✉️</span>
            <span>por correo electrónico</span>
          </button>
        </div>

        <button
          className={`vp-verify-btn ${isComplete ? "vp-verify-btn--ready" : ""}`}
          onClick={handleSubmit}
          disabled={loading || !isComplete}
        >
          {loading ? <span className="vp-spinner" /> : "VERIFICAR"}
        </button>

        <button className="vp-back-btn" onClick={onBack}>
          ← Regresar
        </button>
      </div>
    </div>
  );
}