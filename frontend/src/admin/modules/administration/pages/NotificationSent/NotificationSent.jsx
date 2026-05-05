import React from "react";
import { toast } from "react-toastify";
import "./NotificationSent.css";
 

 export default function handleSubmit() {
  e.preventDefault();

  // aquí iría tu lógica backend

  toast.success("📩 Se envió una notificación al correo", {
    position: "top-right",
    autoClose: 3000,
    className: "custom-toast",
  });
};
