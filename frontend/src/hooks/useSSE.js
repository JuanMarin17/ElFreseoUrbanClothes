import { useEffect, useRef, useCallback } from "react";

const BASE = import.meta.env.VITE_API_URL ?? "";
const RECONNECT_DELAY_MS = 5_000;

/**
 * Hook genérico para streams SSE públicos (sin Authorization).
 *
 * @param {string|null} path        - Ruta relativa al base URL, ej: "/stores/{id}/notifications/admin/stream"
 * @param {object}      options
 * @param {Function}    options.onMessage  - Callback: (payload) => void
 * @param {string[]}    options.events     - Nombres de eventos SSE con nombre (ej: ['new-ticket'])
 * @param {boolean}     options.enabled    - Activar/desactivar el stream
 */
export function useSSE(path, { onMessage, events = [], enabled = true } = {}) {
  const sourceRef    = useRef(null);
  const timerRef     = useRef(null);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const eventsKey = events.join(",");

  const disconnect = useCallback(() => {
    clearTimeout(timerRef.current);
    sourceRef.current?.close();
    sourceRef.current = null;
  }, []);

  const connect = useCallback(() => {
    if (sourceRef.current || !path) return;

    const source = new EventSource(`${BASE}${path}`);
    sourceRef.current = source;

    // Mensajes genéricos (event: message)
    source.onmessage = (e) => {
      try { onMessageRef.current?.(JSON.parse(e.data)); }
      catch { onMessageRef.current?.(e.data); }
    };

    // Eventos con nombre específico
    events.forEach((name) => {
      source.addEventListener(name, (e) => {
        try {
          onMessageRef.current?.({ _event: name, ...JSON.parse(e.data) });
        } catch {
          onMessageRef.current?.({ _event: name, raw: e.data });
        }
      });
    });

    source.onerror = () => {
      source.close();
      sourceRef.current = null;
      timerRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, eventsKey]);

  useEffect(() => {
    if (!enabled) { disconnect(); return; }
    connect();
    return disconnect;
  }, [enabled, connect, disconnect]);
}
