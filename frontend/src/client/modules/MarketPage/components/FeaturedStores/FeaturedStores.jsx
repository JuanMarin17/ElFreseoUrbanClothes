import React, { useState, useEffect } from 'react';
import { Star, Package, ArrowRight, BadgeCheck } from 'lucide-react';
import './FeaturedStores.css';

// ─────────────────────────────────────────────
// FeaturedStores
// 🔌 API TODO:
//   useEffect → fetch('/api/v1/market/stores?featured=true&limit=6')
//   Respuesta esperada: { stores: Store[] }
//   Store: { id, name, tagline, category, cover, avatar,
//            rating, reviews, products, verified }
// ─────────────────────────────────────────────
const MOCK_STORES = [
  { id: 1, name: "Luna Store",   tagline: "Moda femenina única",      category: "Mujer",      cover: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&q=80",  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80",  rating: 4.9, reviews: 841,  products: 312, verified: true },
  { id: 2, name: "Trendify",     tagline: "Streetwear y tendencias",   category: "Hombre",     cover: "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=500&q=80",  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&q=80",  rating: 4.7, reviews: 523,  products: 198, verified: true },
  { id: 3, name: "Home & Co",    tagline: "Hogar con estilo propio",   category: "Hogar",      cover: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=500&q=80",  avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80",  rating: 4.8, reviews: 610,  products: 254, verified: false },
  { id: 4, name: "Beauty Glow",  tagline: "Skincare natural y vegano", category: "Belleza",    cover: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&q=80",  avatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=80&q=80",  rating: 4.9, reviews: 1204, products: 89,  verified: true },
  { id: 5, name: "Active Life",  tagline: "Equipamiento deportivo",    category: "Deportes",   cover: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&q=80",  avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80&q=80",  rating: 4.6, reviews: 387,  products: 143, verified: true },
  { id: 6, name: "Jewelry Chic", tagline: "Joyería artesanal fina",    category: "Joyería",    cover: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&q=80",  avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=80&q=80",  rating: 4.8, reviews: 295,  products: 76,  verified: false },
];

export default function FeaturedStores() {
  const [stores, setStores] = useState(MOCK_STORES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 🔌 Descomenta y ajusta cuando tengas el endpoint real:
    // setLoading(true);
    // fetch('/api/v1/market/stores?featured=true&limit=6')
    //   .then(r => r.json())
    //   .then(data => setStores(data.stores))
    //   .catch(console.error)
    //   .finally(() => setLoading(false));
  }, []);

  return (
    <section className="vx-fstores-root">
      <div className="vx-section-wrap">
        <div className="vx-section-head">
          <h2>Tiendas <span>destacadas</span></h2>
          <a href="/tiendas" className="vx-section-link">
            Ver todas <ArrowRight size={14} />
          </a>
        </div>

        {loading ? (
          <div className="vx-fstores-loading">
            {[...Array(6)].map((_, i) => <div key={i} className="vx-store-skeleton" />)}
          </div>
        ) : (
          <div className="vx-fstores-grid">
            {stores.map(store => (
              <article key={store.id} className="vx-store-card">
                {/* Cover */}
                <div className="vx-store-cover-wrap">
                  <img src={store.cover} alt={store.name} className="vx-store-cover" loading="lazy" />
                  <div className="vx-store-cover-overlay" />
                  {/* Avatar */}
                  <div className="vx-store-avatar-ring">
                    <img src={store.avatar} alt="" className="vx-store-avatar" />
                    {store.verified && (
                      <span className="vx-store-verified" title="Tienda verificada">
                        <BadgeCheck size={12} />
                      </span>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="vx-store-info">
                  <p className="vx-store-category">{store.category}</p>
                  <h4 className="vx-store-name">{store.name}</h4>
                  <p className="vx-store-tagline">{store.tagline}</p>

                  <div className="vx-store-meta">
                    <span className="vx-store-rating">
                      <Star size={11} fill="currentColor" /> {store.rating}
                      <em>({store.reviews})</em>
                    </span>
                    <span className="vx-store-products">
                      <Package size={11} /> {store.products}
                    </span>
                  </div>

                  <a href={`/tienda/${store.id}`} className="vx-store-btn">
                    Visitar tienda
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
