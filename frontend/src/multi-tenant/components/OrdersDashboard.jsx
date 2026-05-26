import React, { useState } from "react";
import "../components/styles/OrdersDashboard.css";

const OrdersDashboard = () => {
  const [activeTab, setActiveTab] = useState("Todos");

  // Datos de los pedidos
  const [orders] = useState([
    {
      id: "#NV-2024-001",
      customer: "John Doe",
      total: "$85.00",
      status: "Pendiente",
      date: "24/05/2024",
    },
    {
      id: "#NV-2024-002",
      customer: "Jane Smith",
      total: "$150.00",
      status: "Enviado",
      date: "24/05/2024",
    },
    {
      id: "#NV-2024-003",
      customer: "Mike Johnson",
      total: "$70.00",
      status: "Entregado",
      date: "23/05/2024",
    },
    {
      id: "#NV-2024-004",
      customer: "Sarah Wilson",
      total: "$45.00",
      status: "Pendiente",
      date: "23/05/2024",
    },
    {
      id: "#NV-2024-005",
      customer: "Alex Brown",
      total: "$120.00",
      status: "Cancelado",
      date: "22/05/2024",
    },
  ]);

  // Lógica de filtrado
  const filteredOrders = orders.filter((order) => {
    if (activeTab === "Todos") return true;
    return order.status === activeTab;
  });

  const tabs = ["Todos", "Pendiente", "Enviado", "Entregado", "Cancelado"];

  return (
    <div className="orders-container">
      {/* SIDEBAR */}
      <aside className="orders-sidebar">
        <div className="brand-section">
          <h2>EL FRESEO</h2>
          <p>ADMIN DASHBOARD</p>
        </div>
        <nav className="nav-menu">
          <div className="menu-item">
            <span className="icon">📊</span> DASHBOARD
          </div>
          <div className="menu-item">
            <span className="icon">📦</span> INVENTORY
          </div>
          <div className="menu-item">
            <span className="icon">👥</span> MANAGE USERS
          </div>
          <div className="menu-item active">
            <span className="icon">🛒</span> PEDIDOS
          </div>
          <div className="menu-item">
            <span className="icon">🏠</span> CLIENTES
          </div>
          <div className="menu-item">
            <span className="icon">⚙️</span> CONFIGURACIÓN
          </div>
        </nav>
        <div className="logout-btn">🚪 LOG OUT</div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="orders-main">
        <header className="main-header">
          <div className="store-selector">
            NEON VAPOR <span>∨</span>
          </div>
          <div className="header-actions">
            <span className="search-icon">🔍</span>
            <span className="settings-icon">⚙️</span>
          </div>
        </header>

        <section className="content-body">
          <h1 className="section-title">PEDIDOS</h1>

          {/* FILTROS (TABS) */}
          <div className="tabs-container">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "Pendiente"
                  ? "Pendientes"
                  : tab === "Enviado"
                    ? "Enviados"
                    : tab === "Entregado"
                      ? "Entregados"
                      : tab === "Cancelado"
                        ? "Cancelados"
                        : tab}
              </button>
            ))}
          </div>

          {/* TABLA DE PEDIDOS */}
          <div className="table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>PEDIDO</th>
                  <th>CLIENTE</th>
                  <th>TOTAL</th>
                  <th>ESTADO</th>
                  <th>FECHA</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, index) => (
                  <tr key={index}>
                    <td className="order-id">{order.id}</td>
                    <td>{order.customer}</td>
                    <td>{order.total}</td>
                    <td>
                      <span
                        className={`status-badge ${order.status.toLowerCase()}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td>{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredOrders.length === 0 && (
              <p className="empty-msg">No hay pedidos en esta categoría.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default OrdersDashboard;
