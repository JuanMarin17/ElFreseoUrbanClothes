import { useState } from "react";
import { fetchRedemptions } from "./service/promotion";

/**
 * CouponsTable
 *
 * Columnas: Código | Tipo | Descuento | Vigencia | Mensaje | Creado | Estado | Acciones
 * API fields: couponId, code, discount, discountType, isActive, createdAt
 * _meta fields (localStorage): startDate, endDate, message, minPurchase
 */
export default function CouponsTable({ coupons, search, onSearch, onEdit, onDeactivate, onNew }) {
  const [redemptionsModal,   setRedemptionsModal]   = useState(null);
  const [redemptions,        setRedemptions]         = useState([]);
  const [redemptionsLoading, setRedemptionsLoading] = useState(false);

  const openRedemptions = async (coupon) => {
    setRedemptionsModal({ couponId: coupon.couponId, code: coupon.code });
    setRedemptions([]);
    setRedemptionsLoading(true);
    try {
      const data = await fetchRedemptions(coupon.couponId);
      setRedemptions(Array.isArray(data) ? data : []);
    } catch { /* silencioso */ }
    finally { setRedemptionsLoading(false); }
  };

  const copyCode = (code) => navigator.clipboard.writeText(code);

  return (
    <>
      <div className="vx-table-wrap">
        <div className="vx-table-toolbar">
          <div className="vx-table-toolbar__left">
            <div className="vx-search">
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
              <input
                type="text"
                placeholder="Buscar por código..."
                value={search}
                onChange={(e) => onSearch(e.target.value)}
                aria-label="Buscar cupones"
              />
            </div>
          </div>
          <div className="vx-table-toolbar__right">
            <button className="vx-btn vx-btn--primary vx-btn--sm" onClick={onNew}>
              <i className="fa-solid fa-plus" aria-hidden="true" /> Nuevo cupón
            </button>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table aria-label="Tabla de cupones">
            <thead>
              <tr>
                <th>Código</th>
                <th>Tipo</th>
                <th>Descuento</th>
                <th>Vigencia</th>
                <th>Mensaje</th>
                <th>Creado</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="vx-table-empty">
                      <i className="fa-solid fa-ticket" aria-hidden="true" />
                      <p>No hay cupones{search ? " que coincidan con la búsqueda" : " creados aún"}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => {
                  const meta = coupon._meta ?? {};
                  return (
                    <tr key={coupon.couponId}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <code style={{
                            background: "var(--vx-purple-dim)", color: "var(--vx-purple)",
                            padding: "3px 10px", borderRadius: 6, fontWeight: 800,
                            fontSize: "0.82rem", letterSpacing: "1px",
                            border: "1px solid rgba(168,85,247,0.2)",
                          }}>
                            {coupon.code}
                          </code>
                          <button
                            className="vx-btn vx-btn--icon"
                            style={{ width: 26, height: 26 }}
                            onClick={() => copyCode(coupon.code)}
                            aria-label={`Copiar código ${coupon.code}`}
                            title="Copiar"
                          >
                            <i className="fa-regular fa-copy" aria-hidden="true" style={{ fontSize: "0.72rem" }} />
                          </button>
                        </div>
                      </td>

                      <td>
                        <span className={`vx-badge ${coupon.discountType === "PERCENTAGE" ? "vx-badge--pct" : "vx-badge--fixed"}`}>
                          {coupon.discountType === "PERCENTAGE" ? "Porcentaje" : "Valor fijo"}
                        </span>
                      </td>

                      <td style={{ fontFamily: "var(--vx-font-display)", fontWeight: 800 }}>
                        {coupon.discountType === "PERCENTAGE"
                          ? `${coupon.discount}%`
                          : `$${Number(coupon.discount).toLocaleString("es-CO")}`}
                      </td>

                      <td style={{ fontSize: "0.78rem", color: "var(--vx-muted)", whiteSpace: "nowrap" }}>
                        {meta.startDate || meta.endDate ? (
                          <>
                            {meta.startDate ? fmtDate(meta.startDate) : "—"}
                            <span style={{ margin: "0 4px", opacity: 0.5 }}>→</span>
                            {meta.endDate ? fmtDate(meta.endDate) : "∞"}
                            {meta.endDate && isPast(meta.endDate) && (
                              <span className="vx-badge vx-badge--inactive" style={{ fontSize: "0.65rem", marginLeft: 4 }}>Vencido</span>
                            )}
                          </>
                        ) : (
                          <span style={{ opacity: 0.4 }}>Sin límite</span>
                        )}
                      </td>

                      <td style={{ maxWidth: 180 }}>
                        {meta.message ? (
                          <span style={{ fontSize: "0.78rem", color: "var(--vx-text)", display: "block",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                            title={meta.message}
                          >
                            {meta.message}
                          </span>
                        ) : (
                          <span style={{ opacity: 0.3, fontSize: "0.72rem" }}>—</span>
                        )}
                        {meta.minPurchase ? (
                          <span style={{ fontSize: "0.68rem", color: "var(--vx-muted)" }}>
                            Mín. ${Number(meta.minPurchase).toLocaleString("es-CO")}
                          </span>
                        ) : null}
                      </td>

                      <td style={{ fontSize: "0.8rem", color: "var(--vx-muted)" }}>
                        {fmtDate(coupon.createdAt)}
                      </td>

                      <td>
                        <span className={`vx-badge ${coupon.isActive ? "vx-badge--active" : "vx-badge--inactive"}`}>
                          {coupon.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </td>

                      <td>
                        <div className="vx-row-actions">
                          <button
                            className="vx-btn vx-btn--icon"
                            onClick={() => openRedemptions(coupon)}
                            aria-label={`Ver canjes de ${coupon.code}`}
                            title="Ver canjes"
                          >
                            <i className="fa-solid fa-clock-rotate-left" aria-hidden="true" />
                          </button>
                          <button
                            className="vx-btn vx-btn--icon"
                            onClick={() => onEdit(coupon)}
                            aria-label={`Editar cupón ${coupon.code}`}
                            title="Editar"
                          >
                            <i className="fa-solid fa-pen" aria-hidden="true" />
                          </button>
                          {coupon.isActive && (
                            <button
                              className="vx-btn vx-btn--danger vx-btn--sm"
                              onClick={() => onDeactivate(coupon.couponId)}
                              aria-label={`Desactivar cupón ${coupon.code}`}
                              title="Desactivar"
                            >
                              <i className="fa-solid fa-ban" aria-hidden="true" /> Desactivar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal historial de canjes ── */}
      {redemptionsModal && (
        <div
          className="vx-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={`Canjes de ${redemptionsModal.code}`}
          onClick={(e) => { if (e.target === e.currentTarget) setRedemptionsModal(null); }}
        >
          <div className="vx-modal" style={{ maxWidth: 520 }}>
            <div className="vx-modal__header">
              <div className="vx-modal__header-left">
                <div className="vx-modal__icon vx-modal__icon--purple">
                  <i className="fa-solid fa-clock-rotate-left" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="vx-modal__title">Historial de canjes</h2>
                  <p className="vx-modal__subtitle">Cupón: <strong>{redemptionsModal.code}</strong></p>
                </div>
              </div>
              <button className="vx-modal__close" onClick={() => setRedemptionsModal(null)} aria-label="Cerrar">
                <i className="fa-solid fa-xmark" aria-hidden="true" />
              </button>
            </div>

            <div className="vx-modal__body">
              {redemptionsLoading ? (
                <div style={{ textAlign: "center", padding: "32px 0", color: "var(--vx-muted)" }}>
                  <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 22 }} />
                </div>
              ) : redemptions.length === 0 ? (
                <div className="vx-table-empty">
                  <i className="fa-solid fa-inbox" aria-hidden="true" />
                  <p>Este cupón no ha sido canjeado aún</p>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Fecha de canje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {redemptions.map((r) => (
                      <tr key={r.redemptionId}>
                        <td>
                          <code style={{ fontSize: "0.75rem", color: "var(--vx-muted)" }}>
                            {r.userId?.slice(0, 8)}…
                          </code>
                        </td>
                        <td style={{ fontSize: "0.8rem", color: "var(--vx-muted)" }}>
                          {fmtDateTime(r.usedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="vx-modal__footer">
              <button className="vx-btn vx-btn--ghost" onClick={() => setRedemptionsModal(null)}>
                Cerrar
              </button>
              <span style={{ fontSize: "0.8rem", color: "var(--vx-muted)", alignSelf: "center" }}>
                {redemptions.length} {redemptions.length === 1 ? "canje" : "canjes"} en total
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function fmtDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function fmtDateTime(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function isPast(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr + "T23:59:59") < new Date();
}
