import { useEffect, useRef, useCallback, useState } from "react";
import {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../utils/notificationService";

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
        "STORE_DISABLED",
        "STORE_ENABLED",
      ]);
      if (!VISIBLE.has(event?.type)) return;

      counterRef.current += 1;
      const id = counterRef.current;

      // El contador local garantiza un id único para el dismiss del toast,
      // independiente del id persistido que ahora trae el evento del backend.
      setToasts((prev) => [...prev.slice(-(MAX_TOASTS - 1)), { ...event, id }]);

      // SESSION_ALERT y STORE_DISABLED duran más para que el usuario pueda leerlas
      const LONG_TTL = new Set(["SESSION_ALERT", "STORE_DISABLED"]);
      const ttl = LONG_TTL.has(event.type) ? 12_000 : 6_000;
      setTimeout(() => dismiss(id), ttl);
    }, [dismiss]),
  });

  return { toasts, dismiss };
}

/* ────────────────────────────────────────────────────────────────────────────
   Bandeja persistida: historial real (GET) + tiempo real (SSE) + leído/no leído
──────────────────────────────────────────────────────────────────────────── */

export function useNotificationInbox() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]              = useState(true);
  const [error, setError]                  = useState(null);

  const userId = getUserId();

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    let active = true;
    setLoading(true);
    setError(null);

    getUserNotifications(userId)
      .then((data) => {
        if (!active) return;
        setNotifications(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (active) setError(err.message ?? "No se pudieron cargar las notificaciones.");
      })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [userId]);

  // Eventos en vivo: se prepend-ean a la lista en vez de volver a pedir el historial.
  useUserNotifications({
    enabled: !!userId,
    onNotification: useCallback((event) => {
      if (!event?.id) return;
      setNotifications((prev) => {
        if (prev.some((n) => n.id === event.id)) return prev;
        return [{ ...event, read: false }, ...prev];
      });
    }, []),
  });

  const markRead = useCallback(async (notificationId) => {
    try {
      await markNotificationRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
      );
    } catch (err) {
      console.error("Error al marcar notificación como leída:", err);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    if (!userId) return;
    try {
      await markAllNotificationsRead(userId);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Error al marcar todas las notificaciones como leídas:", err);
    }
  }, [userId]);

  const unread = notifications.filter((n) => !n.read).length;

  return { notifications, unread, loading, error, markRead, markAllRead };
}
