import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowLeft, Package } from 'lucide-react';
import {
  getWishlist,
  removeFromWishlist,
  toggleInWishlist,
} from '../../../utils/wishlistService';
import './FavoritosPage.css';

const PLACEHOLDER =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400"><rect width="300" height="400" fill="%23111116"/><text x="150" y="210" text-anchor="middle" fill="%2333334a" font-size="48" font-family="sans-serif">◻</text></svg>';

function FavoritoCard({ item, onRemove }) {
  const navigate = useNavigate();
  const [imgSrc, setImgSrc] = useState(item.image || PLACEHOLDER);
  const [removing, setRemoving] = useState(false);

  const productUrl = `/products/${item.id}`;

  const handleRemove = (e) => {
    e.stopPropagation();
    setRemoving(true);
    setTimeout(() => onRemove(item.id), 220);
  };

  const handleClick = () => {
    if (item.storeId)   localStorage.setItem('storeId',   item.storeId);
    if (item.storeSlug) localStorage.setItem('storeSlug', item.storeSlug);
    navigate(productUrl);
  };

  return (
    <article
      className={`fav-card ${removing ? 'fav-card--removing' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && handleClick()}
    >
      <div className="fav-card__img-wrap">
        <img
          src={imgSrc}
          alt={item.name}
          className="fav-card__img"
          loading="lazy"
          onError={() => setImgSrc(PLACEHOLDER)}
        />
        <button
          className="fav-card__remove"
          aria-label="Quitar de favoritos"
          onClick={handleRemove}
          title="Quitar de favoritos"
        >
          <Heart size={14} fill="#f43f5e" color="#f43f5e" />
        </button>
      </div>

      <div className="fav-card__body">
        <p className="fav-card__name">{item.name}</p>
        <p className="fav-card__price">{item.priceFormatted}</p>
        <button
          className="fav-card__cta"
          onClick={e => { e.stopPropagation(); handleClick(); }}
        >
          <ShoppingBag size={12} />
          Ver producto
        </button>
      </div>
    </article>
  );
}

export default function FavoritosPage() {
  const navigate = useNavigate();
  const [items,   setItems]   = useState(() => getWishlist());

  // Escuchar cambios en wishlist (desde otras pestañas o componentes)
  useEffect(() => {
    const sync = () => setItems(getWishlist());
    window.addEventListener('wishlist-updated', sync);
    return () => window.removeEventListener('wishlist-updated', sync);
  }, []);

  const handleRemove = useCallback((id) => {
    removeFromWishlist(id);
    setItems(getWishlist());
  }, []);

  const handleClearAll = () => {
    items.forEach(i => removeFromWishlist(i.id));
    setItems([]);
  };

  return (
    <div className="fav-root">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="fav-header">
        <button className="fav-back" onClick={() => navigate(-1)} aria-label="Volver">
          <ArrowLeft size={18} />
        </button>

        <div className="fav-header__title-group">
          <Heart size={20} fill="#f43f5e" color="#f43f5e" className="fav-header__icon" />
          <h1 className="fav-header__title">Mis favoritos</h1>
          {items.length > 0 && (
            <span className="fav-header__count">{items.length}</span>
          )}
        </div>

        {items.length > 0 && (
          <button className="fav-clear" onClick={handleClearAll} title="Eliminar todos">
            <Trash2 size={15} />
            Limpiar todo
          </button>
        )}
      </header>

      {/* ── Contenido ───────────────────────────────────────────────────── */}
      <main className="fav-main">
        {items.length === 0 ? (
          <div className="fav-empty">
            <div className="fav-empty__orb" />
            <div className="fav-empty__icon-wrap">
              <Heart size={40} />
            </div>
            <h2 className="fav-empty__title">Aún no tienes favoritos</h2>
            <p className="fav-empty__sub">
              Toca el corazón en cualquier producto para guardarlo aquí y encontrarlo fácilmente después.
            </p>
            <div className="fav-empty__actions">
              <button className="fav-btn-primary" onClick={() => navigate('/catalogo')}>
                <Package size={15} />
                Explorar catálogo
              </button>
              <button className="fav-btn-ghost" onClick={() => navigate('/market')}>
                Ver market →
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="fav-subtitle">
              {items.length} producto{items.length !== 1 ? 's' : ''} guardado{items.length !== 1 ? 's' : ''}
            </p>
            <div className="fav-grid">
              {items.map(item => (
                <FavoritoCard
                  key={item.id}
                  item={item}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
