/**
 * TrustStrip
 * Banda de garantías y beneficios del producto (garantía, devolución, envío, etc.)
 *
 * Props:
 *  - items {Array} Lista de ítems: [{ id, icon, label }]
 *                  icon: clase FontAwesome (ej: "fa-solid fa-shield-halved")
 */
export default function TrustStrip({ items = [] }) {
  if (!items.length) return null;

  return (
    <div
      className="vx-trust vx-anim vx-anim--d4"
      aria-label="Garantías y beneficios"
    >
      {items.map((item) => (
        <div key={item.id} className="vx-trust__item">
          <div className="vx-trust__icon" aria-hidden="true">
            <i className={item.icon} />
          </div>
          <span className="vx-trust__text">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
