import { useState, useEffect, useCallback } from 'react';
import { WifiOff, Wifi, RefreshCw, X } from 'lucide-react';
import './OfflineBanner.css';

export default function OfflineBanner() {
  const [isOnline,   setIsOnline]   = useState(navigator.onLine);
  const [showBack,   setShowBack]   = useState(false);
  const [dismissed,  setDismissed]  = useState(false);
  const [retrying,   setRetrying]   = useState(false);
  const [offlineSince, setOfflineSince] = useState(null);
  const [elapsed,    setElapsed]    = useState('');

  useEffect(() => {
    const goOffline = () => {
      setIsOnline(false);
      setShowBack(false);
      setDismissed(false);
      setOfflineSince(Date.now());
    };
    const goOnline = () => {
      setIsOnline(true);
      setShowBack(true);
      setOfflineSince(null);
      setElapsed('');
      const t = setTimeout(() => setShowBack(false), 4000);
      return () => clearTimeout(t);
    };
    window.addEventListener('offline', goOffline);
    window.addEventListener('online',  goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online',  goOnline);
    };
  }, []);

  // Contador de tiempo sin conexión
  useEffect(() => {
    if (!offlineSince) return;
    const tick = () => {
      const sec = Math.floor((Date.now() - offlineSince) / 1000);
      if (sec < 60)       setElapsed(`${sec}s`);
      else if (sec < 3600) setElapsed(`${Math.floor(sec / 60)}m ${sec % 60}s`);
      else                setElapsed(`${Math.floor(sec / 3600)}h`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [offlineSince]);

  const retry = useCallback(() => {
    setRetrying(true);
    setTimeout(() => {
      setRetrying(false);
      if (navigator.onLine) {
        setIsOnline(true);
        setShowBack(true);
        setOfflineSince(null);
        setTimeout(() => setShowBack(false), 4000);
      }
    }, 1500);
  }, []);

  if ((isOnline && !showBack) || dismissed) return null;

  if (showBack) {
    return (
      <div className="ob ob--on" role="status">
        <div className="ob__icon-wrap ob__icon-wrap--on">
          <Wifi size={18} />
        </div>
        <div className="ob__text">
          <span className="ob__title">Conexión restablecida</span>
          <span className="ob__sub">Ya puedes usar todas las funciones</span>
        </div>
        <div className="ob__progress-bar" />
      </div>
    );
  }

  return (
    <div className="ob ob--off" role="alert">
      {/* Icono animado */}
      <div className="ob__icon-wrap ob__icon-wrap--off">
        <WifiOff size={20} />
        <span className="ob__icon-ring" />
      </div>

      {/* Texto */}
      <div className="ob__text">
        <span className="ob__title">Sin conexión a internet</span>
        <span className="ob__sub">
          Algunas funciones no estarán disponibles
          {elapsed && <span className="ob__elapsed"> · {elapsed}</span>}
        </span>
      </div>

      {/* Acciones */}
      <div className="ob__actions">
        <button
          className={`ob__retry ${retrying ? 'ob__retry--spinning' : ''}`}
          onClick={retry}
          disabled={retrying}
          aria-label="Reintentar conexión"
        >
          <RefreshCw size={13} />
          <span>{retrying ? 'Verificando…' : 'Reintentar'}</span>
        </button>
        <button
          className="ob__close"
          onClick={() => setDismissed(true)}
          aria-label="Cerrar"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
