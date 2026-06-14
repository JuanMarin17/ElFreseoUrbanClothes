import { useEffect, useRef, useCallback } from "react";

const BASE = import.meta.env.VITE_API_URL ?? "http://46.225.21.146:8080/api/v1";
const RECONNECT_DELAY_MS = 5_000;

/**
 * Escucha alertas de stock bajo en tiempo real via SSE.
 * Evento nombrado: 'stock-alert'
 * Requiere storeId para filtrar el stream de la tienda.
 *
 * @param {(alert: object) => void} onAlert
 * @param {boolean} [enabled=true]
 */
export function useStockAlerts(onAlert, enabled = true) {
  const sourceRef   = useRef(null);
  const timerRef    = useRef(null);
  const onAlertRef  = useRef(onAlert);
  onAlertRef.current = onAlert;

  const disconnect = useCallback(() => {
    clearTimeout(timerRef.current);
    sourceRef.current?.close();
    sourceRef.current = null;
  }, []);

  const connect = useCallback(() => {
    if (sourceRef.current) return;

    const storeId = localStorage.getItem("storeId");
    if (!storeId || storeId === "null") return;

    const source = new EventSource(
      `${BASE}/alerts/stock/stream/${storeId}`,
      { withCredentials: true },
    );
    sourceRef.current = source;

    source.addEventListener("stock-alert", (e) => {
      try {
        const alert = JSON.parse(e.data);
        onAlertRef.current?.(alert);
      } catch { /* ignorar mensajes mal formados */ }
    });

    source.onerror = () => {
      source.close();
      sourceRef.current = null;
      timerRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
    };
  }, []);

  useEffect(() => {
    if (!enabled) { disconnect(); return; }
    connect();
    return disconnect;
  }, [enabled, connect, disconnect]);
}
