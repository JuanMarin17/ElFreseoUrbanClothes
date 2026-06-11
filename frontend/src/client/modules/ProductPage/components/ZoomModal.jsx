import { useEffect, useReducer, useRef, useCallback, useState } from "react";
import { createPortal } from "react-dom";

const ZOOM_MIN  = 1;
const ZOOM_MAX  = 4;
const ZOOM_STEP = 0.5;

/* ── Zoom / pan state ─────────────────────────────────────── */
const zoomInit = () => ({ scale: 1, tx: 0, ty: 0, dragging: false, ox: 0, oy: 0 });

function zoomReduce(s, a) {
  switch (a.type) {
    case "ZOOM": {
      const scale = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN,
        parseFloat((s.scale + a.delta).toFixed(2))));
      return { ...s, scale, tx: scale === ZOOM_MIN ? 0 : s.tx, ty: scale === ZOOM_MIN ? 0 : s.ty };
    }
    case "DRAG_START": return { ...s, dragging: true,  ox: a.x - s.tx, oy: a.y - s.ty };
    case "DRAG_MOVE":  return s.dragging ? { ...s, tx: a.x - s.ox, ty: a.y - s.oy } : s;
    case "DRAG_END":   return { ...s, dragging: false };
    case "RESET":      return zoomInit();
    default:           return s;
  }
}

/**
 * ZoomModal — lightbox a pantalla completa con zoom + pan.
 *
 * Controles:
 *  – Scroll del mouse          → zoom in / out
 *  – Click en imagen           → zoom rápido (+0.5×) / reset si ya está al máximo
 *  – Click + drag              → pan cuando hay zoom activo
 *  – Barra de rango inferior   → zoom preciso
 *  – Botones − / +             → zoom paso a paso
 *  – Flechas ←/→              → navegar entre imágenes
 *  – Tecla Escape              → cerrar
 *  – Teclas ← →               → navegar
 *  – Teclas + / −              → zoom
 *
 * Props:
 *  - images     {Array<{ url: string, alt: string }>}
 *  - startIndex {number}
 *  - onClose    {() => void}
 */
