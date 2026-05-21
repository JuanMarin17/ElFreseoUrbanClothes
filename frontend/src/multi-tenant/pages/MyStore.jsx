import React from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "./StoreContext";
import "../components/styles/MyStore.css";
import {
  FiGrid,
  FiBox,
  FiUsers,
  FiShoppingCart,
  FiBarChart2,
  FiSettings,
  FiLogOut,
  FiPlus,
  FiSearch,
} from "react-icons/fi";
import StoreCreatedCard from "../components/StoreCreatedCard";
import StoreCard from "./StoreCard";

const STORES_DATA = [
  {
    id: 1,
    name: "NEON VAPOR",
    url: "neonvapor.com",
    status: "ACTIVA",
    img: "https://via.placeholder.com/150",
  },
  {
    id: 2,
    name: "URBAN SYNDICATE",
    url: "urbansyndicate.com",
    status: "ACTIVA",
    img: "https://via.placeholder.com/150",
  },
  {
    id: 3,
    name: "DARK THREADS",
    url: "darkthreads.com",
    status: "PAUSADA",
    img: "https://via.placeholder.com/150",
  },
  {
    id: 4,
    name: "VOID CONCEPT",
    url: "voidconcept.com",
    status: "ACTIVA",
    img: "https://via.placeholder.com/150",
  },
  {
    id: 5,
    name: "BLK.OUT",
    url: "blkout.com",
    status: "BORRADOR",
    img: "https://via.placeholder.com/150",
  },
];



const MyStore = () => {
  const navigate = useNavigate();
  const { state } = useStore();
  const createdStore = state?.store;
  const createdStyles = state?.styles;
  const createdPlan = state?.plan;
  const createdLayout = state?.layout;
  // Datos para la carta de la tienda creada
  const hasCreatedStore =
    createdStore && createdStore.name && createdStore.subdomain;
  const accentColor = createdStyles?.colorBoton || "#3e78ff";
  const cardBg = createdStyles?.cardBg || "#0f0f0f";
  const storeStatus = createdPlan?.name ? "ACTIVA" : "BORRADOR";
  const storeImg =
    createdStyles?.bannerImg || "https://via.placeholder.com/150";

  // Click en carta de tienda creada: ir a /resultado
  const handleGoToResult = () => navigate("/resultado");

  return (
    <div className="admin-container">
      {/* Sidebar Izquierdo */}
      <aside className="sidebar">
        <div className="brand">
          <h2>EL FRESEO</h2>
          <span>ADMIN COMMAND</span>
        </div>
        {/* 
        <nav className="menu">
          <button className="menu-item active">
            <FiGrid /> DASHBOARD
          </button>
          <button className="menu-item">
            <FiBox /> INVENTORY
          </button>
          <button className="menu-item">
            <FiUsers /> MANAGE USERS
          </button>
          <button className="menu-item">
            <FiShoppingCart /> ORDERS
          </button>
          <button className="menu-item">
            <FiBarChart2 /> ANALYTICS
          </button>
          <button className="menu-item">
            <FiSettings /> SETTINGS
          </button>
        </nav> */}

        <button className="logout-btn">
          <FiLogOut /> LOG OUT
        </button>
      </aside>

      {/* Contenido Principal */}
      <main className="main-content">
        <header className="top-bar">
          <div className="search-wrapper">
            <span className="admin-label">EL FRESEO ADMIN</span>
            <div className="search-input">
              <FiSearch />
              <input type="text" placeholder="COMMAND SEARCH..." />
            </div>
          </div>
          <div className="user-info">
            <div className="user-text">
              <span className="role">OPERATOR</span>
              <span className="name">A. FRESEO</span>
            </div>
            <img
              src="https://via.placeholder.com/40"
              alt="avatar"
              className="avatar"
            />
          </div>
        </header>

        <section className="content-body">
          <div className="section-header">
            <div>
              <h1>MIS TIENDAS</h1>
              <p>Administra todas tus tiendas</p>
            </div>
          </div>

          <div className="stores-grid">
            {/* Tienda creada (StoreResult mini) */}
            {hasCreatedStore && (
              <StoreCreatedCard
                store={createdStore}
                styles={createdStyles}
                components={state?.components}
                status={storeStatus}
                onClick={handleGoToResult}
              />
            )}
            {/* Mock stores (d
            emo) */}
            {STORES_DATA.map((store) => (
              <StoreCard
                key={store.id}
                name={store.name}
                url={store.url}
                status={store.status}
                img={store.img}
              />
            ))}
            {/* Tarjeta de "Crear Nueva" (acceso rápido) */}
            <div
              className="store-card create-new"
              onClick={() => navigate("/crear-tienda")}
              style={{ cursor: "pointer" }}
            >
              <FiPlus />
              <p>Crear nueva tienda</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default MyStore;
