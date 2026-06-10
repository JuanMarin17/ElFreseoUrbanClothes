/**
 * SkeletonHero
 * Placeholder animado que se muestra mientras se cargan los datos del producto.
 * Replica la estructura visual del hero para evitar layout shift.
 */
export default function SkeletonHero() {
  return (
    <div
      className="vx-hero__grid"
      aria-busy="true"
      aria-label="Cargando producto..."
    >
      {/* Galería skeleton */}
      <div className="vx-gallery">
        <div
          className="vx-skeleton"
          style={{ aspectRatio: "4/3", borderRadius: "var(--vx-radius-xl)" }}
        />
        <div style={{ display: "flex", gap: 10 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="vx-skeleton"
              style={{
                flex: 1,
                maxWidth: 90,
                aspectRatio: 1,
                borderRadius: 10,
              }}
            />
          ))}
        </div>
      </div>

      {/* Info skeleton */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div
          className="vx-skeleton"
          style={{ height: 18, width: "40%", borderRadius: 4 }}
        />
        <div
          className="vx-skeleton"
          style={{ height: 56, width: "85%", borderRadius: 8 }}
        />
        <div
          className="vx-skeleton"
          style={{ height: 22, width: "60%", borderRadius: 4 }}
        />
        <div
          className="vx-skeleton"
          style={{ height: 110, borderRadius: "var(--vx-radius-lg)" }}
        />
        <div
          className="vx-skeleton"
          style={{ height: 44, width: "70%", borderRadius: 8 }}
        />
        <div
          className="vx-skeleton"
          style={{ height: 44, width: "70%", borderRadius: 8 }}
        />
        <div
          className="vx-skeleton"
          style={{ height: 52, borderRadius: "var(--vx-radius)" }}
        />
        <div
          className="vx-skeleton"
          style={{ height: 80, borderRadius: "var(--vx-radius)" }}
        />
        <div
          className="vx-skeleton"
          style={{ height: 68, borderRadius: "var(--vx-radius)" }}
        />
      </div>
    </div>
  );
}
