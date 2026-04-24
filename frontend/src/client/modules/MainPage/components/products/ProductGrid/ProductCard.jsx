import { useState } from "react";
import { useFavorites } from "../FavoritesContext";
import ProductDetail from "../../ProductDetail/ProductDetail";
import "./ProductCard.css";

const fmt = (price) => `$${price.toLocaleString("es-CO")}`;

const getBadge = (tags = []) => {
  if (tags.includes("en-oferta")) return { label: "Oferta", cls: "badgeOffer" };
  if (tags.includes("nuevos")) return { label: "Nuevo", cls: "" };
  return null;
};

const ProductCard = ({ product, index }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [showDetail, setShowDetail] = useState(false);
  const badge = getBadge(product.tags);
  const fav = isFavorite(product.id);
  const [first, ...rest] = product.name.split(" ");

  return (
    <>
      <article
        className="card"
        style={{ animationDelay: `${index * 0.05}s` }}
        onClick={() => setShowDetail(true)}
      >
        <div className="imageWrapper">
          {badge && <span className={`badge ${badge.cls}`}>{badge.label}</span>}

          {/* Botón favorito */}
          <button
            className={`favBtn ${fav ? "active" : ""}`}
            onClick={(e) => { e.stopPropagation(); toggleFavorite(product); }}
            title={fav ? "Quitar de favoritos" : "Añadir a favoritos"}
          >
            {fav ? "♥" : "♡"}
          </button>

          <img
            src={product.image}
            alt={`${product.name} ${product.subtitle}`}
            className="image"
            loading="lazy"
          />

          {/* Overlay hover */}
          <div className="cardOverlay">
            <span className="cardOverlayText">Ver producto</span>
          </div>
        </div>

        <div className="info">
          <div>
            <p className="name">
              <span>{first}</span>{rest.length ? ` ${rest.join(" ")}` : ""}
            </p>
            <p className="subtitle">{product.subtitle}</p>
          </div>
          <p className="price">{fmt(product.price)}</p>
        </div>
      </article>

      {showDetail && (
        <ProductDetail product={product} onClose={() => setShowDetail(false)} />
      )}
    </>
  );
};

export default ProductCard;