import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { useStore } from "./StoreContext";
import { useAuth } from "../../admin/modules/auth/pages/hook/Useauth";
import "../components/styles/MyStore.css";
import {
  FiLogOut,
  FiPlus,
  FiSearch,
  FiExternalLink,
  FiCopy,
  FiCheck,
} from "react-icons/fi";
import {
  getStoresByUser,
  getStoreSettingsByHeader,
  getAllStores,
} from "./services/storeService";

const MyStore = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, resetAll } = useStore();
  const { user, logout } = useAuth();

  const userId = user?.id ?? user?.userId ?? null;
  const name = user?.userName ?? user?.name ?? null;
  const role = "SUPERADMIN"; // ajustar cuando tengas roles reales

  const menuItems       = role === "SUPERADMIN" ? SUPERADMIN_MENU : ADMIN_MENU;
  const isTransacciones = location.pathname === "/transacciones";

  // ── Tiendas del backend ────────────────────────────────────────────────────
  const [stores, setStores] = useState([]);
  const [storeSettings, setStoreSettings] = useState({});
  const [loadingStores, setLoadingStores] = useState(false);
  const [storesError, setStoresError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [search, setSearch] = useState("");

  // Limpiar storage si se viene de crear tienda
  useEffect(() => {
    if (location.state?.clearStorage) {
      resetAll();
    }
  }, [location.state, resetAll]);

  useEffect(() => {
    setLoadingStores(true);
    setStoresError(null);
    const fetchStores = role === "SUPERADMIN" ? getAllStores : () => getStoresByUser(userId);
    fetchStores()
      .then(async (data) => {
        const tiendas = Array.isArray(data)
          ? data
          : (data?.content ?? data?.stores ?? data?.data ?? []);
        setStores(tiendas);
        const settingsObj = {};
        await Promise.all(
          tiendas.map(async (store) => {
            try {
              settingsObj[store.storeId] = await getStoreSettingsByHeader(store.storeId);
            } catch {
              settingsObj[store.storeId] = {};
            }
          }),
        );
        setStoreSettings(settingsObj);
      })
      .catch((err) => setStoresError(err.message ?? "No se pudieron cargar las tiendas."))
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
    <div className="admin-terminal-wrapper">

      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <Sidebar
        menuItems={menuItems}
        brandName="VEXIO"
        brandSub={role === "SUPERADMIN" ? "SUPER ADMIN" : "ADMIN"}
        onLogout={logout}
        useImageLogo={true}
        logoUrl={storeSettings[stores[0]?.storeId]?.basic?.logoPreview ?? null}
      />

      <div className="admin-main-section">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <AdminHeader
          isAiOpen={isAiOpen}
          setIsAiOpen={setIsAiOpen}
          showAi={true}
          showBell={true}
          showSettings={true}
          isSuperAdmin={role === "SUPERADMIN"}
          searchValue={search}
          onSearchChange={(e) => setSearch(e.target.value)}
          searchPlaceholder={isTransacciones ? "Buscar transacción..." : "Buscar tienda o ID..."}
          userName={name ?? "Usuario"}
          userRole={role}
        />

        <div className="admin-workspace-split">

          <main className="admin-page-body">

            {/* ── Vista condicional ──────────────────────────────────── */}
            {isTransacciones ? (
              <Transaction />
            ) : (
              <>
                <div className="ms-section-header">
                  <div>
                    <h1 className="ms-section-title">Mis tiendas</h1>
                    <p className="ms-section-sub">
                      {stores.length} tienda{stores.length !== 1 ? "s" : ""} registrada{stores.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <button className="ms-btn-create" onClick={() => navigate("/plan")}>
                    <FiPlus size={14} /> Nueva tienda
                  </button>
                </div>

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
            {/* {hasCreatedStore && (
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
            )} */}

            {/* Tiendas del backend */}
            {!loadingStores &&
              filtered.map((store) => (
                <div
                  key={store.storeId}
                  className="ms-store-card"
                  onClick={() => navigate(`/tienda/${store.slug}`)}
                >
                  <div
                    className="ms-store-banner"
                    style={{
                      backgroundImage: storeSettings[store.storeId]?.components
                        ?.banner?.image
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

                    {/* Logo superpuesto — position absolute lado derecho */}
                    {storeSettings[store.storeId]?.basic?.logoPreview ? (
                      <img
                        src={storeSettings[store.storeId].basic.logoPreview}
                        alt={`Logo ${store.name}`}
                        className="ms-store-logo"
                      />
                    ) : (
                      <div className="ms-store-logo ms-store-logo--placeholder">
                        {store.name?.[0]?.toUpperCase() ?? "T"}
                      </div>
                    )}
                  </div>
                  <div className="ms-store-body">
                    {/* quitamos el logo-wrap anterior */}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/tienda/${store.slug}`);
                        }}
                      >
                        Ver tienda <FiExternalLink size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

                  {!loadingStores && !storesError && filtered.length === 0 && (
                    <div className="ms-empty">
                      <span className="ms-empty-icon">🏪</span>
                      <p className="ms-empty-title">Sin tiendas aún</p>
                      <p className="ms-empty-sub">Crea tu primera tienda para empezar</p>
                      <button className="ms-btn-create" onClick={() => navigate("/plan")}>
                        <FiPlus size={14} /> Crear tienda
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

          </main>

          {/* ── Panel IA ────────────────────────────────────────────── */}
          <IAAdmin isOpen={isAiOpen} setIsOpen={setIsAiOpen} />

        </div>
      </div>
    </div>
  );
};

export default MyStore;