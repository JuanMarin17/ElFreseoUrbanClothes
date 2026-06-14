import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSubscription,
  getTransactionHistory,
  getPlanHistory,
  cancelSubscription,
} from "../../../../../multi-tenant/pages/services/transactionService.js";
import "./Subscription.css";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const formatDateTime = (d) =>
  d
    ? new Date(d).toLocaleString("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const formatCOP = (n) =>
  n != null
    ? new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 2,
      }).format(n)
    : "—";

const daysUntil = (dateStr) => {
  if (!dateStr) return null;
  const ms = new Date(dateStr) - new Date();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
};

const STATUS_CONFIG = {
  ACTIVE:    { label: "Activa",    cls: "smg-badge--green"  },
  PENDING:   { label: "Pendiente", cls: "smg-badge--yellow" },
  EXPIRED:   { label: "Vencida",   cls: "smg-badge--red"    },
  CANCELLED: { label: "Cancelada", cls: "smg-badge--gray"   },
};

const TX_STATUS = {
  APPROVED: { label: "Aprobado", cls: "smg-badge--green"  },
  PENDING:  { label: "Pendiente",cls: "smg-badge--yellow" },
  REJECTED: { label: "Rechazado",cls: "smg-badge--red"    },
  REFUNDED: { label: "Reembolso",cls: "smg-badge--blue"   },
};

const TX_TYPE = {
  NEW:       "Nuevo",
  RENEWAL:   "Renovación",
  UPGRADE:   "Mejora",
  DOWNGRADE: "Reducción",
};

const REASON_LABELS = {
  UPGRADE:   "Mejora",
  DOWNGRADE: "Reducción",
  RENEWAL:   "Renovación",
  CANCELLED: "Cancelación",
};

