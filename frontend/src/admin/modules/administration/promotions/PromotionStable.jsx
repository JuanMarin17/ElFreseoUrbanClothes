/**
 * PromotionsTable
 * Tabla de promociones con búsqueda, acciones de editar y desactivar.
 *
 * Props:
 *  - promotions   {Array}
 *  - search       {string}
 *  - onSearch     {Function}
 *  - onEdit       {Function}
 *  - onDeactivate {Function}
 *  - onNew        {Function}
 */
export default function PromotionsTable({
  promotions,
  search,
  onSearch,
  onEdit,
  onDeactivate,
  onNew,
}) {
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
            <i className="fa-solid fa-plus" aria-hidden="true" /> Nueva
            promoción
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
              <th>Producto</th>
              <th>Vigencia</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {promotions.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="vx-table-empty">
                    <i className="fa-solid fa-tags" aria-hidden="true" />
                    <p>
                      No hay promociones
                      {search
                        ? " que coincidan con la búsqueda"
                        : " creadas aún"}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              promotions.map((promo) => (
                <tr key={promo.promotionId}>
                  <td style={{ fontWeight: 700 }}>{promo.name}</td>
                  <td>
                    <span
                      className={`vx-badge ${promo.discountType === "PERCENTAGE" ? "vx-badge--pct" : "vx-badge--fixed"}`}
                    >
                      {promo.discountType === "PERCENTAGE"
                        ? "Porcentaje"
                        : "Valor fijo"}
                    </span>
                  </td>
                  <td
                    style={{
                      fontFamily: "var(--vx-font-display)",
                      fontWeight: 800,
                    }}
                  >
                    {promo.discountType === "PERCENTAGE"
                      ? `${promo.discount}%`
                      : `$${Number(promo.discount).toLocaleString("es-CO")}`}
                  </td>
                  <td style={{ color: "var(--vx-muted)", fontSize: "0.8rem" }}>
                    {promo.productId ? (
                      <code
                        style={{
                          background: "var(--vx-card2)",
                          padding: "2px 6px",
                          borderRadius: 4,
                          fontSize: "0.75rem",
                        }}
                      >
                        {promo.productId}
                      </code>
                    ) : (
                      <span style={{ color: "var(--vx-muted2)" }}>—</span>
                    )}
                  </td>
                  <td style={{ fontSize: "0.8rem", color: "var(--vx-muted)" }}>
                    {promo.startDate && promo.endDate ? (
                      <>
                        {fmt(promo.startDate)} → {fmt(promo.endDate)}
                      </>
                    ) : (
                      <span style={{ color: "var(--vx-muted2)" }}>
                        Sin fecha
                      </span>
                    )}
                  </td>
                  <td>
                    <span
                      className={`vx-badge ${promo.isActive ? "vx-badge--active" : "vx-badge--inactive"}`}
                    >
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
                          <i className="fa-solid fa-ban" aria-hidden="true" />{" "}
                          Desactivar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function fmt(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
