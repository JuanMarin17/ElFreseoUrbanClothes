import React from "react";
import { CheckCircle, XCircle, Clock, ShieldAlert, X } from "lucide-react";
import { useUserNotifToasts } from "../../../hooks/useUserNotifications";
import "./UserNotifToast.css";

const TYPE_CONFIG = {
  ORDER_STATUS_CHANGED: { icon: Clock,        color: "#f59e0b", label: "Estado de orden"    },
  ORDER_CANCELLED:      { icon: XCircle,      color: "#ef4444", label: "Orden cancelada"    },
  PAYMENT_RESULT:       { icon: CheckCircle,  color: "#22c55e", label: "Resultado de pago"  },
  SESSION_ALERT:        { icon: ShieldAlert,  color: "#f97316", label: "Alerta de seguridad" },
};

function UserToastItem({ toast, onDismiss }) {
  const cfg  = TYPE_CONFIG[toast.type] ?? TYPE_CONFIG.ORDER_STATUS_CHANGED;
  const Icon = cfg.icon;
  const isPayment = toast.type === "PAYMENT_RESULT";
  const approved  = toast.data?.status === "APPROVED";
  const color     = isPayment ? (approved ? "#22c55e" : "#ef4444") : cfg.color;

  // Para SESSION_ALERT mostramos dispositivo + IP si vienen en data
  const sessionDetail = toast.type === "SESSION_ALERT"
    ? [toast.data?.device, toast.data?.ip, toast.data?.location]
        .filter(Boolean).join(" · ")
    : null;

  return (
    <div className="unt-item" style={{ "--unt-color": color }}>
      <div className="unt-icon"><Icon size={16} /></div>
      <div className="unt-body">
        <p className="unt-label">{cfg.label}</p>
        <p className="unt-title">{toast.title}</p>
        {toast.message && <p className="unt-msg">{toast.message}</p>}
        {sessionDetail && <p className="unt-msg unt-msg--mono">{sessionDetail}</p>}
      </div>
      <button className="unt-close" onClick={() => onDismiss(toast.id)} aria-label="Cerrar">
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
