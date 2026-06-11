import { Link } from "react-router-dom";

export default function TabDescription({ description, brand, categories = [], storeCard }) {
  return (
    <div role="tabpanel" id="panel-description" aria-labelledby="tab-description">
      <div className="vx-desc-grid">

        {/* ── Columna izquierda: descripción ── */}
        <div>
          {brand && (
            <p className="vx-desc__brand">
              <i className="fa-solid fa-tag" aria-hidden="true" /> {brand}
            </p>
          )}

          <h2 className="vx-desc__title">Sobre este producto</h2>
          <p className="vx-desc__text">{description || "Sin descripción disponible."}</p>

          {categories.length > 0 && (
            <div className="vx-desc__cats">
              <h3 className="vx-desc__title" style={{ marginTop: 24, marginBottom: 12 }}>
                Categorías
              </h3>
              <div className="vx-variants__row">
                {categories.map((cat) => (
                  <span key={cat} className="vx-variant-btn" style={{ cursor: "default" }}>
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Columna derecha: tienda propietaria ── */}
        {storeCard && (
          <aside className="vx-store-owner-card">
            <p className="vx-store-owner-card__label">
              <i className="fa-solid fa-store" aria-hidden="true" /> Vendido por
            </p>

            <Link to={`/tienda/${storeCard.slug}`} className="vx-store-owner-card__inner">
              <div
                className="vx-store-owner-card__logo"
                style={{ background: `${storeCard.accent}18`, border: `1px solid ${storeCard.accent}30` }}
              >
                {storeCard.logoUrl
                  ? <img src={storeCard.logoUrl} alt={storeCard.name} />
                  : <span style={{ color: storeCard.accent }}>
                      {(storeCard.name ?? "??").slice(0, 2).toUpperCase()}
                    </span>
                }
              </div>

              <div className="vx-store-owner-card__info">
                <span className="vx-store-owner-card__name">{storeCard.name}</span>
                <span className="vx-store-owner-card__cta" style={{ color: storeCard.accent }}>
                  Ver tienda <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: "0.65rem" }} />
                </span>
              </div>
            </Link>
          </aside>
        )}

      </div>
    </div>
  );
}