export default function ZoomModal({ images = [], startIndex = 0, onClose }) {
  const [z, dispatch]       = useReducer(zoomReduce, null, zoomInit);
  const [activeIdx, setActiveIdx] = useState(startIndex);
  const viewportRef         = useRef(null);

  const active = images[activeIdx] ?? null;

  /* ── Navegar entre imágenes ─────────────────────────────── */
  const goTo = useCallback((i) => {
    setActiveIdx((i + images.length) % images.length);
    dispatch({ type: "RESET" });
  }, [images.length]);

  /* ── Teclado ─────────────────────────────────────────────── */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape")                       onClose();
      if (e.key === "ArrowLeft")                    goTo(activeIdx - 1);
      if (e.key === "ArrowRight")                   goTo(activeIdx + 1);
      if (e.key === "+" || e.key === "=")           dispatch({ type: "ZOOM", delta: +ZOOM_STEP });
      if (e.key === "-" || e.key === "_")           dispatch({ type: "ZOOM", delta: -ZOOM_STEP });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, goTo, activeIdx]);

  /* ── Bloquear scroll del body ────────────────────────────── */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  /* ── Rueda del mouse (passive: false para preventDefault) ── */
  const onWheel = useCallback((e) => {
    e.preventDefault();
    dispatch({ type: "ZOOM", delta: e.deltaY < 0 ? +ZOOM_STEP : -ZOOM_STEP });
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [onWheel]);

  /* ── Drag ────────────────────────────────────────────────── */
  const onMouseDown  = useCallback((e) => {
    if (z.scale <= 1) return;
    e.preventDefault();
    dispatch({ type: "DRAG_START", x: e.clientX, y: e.clientY });
  }, [z.scale]);

  const onMouseMove  = useCallback((e) => {
    dispatch({ type: "DRAG_MOVE", x: e.clientX, y: e.clientY });
  }, []);

  const onMouseUp    = useCallback(() => dispatch({ type: "DRAG_END" }), []);

  /* ── Click en imagen ─────────────────────────────────────── */
  const onImgClick = useCallback(() => {
    if (z.scale >= ZOOM_MAX) dispatch({ type: "RESET" });
    else dispatch({ type: "ZOOM", delta: +ZOOM_STEP });
  }, [z.scale]);

  /* ── Helpers de presentación ─────────────────────────────── */
  const pct    = Math.round(z.scale * 100);
  const cursor = z.scale > 1 ? (z.dragging ? "grabbing" : "grab") : "zoom-in";

  return createPortal(
    <div className="vx-zm" role="dialog" aria-modal="true"
         aria-label="Vista ampliada del producto"
         onClick={onClose}>

      {/* Cerrar */}
      <button className="vx-zm__close" aria-label="Cerrar" onClick={onClose}>
        <i className="fa-solid fa-xmark" aria-hidden="true" />
      </button>

      {/* Contador de imagen */}
      {images.length > 1 && (
        <div className="vx-zm__counter" aria-live="polite" onClick={(e) => e.stopPropagation()}>
          {activeIdx + 1} <span>/</span> {images.length}
        </div>
      )}

      {/* Viewport de zoom + pan */}
      <div
        ref={viewportRef}
        className="vx-zm__viewport"
        style={{ cursor }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onClick={(e) => e.stopPropagation()}
      >
        {active && (
          <img
            key={active.url}
            src={active.url}
            alt={active.alt ?? "Producto"}
            className="vx-zm__img"
            style={{
              transform: `translate(${z.tx}px, ${z.ty}px) scale(${z.scale})`,
              transition: z.dragging ? "none" : "transform 0.2s cubic-bezier(0.25,0.46,0.45,0.94)",
              cursor,
            }}
            onClick={onImgClick}
            draggable={false}
          />
        )}
      </div>

      {/* Flechas de navegación */}
      {images.length > 1 && (
        <>
          <button className="vx-zm__nav vx-zm__nav--prev"
                  aria-label="Imagen anterior"
                  onClick={(e) => { e.stopPropagation(); goTo(activeIdx - 1); }}>
            <i className="fa-solid fa-chevron-left" aria-hidden="true" />
          </button>
          <button className="vx-zm__nav vx-zm__nav--next"
                  aria-label="Imagen siguiente"
                  onClick={(e) => { e.stopPropagation(); goTo(activeIdx + 1); }}>
            <i className="fa-solid fa-chevron-right" aria-hidden="true" />
          </button>
        </>
      )}

      {/* Barra de controles inferior */}
      <div className="vx-zm__controls" onClick={(e) => e.stopPropagation()}>
        <button className="vx-zm__ctrl-btn" aria-label="Reducir zoom"
                disabled={z.scale <= ZOOM_MIN}
                onClick={() => dispatch({ type: "ZOOM", delta: -ZOOM_STEP })}>
          <i className="fa-solid fa-minus" aria-hidden="true" />
        </button>

        <input
          type="range"
          className="vx-zm__ctrl-range"
          min={ZOOM_MIN} max={ZOOM_MAX} step={0.1}
          value={z.scale}
          aria-label="Nivel de zoom"
          onChange={(e) =>
            dispatch({ type: "ZOOM", delta: parseFloat(e.target.value) - z.scale })
          }
        />

        <button className="vx-zm__ctrl-btn" aria-label="Aumentar zoom"
                disabled={z.scale >= ZOOM_MAX}
                onClick={() => dispatch({ type: "ZOOM", delta: +ZOOM_STEP })}>
          <i className="fa-solid fa-plus" aria-hidden="true" />
        </button>

        <div className="vx-zm__ctrl-level">{pct}%</div>

        <button className="vx-zm__ctrl-btn" aria-label="Restablecer zoom"
                disabled={z.scale === ZOOM_MIN}
                onClick={() => dispatch({ type: "RESET" })}>
          <i className="fa-solid fa-compress" aria-hidden="true" />
        </button>
      </div>
    </div>,
    document.body
  );
}
