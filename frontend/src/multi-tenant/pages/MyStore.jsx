import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "./StoreContext";
import { useAuth } from "../../admin/modules/auth/pages/hook/Useauth";
import "../components/styles/MyStore.css";
import { FiLogOut, FiPlus, FiSearch, FiExternalLink, FiCopy, FiCheck } from "react-icons/fi";
import { getStoresByUser, getStoreSettingsByHeader, getAllStores } from "./services/storeService";

const MyStore = () => {
  const navigate = useNavigate();
  const { state } = useStore();
  const { user, logout } = useAuth();
  const userId = user?.id ?? user?.userId ?? null;
  const name   = user?.userName ?? user?.name ?? null;
  const role   = "SUPERADMIN"; // ajustar cuando tengas roles reales

  // ── Tienda recién creada (wizard) ──────────────────────────────────────────
  const createdStore = state?.store;
  const createdStyles = state?.styles;
  const createdPlan = state?.plan;
  const hasCreatedStore = createdStore?.name && createdStore?.subdomain;
  const storeStatus = createdPlan?.name ? "ACTIVA" : "BORRADOR";

  // ── Tiendas del backend ────────────────────────────────────────────────────
  const [stores, setStores] = useState([]);
  const [storeSettings, setStoreSettings] = useState({});
  const [loadingStores, setLoadingStores] = useState(false);
  const [storesError, setStoresError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // console.log("🔑 userId en MyStore:", userId);
    // if (!userId) {
    //   console.warn("⚠️ userId es null — no se cargará nada del backend");
    //   return;
    // }
    setLoadingStores(true);
    setStoresError(null);
    // Si es superadmin, obtener todas las tiendas
    const fetchStores =
      role === "SUPERADMIN" ? getAllStores : () => getStoresByUser(userId);
    fetchStores()
      .then(async (data) => {
        console.log("✅ getStoresByUser response:", data);
        const tiendas = Array.isArray(data)
          ? data
          : (data?.content ?? data?.stores ?? data?.data ?? []);
        console.log("📦 tiendas parseadas:", tiendas);
        setStores(tiendas);
        const settingsObj = {};
        await Promise.all(
          tiendas.map(async (store) => {
            try {
              settingsObj[store.storeId] = await getStoreSettingsByHeader(
                store.storeId,
              );
              console.log(settingsObj);
            } catch {
              settingsObj[store.storeId] = {};
            }
          }),
        );
        setStoreSettings(settingsObj);
      })
      .catch((err) => {
        console.error("❌ Error cargando tiendas:", err);
        console.error("❌ Status:", err.status, "| Message:", err.message);
        setStoresError(err.message ?? "No se pudieron cargar las tiendas.");
      })
      .finally(() => setLoadingStores(false));
  }, [userId]);

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = stores.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.storeId?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="ms-root">
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="ms-sidebar">
        <div className="ms-brand">
          <span className="ms-brand-name">EL FRESEO</span>
          <span className="ms-brand-sub">ADMIN</span>
        </div>

        <nav className="ms-nav">
          <button className="ms-nav-item active">
            <span className="ms-nav-icon">🏪</span>
            Mis tiendas
          </button>
          <button className="ms-nav-item" onClick={() => navigate("/plan")}>
            <span className="ms-nav-icon">✦</span>
            Nueva tienda
          </button>
          <button
            className="ms-nav-item"
            onClick={() => navigate("/inventario")}
          >
            <span className="ms-nav-icon">📦</span>
            Inventario
          </button>
          <button className="ms-nav-item" onClick={() => navigate("/ordenes")}>
            <span className="ms-nav-icon">📋</span>
            Pedidos
          </button>
        </nav>

        <button className="ms-logout" onClick={logout}>
          <FiLogOut size={14} />
          Cerrar sesión
        </button>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <main className="ms-main">
        {/* Topbar */}
        <header className="ms-topbar">
          <div className="ms-search-box">
            <FiSearch size={14} className="ms-search-icon" />
            <input
              type="text"
              placeholder="Buscar tienda o ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ms-search-input"
            />
          </div>

          <div className="ms-user">
            <div className="ms-user-info">
              <span className="ms-user-role">{role ?? "OWNER"}</span>
              <span className="ms-user-name">{name ?? "Usuario"}</span>
            </div>
            <div className="ms-avatar">{(name ?? "U")[0].toUpperCase()}</div>
          </div>
        </header>

        {/* Content */}
        <div className="ms-content">
          {/* Header de sección */}
          <div className="ms-section-header">
            <div>
              <h1 className="ms-section-title">Mis tiendas</h1>
              <p className="ms-section-sub">
                {stores.length + (hasCreatedStore ? 1 : 0)} tienda
                {stores.length !== 1 ? "s" : ""} registrada
                {stores.length !== 1 ? "s" : ""}
              </p>
            </div>
            <button className="ms-btn-create" onClick={() => navigate("/plan")}>
              <FiPlus size={14} />
              Nueva tienda
            </button>
          </div>

          {/* Estados */}
          {loadingStores && (
            <div className="ms-state">
              <div className="ms-spinner" />
              <span>Cargando tiendas...</span>
            </div>
          )}

          {storesError && (
            <div className="ms-state ms-state--error">
              <span>⚠ {storesError}</span>
            </div>
          )}

          {/* Grid */}
          <div className="ms-grid">
            {/* Tienda del wizard */}
            {hasCreatedStore && (
              <div
                className="ms-store-card"
                onClick={() => navigate("/resultado")}
              >
                <div
                  className="ms-store-banner"
                  style={{ background: createdStyles?.cardBg ?? "#0d1520" }}
                >
                  <span
                    className={`ms-store-badge ms-store-badge--${storeStatus.toLowerCase()}`}
                  >
                    {storeStatus}
                  </span>
                </div>
                <div className="ms-store-body">
                  <h3 className="ms-store-name">{createdStore.name}</h3>
                  <p className="ms-store-url">
                    {createdStore.subdomain}.freseo.com
                  </p>
                  {state?.storeId && (
                    <div className="ms-store-id-row">
                      <span className="ms-store-id-label">ID</span>
                      <code className="ms-store-id">{state.storeId}</code>
                      <button
                        className="ms-copy-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyId(state.storeId);
                        }}
                        title="Copiar ID"
                      >
                        {copiedId === state.storeId ? (
                          <FiCheck size={11} />
                        ) : (
                          <FiCopy size={11} />
                        )}
                      </button>
                    </div>
                  )}
                  <div className="ms-store-footer">
                    <span className="ms-store-plan">
                      {createdPlan?.name ?? "—"}
                    </span>
                    <button
                      className="ms-store-link"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/resultado");
                      }}
                    >
                      Ver tienda <FiExternalLink size={11} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tiendas del backend */}
            {!loadingStores &&
              filtered.map((store) => (
                <div
                  key={store.storeId}
                  className="ms-store-card"
                  // No navegamos a detalle, solo mostramos la tarjeta
                  style={{ cursor: "default" }}
                >
                  <div
                    className="ms-store-banner"
                    style={{
                      backgroundImage: storeSettings[store.storeId]?.components?.banner?.image
                        ? `url(${storeSettings[store.storeId].components.banner.image})`
                        : undefined,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <span
                      className={`ms-store-badge ms-store-badge--${store.isActive ? "activa" : "borrador"}`}
                    >
                      {store.isActive ? "ACTIVA" : "BORRADOR"}
                    </span>
                  </div>
                  <div className="ms-store-body">
                    <h3 className="ms-store-name">{store.name}</h3>
                    <p className="ms-store-url">{store.slug}.freseo.com</p>

                    {/* Store ID con botón copiar */}
                    <div className="ms-store-id-row">
                      <span className="ms-store-id-label">ID</span>
                      <code className="ms-store-id">{store.storeId}</code>
                      <button
                        className="ms-copy-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyId(store.storeId);
                        }}
                        title="Copiar ID"
                      >
                        {copiedId === store.storeId ? (
                          <FiCheck size={11} />
                        ) : (
                          <FiCopy size={11} />
                        )}
                      </button>
                    </div>

                    <div className="ms-store-footer">
                      {/* El plan viene de los settings, no del objeto store */}
                      <span className="ms-store-plan">
                        {storeSettings[store.storeId]?.plan?.name ?? "—"}
                      </span>
                      <button
                        className="ms-store-link"
                        disabled
                        style={{ opacity: 0.5, pointerEvents: "none" }}
                      >
                        Ver tienda <FiExternalLink size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

            {/* Empty state */}
            {!loadingStores &&
              !storesError &&
              filtered.length === 0 &&
              !hasCreatedStore && (
                <div className="ms-empty">
                  <span className="ms-empty-icon">🏪</span>
                  <p className="ms-empty-title">Sin tiendas aún</p>
                  <p className="ms-empty-sub">
                    Crea tu primera tienda para empezar
                  </p>
                  <button
                    className="ms-btn-create"
                    onClick={() => navigate("/plan")}
                  >
                    <FiPlus size={14} /> Crear tienda
                  </button>
                </div>
              )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MyStore;
