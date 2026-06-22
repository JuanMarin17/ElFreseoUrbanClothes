import { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";
import "./OfflineBanner.css";

export default function OfflineBanner() {
  const [offline,       setOffline]       = useState(!navigator.onLine);
  const [showReconnect, setShowReconnect] = useState(false);

  useEffect(() => {
    const goOffline = () => setOffline(true);
    const goOnline  = () => {
      setOffline(false);
      setShowReconnect(true);
      setTimeout(() => setShowReconnect(false), 3000);
    };

    window.addEventListener("offline", goOffline);
    window.addEventListener("online",  goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online",  goOnline);
    };
  }, []);

  return (
    <>
      {/* Banner inferior — persiste mientras no hay conexión */}
      <div className={`offline-banner${offline ? " offline-banner--visible" : ""}`} role="alert" aria-live="assertive">
        <WifiOff size={16} className="offline-banner__icon" />
        <span className="offline-banner__text">Sin conexión a internet</span>
        <span className="offline-banner__sub">Verifica tu red e inténtalo de nuevo</span>
      </div>

      {/* Toast de reconexión — aparece brevemente */}
      <div className={`offline-reconnect${showReconnect ? " offline-reconnect--visible" : ""}`} role="status">
        <Wifi size={15} className="offline-reconnect__icon" />
        <span>Conexión restaurada</span>
      </div>
    </>
  );
}
