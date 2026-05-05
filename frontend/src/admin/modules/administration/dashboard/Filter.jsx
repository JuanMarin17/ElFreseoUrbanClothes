import React, { useState, useEffect } from "react";
import "./Filter.css";

// Opción A: Función por defecto (Recomendado)
const Filter = ({ onFilterChange = () => {} }) => { 
  // ... resto del código
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000000 });

  const categories = ["ALL", "Categoria", "Nombre", "Estado", "Tallas"];

  // Notificar al padre cada vez que un filtro cambie
  useEffect(() => {
    onFilterChange({
      search: searchTerm,
      category: activeCategory,
      prices: priceRange,
    });
  }, [searchTerm, activeCategory, priceRange, onFilterChange]);

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setPriceRange((prev) => ({ ...prev, [name]: Number(value) }));
  };

  return (
    <div className="filter-system">
      {/* Barra de Búsqueda con Scanner Line */}
      <div className="search-module">
        <div className="input-wrapper">
          <span className="scanner-line"></span>
          <input
            type="text"
            placeholder="BUSCAR PRODUCTO"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="search-btn">Buscar</button>
        </div>
      </div>

      <div className="filter-controls">
        {/* Categorías con Status Dot Animado */}
        <div className="category-grid">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-tab ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              <span className="status-dot"></span>
              {cat.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="secondary-filters">
          {/* Nuevo: Filtro de Precio Numérico con Animación */}
          <div className="filter-group price-range-module">
            <label>PRICE_VAL_RANGE</label>
            <div className="price-inputs-row">
              <input
                type="number"
                name="min"
                placeholder="MIN"
                onChange={handlePriceChange}
              />
              <span className="price-separator">/</span>
              <input
                type="number"
                name="max"
                placeholder="MAX"
                onChange={handlePriceChange}
              />
            </div>
          </div>

          <div className="filter-group">
            <label>ORDENAR_POR</label>
            <select className="tech-select">
              <option value="latest">LATEST_RELEASE</option>
              <option value="asc">PRECIO_ASC</option>
              <option value="desc">PRECIO_DESC</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filter;
