/**
 * ProductPrice
 * Bloque de precio con precio tachado, descuento e información de cuotas/envío.
 *
 * Props:
 *  - priceFormatted         {string}  Precio actual formateado (ej: "$289.99")
 *  - originalPriceFormatted {string}  Precio original tachado (opcional)
 *  - discountLabel          {string}  Etiqueta de descuento (ej: "−26% OFF") (opcional)
 *  - installmentText        {string}  Texto de cuotas (opcional)
 *  - shippingText           {string}  Texto de envío destacado (opcional)
 */
export default function ProductPrice({
  priceFormatted,
  originalPriceFormatted,
  discountLabel,
  installmentText,
  shippingText,
}) {
  return (
    <div className="vx-price-block vx-anim vx-anim--d2">
      <div className="vx-price-block__row">
        <span className="vx-price-block__main">{priceFormatted}</span>

        {originalPriceFormatted && (
          <span className="vx-price-block__original">
            {originalPriceFormatted}
          </span>
        )}

        {discountLabel && (
          <span className="vx-price-block__discount">{discountLabel}</span>
        )}
      </div>

      {installmentText && (
        <p className="vx-price-block__note">
          {installmentText}
          {shippingText && (
            <>
              {" "}
              &nbsp;·&nbsp; <span>{shippingText}</span>
            </>
          )}
        </p>
      )}
    </div>
  );
}
