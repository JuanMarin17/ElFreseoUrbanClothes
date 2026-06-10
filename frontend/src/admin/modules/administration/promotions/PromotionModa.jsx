import PromotionForm from "./PromotionForm";

/**
 * PromotionModal
 * Wrapper del modal para crear/editar promociones y cupones.
 *
 * Props:
 *  - open     {boolean}
 *  - type     {'promotion' | 'coupon'}
 *  - mode     {'create' | 'edit'}
 *  - initial  {object | null}
 *  - onSubmit {Function}
 *  - onClose  {Function}
 */
export default function PromotionModal({
  open,
  type,
  mode,
  initial,
  onSubmit,
  onClose,
}) {
  if (!open) return null;

  const isCoupon = type === "coupon";
  const isEdit = mode === "edit";

  const title = isEdit
    ? `Editar ${isCoupon ? "cupón" : "promoción"}`
    : `Nueva ${isCoupon ? "cupón" : "promoción"}`;

  const subtitle = isEdit
    ? `Modifica los datos de ${initial?.name ?? ""}`
    : `Completa el formulario para crear ${isCoupon ? "el cupón" : "la promoción"}`;

  const iconClass = isCoupon
    ? "vx-modal__icon--purple"
    : "vx-modal__icon--cyan";
  const iconFa = isCoupon ? "fa-solid fa-ticket" : "fa-solid fa-tags";

  /* Cierra al hacer click en el overlay (fuera del modal) */
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="vx-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={handleOverlayClick}
    >
      <div className="vx-modal">
        {/* Header */}
        <div className="vx-modal__header">
          <div className="vx-modal__header-left">
            <div className={`vx-modal__icon ${iconClass}`}>
              <i className={iconFa} aria-hidden="true" />
            </div>
            <div>
              <h2 className="vx-modal__title">{title}</h2>
              <p className="vx-modal__subtitle">{subtitle}</p>
            </div>
          </div>
          <button
            className="vx-modal__close"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>

        {/* Form */}
        <PromotionForm
          type={type}
          mode={mode}
          initial={initial}
          onSubmit={onSubmit}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
