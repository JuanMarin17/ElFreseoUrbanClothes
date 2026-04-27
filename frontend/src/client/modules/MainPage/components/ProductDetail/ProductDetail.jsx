import React, { useState } from "react";
import { useFavorites } from "../products/FavoritesContext";
import { Star, Send, X, Truck, RotateCcw } from "lucide-react";
import { productsMock } from "../../services/productsMock";
import "./ProductDetail.css";

const fmt = (price) => `$${price.toLocaleString("es-CO")}`;

const ProductDetail = ({ product, onClose }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [selectedSize, setSelectedSize] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [newComment, setNewComment] = useState("");

  const fav = isFavorite(product.id);
  const images = [product.image, product.image, product.image];
  const related = productsMock
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  return (
    <div
      className="detailOverlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="detailBox">
        <button className="detailClose" onClick={onClose}>
          <X size={24} />
        </button>

        {/* COLUMNA IZQUIERDA: Visual y Premium */}
        <div className="detailLeft">
          <div className="detailMainImg">
            <img src={images[activeImg]} alt={product.name} />
          </div>
          <div className="detailThumbs">
            {images.map((img, i) => (
              <button
                key={i}
                className={`detailThumb ${activeImg === i ? "active" : ""}`}
                onClick={() => setActiveImg(i)}
              >
                <img src={img} alt={`Vista ${i}`} />
              </button>
            ))}
          </div>
        </div>

        {/* COLUMNA DERECHA: Info con mucho espacio */}
        <div className="detailRight">
          <div className="detailContent">
            <header className="detailHeader">
              <div className="detailBadges">
                <span className="badge-blue">Nuevo</span>
                <span className="category-tag">{product.category}</span>
              </div>
              <h2 className="detailTitle">
                {product.name}
                <span>{product.sub || "Urban Collection"}</span>
              </h2>

              <div className="detailRating">
                <div className="stars">
                  {[1, 2, 3, 4].map((s) => (
                    <Star key={s} size={18} fill="#3b82f6" stroke="#3b82f6" />
                  ))}
                  <Star size={18} stroke="#444" />
                </div>
                <span className="resenas">(12 reseñas verificadas)</span>
              </div>

              <p className="detailPrice">{fmt(product.price)}</p>
            </header>

            <div className="detailDivider" />

            {/* Tallas con botones más grandes */}
            <section className="detailSection">
              <p className="label">Talla disponible</p>
              <div className="sizeGrid">
                {["S", "M", "L", "XL", "2XL"].map((size) => (
                  <button
                    key={size}
                    className={`sizeBtn ${selectedSize === size ? "active" : ""}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </section>

            {/* Acciones de compra */}
            <div className="detailActions">
              <button className={`btn-buy ${!selectedSize ? "disabled" : ""}`}>
                {selectedSize ? "Agregar al carrito" : "Selecciona tu talla"}
              </button>
              <button
                className={`btn-fav ${fav ? "active" : ""}`}
                onClick={() => toggleFavorite(product)}
              >
                {fav ? "❤️" : "🖤"}
              </button>
            </div>

            {/* Meta Info */}
            <div className="detailMeta">
              <div className="metaItem">
                <Truck size={20} />{" "}
                <span>Envío express gratis en pedidos +$150.000</span>
              </div>
              <div className="metaItem">
                <RotateCcw size={20} />{" "}
                <span>Garantía de devolución de 30 días</span>
              </div>
            </div>

            <div className="detailDivider" />

            {/* Feed de Comentarios */}
            <section className="detailSection">
              <p className="label">Opiniones de la comunidad</p>
              <div className="commentBox">
                <p className="commentUser">@UrbanStyle_Dev</p>
                <p className="commentText">
                  El corte es perfecto y el color azul neón resalta muchísimo en
                  persona. 10/10.
                </p>
              </div>
              <div className="commentInput">
                <input
                  type="text"
                  placeholder="Comparte tu opinión..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button className="btn-send">
                  <Send size={18} />
                </button>
              </div>
            </section>

            {/* Sugerencias Relacionadas */}
            <section className="detailSection">
              <p className="label">Completa tu outfit</p>
              <div className="relatedList">
                {related.map((item) => (
                  <div key={item.id} className="relatedCard">
                    <img src={item.image} alt={item.name} />
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
