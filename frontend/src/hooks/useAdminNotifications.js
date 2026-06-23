import { useState, useCallback, useRef, useEffect } from "react";

const BASE = import.meta.env.VITE_API_URL ?? "http://46.225.21.146:8080/api/v1";
const MAX_QUEUE = 50;

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

    // ── Stream 1: Órdenes ─────────────────────────────────────────────────
    const esOrders = new EventSource(
      sseUrl(`/stores/${storeId}/notifications/admin/stream`),
    );
    esOrders.addEventListener("notification", (e) => {
      try {
        const p = JSON.parse(e.data);
        push({
          type:      p.type      ?? "NEW_ORDER",
          title:     p.title     ?? "Nueva orden",
          message:   p.message   ?? "",
          timestamp: p.timestamp,
          data:      p.data      ?? p,
        });
      } catch { /* ignorar líneas mal formadas */ }
    });

    // ── Stream 2: Soporte ─────────────────────────────────────────────────
    const esSupport = new EventSource(
      sseUrl(`/stores/${storeId}/support/notifications/stream`),
    );
    esSupport.addEventListener("new-ticket", (e) => {
      try {
        const p = JSON.parse(e.data);
        push({
          type:    "NEW_TICKET",
          title:   "Nuevo ticket de soporte",
          message: p.subject ?? `Ticket #${p.ticketId ?? ""}`,
          data:    p,
        });
      } catch { }
    });

    // ── Stream 3: Reseñas ─────────────────────────────────────────────────
    const esReviews = new EventSource(
      sseUrl(`/stores/${storeId}/reviews/notifications/stream`),
    );
    esReviews.addEventListener("new-review", (e) => {
      try {
        const p = JSON.parse(e.data);
        push({
          type:    "NEW_REVIEW",
          title:   "Nueva reseña",
          message: `Producto ${p.productId ?? ""} — ${p.rating ?? "?"}★`,
          data:    p,
        });
      } catch { }
    });

    // ── Stream 4: Devoluciones ───────────────────────────────────────────
    const esReturns = new EventSource(
      sseUrl(`/stores/${storeId}/returns/notifications/stream`),
    );
    esReturns.addEventListener("new-return", (e) => {
      try {
        const p = JSON.parse(e.data);
        push({
          type:    "NEW_RETURN",
          title:   "Nueva solicitud de devolución",
          message: p.reason ?? `Orden #${p.orderId ?? ""}`,
          data:    p,
        });
      } catch { }
    });

    return () => {
      esOrders.close();
      esSupport.close();
      esReviews.close();
      esReturns.close();
    };
  }, [storeId, push]);

  const markAllRead = useCallback(() => setUnread(0), []);
  const clear       = useCallback(() => { setNotifications([]); setUnread(0); }, []);

  return { notifications, unread, markAllRead, clear };
}
