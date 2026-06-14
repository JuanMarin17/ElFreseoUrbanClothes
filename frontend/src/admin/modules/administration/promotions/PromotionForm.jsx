import { useState, useEffect } from "react";
import { usePromotionForm } from "./service/usepromotionform";
import { getAllProducts } from "../services/productService";

/**
 * PromotionForm
 *
 * Promotion API fields: name, discountType, discount, productId (opcional)
 * Coupon API fields:    code, discountType, discount
 * Shared metadata (localStorage): startDate, endDate, message, minPurchase
 */
export default function PromotionForm({ type, mode, initial, onSubmit, onCancel }) {
  const { values, errors, submitting, handleChange, setDiscountType, handleSubmit } =
    usePromotionForm(type, onSubmit, initial);

  const [storeProducts,  setStoreProducts]  = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const isEdit   = mode === "edit";
  const isCoupon = type === "coupon";

  /* Load store products for the product selector */
  useEffect(() => {
    if (isCoupon) return;
    setLoadingProducts(true);
    getAllProducts()
      .then((res) => {
        const raw = Array.isArray(res) ? res
          : (Array.isArray(res?.content) ? res.content
          : (Array.isArray(res?.data)    ? res.data : []));
        setStoreProducts(raw);
      })
      .catch(() => setStoreProducts([]))
      .finally(() => setLoadingProducts(false));
  }, [isCoupon]);

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="vx-modal__body">

        {/* ── Nombre — solo promociones ── */}
        {!isCoupon && (
          <div className="vx-field">
            <label className="vx-field__label" htmlFor="name">
              Nombre <span className="vx-field__label-required">*</span>
            </label>
            <input
              id="name" name="name" type="text"
              className={`vx-field__input ${errors.name ? "is-error" : ""}`}
              placeholder="ej: Promo Lanzamiento"
              value={values.name}
              onChange={handleChange}
              autoComplete="off"
            />
            {errors.name && (
              <span className="vx-field__error">
                <i className="fa-solid fa-circle-exclamation" aria-hidden="true" /> {errors.name}
              </span>
            )}
          </div>
        )}

        {/* ── Código — solo cupones ── */}
        {isCoupon && (
          <div className="vx-field">
            <label className="vx-field__label" htmlFor="code">
              Código <span className="vx-field__label-required">*</span>
            </label>
            <input
              id="code" name="code" type="text"
              className={`vx-field__input ${errors.code ? "is-error" : ""}`}
              placeholder="ej: VERANO20"
              value={values.code}
              onChange={handleChange}
              autoComplete="off"
              style={{ textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700 }}
            />
            {errors.code && (
              <span className="vx-field__error">
                <i className="fa-solid fa-circle-exclamation" aria-hidden="true" /> {errors.code}
              </span>
            )}
            <span className="vx-field__hint">Se guardará en mayúsculas automáticamente</span>
          </div>
        )}

        {/* ── Tipo y valor de descuento ── */}
        <div className="vx-form-grid">
          <div className="vx-field">
            <label className="vx-field__label">
              Tipo de descuento <span className="vx-field__label-required">*</span>
            </label>
            <div className="vx-type-toggle" role="group" aria-label="Tipo de descuento">
              <button
                type="button"
                className={`vx-type-toggle__btn ${values.discountType === "PERCENTAGE" ? "is-active" : ""}`}
                onClick={() => setDiscountType("PERCENTAGE")}
                aria-pressed={values.discountType === "PERCENTAGE"}
              >
                <i className="fa-solid fa-percent" aria-hidden="true" /> Porcentaje
              </button>
              <button
                type="button"
                className={`vx-type-toggle__btn ${values.discountType === "FIXED" ? "is-active" : ""}`}
                onClick={() => setDiscountType("FIXED")}
                aria-pressed={values.discountType === "FIXED"}
              >
                <i className="fa-solid fa-dollar-sign" aria-hidden="true" /> Valor fijo
              </button>
            </div>
          </div>

          <div className="vx-field">
            <label className="vx-field__label" htmlFor="discount">
              {values.discountType === "PERCENTAGE" ? "Porcentaje (%)" : "Valor fijo (COP)"}
              <span className="vx-field__label-required"> *</span>
            </label>
            <input
              id="discount" name="discount" type="number"
              min="0"
              max={values.discountType === "PERCENTAGE" ? 100 : undefined}
              step={values.discountType === "PERCENTAGE" ? 1 : 100}
              className={`vx-field__input ${errors.discount ? "is-error" : ""}`}
              placeholder={values.discountType === "PERCENTAGE" ? "ej: 20" : "ej: 10000"}
              value={values.discount}
              onChange={handleChange}
            />
            {errors.discount && (
              <span className="vx-field__error">
                <i className="fa-solid fa-circle-exclamation" aria-hidden="true" /> {errors.discount}
              </span>
            )}
            {values.discountType === "PERCENTAGE" && (
              <span className="vx-field__hint">Máximo 100%</span>
            )}
          </div>
        </div>

        {/* ── Selector de producto — solo promociones ── */}
        {!isCoupon && (
          <div className="vx-field">
            <label className="vx-field__label" htmlFor="productId">
              Aplica a{" "}
              <span className="vx-field__label-optional">(opcional)</span>
            </label>
            <select
              id="productId"
              name="productId"
              className="vx-field__input"
              value={values.productId ?? ""}
              onChange={handleChange}
              disabled={loadingProducts}
            >
              <option value="">— Toda la orden —</option>
              {storeProducts.map((p) => {
                const pid = p.productId ?? p.id;
                return (
                  <option key={pid} value={pid}>
                    {p.name}
                  </option>
                );
              })}
            </select>
            <span className="vx-field__hint">
              {loadingProducts
                ? "Cargando productos…"
                : "Sin selección: aplica al total de la orden"}
            </span>
          </div>
        )}

        {/* ── Mensaje para clientes ── */}
        <div className="vx-field">
          <label className="vx-field__label" htmlFor="message">
            Mensaje para clientes{" "}
            <span className="vx-field__label-optional">(opcional)</span>
          </label>
          <input
            id="message" name="message" type="text"
            className="vx-field__input"
            placeholder={
              isCoupon
                ? "ej: Usa el código VERANO20 y obtén 20% de descuento"
                : "ej: ¡Compra hoy y lleva un 15% de descuento en toda la tienda!"
            }
            value={values.message}
            onChange={handleChange}
            autoComplete="off"
          />
          <span className="vx-field__hint">
            Este texto aparecerá como alerta visible en tu tienda online
          </span>
        </div>

        {/* ── Compra mínima ── */}
        <div className="vx-field">
          <label className="vx-field__label" htmlFor="minPurchase">
            Compra mínima (COP){" "}
            <span className="vx-field__label-optional">(opcional)</span>
          </label>
          <input
            id="minPurchase" name="minPurchase" type="number"
            min="0" step="1000"
            className="vx-field__input"
            placeholder="ej: 150000"
            value={values.minPurchase}
            onChange={handleChange}
          />
          <span className="vx-field__hint">
            Monto mínimo en el carrito para que aplique el descuento
          </span>
        </div>

        {/* ── Vigencia — fechas de inicio y fin ── */}
        <div className="vx-form-grid">
          <div className="vx-field">
            <label className="vx-field__label" htmlFor="startDate">
              Fecha de inicio{" "}
              <span className="vx-field__label-optional">(opcional)</span>
            </label>
            <input
              id="startDate" name="startDate" type="date"
              className={`vx-field__input ${errors.startDate ? "is-error" : ""}`}
              value={values.startDate}
              onChange={handleChange}
            />
            {errors.startDate && (
              <span className="vx-field__error">
                <i className="fa-solid fa-circle-exclamation" aria-hidden="true" /> {errors.startDate}
              </span>
            )}
          </div>

          <div className="vx-field">
            <label className="vx-field__label" htmlFor="endDate">
              Fecha de fin{" "}
              <span className="vx-field__label-optional">(opcional)</span>
            </label>
            <input
              id="endDate" name="endDate" type="date"
              className={`vx-field__input ${errors.endDate ? "is-error" : ""}`}
              value={values.endDate}
              onChange={handleChange}
            />
            {errors.endDate && (
              <span className="vx-field__error">
                <i className="fa-solid fa-circle-exclamation" aria-hidden="true" /> {errors.endDate}
              </span>
            )}
          </div>
        </div>
        <span className="vx-field__hint" style={{ marginTop: -8, display: "block" }}>
          Si no defines fechas, la {isCoupon ? "promoción del cupón" : "promoción"} estará activa indefinidamente
        </span>

      </div>

      {/* ── Footer ── */}
      <div className="vx-modal__footer">
        <button
          type="button" className="vx-btn vx-btn--ghost"
          onClick={onCancel} disabled={submitting}
        >
          Cancelar
        </button>
        <button
          type="submit" className="vx-btn vx-btn--primary"
          disabled={submitting} aria-busy={submitting}
        >
          {submitting ? (
            <><i className="fa-solid fa-spinner fa-spin" aria-hidden="true" /> Guardando…</>
          ) : isEdit ? (
            <><i className="fa-solid fa-floppy-disk" aria-hidden="true" /> Guardar cambios</>
          ) : (
            <><i className="fa-solid fa-plus" aria-hidden="true" /> Crear {isCoupon ? "cupón" : "promoción"}</>
          )}
        </button>
      </div>
    </form>
  );
}
