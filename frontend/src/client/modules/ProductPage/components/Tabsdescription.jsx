/**
 * TabDescription
 * Panel de descripción. Usa los campos reales del backend:
 * description (string), brand, categories.
 *
 * Props:
 *  - description {string}
 *  - brand       {string}
 *  - categories  {string[]}
 */
export default function TabDescription({
  description,
  brand,
  categories = [],
}) {
  return (
    <div
      role="tabpanel"
      id="panel-description"
      aria-labelledby="tab-description"
    >
      <div className="vx-desc-grid">
        <div>
          {brand && (
            <p className="vx-desc__brand">
              <i className="fa-solid fa-tag" aria-hidden="true" /> {brand}
            </p>
          )}

          <h2 className="vx-desc__title">Sobre este producto</h2>

          <p className="vx-desc__text">
            {description || "Sin descripción disponible."}
          </p>

          {categories.length > 0 && (
            <div className="vx-desc__cats">
              <h3
                className="vx-desc__title"
                style={{ marginTop: 24, marginBottom: 12 }}
              >
                Categorías
              </h3>
              <div className="vx-variants__row">
                {categories.map((cat) => (
                  <span
                    key={cat}
                    className="vx-variant-btn"
                    style={{ cursor: "default" }}
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
