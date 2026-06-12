import './PageSpinner.css';

/**
 * @param {{ fullscreen?: boolean, label?: string | null }} props
 * fullscreen=true  → overlay fijo, fondo oscuro (Suspense de rutas)
 * fullscreen=false → bloque inline dentro de una sección (default)
 */
export default function PageSpinner({ fullscreen = false, label = 'Cargando...' }) {
  return (
    <div
      className={`pg-wrap${fullscreen ? ' pg-wrap--full' : ' pg-wrap--inline'}`}
      role="status"
      aria-label={label ?? 'Cargando'}
    >
      <div className="pg-dots" aria-hidden="true">
        <span className="pg-dot" />
        <span className="pg-dot" />
        <span className="pg-dot" />
      </div>
      {label && <p className="pg-label">{label}</p>}
    </div>
  );
}
