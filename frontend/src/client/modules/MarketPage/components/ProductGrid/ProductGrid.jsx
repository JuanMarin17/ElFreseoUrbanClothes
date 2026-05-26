import React, { useState } from 'react';
import { Heart, ShoppingCart, ArrowRight, Star } from 'lucide-react';
import './ProductGrid.css';

// ─────────────────────────────────────────────
// ProductGrid — reutilizable para cualquier listado
// Props:
//   title    — string: título de la sección
//   products — array de productos (mock o API)
//   loading  — boolean (opcional)
//
// 🔌 API TODO: El padre (MarketPage) hace el fetch
//    y pasa los productos como prop. Añadir `loading`
//    prop para mostrar skeletons mientras carga.
// ─────────────────────────────────────────────

export default function ProductGrid({ title, products = [], loading = false }) {
  const [wishlist, setWishlist] = useState([]);

  const toggleWish = (id) => {
    setWishlist(prev =>
      prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
    );
  };

  return (
    <section className="vx-pgrid-root">
      <div className="vx-section-wrap">
        <div className="vx-section-head">
          <h2>{title}</h2>
          <a href="/productos" className="vx-section-link">
            Ver más <ArrowRight size={14} />
          </a>
        </div>

        <div className="vx-pgrid-grid">
          {loading
            ? [...Array(6)].map((_, i) => (
                <div key={i} className="vx-product-skeleton" />
              ))
            : products.map(product => (
                <article key={product.id} className="vx-product-card">
                  {/* Imagen */}
                  <div className="vx-product-img-wrap">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="vx-product-img"
                      loading="lazy"
                    />

                    {/* Badge */}
                    {product.badge && (
                      <span className="vx-product-badge">{product.badge}</span>
                    )}

                    {/* Acciones hover */}
                    <div className="vx-product-actions">
                      <button
                        className="vx-product-action-btn"
                        aria-label="Agregar al carrito"
                      >
                        <ShoppingCart size={15} />
                      </button>
                      <button
                        className={`vx-product-action-btn ${wishlist.includes(product.id) ? 'is-wished' : ''}`}
                        aria-label="Agregar a favoritos"
                        onClick={() => toggleWish(product.id)}
                      >
                        <Heart size={15} fill={wishlist.includes(product.id) ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="vx-product-meta">
                    <p className="vx-product-title">{product.title}</p>
                    <div className="vx-product-bottom">
                      <span className="vx-product-price">${product.price.toFixed(2)}</span>
                      <span className="vx-product-sales">{product.badge}</span>
                    </div>
                  </div>
                </article>
              ))
          }
        </div>
      </div>
    </section>
  );
}
