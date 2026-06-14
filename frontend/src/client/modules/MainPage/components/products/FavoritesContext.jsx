import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  getWishlist,
  toggleInWishlist,
  isWishlisted,
} from "../../../../../utils/wishlistService";

const FavoritesContext = createContext(null);

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState(() => getWishlist());

  // Sincronizar cuando otro componente modifica la wishlist
  useEffect(() => {
    const sync = () => setFavorites(getWishlist());
    window.addEventListener("wishlist-updated", sync);
    return () => window.removeEventListener("wishlist-updated", sync);
  }, []);

  const toggleFavorite = useCallback((product) => {
    toggleInWishlist(product);
    setFavorites(getWishlist());
  }, []);

  const isFavorite = useCallback((id) => isWishlisted(id), []);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useFavorites = () => useContext(FavoritesContext);
