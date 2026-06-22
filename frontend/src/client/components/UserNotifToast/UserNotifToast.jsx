import React from "react";
import { CheckCircle, XCircle, Clock, ShieldAlert, Ban, Store, X, MessageCircle, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserNotifToasts } from "../../../hooks/useUserNotifications";
import "./UserNotifToast.css";

const TYPE_CONFIG = {
  ORDER_STATUS_CHANGED:   { icon: Clock,          color: "#f59e0b", label: "Estado de orden",      path: (d) => d?.orderId  ? `/cuenta/pedidos` : `/cuenta/pedidos` },
  ORDER_CANCELLED:        { icon: XCircle,        color: "#ef4444", label: "Orden cancelada",      path: (d) => `/cuenta/pedidos` },
  PAYMENT_RESULT:         { icon: CheckCircle,    color: "#22c55e", label: "Resultado de pago",    path: (d) => `/cuenta/pedidos` },
  SUPPORT_TICKET_REPLIED: { icon: MessageCircle,  color: "#6366f1", label: "Ticket respondido",    path: (d) => d?.ticketId ? `/cuenta/soporte/${d.ticketId}` : `/cuenta/soporte` },
  SUPPORT_TICKET_CLOSED:  { icon: MessageCircle,  color: "#94a3b8", label: "Ticket cerrado",       path: (d) => d?.ticketId ? `/cuenta/soporte/${d.ticketId}` : `/cuenta/soporte` },
  SESSION_ALERT:          { icon: ShieldAlert,    color: "#f97316", label: "Alerta de seguridad",  path: ()  => `/cuenta/seguridad` },
  STORE_DISABLED:         { icon: Ban,            color: "#ef4444", label: "Tienda inhabilitada",  path: ()  => null },
  STORE_ENABLED:          { icon: Store,          color: "#22c55e", label: "Tienda habilitada",    path: ()  => null },
};

function UserToastItem({ toast, onDismiss }) {
  const navigate  = useNavigate();
  const cfg       = TYPE_CONFIG[toast.type] ?? TYPE_CONFIG.ORDER_STATUS_CHANGED;
  const Icon      = cfg.icon;
  const isPayment = toast.type === "PAYMENT_RESULT";
  const approved  = toast.data?.status === "APPROVED";
  const color     = isPayment ? (approved ? "#22c55e" : "#ef4444") : cfg.color;
  const clickPath = cfg.path?.(toast.data);

  const sessionDetail = toast.type === "SESSION_ALERT"
    ? [toast.data?.device, toast.data?.ip, toast.data?.location].filter(Boolean).join(" · ")
    : null;
  const disableReason = toast.type === "STORE_DISABLED"
    ? (toast.data?.reason ?? toast.data?.disabledReason ?? toast.reason ?? null)
    : null;

  const handleClick = () => {
    if (clickPath) { navigate(clickPath); onDismiss(toast.id); }
  };

  return (
    <div
      className={`unt-item${clickPath ? " unt-item--clickable" : ""}`}
      style={{ "--unt-color": color }}
      onClick={handleClick}
      role={clickPath ? "button" : undefined}
    >
      <div className="unt-icon"><Icon size={16} /></div>
      <div className="unt-body">
        <p className="unt-label">{cfg.label}</p>
        <p className="unt-title">{toast.title}</p>
        {toast.message && <p className="unt-msg">{toast.message}</p>}
        {sessionDetail && <p className="unt-msg unt-msg--mono">{sessionDetail}</p>}
        {disableReason && <p className="unt-msg">Motivo: {disableReason}</p>}
      </div>
      <button className="unt-close" onClick={(e) => { e.stopPropagation(); onDismiss(toast.id); }} aria-label="Cerrar">
        <X size={13} />
      </button>
      <div className="unt-progress" />
    </div>
  );
}

/**
 * Muestra toasts de notificaciones SSE para el usuario autenticado.
 * Montar este componente solo cuando el usuario está logueado.
 */
export default function UserNotifToast({ enabled = true }) {
  const { toasts, dismiss } = useUserNotifToasts(enabled);
  if (!toasts.length) return null;

  return (
    <div className="unt-stack">
      {toasts.map((t) => (
        <UserToastItem key={t.id} toast={t} onDismiss={dismiss} />
      ))}
    </div>
  );
}
