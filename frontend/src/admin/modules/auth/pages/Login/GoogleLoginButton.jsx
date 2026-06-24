import { useEffect, useRef, useState } from "react";

const SCRIPT_SRC = "https://accounts.google.com/gsi/client";
let scriptPromise = null;

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
export default function GoogleLoginButton({ onSuccess, onError, disabled }) {
  const buttonRef = useRef(null);
  const [ready, setReady] = useState(false);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Refs para no reinicializar Google Identity Services en cada render del padre
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef   = useRef(onError);
  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current   = onError;
  }, [onSuccess, onError]);

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
      .catch((err) => onErrorRef.current?.(err.message));
    return () => {
      cancelled = true;
    };
  }, [clientId]);

  useEffect(() => {
    if (!ready || !buttonRef.current) return;
    buttonRef.current.innerHTML = "";
    window.google.accounts.id.renderButton(buttonRef.current, {
      type: "standard",
      theme: "filled_black",
      size: "large",
      shape: "pill",
      text: "continue_with",
      logo_alignment: "center",
      width: 300,
    });
  }, [ready]);

  if (!clientId) return null;

  return (
    <div
      className={`g-login-btn-wrap${disabled ? " g-login-btn-wrap--disabled" : ""}`}
      ref={buttonRef}
    />
  );
}