function Badge({ status, map }) {
  const cfg = map[status] ?? { label: status, cls: "smg-badge--gray" };
  return <span className={`smg-badge ${cfg.cls}`}>{cfg.label}</span>;
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function SubscriptionManagement() {
  const navigate = useNavigate();
  const storeId  = localStorage.getItem("storeId");

  const [sub,        setSub]        = useState(null);
  const [history,    setHistory]    = useState([]);
  const [planHist,   setPlanHist]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [toast,      setToast]      = useState(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const load = useCallback(async () => {
    if (!storeId) { setLoading(false); return; }
    setLoading(true);
    try {
      const [subRes, histRes, planHistRes] = await Promise.allSettled([
        getSubscription(storeId),
        getTransactionHistory(storeId),
        getPlanHistory(storeId),
      ]);

      if (subRes.status === "fulfilled") setSub(subRes.value);
      else if (subRes.reason?.status !== 404)
        showToast("error", "No se pudo cargar la suscripción.");

      if (histRes.status === "fulfilled")
        setHistory(Array.isArray(histRes.value) ? histRes.value : []);

      if (planHistRes.status === "fulfilled")
        setPlanHist(Array.isArray(planHistRes.value) ? planHistRes.value : []);
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => { load(); }, [load]);

  const handleCancel = async () => {
    if (!storeId) return;
    setCancelling(true);
    try {
      await cancelSubscription(storeId);
      showToast("success", "Suscripción cancelada correctamente.");
      setCancelOpen(false);
      await load();
    } catch (err) {
      showToast("error", err.message ?? "No se pudo cancelar la suscripción.");
    } finally {
      setCancelling(false);
    }
  };

  const days = daysUntil(sub?.expiresAt);
  const renewalSoon =
    sub?.renewalAt &&
    new Date(sub.renewalAt) - new Date() < 3 * 24 * 60 * 60 * 1000;
  const statusCfg = STATUS_CONFIG[sub?.status] ?? { label: sub?.status, cls: "smg-badge--gray" };

  return (
    <div className="smg-root">
      {/* ── Toast ── */}
      {toast && (
        <div className={`smg-toast smg-toast--${toast.type}`}>{toast.msg}</div>
      )}

      {/* ── Modal de confirmación de cancelación ── */}
      {cancelOpen && (
        <div className="smg-modal-overlay" onClick={() => setCancelOpen(false)}>
          <div className="smg-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="smg-modal__title">Cancelar suscripción</h2>
            <p className="smg-modal__text">
              ¿Estás seguro de que quieres cancelar tu suscripción?
              Perderás el acceso a las funciones de tu plan actual al vencer el
              período.
            </p>
            <div className="smg-modal__actions">
              <button
                className="sub-btn sub-btn--outline"
                onClick={() => setCancelOpen(false)}
                disabled={cancelling}
              >
                Mantener plan
              </button>
              <button
                className="sub-btn sub-btn--danger"
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? "Cancelando..." : "Sí, cancelar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="smg-header">
        <h1 className="smg-title">Mi suscripción</h1>
        <button className="sub-btn sub-btn--outline smg-btn-plans" onClick={() => navigate("/planes")}>
          Ver todos los planes
        </button>
      </div>

      {loading ? (
        <div className="sub-loading">
          <span className="sub-spinner" />
          <span>Cargando información...</span>
        </div>
      ) : (
        <>
          {/* ── Tarjeta de suscripción activa ── */}
          <section className="smg-section">
            {sub ? (
              <div className="smg-sub-card">
                <div className="smg-sub-card__top">
                  <div>
                    <p className="smg-sub-card__plan">{sub.planName ?? sub.plan}</p>
                    <span className={`smg-badge ${statusCfg.cls}`}>
                      {statusCfg.label}
                    </span>
                  </div>
                  {sub.status === "ACTIVE" && (
                    <button
                      className="sub-btn sub-btn--outline smg-btn-cancel"
                      onClick={() => setCancelOpen(true)}
                    >
                      Cancelar suscripción
                    </button>
                  )}
                </div>

                <div className="smg-sub-card__details">
                  {sub.startedAt && (
                    <div className="smg-detail-row">
                      <span className="smg-detail-label">Inicio</span>
                      <span className="smg-detail-value">{formatDate(sub.startedAt)}</span>
                    </div>
                  )}
                  {sub.expiresAt && (
                    <div className="smg-detail-row">
                      <span className="smg-detail-label">Vencimiento</span>
                      <span className="smg-detail-value">
                        {formatDate(sub.expiresAt)}
                        {days != null && days >= 0 && (
                          <span className={`smg-days ${days <= 3 ? "smg-days--warn" : ""}`}>
                            &nbsp;({days} día{days !== 1 ? "s" : ""} restante{days !== 1 ? "s" : ""})
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                  {sub.renewalAt && (
                    <div className="smg-detail-row">
                      <span className="smg-detail-label">Renovación</span>
                      <span className="smg-detail-value">
                        {formatDate(sub.renewalAt)}
                      </span>
                    </div>
                  )}
                </div>

                {renewalSoon && (
                  <div className="smg-alert smg-alert--warn">
                    ⚠ Tu suscripción se renueva pronto. Asegúrate de tener
                    fondos disponibles para evitar interrupciones.
                  </div>
                )}
              </div>
            ) : (
              <div className="smg-empty-sub">
                <p>No tienes una suscripción activa.</p>
                <button
                  className="sub-btn sub-btn--primary"
                  onClick={() => navigate("/planes")}
                  style={{ marginTop: 16, width: "auto", padding: "12px 28px" }}
                >
                  Ver planes →
                </button>
              </div>
            )}
          </section>

          {/* ── Historial de transacciones ── */}
          <section className="smg-section">
            <h2 className="smg-section__title">Historial de pagos</h2>
            {history.length === 0 ? (
              <p className="smg-empty">No hay transacciones registradas.</p>
            ) : (
              <div className="smg-table-wrapper">
                <table className="smg-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Plan</th>
                      <th>Tipo</th>
                      <th>Monto</th>
                      <th>Estado</th>
                      <th>ID MercadoPago</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((tx) => (
                      <tr key={tx.transactionId}>
                        <td>{formatDateTime(tx.createdAt)}</td>
                        <td>{tx.planName}</td>
                        <td>
                          <span className="smg-type-badge">
                            {TX_TYPE[tx.type] ?? tx.type}
                          </span>
                        </td>
                        <td>{formatCOP(tx.amount)}</td>
                        <td>
                          <Badge status={tx.status} map={TX_STATUS} />
                        </td>
                        <td className="smg-mp-id">
                          {tx.mpPaymentId ?? <span style={{ color: "#475569" }}>—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* ── Historial de cambios de plan ── */}
          <section className="smg-section">
            <h2 className="smg-section__title">Historial de cambios de plan</h2>
            {planHist.length === 0 ? (
              <p className="smg-empty">No hay cambios de plan registrados.</p>
            ) : (
              <div className="smg-table-wrapper">
                <table className="smg-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Desde</th>
                      <th>Hasta</th>
                      <th>Motivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {planHist.map((h) => (
                      <tr key={h.historyId}>
                        <td>{formatDateTime(h.changedAt)}</td>
                        <td>{h.fromPlan ?? <span style={{ color: "#475569" }}>—</span>}</td>
                        <td><strong>{h.toPlan}</strong></td>
                        <td>
                          <span className="smg-type-badge">
                            {REASON_LABELS[h.reason] ?? h.reason}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
