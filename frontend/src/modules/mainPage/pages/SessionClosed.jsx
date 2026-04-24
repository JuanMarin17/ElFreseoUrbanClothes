import { useState, useEffect, useRef } from "react";
import "./SessionClosed.css";
import logo from "../../../assets/logo.png";



const PARTICLE_DATA = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  bottom: `${Math.random() * 10}%`,
  size: 2 + Math.random() * 4,
  color:
    Math.random() > 0.5
      ? `rgba(139,60,247,${0.4 + Math.random() * 0.4})`
      : `rgba(245,200,66,${0.3 + Math.random() * 0.3})`,
  dur: `${5 + Math.random() * 8}s`,
  del: `${Math.random() * 8}s`,
}));
function SessionClosed() {
  const REDIRECT_SECS = 50;
  const [secs, setSecs] = useState(REDIRECT_SECS);
  const [redirected, setRedirected] = useState(false);
  const interval = useRef(null);

  useEffect(() => {
    interval.current = setInterval(() => {
      setSecs((s) => {
        if (s <= 1) {
          clearInterval(interval.current);
          setRedirected(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval.current);
  }, []);

  function handleLogin() {
    clearInterval(interval.current);
    setRedirected(true);
  }

  function handleStay() {
    clearInterval(interval.current);
    setSecs(null); // stop countdown
  }

  // Format current time
  const now = new Date();
  const timeStr = now.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateStr = now.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const pct = secs !== null ? (secs / REDIRECT_SECS) * 100 : 0;

  if (redirected) {
    return (
      <>
        <div className="scene">
          <div className="orb o1" />
          <div className="orb o2" />
          <div className="orb o3" />
          <div
            className="card"
            style={{ textAlign: "center", padding: "60px 40px" }}
          >
            <div
              style={{
                fontSize: 52,
                marginBottom: 20,
                animation: "lockShake 1s ease",
              }}
            >
              ✅
            </div>
            <div className="session-title">Redirigiendo…</div>
            <p className="session-sub" style={{ marginTop: 12 }}>
              Llevándote al inicio de sesión.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="scene">
        {/* Ambient */}
        <div className="orb o1" />
        <div className="orb o2" />
        <div className="orb o3" />

        {/* Particles */}
        <div className="particles">
          {PARTICLE_DATA.map((p) => (
            <div
              key={p.id}
              className="particle"
              style={{
                left: p.left,
                bottom: p.bottom,
                width: p.size,
                height: p.size,
                background: p.color,
                "--dur": p.dur,
                "--del": p.del,
              }}
            />
          ))}
        </div>

        {/* ── CARD ── */}
        <div className="card">
          {/* TOP */}
          <div className="card-top">
            {/* Ring system */}
            <div className="rings">
              <div className="ring ring-1" />
              <div className="ring ring-2" />
              <div className="ring ring-3" />
              <div className="lock-center">
                <div className="lock-bg">
                  <span className="lock-icon">
                    <img src={logo} alt="" />
                  </span>
                </div>
              </div>
              <div className="badge">!</div>
            </div>

            <h1 className="session-title">
              Sesión <em>Cerrada</em>
            </h1>
            <p className="session-sub">
              Tu sesión fue cerrada por seguridad. Debes iniciar sesión
              nuevamente para continuar.
            </p>
          </div>

          {/* INFO STRIP */}
          <div className="info-strip">
            <div className="info-row">
              <div className="info-dot dot-red" />
              <span className="info-label">Estado de sesión</span>
              <span className="info-value" style={{ color: "var(--danger)" }}>
                CERRADA
              </span>
            </div>
            <div className="info-row">
              <div className="info-dot dot-gold" />
              <span className="info-label">Hora de cierre</span>
              <span className="info-value">
                {timeStr} — {dateStr}
              </span>
            </div>
            {/* <div className="info-row">
              <div className="info-dot dot-green" />
              <span className="info-label">Conexión segura</span>
              <span className="info-value" style={{ color: "var(--success)" }}>
                ACTIVA
              </span>
            </div> */}
          </div>

          {/* PROGRESS + COUNTDOWN */}
          {secs !== null && (
            <>
              <div className="progress-track" style={{ marginTop: 24 }}>
                <div className="progress-fill" style={{ width: `${pct}%` }} />
              </div>
              <div className="countdown-wrap">
                <span>Redirigiendo en</span>
                <span className="countdown-num">{secs}</span>
                <span>segundos…</span>
              </div>
            </>
          )}

          {/* ACTIONS */}
          <div className="actions">
            <button className="btn btn-primary" onClick={handleLogin}>
              <span>🔑</span> Iniciar Sesión
            </button>
            {/* <button className="btn btn-ghost" onClick={handleStay}>
              Quedarse en esta página
            </button> */}
          </div>
        </div>
      </div>
    </>
  );
}
export default SessionClosed;
