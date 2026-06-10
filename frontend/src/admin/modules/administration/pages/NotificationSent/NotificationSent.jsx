// NotificationSent.jsx
import React from "react";
import { toast } from "react-toastify";
import "./NotificationSent.css";

/**
 * Llama a esta función desde el onSubmit de tu formulario:
 *
 *   import { notifySuccess } from "./NotificationSent";
 *   <form onSubmit={notifySuccess}> ... </form>
 *
 * O renderiza el botón directamente con <NotificationSent />
 */
export function notifySuccess(e) {
  if (e?.preventDefault) e.preventDefault();

  toast.success("📩 Se envió una notificación al correo", {
    position: "top-right",
    autoClose: 3000,
    className: "custom-toast",
  });
}

export default function NotificationSent() {
  return (
    <button type="button" onClick={notifySuccess} className="notif-btn">
      Enviar notificación
    </button>
  );
}