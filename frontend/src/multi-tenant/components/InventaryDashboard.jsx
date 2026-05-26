import React, { useState } from "react";
import "../components/styles/InventaryDashboard.css";

const InventoryDashboard = () => {
  // 1. Estado para los productos (Aquí vendrían de una API en el futuro)
  const [allProducts] = useState([
    {
      id: 1,
      name: "NEON_VAPOR HOODIE",
      price: "$55.00",
      stock: 24,
      status: "Activo",
      img: "🧥",
    },
    {
      id: 2,
      name: "VAPOR TEE",
      price: "$45.00",
      stock: 50,
      status: "Activo",
      img: "👕",
    },
    {
      id: 3,
      name: "TECH CARGO PANTS",
      price: "$70.00",
      stock: 18,
      status: "Activo",
      img: "👖",
    },
    {
      id: 4,
      name: "VAPOR BEANIE",
      price: "$25.00",
      stock: 35,
      status: "Activo",
      img: "🧢",
    },
  ]);

  // 2. Estado para el input de búsqueda
  const [searchTerm, setSearchTerm] = useState("");

  // 3. Filtrar productos dinámicamente según el searchTerm
  const filteredProducts = allProducts.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h2>EL FRESEO</h2>
          <span>ADMIN DASHBOARD</span>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-item">
            <i className="icon">📊</i> DASHBOARD
          </div>
          <div className="nav-item active">
            <i className="icon">📦</i> INVENTORY
          </div>
          <div className="nav-item">
            <i className="icon">🛒</i> PEDIDOS
          </div>
          <div className="nav-item">
            <i className="icon">⚙️</i> CONFIGURACIÓN
          </div>
        </nav>
      </aside>

      <main className="main-content">
        <header className="content-header">
          <div className="dropdown-store">
            NEON VAPOR <span className="arrow">∨</span>
          </div>
          <button className="btn-add-product">+ AGREGAR PRODUCTO</button>
        </header>

        <section className="inventory-section">
          <h1>PRODUCTOS</h1>

          <div className="table-actions">
            <div className="tabs">
              <span className="tab active">Todos</span>
              <span className="tab">Activos</span>
            </div>

            {/* BUSCADOR FUNCIONAL */}
            <div className="search-bar">
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} // Actualiza el estado al escribir
              />
            </div>
          </div>

          <div className="products-table-container">
            <table className="products-table">
              <thead>
                <tr>
                  <th>PRODUCTO</th>
                  <th>PRECIO</th>
                  <th>STOCK</th>
                  <th>ESTADO</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td className="product-info">
                        <div className="product-img-placeholder">
                          {product.img}
                        </div>
                        {product.name}
                      </td>
                      <td>{product.price}</td>
                      <td>{product.stock}</td>
                      <td className="status-active">{product.status}</td>
                      <td className="actions-cell">⋮</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="no-results">
                      No se encontraron productos que coincidan con "
                      {searchTerm}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default InventoryDashboard;
