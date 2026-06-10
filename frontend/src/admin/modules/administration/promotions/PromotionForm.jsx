import { usePromotionForm } from "./service/usepromotionform";

/**
 * PromotionForm
 * Formulario unificado para crear/editar Promociones y Cupones.
 * Campos: nombre, código (solo cupón), tipo descuento, valor,
 *         producto, usuario (opcional), fechas, motivo (opcional).
 *
 * Props:
 *  - type     {'promotion' | 'coupon'}
 *  - mode     {'create' | 'edit'}
 *  - initial  {object | null}   Datos para modo edición
 *  - onSubmit {Function}        Recibe el payload limpio
 *  - onCancel {Function}
 */
export default function PromotionForm({
  type,
  mode,
  initial,
  onSubmit,
  onCancel,
}) {
  const {
    values,
    errors,
    submitting,
    handleChange,
    setDiscountType,
    handleSubmit,
  } = usePromotionForm(type, onSubmit, initial);

  const isEdit = mode === "edit";
  const isCoupon = type === "coupon";
  const today = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="vx-modal__body">
        {/* ── Nombre ── */}
        <div className="vx-form-grid">
          <div className={`vx-field ${isCoupon ? "" : "vx-form-grid--full"}`}>
            <label className="vx-field__label" htmlFor="name">
              Nombre <span className="vx-field__label-required">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className={`vx-field__input ${errors.name ? "is-error" : ""}`}
              placeholder={
                isCoupon ? "ej: Cupón Verano 2026" : "ej: Promo Lanzamiento"
              }
              value={values.name}
              onChange={handleChange}
              autoComplete="off"
            />
            {errors.name && (
              <span className="vx-field__error">
                <i
                  className="fa-solid fa-circle-exclamation"
                  aria-hidden="true"
                />{" "}
                {errors.name}
              </span>
            )}
          </div>

          {/* Código — solo cupón */}
          {isCoupon && (
            <div className="vx-field">
              <label className="vx-field__label" htmlFor="code">
                Código <span className="vx-field__label-required">*</span>
              </label>
              <input
                id="code"
                name="code"
                type="text"
                className={`vx-field__input ${errors.code ? "is-error" : ""}`}
                placeholder="ej: VERANO20"
                value={values.code}
                onChange={handleChange}
                autoComplete="off"
                style={{
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  fontWeight: 700,
                }}
              />
              {errors.code && (
                <span className="vx-field__error">
                  <i
                    className="fa-solid fa-circle-exclamation"
                    aria-hidden="true"
                  />{" "}
                  {errors.code}
                </span>
              )}
              <span className="vx-field__hint">
                Se guardará en mayúsculas automáticamente
              </span>
            </div>
          )}
        </div>

        {/* ── Tipo y valor de descuento ── */}
        <div className="vx-form-grid">
          <div className="vx-field">
            <label className="vx-field__label">
              Tipo de descuento{" "}
              <span className="vx-field__label-required">*</span>
            </label>
            <div
              className="vx-type-toggle"
              role="group"
              aria-label="Tipo de descuento"
            >
              <button
                type="button"
                className={`vx-type-toggle__btn ${values.discountType === "PERCENTAGE" ? "is-active" : ""}`}
                onClick={() => setDiscountType("PERCENTAGE")}
                aria-pressed={values.discountType === "PERCENTAGE"}
              >
                <i className="fa-solid fa-percent" aria-hidden="true" />
                Porcentaje
              </button>
              <button
                type="button"
                className={`vx-type-toggle__btn ${values.discountType === "FIXED_AMOUNT" ? "is-active" : ""}`}
                onClick={() => setDiscountType("FIXED_AMOUNT")}
                aria-pressed={values.discountType === "FIXED_AMOUNT"}
              >
                <i className="fa-solid fa-dollar-sign" aria-hidden="true" />
                Valor fijo
              </button>
            </div>
          </div>

          <div className="vx-field">
            <label className="vx-field__label" htmlFor="discount">
              {values.discountType === "PERCENTAGE"
                ? "Porcentaje (%)"
                : "Valor fijo (COP)"}
              <span className="vx-field__label-required"> *</span>
            </label>
            <input
              id="discount"
              name="discount"
              type="number"
              min="0"
              max={values.discountType === "PERCENTAGE" ? 100 : undefined}
              step={values.discountType === "PERCENTAGE" ? 1 : 100}
              className={`vx-field__input ${errors.discount ? "is-error" : ""}`}
              placeholder={
                values.discountType === "PERCENTAGE" ? "ej: 20" : "ej: 10000"
              }
              value={values.discount}
              onChange={handleChange}
            />
            {errors.discount && (
              <span className="vx-field__error">
                <i
                  className="fa-solid fa-circle-exclamation"
                  aria-hidden="true"
                />{" "}
                {errors.discount}
              </span>
            )}
            {values.discountType === "PERCENTAGE" && (
              <span className="vx-field__hint">Máximo 100%</span>
            )}
          </div>
        </div>

        <div className="vx-form-separator">Aplicación</div>

        {/* ── Producto ── */}
        <div className="vx-field">
          <label className="vx-field__label" htmlFor="productId">
            Producto <span className="vx-field__label-required">*</span>
          </label>
          <input
            id="productId"
            name="productId"
            type="text"
            className={`vx-field__input ${errors.productId ? "is-error" : ""}`}
            placeholder="UUID o nombre del producto"
            value={values.productId}
            onChange={handleChange}
            autoComplete="off"
          />
          {errors.productId && (
            <span className="vx-field__error">
              <i
                className="fa-solid fa-circle-exclamation"
                aria-hidden="true"
              />{" "}
              {errors.productId}
            </span>
          )}
          <span className="vx-field__hint">
            Cuando el backend esté listo aquí irá un selector con búsqueda de
            productos
          </span>
        </div>

        {/* ── Usuario (opcional) ── */}
        <div className="vx-field">
          <label className="vx-field__label" htmlFor="userId">
            Usuario{" "}
            <span className="vx-field__label-optional">
              (opcional — dejar vacío para aplicar a todos)
            </span>
          </label>
          <input
            id="userId"
            name="userId"
            type="text"
            className="vx-field__input"
            placeholder="Email o UUID del usuario"
            value={values.userId}
            onChange={handleChange}
            autoComplete="off"
          />
          <span className="vx-field__hint">
            Si se deja vacío, la{" "}
            {isCoupon ? "promoción del cupón" : "promoción"} aplica a todos los
            clientes
          </span>
        </div>

        <div className="vx-form-separator">Vigencia</div>

        {/* ── Fechas ── */}
        <div className="vx-form-grid">
          <div className="vx-field">
            <label className="vx-field__label" htmlFor="startDate">
              Fecha de inicio{" "}
              <span className="vx-field__label-required">*</span>
            </label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              min={today}
              className={`vx-field__input ${errors.startDate ? "is-error" : ""}`}
              value={values.startDate}
              onChange={handleChange}
              style={{ colorScheme: "dark" }}
            />
            {errors.startDate && (
              <span className="vx-field__error">
                <i
                  className="fa-solid fa-circle-exclamation"
                  aria-hidden="true"
                />{" "}
                {errors.startDate}
              </span>
            )}
          </div>

          <div className="vx-field">
            <label className="vx-field__label" htmlFor="endDate">
              Fecha de fin <span className="vx-field__label-required">*</span>
            </label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              min={values.startDate || today}
              className={`vx-field__input ${errors.endDate ? "is-error" : ""}`}
              value={values.endDate}
              onChange={handleChange}
              style={{ colorScheme: "dark" }}
            />
            {errors.endDate && (
              <span className="vx-field__error">
                <i
                  className="fa-solid fa-circle-exclamation"
                  aria-hidden="true"
                />{" "}
                {errors.endDate}
              </span>
            )}
          </div>
        </div>

        <div className="vx-form-separator">Adicional</div>

        {/* ── Motivo (opcional) ── */}
        <div className="vx-field">
          <label className="vx-field__label" htmlFor="reason">
            Motivo del descuento{" "}
            <span className="vx-field__label-optional">(opcional)</span>
          </label>
          <textarea
            id="reason"
            name="reason"
            className="vx-field__textarea"
            placeholder="ej: Descuento por temporada de verano, cliente frecuente, liquidación de inventario..."
            value={values.reason}
            onChange={handleChange}
            rows={3}
          />
          <span className="vx-field__hint">
            Visible solo para administradores, no se muestra al cliente
          </span>
        </div>
      </div>

      {/* ── Footer con acciones ── */}
      <div className="vx-modal__footer">
        <button
          type="button"
          className="vx-btn vx-btn--ghost"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="vx-btn vx-btn--primary"
          disabled={submitting}
          aria-busy={submitting}
        >
          {submitting ? (
            <>
              <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" />{" "}
              Guardando…
            </>
          ) : isEdit ? (
            <>
              <i className="fa-solid fa-floppy-disk" aria-hidden="true" />{" "}
              Guardar cambios
            </>
          ) : (
            <>
              <i className="fa-solid fa-plus" aria-hidden="true" /> Crear{" "}
              {isCoupon ? "cupón" : "promoción"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
