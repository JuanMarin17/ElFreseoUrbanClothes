/**
 * ProductGallery
 *
 * Muestra las imágenes del producto normalizadas por productService.
 * Cada imagen: { id, url, alt, isMain }
 * Las URLs vienen directamente de Cloudinary vía Spring.
 *
 * Props:
 *  - images        {Array<{ id, url, alt, isMain }>}
 *  - selectedImage {number}
 *  - onSelect      {Function}
 *  - productName   {string}
 */
export default function ProductGallery({
  images = [],
  selectedImage,
  onSelect,
  productName = "Producto",
}) {
  const active = images[selectedImage] ?? null;
  const hasImages = images.length > 0;
  const hasThumbs = images.length > 1;

  return (
    <div className="vx-gallery vx-anim">
      {/* Imagen principal */}
      <div className="vx-gallery__main">
        {hasImages ? (
          <img
            key={active.url} /* key fuerza re-render al cambiar url */
            src={active.url}
            alt={active.alt || `${productName} - imagen principal`}
            loading="eager"
            decoding="async"
          />
        ) : (
          <div
            className="vx-gallery__main--empty"
            aria-label="Sin imagen disponible"
          >
            <div className="vx-gallery__placeholder-icon">
              <i className="fa-solid fa-image" aria-hidden="true" />
            </div>
            <span className="vx-gallery__placeholder-label">Sin imagen</span>
          </div>
        )}

        {/* Zoom — abre la URL original de Cloudinary en nueva pestaña */}
        {hasImages && (
          <button
            className="vx-gallery__zoom"
            aria-label="Ver imagen ampliada"
            onClick={() =>
              window.open(active.url, "_blank", "noopener,noreferrer")
            }
          >
            <i className="fa-solid fa-expand" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Miniaturas */}
      {hasThumbs && (
        <div
          className="vx-gallery__thumbs"
          role="list"
          aria-label="Miniaturas del producto"
        >
          {images.map((img, idx) => (
            <button
              key={img.id}
              role="listitem"
              className={`vx-gallery__thumb ${selectedImage === idx ? "is-active" : ""}`}
              onClick={() => onSelect(idx)}
              aria-label={img.alt || `Imagen ${idx + 1}`}
              aria-pressed={selectedImage === idx}
            >
              <img
                src={img.url}
                alt={img.alt || `Miniatura ${idx + 1}`}
                loading="lazy"
                decoding="async"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
