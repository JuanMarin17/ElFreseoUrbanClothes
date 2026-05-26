/**
 * StoreCard.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Tarjeta de tienda con vistas diferenciadas por rol.
 *
 * SUPERADMIN → Nombre, slug, descripción, status, ID interno
 * OWNER      → Nombre, slug, descripción, status
 * ADMIN      → Nombre, slug, descripción
 * STAFF      → Nombre y slug (solo lectura)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from "react";
import { ROLES } from "../context/AuthContext"; // ajusta la ruta según tu estructura

// ─── Sub-vistas por rol ────────────────────────────────────────────────────────

/** SUPERADMIN: todo visible incluyendo ID interno */
const SuperAdminCard = ({ store, onClick }) => (
  <div
    className="store-card"
    onClick={onClick}
    style={{ cursor: onClick ? "pointer" : undefined }}
  >
    <div
      className="store-img"
      style={{ backgroundImage: `url(https://via.placeholder.com/150)` }}
    />
    <div className="store-info">
      <h3>{store.name}</h3>
      <p className="store-url">{store.slug}.freseo.com</p>
      <p className="store-description">{store.description}</p>
      <span className={`status ${store.isActive ? "activa" : "borrador"}`}>
        {store.isActive ? "ACTIVA" : "BORRADOR"}
      </span>
      <div className="store-meta">
        <span className="store-id" title="ID interno">
          🔑 {store.storeId}
        </span>
      </div>
    </div>
  </div>
);

/** OWNER: nombre, slug, descripción y estado — sin ID interno */
const OwnerCard = ({ store, onClick }) => (
  <div
    className="store-card"
    onClick={onClick}
    style={{ cursor: onClick ? "pointer" : undefined }}
  >
    <div
      className="store-img"
      style={{ backgroundImage: `url(https://via.placeholder.com/150)` }}
    />
    <div className="store-info">
      <h3>{store.name}</h3>
      <p className="store-url">{store.slug}.freseo.com</p>
      <p className="store-description">{store.description}</p>
      <span className={`status ${store.isActive ? "activa" : "borrador"}`}>
        {store.isActive ? "ACTIVA" : "BORRADOR"}
      </span>
    </div>
  </div>
);

/** ADMIN: nombre, slug y descripción — sin estado técnico */
const AdminCard = ({ store, onClick }) => (
  <div
    className="store-card"
    onClick={onClick}
    style={{ cursor: onClick ? "pointer" : undefined }}
  >
    <div
      className="store-img"
      style={{ backgroundImage: `url(https://via.placeholder.com/150)` }}
    />
    <div className="store-info">
      <h3>{store.name}</h3>
      <p className="store-url">{store.slug}.freseo.com</p>
      <p className="store-description">{store.description}</p>
    </div>
  </div>
);

/** STAFF: solo nombre y URL — solo lectura, sin onClick */
const StaffCard = ({ store }) => (
  <div className="store-card store-card--readonly">
    <div
      className="store-img"
      style={{ backgroundImage: `url(https://via.placeholder.com/150)` }}
    />
    <div className="store-info">
      <h3>{store.name}</h3>
      <p className="store-url">{store.slug}.freseo.com</p>
      <span className="store-badge-readonly">Solo lectura</span>
    </div>
  </div>
);

// ─── Componente principal ──────────────────────────────────────────────────────

/**
 * @param {{ store: object, role: string, onClick?: () => void }} props
 */
const StoreCard = ({ store, role, onClick }) => {
  switch (role) {
    case ROLES.SUPERADMIN:
      return <SuperAdminCard store={store} onClick={onClick} />;
    case ROLES.OWNER:
      return <OwnerCard store={store} onClick={onClick} />;
    case ROLES.ADMIN:
      return <AdminCard store={store} onClick={onClick} />;
    case ROLES.STAFF:
      return <StaffCard store={store} />;
    default:
      // Rol desconocido → vista más restrictiva por seguridad
      return <StaffCard store={store} />;
  }
};

export default StoreCard;
