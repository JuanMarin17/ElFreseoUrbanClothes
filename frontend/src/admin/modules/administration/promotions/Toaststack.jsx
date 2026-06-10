/**
 * ToastStack
 * Notificaciones toast apiladas en la esquina inferior derecha.
 *
 * Props:
 *  - toasts {Array<{ id, message, type }>}
 *    type: 'success' | 'error' | 'info'
 */
export default function ToastStack({ toasts = [] }) {
  if (!toasts.length) return null;

  const icons = {
    success: "fa-solid fa-circle-check",
    error: "fa-solid fa-circle-exclamation",
    info: "fa-solid fa-circle-info",
  };

  return (
    <div className="vx-toast-stack" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`vx-toast vx-toast--${toast.type}`}
          role="status"
        >
          <i className={icons[toast.type] ?? icons.info} aria-hidden="true" />
          {toast.message}
        </div>
      ))}
    </div>
  );
}
