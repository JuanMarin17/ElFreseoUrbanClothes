/**
 * MyStore.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Dashboard principal. Carga las tiendas del usuario autenticado desde el
 * backend y las muestra con la vista correcta según su rol.
 *
 * Cambios respecto a la versión anterior:
 *  ✅ Ya no hay USER_ROLE ni TEMP_OWNER_ID hardcodeados en el componente.
 *  ✅ userId y role vienen de AuthContext.
 *  ✅ El botón "Crear tienda" solo aparece si el rol lo permite.
 *  ✅ El logout llama a auth.logout() en lugar de no hacer nada.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "./StoreContext";
import { useAuth } from "../context/AuthContext"; // ajusta la ruta según tu estructura
import "../components/styles/MyStore.css";
import { FiLogOut, FiPlus, FiSearch } from "react-icons/fi";
import StoreCreatedCard from "../components/StoreCreatedCard";
import StoreCard from "./StoreCard";
import { getStoresByUser } from "./services/storeService";

const MyStore = () => {
  const navigate = useNavigate();
  const { state } = useStore();

  // ─── Auth: userId y rol vienen del contexto, sin hardcoding ───────────────
  const { userId, name, role, can, logout } = useAuth();

  // ─── Tienda recién creada (flujo wizard) ───────────────────────────────────
  const createdStore = state?.store;
  const createdStyles = state?.styles;
  const createdPlan = state?.plan;
  const hasCreatedStore = createdStore?.name && createdStore?.subdomain;
  const storeStatus = createdPlan?.name ? "ACTIVA" : "BORRADOR";

  // ─── Tiendas del backend ───────────────────────────────────────────────────
  const [stores, setStores] = useState([]);
  const [loadingStores, setLoadingStores] = useState(false);
  const [storesError, setStoresError] = useState(null);

  useEffect(() => {
    // No cargamos si no hay userId válido
    if (!userId) return;

    setLoadingStores(true);
    setStoresError(null);

    getStoresByUser(userId)
      .then((data) => {
        /**
         * El endpoint GET /users/:userId devuelve StoreUserResponseDTO[].
         * Cada elemento tiene { storeId, name, slug, description, isActive, ... }.
         * Si tu backend devuelve directamente la lista de tiendas, no necesitas
         * el map — déjalo como está.  Si devuelve objetos de relación con un
         * campo "store" anidado, usa:
         *   setStores(data.map((rel) => rel.store));
         */
        setStores(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Error cargando tiendas:", err);
        setStoresError(err.message ?? "No se pudieron cargar las tiendas.");
      })
      .finally(() => setLoadingStores(false));
  }, [userId]);

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="admin-container">
      <aside className="sidebar">
        <div className="brand">
          <h2>EL FRESEO</h2>
          <span>ADMIN COMMAND</span>
        </div>
        <button className="logout-btn" onClick={logout}>
          <FiLogOut /> LOG OUT
        </button>
      </aside>

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
              {/* role viene de AuthContext, no hardcodeado */}
              <span className="role">{role}</span>
              <span className="name">{name ?? "Usuario"}</span>
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

          {/* Estado de carga y error */}
          {loadingStores && (
            <p className="stores-loading">Cargando tiendas...</p>
          )}
          {storesError && <p className="stores-error">{storesError}</p>}

          <div className="stores-grid">
            {/* Tienda recién creada desde el wizard */}
            {hasCreatedStore && (
              <StoreCreatedCard
                store={createdStore}
                styles={createdStyles}
                components={state?.components}
                status={storeStatus}
                onClick={() => navigate("/resultado")}
              />
            )}

            {/* Tiendas cargadas del backend */}
            {!loadingStores &&
              stores.map((store) => (
                <StoreCard
                  key={store.storeId}
                  store={store}
                  role={role} // ← viene de AuthContext
                  onClick={() => navigate(`/tienda/${store.storeId}`)}
                />
              ))}

            {/* Empty state */}
            {!loadingStores &&
              !storesError &&
              stores.length === 0 &&
              !hasCreatedStore && (
                <p className="stores-empty">Aún no tienes tiendas creadas.</p>
              )}

            {/* Botón crear — solo si el rol lo permite */}
            {can.createStore && (
              <div
                className="store-card create-new"
                onClick={() => navigate("/crear-tienda")}
                style={{ cursor: "pointer" }}
              >
                <FiPlus />
                <p>Crear nueva tienda</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default MyStore;
