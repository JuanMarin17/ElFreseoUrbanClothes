import { useEffect, useRef, useState } from "react";

const SCRIPT_SRC = "https://accounts.google.com/gsi/client";
let scriptPromise = null;

// Logo "G" de Google — el botón nativo de Google Identity Services no permite
// un texto personalizado como "Google" a solas, así que dibujamos nuestra
// propia capa visible y dejamos el botón real (invisible) superpuesto encima
// para que el clic siga abriendo el flujo oficial de Google sin cambios.
function GoogleGIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285
      F4" d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9087-2.2581c-.8059.54-1.8368.8591-3.0477.8591-2.3436 0-4.3282-1.5831-5.0359-3.7104H.9573v2.3318C2.4382 15.9832 5.4818 18 9 18z"/>
      <path fill="#FBBC05" d="M3.9641 10.71c-.1818-.54-.2854-1.1168-.2854-1.71s.1036-1.17.2854-1.71V4.9582H.9573C.3477 6.1731 0 7.5477 0 9s.3477 2.8269.9573 4.0418L3.9641 10.71z"/>
      <path fill="#EA4335" d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.43 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.9641 7.29C4.6718 5.1627 6.6564 3.5795 9 3.5795z"/>
    </svg>
  );
}

function loadGoogleScript() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error("No se pudo cargar Google"));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

// Botón "Continuar con Google" basado en Google Identity Services.
// Requiere VITE_GOOGLE_CLIENT_ID; si no está configurado, no se muestra.
export default function GoogleLoginButton({ onSuccess, onError, onUnavailable, disabled }) {
  const buttonRef = useRef(null);
  const [ready, setReady] = useState(false);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Refs para no reinicializar Google Identity Services en cada render del padre
  const onSuccessRef     = useRef(onSuccess);
  const onErrorRef       = useRef(onError);
  const onUnavailableRef = useRef(onUnavailable);
  useEffect(() => {
    onSuccessRef.current     = onSuccess;
    onErrorRef.current       = onError;
    onUnavailableRef.current = onUnavailable;
  }, [onSuccess, onError, onUnavailable]);

  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;
    loadGoogleScript()
      .then(() => {
        if (cancelled) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response?.credential) onSuccessRef.current(response.credential);
            else onErrorRef.current?.("No se pudo obtener la credencial de Google");
          },
        });
        setReady(true);
      })
      // El script no cargó (bloqueado por un navegador/extensión, sin red, etc.):
      // no es un error de login, es que la opción no está disponible aquí.
      .catch(() => { if (!cancelled) onUnavailableRef.current?.(); });
    return () => {
      cancelled = true;
    };
  }, [clientId]);

  // Ancho del botón = ancho real del contenedor (full-width, igual que el botón ENTRAR),
  // recalculado si la tarjeta cambia de tamaño (responsive / resize de ventana).
  useEffect(() => {
    if (!ready || !buttonRef.current) return;
    let lastWidth = 0;

    const renderGoogleButton = () => {
      const el = buttonRef.current;
      if (!el) return;
      const width = Math.round(el.getBoundingClientRect().width);
      if (!width || Math.abs(width - lastWidth) < 4) return;
      lastWidth = width;
      el.innerHTML = "";
      window.google.accounts.id.renderButton(el, {
        type: "standard",
        theme: "filled_black",
        size: "large",
        shape: "pill",
        text: "continue_with",
        logo_alignment: "center",
        width: Math.min(400, Math.max(220, width)),
      });
    };

    renderGoogleButton();
    const ro = new ResizeObserver(renderGoogleButton);
    ro.observe(buttonRef.current);
    return () => ro.disconnect();
  }, [ready]);

  if (!clientId) return null;

  return (
    <div
      className={`g-login-btn-shell${ready ? " g-login-btn-shell--ready" : ""}${disabled ? " g-login-btn-shell--disabled" : ""}`}
    >
      <div className="g-login-btn-visible" aria-hidden="true">
        <GoogleGIcon />
        <span>Google</span>
      </div>
      {/* Botón real de Google Identity Services: invisible pero clickeable,
          superpuesto encima para no romper el flujo oficial de login. */}
      <div className="g-login-btn-real" ref={buttonRef} />
    </div>
  );
}
