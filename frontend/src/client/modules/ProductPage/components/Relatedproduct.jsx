import { Link } from "react-router-dom";

/**
 * RelatedProducts
 * Sección de productos relacionados en formato grid con tarjetas.
 *
 * Props:
 *  - products {Array} Lista de productos relacionados:
 *    [{ id, name, categoryName, priceFormatted, rating, reviewCount, thumbnailUrl }]
 */
export default function RelatedProducts({ products = [] }) {
  if (!products.length) return null;

  return (
    <section className="vx-related" aria-label="Productos relacionados">
      <div className="vx-wrap">
        <div className="vx-section-head">
          <h2 className="vx-section-head__title">
            También te puede <span>interesar</span>
          </h2>
          <Link to="/products" className="vx-section-head__link">
            Ver todo{" "}
            <i
              className="fa-solid fa-arrow-right"
              style={{ fontSize: "0.75rem" }}
              aria-hidden="true"
            />
          </Link>
        </div>

        <div className="vx-product-grid">
          {products.map((product) => (
            <Link
              key={product.id}
              to={`/products/${product.id}`}
              className="vx-product-card"
            >
              {/* Imagen */}
              <div className="vx-product-card__img">
                {product.thumbnailUrl ? (
                  <img
                    src={product.thumbnailUrl}
                    alt={product.name}
                    loading="lazy"
                  />
                ) : (
                  <div
                    className="vx-product-card__img--empty"
                    aria-hidden="true"
                  >
                    <i className="fa-solid fa-box" />
                  </div>
                )}
                <button
                  className="vx-product-card__wish"
                  aria-label={`Agregar ${product.name} a favoritos`}
                  onClick={(e) => e.preventDefault()}
                >
                  <i className="fa-regular fa-heart" aria-hidden="true" />
                </button>
              </div>

              {/* Info */}
              <div className="vx-product-card__body">
                <div className="vx-product-card__cat">
                  {product.categoryName}
                </div>
                <div className="vx-product-card__name">{product.name}</div>
                <div className="vx-product-card__footer">
                  <span className="vx-product-card__price">
                    {product.priceFormatted}
                  </span>
                  <div className="vx-product-card__stars">
                    <i className="fa-solid fa-star" aria-hidden="true" />
                    {product.rating}
                    <span>({product.reviewCount?.toLocaleString()})</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
