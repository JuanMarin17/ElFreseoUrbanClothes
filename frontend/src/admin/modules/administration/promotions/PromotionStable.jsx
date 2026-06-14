/**
 * PromotionsTable
 *
 * Columnas: Nombre | Tipo | Descuento | Aplica a | Vigencia | Mensaje | Estado | Acciones
 * API fields: promotionId, name, discount, discountType, productId, isActive, createdAt
 * _meta fields (localStorage): startDate, endDate, message, minPurchase
 */
export default function PromotionsTable({ promotions, search, onSearch, onEdit, onDeactivate, onNew }) {
  return (
    <div className="vx-table-wrap">
      <div className="vx-table-toolbar">
        <div className="vx-table-toolbar__left">
          <div className="vx-search">
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
            <input
              type="text"
              placeholder="Buscar promoción..."
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              aria-label="Buscar promociones"
            />
          </div>
        </div>
        <div className="vx-table-toolbar__right">
          <button className="vx-btn vx-btn--primary vx-btn--sm" onClick={onNew}>
            <i className="fa-solid fa-plus" aria-hidden="true" /> Nueva promoción
          </button>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table aria-label="Tabla de promociones">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Descuento</th>
              <th>Aplica a</th>
              <th>Vigencia</th>
              <th>Mensaje</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {promotions.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className="vx-table-empty">
                    <i className="fa-solid fa-tags" aria-hidden="true" />
                    <p>No hay promociones{search ? " que coincidan con la búsqueda" : " creadas aún"}</p>
                  </div>
                </td>
              </tr>
            ) : (
              promotions.map((promo) => {
                const meta = promo._meta ?? {};
                const hasProduct = promo.productId && promo.productId !== "null";
                return (
                  <tr key={promo.promotionId}>
                    <td style={{ fontWeight: 700 }}>{promo.name}</td>

                    <td>
                      <span className={`vx-badge ${promo.discountType === "PERCENTAGE" ? "vx-badge--pct" : "vx-badge--fixed"}`}>
                        {promo.discountType === "PERCENTAGE" ? "Porcentaje" : "Valor fijo"}
                      </span>
                    </td>

                    <td style={{ fontFamily: "var(--vx-font-display)", fontWeight: 800 }}>
                      {promo.discountType === "PERCENTAGE"
                        ? `${promo.discount}%`
                        : `$${Number(promo.discount).toLocaleString("es-CO")}`}
                    </td>

                    <td>
                      {hasProduct ? (
                        <code style={{ background: "var(--vx-card2)", padding: "2px 6px", borderRadius: 4, fontSize: "0.72rem" }}>
                          {promo.productId.slice(0, 8)}…
                        </code>
                      ) : (
                        <span className="vx-badge vx-badge--pct" style={{ fontSize: "0.72rem" }}>
                          Toda la orden
                        </span>
                      )}
                    </td>

                    <td style={{ fontSize: "0.78rem", color: "var(--vx-muted)", whiteSpace: "nowrap" }}>
                      {meta.startDate || meta.endDate ? (
                        <>
                          {meta.startDate ? fmtDate(meta.startDate) : "—"}
                          <span style={{ margin: "0 4px", opacity: 0.5 }}>→</span>
                          {meta.endDate ? fmtDate(meta.endDate) : "∞"}
                          {meta.endDate && isPast(meta.endDate) && (
                            <span className="vx-badge vx-badge--inactive" style={{ fontSize: "0.65rem", marginLeft: 4 }}>Vencida</span>
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

                    <td>
                      <span className={`vx-badge ${promo.isActive ? "vx-badge--active" : "vx-badge--inactive"}`}>
                        {promo.isActive ? "Activa" : "Inactiva"}
                      </span>
                    </td>

                    <td>
                      <div className="vx-row-actions">
                        <button
                          className="vx-btn vx-btn--icon"
                          onClick={() => onEdit(promo)}
                          aria-label={`Editar ${promo.name}`}
                          title="Editar"
                        >
                          <i className="fa-solid fa-pen" aria-hidden="true" />
                        </button>
                        {promo.isActive && (
                          <button
                            className="vx-btn vx-btn--danger vx-btn--sm"
                            onClick={() => onDeactivate(promo.promotionId)}
                            aria-label={`Desactivar ${promo.name}`}
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
  );
}

function fmtDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function isPast(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr + "T23:59:59") < new Date();
}
