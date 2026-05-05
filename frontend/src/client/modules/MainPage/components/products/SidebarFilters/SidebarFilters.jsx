import { useState, useCallback } from "react";
import { useFavorites } from "../FavoritesContext";
import "./SidebarFilters.css";

const MAX_PRICE = 165000;
const SIZES = ["S", "M", "L", "XL", "2XL", "3XL", "4XL"];
const COLORS = ["white", "black", "gray", "blue", "yellow", "green"];
const CATEGORIES = ["Camisetas", "Hoodies", "Chaquetas", "Pantalones", "Gorras"];
const COLOR_CLASS = { white: "colorWhite", black: "colorBlack", gray: "colorGray", blue: "colorBlue", yellow: "colorYellow", green: "colorGreen" };
const TAGS = [
  { value: "nuevos", label: "Nuevos", icon: "✦" },
  { value: "en-oferta", label: "En oferta", icon: "⚡" },
  { value: "mas-vendidos", label: "Más vendidos", icon: "★" },
];

const SidebarFilters = ({ filters, setFilters }) => {
  const { favorites } = useFavorites();
  const [priceDisplay, setPriceDisplay] = useState(MAX_PRICE);

  const handlePrice = useCallback((e) => {
    const val = Number(e.target.value);
    setPriceDisplay(val);
    setFilters(prev => ({ ...prev, maxPrice: val }));
  }, [setFilters]);

  const toggle = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value],
    }));
  }, [setFilters]);

  const toggleFavoritesFilter = useCallback(() => {
    setFilters(prev => ({ ...prev, onlyFavorites: !prev.onlyFavorites }));
  }, [setFilters]);

  const reset = useCallback(() => {
    setPriceDisplay(MAX_PRICE);
    setFilters({ maxPrice: MAX_PRICE, sizes: [], categories: [], colors: [], tags: [], onlyFavorites: false });
  }, [setFilters]);

  const pct = ((priceDisplay / MAX_PRICE) * 100).toFixed(1);

  return (
    <aside className="sidebar">

      {/* Favoritos */}
      <button
        className={`favFilterBtn ${filters.onlyFavorites ? "active" : ""}`}
        onClick={toggleFavoritesFilter}
      >
        <span className="favFilterIcon">{filters.onlyFavorites ? "♥" : "♡"}</span>
        Mis favoritos
        {favorites.length > 0 && (
          <span className="favCount">{favorites.length}</span>
        )}
      </button>

      <div className="divider" />

      {/* Precio */}
      <div className="section">
        <p className="sectionTitle">Precio</p>
        <div className="priceRange">
          <div className="priceLabels">
            <span>$0</span>
            <span className="priceValue">${priceDisplay.toLocaleString("es-CO")}</span>
          </div>
          <input
            type="range" className="slider"
            min={0} max={MAX_PRICE} step={5000} value={priceDisplay}
            onChange={handlePrice}
            style={{ "--progress": `${pct}%` }}
          />
        </div>
      </div>

      <div className="divider" />

      {/* Talla */}
      <div className="section">
        <p className="sectionTitle">Talla</p>
        <div className="twoCol">
          {SIZES.map(size => (
            <label key={`size-${size}`} className="checkLabel">
              <input type="checkbox" checked={filters.sizes.includes(size)} onChange={() => toggle("sizes", size)} />
              {size}
            </label>
          ))}
        </div>
      </div>

      <div className="divider" />

      {/* Color */}
      <div className="section">
        <p className="sectionTitle">Color</p>
        <div className="colorGrid">
          {COLORS.map(color => (
            <button
              key={`color-${color}`}
              title={color}
              className={`colorCircle ${COLOR_CLASS[color]} ${filters.colors.includes(color) ? "active" : ""}`}
              onClick={() => toggle("colors", color)}
            />
          ))}
        </div>
      </div>

      <div className="divider" />

      {/* Categoría */}
      <div className="section">
        <p className="sectionTitle">Categoría</p>
        <div className="twoCol">
          {CATEGORIES.map(cat => (
            <label key={`cat-${cat}`} className="checkLabel">
              <input type="checkbox" checked={filters.categories.includes(cat)} onChange={() => toggle("categories", cat)} />
              {cat}
            </label>
          ))}
        </div>
      </div>

      <div className="divider" />

      {/* Otros */}
      <div className="section">
        <p className="sectionTitle">Otros</p>
        <div className="tagList">
          {TAGS.map(({ value, label, icon }) => (
            <label key={`tag-${value}`} className="tagOption">
              <input type="checkbox" checked={filters.tags.includes(value)} onChange={() => toggle("tags", value)} />
              <span className="tagIcon">{icon}</span>
              {label}
            </label>
          ))}
        </div>
      </div>

      <button className="resetButton" onClick={reset}>Limpiar filtros</button>
    </aside>
  );
};

export default SidebarFilters;