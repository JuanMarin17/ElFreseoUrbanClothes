import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { getMyOrders } from "../services/orderService.js";
import "./MyOrders.css";

const isLoggedIn = () => {
  const jwt = localStorage.getItem("jwt");
  return !!jwt && jwt !== "null";
};

const formatCOP = (n) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", minimumFractionDigits: 0,
  }).format(n ?? 0);

const formatDate = (d) => {
  if (!d) return "—";
  try {
    return new Date(`${d}-05:00`).toLocaleDateString("es-CO", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch { return d; }
};

const STATUS_INFO = {
  PENDING:    { label: "Pendiente",    cls: "mo-badge--warning" },
  CONFIRMED:  { label: "Confirmada",   cls: "mo-badge--info" },
  PROCESSING: { label: "En proceso",   cls: "mo-badge--info" },
  SHIPPED:    { label: "Enviada",      cls: "mo-badge--info" },
  DELIVERED:  { label: "Entregada",    cls: "mo-badge--success" },
  CANCELLED:  { label: "Cancelada",    cls: "mo-badge--danger" },
  REFUNDED:   { label: "Reembolsada",  cls: "mo-badge--danger" },
};

export default function MyOrders() {
  const { slug }  = useParams();
  const navigate  = useNavigate();
  const location  = useLocation();
  const storeId   = localStorage.getItem("storeId");

  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!isLoggedIn()) { navigate("/login"); return; }
    const load = async () => {
      if (!storeId) { setError("No se encontró la tienda."); setLoading(false); return; }
      setLoading(true);
      setError(null);
      try {
        const data = await getMyOrders(storeId);
        setOrders(Array.isArray(data) ? data : data?.content ?? []);
      } catch (err) {
        setError(err.message ?? "No se pudieron cargar tus pedidos.");
      } finally {
        setLoading(false);
      }
    };
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId, location.key]);

  return (
    <div className="mo-root">
      <div className="mo-topbar">
        <button
          className="mo-back"
          onClick={() => slug ? navigate(`/tienda/${slug}`) : navigate(-1)}
        >
          ← Volver a la tienda
        </button>
        <span className="mo-brand">VEXIO</span>
      </div>

      <div className="mo-page">
        <div className="mo-header">
          <h1 className="mo-title">Mis pedidos</h1>
          {!loading && !error && (
            <span className="mo-count">{orders.length} pedido{orders.length !== 1 ? "s" : ""}</span>
          )}
        </div>

        {loading ? (
          <div className="mo-state">
            <div className="mo-spinner" />
            <span>Cargando pedidos...</span>
          </div>
        ) : error ? (
          <div className="mo-state mo-state--error">{error}</div>
        ) : orders.length === 0 ? (
          <div className="mo-empty">
            <div className="mo-empty__icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
            </div>
            <p className="mo-empty__title">Aún no tienes pedidos</p>
            <p className="mo-empty__sub">Cuando realices una compra, aparecerá aquí.</p>
            <button className="mo-btn-store" onClick={() => navigate(`/tienda/${slug}`)}>
              Ver productos
            </button>
          </div>
        ) : (
          <div className="mo-list">
            {orders.map((order) => {
              const statusInfo = STATUS_INFO[order.status] ?? { label: order.status, cls: "mo-badge--info" };
              return (
                <div
                  key={order.id}
                  className="mo-card"
                  onClick={() => navigate(`/tienda/${slug}/orders/${order.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && navigate(`/tienda/${slug}/orders/${order.id}`)}
                >
                  <div className="mo-card__top">
                    <div>
                      <p className="mo-card__number">{order.orderNumber}</p>
                      <p className="mo-card__date">{formatDate(order.createdAt)}</p>
                    </div>
                    <span className={`mo-badge ${statusInfo.cls}`}>{statusInfo.label}</span>
                  </div>

                  <div className="mo-card__items">
                    {(order.items ?? []).slice(0, 2).map((item, i) => (
                      <span key={i} className="mo-card__item-chip">
                        {item.productName} ×{item.quantity}
                      </span>
                    ))}
                    {(order.items?.length ?? 0) > 2 && (
                      <span className="mo-card__item-chip mo-card__item-chip--more">
                        +{order.items.length - 2} más
                      </span>
                    )}
                  </div>

                  <div className="mo-card__footer">
                    <span className="mo-card__total">{formatCOP(order.total)}</span>
                    <span className="mo-card__cta">Ver detalle →</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
