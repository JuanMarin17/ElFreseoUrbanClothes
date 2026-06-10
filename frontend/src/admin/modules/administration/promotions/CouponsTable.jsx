/**
 * CouponsTable
 * Tabla de cupones con búsqueda, código copiable y acciones.
 *
 * Props:
 *  - coupons      {Array}
 *  - search       {string}
 *  - onSearch     {Function}
 *  - onEdit       {Function}
 *  - onDeactivate {Function}
 *  - onNew        {Function}
 */
export default function CouponsTable({
  coupons,
  search,
  onSearch,
  onEdit,
  onDeactivate,
  onNew,
}) {
  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
  };

  return (
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
              <th>Nombre</th>
              <th>Código</th>
              <th>Tipo</th>
              <th>Descuento</th>
              <th>Producto</th>
              <th>Vigencia</th>
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
                    <p>
                      No hay cupones
                      {search
                        ? " que coincidan con la búsqueda"
                        : " creados aún"}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              coupons.map((coupon) => (
                <tr key={coupon.couponId}>
                  <td style={{ fontWeight: 700 }}>{coupon.name ?? "—"}</td>
                  <td>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <code
                        style={{
                          background: "var(--vx-purple-dim)",
                          color: "var(--vx-purple)",
                          padding: "3px 10px",
                          borderRadius: 6,
                          fontWeight: 800,
                          fontSize: "0.82rem",
                          letterSpacing: "1px",
                          border: "1px solid rgba(168,85,247,0.2)",
                        }}
                      >
                        {coupon.code}
                      </code>
                      <button
                        className="vx-btn vx-btn--icon"
                        style={{ width: 26, height: 26 }}
                        onClick={() => copyCode(coupon.code)}
                        aria-label={`Copiar código ${coupon.code}`}
                        title="Copiar"
                      >
                        <i
                          className="fa-regular fa-copy"
                          aria-hidden="true"
                          style={{ fontSize: "0.72rem" }}
                        />
                      </button>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`vx-badge ${coupon.discountType === "PERCENTAGE" ? "vx-badge--pct" : "vx-badge--fixed"}`}
                    >
                      {coupon.discountType === "PERCENTAGE"
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
                    {coupon.discountType === "PERCENTAGE"
                      ? `${coupon.discount}%`
                      : `$${Number(coupon.discount).toLocaleString("es-CO")}`}
                  </td>
                  <td style={{ color: "var(--vx-muted)", fontSize: "0.8rem" }}>
                    {coupon.productId ? (
                      <code
                        style={{
                          background: "var(--vx-card2)",
                          padding: "2px 6px",
                          borderRadius: 4,
                          fontSize: "0.75rem",
                        }}
                      >
                        {coupon.productId}
                      </code>
                    ) : (
                      <span style={{ color: "var(--vx-muted2)" }}>—</span>
                    )}
                  </td>
                  <td style={{ fontSize: "0.8rem", color: "var(--vx-muted)" }}>
                    {coupon.startDate && coupon.endDate ? (
                      <>
                        {fmt(coupon.startDate)} → {fmt(coupon.endDate)}
                      </>
                    ) : (
                      <span style={{ color: "var(--vx-muted2)" }}>
                        Sin fecha
                      </span>
                    )}
                  </td>
                  <td>
                    <span
                      className={`vx-badge ${coupon.isActive ? "vx-badge--active" : "vx-badge--inactive"}`}
                    >
                      {coupon.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td>
                    <div className="vx-row-actions">
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
