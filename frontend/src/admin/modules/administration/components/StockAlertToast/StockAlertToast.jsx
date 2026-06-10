import { useState, useCallback } from "react";
import { useStockAlerts } from "../../../../../hooks/useStockAlerts";
import { AlertTriangle, X } from "lucide-react";
import "./StockAlertToast.css";

/**
 * Componente que escucha SSE y muestra toasts de stock bajo.
 * Montar una sola vez dentro del layout del admin de la tienda.
 */
export default function StockAlertToast() {
  const [alerts, setAlerts] = useState([]);

  const handleAlert = useCallback((alert) => {
    const id = `${alert.variantId}-${Date.now()}`;
    setAlerts((prev) => [...prev.slice(-4), { ...alert, id }]); // máx 5 visibles

    // Auto-cerrar tras 8 segundos
    setTimeout(() => {
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    }, 8_000);
  }, []);

  useStockAlerts(handleAlert);

  if (!alerts.length) return null;

  return (
    <div className="sat-container">
      {alerts.map((alert) => (
        <div key={alert.id} className="sat-toast">
          <AlertTriangle size={16} className="sat-icon" />
          <div className="sat-body">
            <p className="sat-title">Stock bajo — {alert.productName}</p>
            <p className="sat-desc">
              <strong>{alert.sku}</strong>: {alert.currentStock} unidad{alert.currentStock !== 1 ? "es" : ""} (mín. {alert.minStock})
            </p>
          </div>
          <button
            className="sat-close"
            onClick={() => setAlerts((prev) => prev.filter((a) => a.id !== alert.id))}
          >
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}
