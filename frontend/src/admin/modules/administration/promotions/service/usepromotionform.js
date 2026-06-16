import { useState, useCallback } from "react";

/**
 * usePromotionForm
 *
 * Promotion DTO (API): { name, discount, discountType, productId? }
 * Coupon DTO (API):    { code, discount, discountType }
 * discountType: "PERCENTAGE" | "FIXED"
 *
 * _meta (localStorage only): { startDate, endDate, message, minPurchase }
 */
export function usePromotionForm(type, onSubmit, initial = null) {
  const isCoupon = type === "coupon";
  const meta = initial?._meta ?? {};

  const init = {
    name:         initial?.name         ?? "",
    code:         initial?.code         ?? "",
    discount:     initial?.discount     ?? "",
    discountType: initial?.discountType ?? "PERCENTAGE",
    productId:    initial?.productId    ?? "",
    // Metadata fields — stored in localStorage, not sent to the API
    startDate:   meta.startDate   ?? "",
    endDate:     meta.endDate     ?? "",
    message:     meta.message     ?? "",
    minPurchase: meta.minPurchase != null ? String(meta.minPurchase) : "",
  };

  const [values,     setValues]     = useState(init);
  const [errors,     setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }, []);

  const setDiscountType = useCallback((val) => {
    setValues((prev) => ({ ...prev, discountType: val, discount: "" }));
  }, []);

  const validate = useCallback(() => {
    const e = {};

    if (!isCoupon && !values.name.trim())
      e.name = "El nombre es obligatorio";

    if (isCoupon && !values.code.trim())
      e.code = "El código del cupón es obligatorio";

    const num = Number(values.discount);
    if (!values.discount || isNaN(num) || num <= 0)
      e.discount = "Ingresa un descuento válido mayor a 0";

    if (values.discountType === "PERCENTAGE" && num > 100)
      e.discount = "El porcentaje no puede superar 100%";

    if (values.startDate && values.endDate && values.endDate < values.startDate)
      e.endDate = "La fecha de fin no puede ser anterior al inicio";

    return e;
  }, [values, isCoupon]);

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
        const _meta = {
          startDate:   values.startDate   || null,
          endDate:     values.endDate     || null,
          message:     values.message.trim() || null,
          minPurchase: values.minPurchase ? Number(values.minPurchase) : null,
        };

        let payload;
        if (isCoupon) {
          payload = {
            code:         values.code.trim().toUpperCase(),
            discount:     Number(values.discount),
            discountType: values.discountType,
            _meta,
          };
        } else {
          payload = {
            name:         values.name.trim(),
            discount:     Number(values.discount),
            discountType: values.discountType,
            productId:    values.productId || null,
            _meta,
          };
        }
        await onSubmit(payload);
      } finally {
        setSubmitting(false);
      }
    },
    [values, validate, onSubmit, isCoupon],
  );

  return { values, errors, submitting, handleChange, setDiscountType, handleSubmit };
}
