import { useEffect, useRef, useCallback, useState } from "react";

const BASE = import.meta.env.VITE_API_URL ?? "http://46.225.21.146:8080/api/v1";

function getUserId() {
  try {
    const jwt = localStorage.getItem("jwt");
    if (!jwt || jwt === "null") return null;
    return JSON.parse(atob(jwt.split(".")[1])).user_id ?? null;
  } catch {
    return null;
  }
}

/**
 * Conecta al stream SSE público del usuario.
 * Endpoint: GET /notifications/user/{userId}/stream
 * No requiere JWT en header — usa EventSource nativo.
 *
 * @param {object}   options
 * @param {Function} options.onNotification - (event) => void
 * @param {boolean}  options.enabled
 */
export function useUserNotifications({ onNotification, enabled = true } = {}) {
  const onNotifRef = useRef(onNotification);
  onNotifRef.current = onNotification;

  useEffect(() => {
    if (!enabled) return;
    const userId = getUserId();
    if (!userId) return;

    const es = new EventSource(`${BASE}/notifications/user/${userId}/stream`);

    es.onmessage = (e) => {
      try { onNotifRef.current?.(JSON.parse(e.data)); } catch { }
    };

    // EventSource reconecta automáticamente en onerror — no hacer nada extra
    return () => es.close();
  }, [enabled]);
}

/* ────────────────────────────────────────────────────────────────────────────
   Hook de más alto nivel: gestiona toasts para el usuario autenticado
──────────────────────────────────────────────────────────────────────────── */

const MAX_TOASTS = 5;

export function useUserNotifToasts(enabled = true) {
  const [toasts, setToasts] = useState([]);
  const counterRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useUserNotifications({
    enabled,
    onNotification: useCallback((event) => {
      const VISIBLE = new Set([
        "ORDER_STATUS_CHANGED",
        "ORDER_CANCELLED",
        "PAYMENT_RESULT",
        "SESSION_ALERT",
      ]);
      if (!VISIBLE.has(event?.type)) return;

      counterRef.current += 1;
      const id = counterRef.current;

      setToasts((prev) => [...prev.slice(-(MAX_TOASTS - 1)), { id, ...event }]);

      // SESSION_ALERT dura más para que el usuario pueda leerla
      const ttl = event.type === "SESSION_ALERT" ? 12_000 : 6_000;
      setTimeout(() => dismiss(id), ttl);
    }, [dismiss]),
  });

  return { toasts, dismiss };
}
