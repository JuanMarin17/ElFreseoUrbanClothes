import "./ProductCard.css";

const fmt = (price) => `$${price.toLocaleString("es-CO")}`;

const getBadge = (tags = []) => {
  if (tags.includes("en-oferta")) return { label: "Oferta", cls: "badgeOffer" };
  if (tags.includes("nuevos"))    return { label: "Nuevo",  cls: "" };
  return null;
};

const ProductCard = ({ product, index }) => {
  const badge = getBadge(product.tags);
  const [first, ...rest] = product.name.split(" ");

  return (
    <article className="card" style={{ animationDelay: `${index * 0.05}s` }}>
      <div className="imageWrapper">
        {badge && <span className={`badge ${badge.cls}`}>{badge.label}</span>}
        <img
          src={product.image}
          alt={`${product.name} ${product.subtitle}`}
          className="image"
          loading="lazy"
        />
      </div>
      <div className="info">
        <div>
          <p className="name">
            <span>{first}</span>{rest.length ? ` ${rest.join(" ")}` : ""}
          </p>
          <p className="subtitle">{product.subtitle}</p>
        </div>
        <p className="price">{fmt(product.price)}</p>
        <button className="buyButton">Comprar</button>
      </div>
    </article>
  );
};

export default ProductCard;