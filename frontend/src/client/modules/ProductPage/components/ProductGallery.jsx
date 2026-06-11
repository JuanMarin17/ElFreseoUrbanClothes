import { useReducer, useCallback, useEffect } from "react";

const SCALE = 4;

export default function ProductGallery({ images = [], selectedImage, onSelect, productName = "Producto" }) {
  const [active_z, dispatch] = useReducer(
    (s, a) => a === "IN" ? true : false,
    false
  );

  const active = images[selectedImage] ?? null;
  const hasImages = images.length > 0;
  const hasThumbs = images.length > 1;

  /* Reset al cambiar imagen */
  useEffect(() => { dispatch("OUT"); }, [selectedImage]);

  /* Escape */
  useEffect(() => {
    if (!active_z) return;
    const fn = (e) => { if (e.key === "Escape") dispatch("OUT"); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [active_z]);

  const toggle = useCallback((e) => {
    if (!hasImages) return;
    e.stopPropagation();
    dispatch(active_z ? "OUT" : "IN");
  }, [hasImages, active_z]);

  const cursor = !hasImages ? "default" : active_z ? "zoom-out" : "zoom-in";

  const imgStyle = {
    transformOrigin: "50% 50%",
    transform: active_z ? `scale(${SCALE})` : "scale(1)",
    transition: "transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
    cursor,
    userSelect: "none",
  };

  return (
    <div className="vx-gallery vx-anim">
      <div className="vx-gallery__wrap">

        {/* Imagen principal */}
        <div
          className={`vx-gallery__main${active_z ? " is-zoomed" : ""}`}
          style={{ cursor }}
          onClick={toggle}
        >
          {hasImages ? (
            <img
              key={active.url}
              src={active.url}
              alt={active.alt || `${productName} - imagen principal`}
              loading="eager"
              decoding="async"
              style={imgStyle}
              draggable={false}
            />
          ) : (
            <div className="vx-gallery__main--empty">
              <i className="fa-solid fa-image" aria-hidden="true" />
              <span>Sin imagen</span>
            </div>
          )}

          {hasImages && !active_z && (
            <div className="vx-gallery__zoom-hint" aria-hidden="true">
              <i className="fa-solid fa-magnifying-glass-plus" />
              <span>Click para ampliar</span>
            </div>
          )}

          {hasImages && active_z && (
            <div className="vx-gallery__zoom-active" aria-hidden="true">
              <i className="fa-solid fa-compress" />
              <span>Click o ESC para salir</span>
            </div>
          )}
        </div>

        {/* Botón toggle zoom */}
        {hasImages && (
          <button
            className={`vx-gallery__zoom${active_z ? " is-active" : ""}`}
            aria-label={active_z ? "Salir del zoom" : "Ampliar imagen"}
            type="button"
            onClick={toggle}
          >
            <i className={active_z ? "fa-solid fa-compress" : "fa-solid fa-expand"} aria-hidden="true" />
          </button>
        )}
      </div>

      {hasThumbs && (
        <div className="vx-gallery__thumbs" role="list">
          {images.map((img, idx) => (
            <button
              key={img.id}
              role="listitem"
              className={`vx-gallery__thumb${selectedImage === idx ? " is-active" : ""}`}
              onClick={() => onSelect(idx)}
              aria-pressed={selectedImage === idx}
            >
              <img src={img.url} alt={img.alt || `Imagen ${idx + 1}`} loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
