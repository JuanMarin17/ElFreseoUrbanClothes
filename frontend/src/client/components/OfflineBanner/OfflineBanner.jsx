import { useState, useEffect, useRef } from "react";
import { WifiOff, Wifi, AlertTriangle, Gauge } from "lucide-react";
import "./OfflineBanner.css";

const MESSAGES = {
  offline:  { title: "Sin conexión a internet", sub: "Verifica tu red e inténtalo de nuevo" },
  unstable: { title: "Conexión inestable",      sub: "La red está fallando de forma intermitente" },
  slow:     { title: "Conexión lenta",          sub: "Algunas funciones pueden tardar más de lo normal" },
};

const ICONS = { offline: WifiOff, unstable: AlertTriangle, slow: Gauge };

export default function OfflineBanner() {
  const [isOnline,      setIsOnline]      = useState(navigator.onLine);
  const [unstable,      setUnstable]      = useState(false);
  const [slow,          setSlow]          = useState(false);
  const [showReconnect, setShowReconnect] = useState(false);
  const [offlineSince,  setOfflineSince]  = useState(navigator.onLine ? null : Date.now());
  const [elapsed,       setElapsed]       = useState("");

  const toggleTimestamps = useRef([]);
  const unstableTimer    = useRef(null);

  // Detecta caídas/recuperaciones, incluida la red que "parpadea" (inestable)
  useEffect(() => {
    const recordToggle = () => {
      const now = Date.now();
      toggleTimestamps.current = [...toggleTimestamps.current.filter((t) => now - t < 15000), now];
      const flapping = toggleTimestamps.current.length >= 4;
      if (flapping) {
        setUnstable(true);
        clearTimeout(unstableTimer.current);
        unstableTimer.current = setTimeout(() => setUnstable(false), 6000);
      }
      return flapping;
    };

    const goOffline = () => {
      recordToggle();
      setIsOnline(false);
      setShowReconnect(false);
      setOfflineSince(Date.now());
    };

    const goOnline = () => {
      const flapping = recordToggle();
      setIsOnline(true);
      setOfflineSince(null);
      setElapsed("");
      if (!flapping) {
        setShowReconnect(true);
        setTimeout(() => setShowReconnect(false), 3000);
      }
    };

    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
      clearTimeout(unstableTimer.current);
    };
  }, []);

  // Detecta red de baja calidad (Network Information API — Chrome/Edge/Android)
  useEffect(() => {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!conn) return;
    const evaluate = () => {
      const { effectiveType, downlink } = conn;
      setSlow(
        effectiveType === "slow-2g" ||
        effectiveType === "2g" ||
        (typeof downlink === "number" && downlink > 0 && downlink < 0.5)
      );
    };
    evaluate();
    conn.addEventListener("change", evaluate);
    return () => conn.removeEventListener("change", evaluate);
  }, []);

  // Contador de tiempo sin conexión
  useEffect(() => {
    if (!offlineSince) return;
    const tick = () => {
      const sec = Math.floor((Date.now() - offlineSince) / 1000);
      if (sec < 60) setElapsed(`${sec}s`);
      else if (sec < 3600) setElapsed(`${Math.floor(sec / 60)}m ${sec % 60}s`);
      else setElapsed(`${Math.floor(sec / 3600)}h`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [offlineSince]);

  const status  = unstable ? "unstable" : !isOnline ? "offline" : slow ? "slow" : "online";
  const visible = status !== "online";
  const Icon    = ICONS[status] || WifiOff;
  const msg     = MESSAGES[status] || MESSAGES.offline;

  return (
    <>
      {/* Banner inferior — persiste mientras la red no esté completamente sana */}
      <div
        className={`offline-banner offline-banner--${status}${visible ? " offline-banner--visible" : ""}`}
        role="alert"
        aria-live="assertive"
      >
        <span className="offline-banner__icon-wrap">
          <Icon size={16} className="offline-banner__icon" />
          <span className="offline-banner__icon-ring" />
        </span>
        <span className="offline-banner__text">{msg.title}</span>
        <span className="offline-banner__sub">
          {msg.sub}
          {status === "offline" && elapsed && <span className="offline-banner__elapsed"> · {elapsed}</span>}
        </span>
      </div>

      {/* Toast de reconexión — aparece brevemente */}
      <div className={`offline-reconnect${showReconnect ? " offline-reconnect--visible" : ""}`} role="status">
        <span className="offline-reconnect__icon-wrap">
          <Wifi size={15} className="offline-reconnect__icon" />
        </span>
        <span>Conexión restaurada</span>
      </div>
    </>
  );
}
