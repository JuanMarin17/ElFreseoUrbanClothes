import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { isSubscriptionActive } from "../../../../../multi-tenant/pages/services/paymentService.js";

/**
 * SubscriptionGuard
 * Verifica que el tenant tenga suscripción activa antes de mostrar el dashboard.
 * Si no la tiene, redirige a /planes.
 */
export default function SubscriptionGuard() {
  const [status, setStatus] = useState("checking"); // "checking" | "active" | "inactive"
  const tenantId = localStorage.getItem("storeId");

  useEffect(() => {
    if (!tenantId) {
      setStatus("inactive");
      return;
    }
    isSubscriptionActive(tenantId)
      .then((active) => {
        setStatus(active === true || active === "true" ? "active" : "inactive");
      })
      .catch(() => setStatus("inactive"));
  }, [tenantId]);

  if (status === "checking") {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100vh", background: "#080b14", gap: 12,
        fontFamily: "Inter, sans-serif", color: "#475569", fontSize: 14,
      }}>
        <div style={{
          width: 20, height: 20,
          border: "2px solid #1e2230", borderTopColor: "#6366f1",
          borderRadius: "50%", animation: "spin 0.7s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        Verificando suscripción...
      </div>
    );
  }

  if (status === "inactive") {
    return <Navigate to="/planes" replace />;
  }

  return <Outlet />;
}
