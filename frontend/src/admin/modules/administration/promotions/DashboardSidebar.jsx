import { Link, useLocation } from "react-router-dom";

/**
 * DashboardSidebar
 * Barra lateral de navegación del panel administrativo.
 */
const NAV_ITEMS = [
  {
    id: "overview",
    label: "Resumen",
    icon: "fa-solid fa-chart-pie",
    path: "/admin",
  },
  {
    id: "products",
    label: "Productos",
    icon: "fa-solid fa-box",
    path: "/admin/products",
  },
  {
    id: "promotions",
    label: "Promociones",
    icon: "fa-solid fa-tags",
    path: "/admin/promociones",
  },
  {
    id: "orders",
    label: "Pedidos",
    icon: "fa-solid fa-bag-shopping",
    path: "/admin/orders",
  },
  {
    id: "customers",
    label: "Clientes",
    icon: "fa-solid fa-users",
    path: "/admin/customers",
  },
];

const BOTTOM_ITEMS = [
  {
    id: "settings",
    label: "Configuración",
    icon: "fa-solid fa-gear",
    path: "/admin/settings",
  },
  {
    id: "logout",
    label: "Cerrar sesión",
    icon: "fa-solid fa-arrow-right-from-bracket",
    path: "/logout",
  },
];

export default function DashboardSidebar() {
  const location = useLocation();

  return (
    <aside className="vx-sidebar">
      <Link to="/admin" className="vx-sidebar__logo">
        <span className="vx-sidebar__logo-dot" aria-hidden="true" />
        VEXIO
      </Link>

      <p className="vx-sidebar__section-label">Menú</p>

      <nav className="vx-sidebar__nav" aria-label="Navegación del panel">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            className={`vx-sidebar__item ${location.pathname === item.path ? "is-active" : ""}`}
          >
            <i className={item.icon} aria-hidden="true" />
            {item.label}
          </Link>
        ))}
      </nav>

      <p className="vx-sidebar__section-label">Sistema</p>

      <div className="vx-sidebar__footer">
        {BOTTOM_ITEMS.map((item) => (
          <Link key={item.id} to={item.path} className="vx-sidebar__item">
            <i className={item.icon} aria-hidden="true" />
            {item.label}
          </Link>
        ))}
      </div>
    </aside>
  );
}
