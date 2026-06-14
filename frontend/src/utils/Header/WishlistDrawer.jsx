import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { removeFromWishlist } from "../wishlistService.js";
import "./WishlistDrawer.css";

function WishlistItem({ item, onRemove, onNavigate }) {
  const productUrl = `/products/${item.id}`;

  return (
    <div className="wl-item">
      <div className="wl-item__img">
        {item.image ? (
          <img src={item.image} alt={item.name} />
        ) : (
          <div className="wl-item__img-placeholder">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}
      </div>

      <div className="wl-item__info">
        <p className="wl-item__name">{item.name}</p>
        <p className="wl-item__price">{item.priceFormatted}</p>
        <Link
          to={productUrl}
          className="wl-item__link"
          onClick={() => {
            if (item.storeId)   localStorage.setItem("storeId",   item.storeId);
            if (item.storeSlug) localStorage.setItem("storeSlug", item.storeSlug);
            onNavigate();
          }}
        >
          Ver producto →
        </Link>
      </div>

      <button
        className="wl-item__remove"
        onClick={() => onRemove(item.id)}
        aria-label="Quitar de favoritos"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

export default function WishlistDrawer({ isOpen, onClose, items }) {
  const navigate = useNavigate();
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      <div
        className={`wl-backdrop ${isOpen ? "wl-backdrop--visible" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`wl-panel ${isOpen ? "wl-panel--open" : ""}`}
        aria-label="Lista de deseos"
      >
        {/* Header */}
        <div className="wl-header">
          <div className="wl-header__left">
            <svg className="wl-header__icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span className="wl-header__title">Favoritos</span>
            {items.length > 0 && (
              <span className="wl-header__count">{items.length}</span>
            )}
          </div>
          <button className="wl-close" onClick={onClose} aria-label="Cerrar favoritos">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="wl-body">
          {items.length === 0 ? (
            <div className="wl-empty">
              <div className="wl-empty__icon">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
              <p className="wl-empty__title">Sin favoritos aún</p>
              <p className="wl-empty__sub">
                Toca el corazón en cualquier producto para guardarlo aquí.
              </p>
            </div>
          ) : (
            <div className="wl-items">
              {items.map((item) => (
                <WishlistItem
                  key={item.id}
                  item={item}
                  onRemove={removeFromWishlist}
                  onNavigate={onClose}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="wl-footer">
            <p className="wl-footer__count">
              {items.length} {items.length === 1 ? "producto guardado" : "productos guardados"}
            </p>
            <button
              className="wl-footer__ver-todos"
              onClick={() => { onClose(); navigate('/favoritos'); }}
            >
              Ver todos mis favoritos →
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
