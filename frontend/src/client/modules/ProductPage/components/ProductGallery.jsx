/**
 * ProductGallery
 * Galería de imágenes del producto con imagen principal y miniaturas.
 *
 * Props:
 *  - images        {Array}   Lista de imágenes del producto
 *  - selectedImage {number}  Índice de la imagen activa
 *  - onSelect      {Function} Callback al seleccionar miniatura
 */
export default function ProductGallery({
  images = [],
  selectedImage,
  onSelect,
}) {
  const active = images[selectedImage];

  return (
    <div className="vx-gallery vx-anim">
      {/* Imagen principal */}
      <div className="vx-gallery__main">
        {images.length > 0 ? (
          <img
            src={active?.url}
            alt={active?.alt || "Imagen del producto"}
            loading="eager"
          />
        ) : (
          <div className="vx-gallery__main--empty">
            <div className="vx-gallery__placeholder-icon">
              <i className="fa-solid fa-image" aria-hidden="true" />
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="vx-gallery__badges" aria-hidden="true">
          {active?.badgeNew && (
            <span className="vx-badge vx-badge--new">Nuevo</span>
          )}
          {active?.badgeHot && (
            <span className="vx-badge vx-badge--hot">🔥 Popular</span>
          )}
          {active?.badgeSale && (
            <span className="vx-badge vx-badge--sale">Oferta</span>
          )}
        </div>

        <button className="vx-gallery__zoom" aria-label="Ver imagen ampliada">
          <i className="fa-solid fa-expand" aria-hidden="true" />
        </button>
      </div>

      {/* Miniaturas */}
      {images.length > 1 && (
        <div className="vx-gallery__thumbs" role="list">
          {images.map((img, idx) => (
            <button
              key={img.id ?? idx}
              role="listitem"
              className={`vx-gallery__thumb ${selectedImage === idx ? "is-active" : ""}`}
              onClick={() => onSelect(idx)}
              aria-label={`Ver imagen ${idx + 1}`}
              aria-pressed={selectedImage === idx}
            >
              <img
                src={img.url}
                alt={img.alt || `Miniatura ${idx + 1}`}
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
