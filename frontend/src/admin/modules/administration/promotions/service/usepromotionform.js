import { useState, useCallback } from "react";

/**
 * usePromotionForm
 *
 * Maneja el estado, validación y submit del formulario
 * tanto para Promociones como para Cupones.
 *
 * @param {'promotion' | 'coupon'} type
 * @param {Function} onSubmit  Recibe el payload limpio
 * @param {object}   initial   Para modo edición (opcional)
 */
export function usePromotionForm(type, onSubmit, initial = null) {
  const defaultValues = {
    // Campos comunes
    name: initial?.name ?? "",
    discount: initial?.discount ?? "",
    discountType: initial?.discountType ?? "PERCENTAGE", // PERCENTAGE | FIXED_AMOUNT
    productId: initial?.productId ?? "",
    startDate: initial?.startDate ?? "",
    endDate: initial?.endDate ?? "",
    userId: initial?.userId ?? "",
    reason: initial?.reason ?? "", // opcional

    // Solo cupón
    code: initial?.code ?? "",
  };

  const [values, setValues] = useState(defaultValues);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  /* ── Cambio de campo ── */
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    // Limpia el error del campo al escribir
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }, []);

  /* ── Cambio de toggle (discountType) ── */
  const setDiscountType = useCallback((val) => {
    setValues((prev) => ({ ...prev, discountType: val, discount: "" }));
  }, []);

  /* ── Validación ── */
  const validate = useCallback(() => {
    const e = {};

    if (!values.name.trim()) e.name = "El nombre es obligatorio";

    if (type === "coupon" && !values.code.trim())
      e.code = "El código del cupón es obligatorio";

    if (
      !values.discount ||
      isNaN(Number(values.discount)) ||
      Number(values.discount) <= 0
    )
      e.discount = "Ingresa un valor de descuento válido mayor a 0";

    if (values.discountType === "PERCENTAGE" && Number(values.discount) > 100)
      e.discount = "El porcentaje no puede superar 100%";

    if (!values.productId.trim())
      e.productId = "Selecciona o ingresa un producto";

    if (!values.startDate) e.startDate = "La fecha de inicio es obligatoria";

    if (!values.endDate) e.endDate = "La fecha de fin es obligatoria";

    if (
      values.startDate &&
      values.endDate &&
      values.endDate <= values.startDate
    )
      e.endDate = "La fecha de fin debe ser posterior a la de inicio";

    return e;
  }, [values, type]);

  /* ── Submit ── */
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const validationErrors = validate();

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      setSubmitting(true);
      try {
        // Construye payload limpio — campos vacíos opcionales no se envían
        const payload = {
          name: values.name.trim(),
          discount: Number(values.discount),
          discountType: values.discountType,
          productId: values.productId.trim(),
          startDate: values.startDate,
          endDate: values.endDate,
          ...(type === "coupon" && { code: values.code.trim().toUpperCase() }),
          ...(values.userId.trim() && { userId: values.userId.trim() }),
          ...(values.reason.trim() && { reason: values.reason.trim() }),
        };

        await onSubmit(payload);
      } finally {
        setSubmitting(false);
      }
    },
    [values, validate, onSubmit, type],
  );

  /* ── Reset ── */
  const reset = useCallback(() => {
    setValues(defaultValues);
    setErrors({});
  }, []);

  return {
    values,
    errors,
    submitting,
    handleChange,
    setDiscountType,
    handleSubmit,
    reset,
  };
}
