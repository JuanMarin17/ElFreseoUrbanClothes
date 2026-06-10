import { useEffect, useRef, useCallback } from "react";

const SSE_URL = `${import.meta.env.VITE_API_URL ?? "http://localhost:8080/api/v1"}/alerts/stock/stream`;

const SSE_URL = "http://46.225.21.146:8080/api/v1/alerts/stock/stream";

const RECONNECT_DELAY_MS = 5_000;

/**
 * Hook que escucha alertas de stock bajo en tiempo real via SSE.
 * La ruta /alerts/stock/stream es pública — no requiere JWT.
 *
 * @param {(alert: StockAlert) => void} onAlert  Callback que recibe cada alerta
 * @param {boolean} [enabled=true]               Activar/desactivar la conexión
 *
 * @typedef {{ variantId, sku, productName, currentStock, minStock }} StockAlert
 */
export function useStockAlerts(onAlert, enabled = true) {
  const sourceRef = useRef(null);
  const timerRef = useRef(null);
  const onAlertRef = useRef(onAlert);
  onAlertRef.current = onAlert; // siempre apunta al callback más reciente

  const disconnect = useCallback(() => {
    clearTimeout(timerRef.current);
    sourceRef.current?.close();
    sourceRef.current = null;
  }, []);

  const connect = useCallback(() => {
    if (sourceRef.current) return; // ya conectado

    const source = new EventSource(SSE_URL);
    sourceRef.current = source;

    source.onmessage = (e) => {
      try {
        const alert = JSON.parse(e.data);
        onAlertRef.current?.(alert);
      } catch {
        // ignorar mensajes mal formados
      }
    };

    source.onerror = () => {
      source.close();
      sourceRef.current = null;
      // Reconectar automáticamente tras el delay
      timerRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      disconnect();
      return;
    }
    connect();
    return disconnect;
  }, [enabled, connect, disconnect]);
}
