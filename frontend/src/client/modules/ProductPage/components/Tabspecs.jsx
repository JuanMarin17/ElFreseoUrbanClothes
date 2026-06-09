/**
 * TabSpecs
 * Panel de especificaciones técnicas agrupadas por categoría.
 *
 * Props:
 *  - specGroups {Array} Grupos de specs:
 *    [{ id, label, icon, specs: [{ key, value }] }]
 *    icon: clase FontAwesome (ej: "fa-solid fa-wave-square")
 */
export default function TabSpecs({ specGroups = [] }) {
  if (!specGroups.length) {
    return (
      <div role="tabpanel" id="panel-specs" aria-labelledby="tab-specs">
        <p className="vx-desc__text">No hay especificaciones disponibles.</p>
      </div>
    );
  }

  return (
    <div role="tabpanel" id="panel-specs" aria-labelledby="tab-specs">
      <div className="vx-specs-grid">
        {specGroups.map((group) => (
          <div key={group.id} className="vx-specs-card">
            <div className="vx-specs-card__head">
              <i className={group.icon} aria-hidden="true" />
              {group.label}
            </div>
            {group.specs.map((spec) => (
              <div key={spec.key} className="vx-spec-row">
                <span className="vx-spec-row__key">{spec.key}</span>
                <span className="vx-spec-row__val">{spec.value}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
