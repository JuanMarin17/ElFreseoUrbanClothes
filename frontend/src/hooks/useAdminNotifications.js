import { useState, useCallback, useRef, useEffect } from "react";

const BASE = import.meta.env.VITE_API_URL ?? "http://46.225.21.146:8080/api/v1";
const MAX_QUEUE = 50;
const RECONNECT_DELAY_MS = 5_000;

/**
 * Conecta los 4 streams SSE de admin con EventSource nativo (sin JWT).
 *   - /stores/{storeId}/notifications/admin/stream   → evento "notification" → NEW_ORDER
 *   - /stores/{storeId}/support/notifications/stream  → evento "new-ticket"
 *   - /stores/{storeId}/reviews/notifications/stream  → evento "new-review"
 *   - /stores/{storeId}/returns/notifications/stream  → evento "new-return"
 */
function getJwt() {
  const j = localStorage.getItem("jwt");
  return j && j !== "null" ? j : null;
}

function sseUrl(path) {
  const jwt = getJwt();
  const url = new URL(`${BASE}${path}`);
  if (jwt) url.searchParams.set("token", jwt);
  return url.toString();
}

export function useAdminNotifications(storeId) {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread]               = useState(0);
  const counterRef = useRef(0);

  const push = useCallback((notif) => {
    counterRef.current += 1;
    const item = { id: counterRef.current, receivedAt: Date.now(), ...notif };
    setNotifications((prev) => [item, ...prev].slice(0, MAX_QUEUE));
    setUnread((n) => n + 1);
  }, []);

  useEffect(() => {
    if (!storeId || storeId === "null" || storeId === "undefined") return;

    const pushRef = { current: push };
    pushRef.current = push;

    let cancelled = false;
    const sources = [];
    const timers   = [];

    // Conecta un stream con reconexión controlada: si el backend responde con
    // error (ej. 504 porque el stream está caído), el EventSource nativo
    // reintenta solo de inmediato y sin límite si no hay onerror — eso inunda
    // la consola con cientos de 504 seguidos. Con esto, reintenta cada 5s.
    const connectStream = (path, eventName, mapToNotif) => {
      if (cancelled) return;
      const source = new EventSource(sseUrl(path));
      sources.push(source);

      source.addEventListener(eventName, (e) => {
        try {
          pushRef.current(mapToNotif(JSON.parse(e.data)));
        } catch { /* ignorar líneas mal formadas */ }
      });

      source.onerror = () => {
        source.close();
        const idx = sources.indexOf(source);
        if (idx !== -1) sources.splice(idx, 1);
        if (!cancelled) {
          timers.push(setTimeout(() => connectStream(path, eventName, mapToNotif), RECONNECT_DELAY_MS));
        }
      };
    };

    connectStream(
      `/stores/${storeId}/notifications/admin/stream`,
      "notification",
      (p) => ({
        type:      p.type      ?? "NEW_ORDER",
        title:     p.title     ?? "Nueva orden",
        message:   p.message   ?? "",
        timestamp: p.timestamp,
        data:      p.data      ?? p,
      }),
    );

    connectStream(
      `/stores/${storeId}/support/notifications/stream`,
      "new-ticket",
      (p) => ({
        type:    "NEW_TICKET",
        title:   "Nuevo ticket de soporte",
        message: p.subject ?? `Ticket #${p.ticketId ?? ""}`,
        data:    p,
      }),
    );

    connectStream(
      `/stores/${storeId}/reviews/notifications/stream`,
      "new-review",
      (p) => ({
        type:    "NEW_REVIEW",
        title:   "Nueva reseña",
        message: `Producto ${p.productId ?? ""} — ${p.rating ?? "?"}★`,
        data:    p,
      }),
    );

    connectStream(
      `/stores/${storeId}/returns/notifications/stream`,
      "new-return",
      (p) => ({
        type:    "NEW_RETURN",
        title:   "Nueva solicitud de devolución",
        message: p.reason ?? `Orden #${p.orderId ?? ""}`,
        data:    p,
      }),
    );

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      sources.forEach((s) => s.close());
    };
  }, [storeId, push]);

  const markAllRead = useCallback(() => setUnread(0), []);
  const clear       = useCallback(() => { setNotifications([]); setUnread(0); }, []);

  return { notifications, unread, markAllRead, clear };
}
