import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useStore } from "./StoreContext";
import { useAuth } from "../../admin/modules/auth/pages/hook/Useauth";
import "../components/styles/MyStore.css";
import "../../admin/modules/administration/components/AdminLayout/AdminLayout.css";
import { FiPlus, FiExternalLink, FiCopy, FiCheck } from "react-icons/fi";
import { Store, CreditCard, LayoutGrid, LayoutList } from "lucide-react";
import {
  getStoresByUser,
  getStoreSettingsByHeader,
  getAllStores,
} from "./services/storeService";
import Sidebar from "../../admin/modules/administration/components/Sidebar/Sidebar";
import AdminHeader from "../../admin/modules/administration/components/AdminHeader/AdminHeader";
import IAAdmin from "../../admin/modules/administration/pages/IAAdmin/AIAdmin";
import Transaction from "./Transaction/Transaction";

const SUPERADMIN_MENU = [
  { path: "/mis-tiendas", label: "MIS TIENDAS", icon: Store },
  { path: "/transacciones", label: "TRANSACCIONES", icon: CreditCard },
];

const ADMIN_MENU = [
  { path: "/mis-tiendas", label: "MIS TIENDAS", icon: Store },
  { path: "/transacciones", label: "TRANSACCIONES", icon: CreditCard },
];

const MyStore = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { resetAll } = useStore();
  const { user, logout } = useAuth();

  const userId = user?.id ?? user?.userId ?? null;
  const name = user?.userName ?? user?.name ?? null;
  const role = "SUPERADMIN"; // ajustar cuando tengas roles reales

  const menuItems = role === "SUPERADMIN" ? SUPERADMIN_MENU : ADMIN_MENU;
  const isTransacciones = location.pathname === "/transacciones";

  // ── Tiendas del backend ────────────────────────────────────────────────────
  const [stores, setStores] = useState([]);
  const [storeSettings, setStoreSettings] = useState({});
  const [loadingStores, setLoadingStores] = useState(false);
  const [storesError, setStoresError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [search, setSearch]   = useState("");
  const [isAiOpen,  setIsAiOpen]  = useState(false);
  const [viewMode,  setViewMode]  = useState("grid"); // "grid" | "list"

  // Limpiar storage si se viene de crear tienda
  useEffect(() => {
    if (location.state?.clearStorage) {
      resetAll();
    }
  }, [location.state, resetAll]);

  useEffect(() => {
    const load = async () => {
      setLoadingStores(true);
      setStoresError(null);
      const fetchStores =
        role === "SUPERADMIN" ? getAllStores : () => getStoresByUser(userId);
      try {
        const data = await fetchStores();
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
      } catch (err) {
        setStoresError(err.message ?? "No se pudieron cargar las tiendas.");
      } finally {
        setLoadingStores(false);
      }
    };
    load();
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
          searchPlaceholder={
            isTransacciones ? "Buscar transacción..." : "Buscar tienda o ID..."
          }
          userName={name ?? "Usuario"}
          userRole={role}
        />

        <div className="admin-workspace-split">
          <main className="admin-page-body">
            {isTransacciones ? <Transaction /> : (
            <>
                <div className="ms-section-header">
                  <div>
                    <h1 className="ms-section-title">Mis tiendas</h1>
                    <p className="ms-section-sub">
                      {stores.length} tienda{stores.length !== 1 ? "s" : ""}{" "}
                      registrada{stores.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    {/* Toggle cuadrícula / lista */}
                    <div className="ms-view-controls">
                      <button
                        className={`ms-view-btn${viewMode === "grid" ? " ms-view-btn--active" : ""}`}
                        onClick={() => setViewMode("grid")}
                        title="Vista cuadrícula"
                      >
                        <LayoutGrid size={14} />
                      </button>
                      <button
                        className={`ms-view-btn${viewMode === "list" ? " ms-view-btn--active" : ""}`}
                        onClick={() => setViewMode("list")}
                        title="Vista lista"
                      >
                        <LayoutList size={14} />
                      </button>
                    </div>
                    <button
                      className="ms-btn-create"
                      onClick={() => navigate("/plan")}
                    >
                      <FiPlus size={14} /> Nueva tienda
                    </button>
                  </div>
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

                {/* ── Vista cuadrícula ───────────────────────── */}
                {viewMode === "grid" && (
                  <div className="ms-grid">
                    {!loadingStores && filtered.map((store) => {
                      const bannerImg = storeSettings[store.storeId]?.components?.banner?.image;
                      const logoImg   = storeSettings[store.storeId]?.basic?.logoPreview;
                      const plan      = storeSettings[store.storeId]?.plan?.name ?? "—";
                      return (
                        <div key={store.storeId} className="ms-store-card" onClick={() => navigate(`/tienda/${store.slug}`)}>
                          <div className="ms-store-banner" style={{ backgroundImage: bannerImg ? `url(${bannerImg})` : undefined, backgroundSize: "cover", backgroundPosition: "center" }}>
                            <span className={`ms-store-badge ms-store-badge--${store.isActive ? "activa" : "borrador"}`}>
                              {store.isActive ? "ACTIVA" : "BORRADOR"}
                            </span>
                            {logoImg
                              ? <img src={logoImg} alt={store.name} className="ms-store-logo" />
                              : <div className="ms-store-logo ms-store-logo--placeholder">{store.name?.[0]?.toUpperCase() ?? "T"}</div>
                            }
                          </div>
                          <div className="ms-store-body">
                            <h3 className="ms-store-name">{store.name}</h3>
                            <p className="ms-store-url">{store.slug}.freseo.com</p>
                            <div className="ms-store-id-row">
                              <span className="ms-store-id-label">ID</span>
                              <code className="ms-store-id">{store.storeId}</code>
                              <button className="ms-copy-btn" onClick={(e) => { e.stopPropagation(); handleCopyId(store.storeId); }} title="Copiar ID">
                                {copiedId === store.storeId ? <FiCheck size={11} /> : <FiCopy size={11} />}
                              </button>
                            </div>
                            <div className="ms-store-footer">
                              <span className="ms-store-plan">{plan}</span>
                              <button className="ms-store-link" onClick={(e) => { e.stopPropagation(); navigate(`/tienda/${store.slug}`); }}>
                                Ver tienda <FiExternalLink size={11} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {!loadingStores && !storesError && filtered.length === 0 && (
                      <div className="ms-empty">
                        <span className="ms-empty-icon">🏪</span>
                        <p className="ms-empty-title">Sin tiendas aún</p>
                        <p className="ms-empty-sub">Crea tu primera tienda para empezar</p>
                        <button className="ms-btn-create" onClick={() => navigate("/plan")}><FiPlus size={14} /> Crear tienda</button>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Vista lista ────────────────────────────── */}
                {viewMode === "list" && (
                  <div className="ms-list">
                    {!loadingStores && filtered.map((store) => {
                      const bannerImg = storeSettings[store.storeId]?.components?.banner?.image;
                      const logoImg   = storeSettings[store.storeId]?.basic?.logoPreview;
                      const plan      = storeSettings[store.storeId]?.plan?.name ?? "—";
                      return (
                        <div key={store.storeId} className="ms-list-card" onClick={() => navigate(`/tienda/${store.slug}`)}>
                          {/* Banner full-width */}
                          <div
                            className="ms-list-banner"
                            style={{ backgroundImage: bannerImg ? `url(${bannerImg})` : undefined }}
                          >
                            <span className={`ms-store-badge ms-store-badge--${store.isActive ? "activa" : "borrador"}`}>
                              {store.isActive ? "ACTIVA" : "BORRADOR"}
                            </span>
                            {logoImg
                              ? <img src={logoImg} alt={store.name} className="ms-list-logo" />
                              : <div className="ms-list-logo--placeholder">{store.name?.[0]?.toUpperCase() ?? "T"}</div>
                            }
                          </div>

                          {/* Info + acciones debajo del banner */}
                          <div className="ms-list-info">
                            <div className="ms-list-info__text">
                              <p className="ms-list-name">{store.name}</p>
                              <div className="ms-list-meta">
                                <span className="ms-list-url">{store.slug}.freseo.com</span>
                                <span className="ms-list-id">{store.storeId}</span>
                              </div>
                            </div>
                            <div className="ms-list-actions" onClick={(e) => e.stopPropagation()}>
                              <span className="ms-list-plan">{plan}</span>
                              <button className="ms-list-copy" onClick={(e) => { e.stopPropagation(); handleCopyId(store.storeId); }} title="Copiar ID">
                                {copiedId === store.storeId ? <FiCheck size={12} /> : <FiCopy size={12} />}
                              </button>
                              <button className="ms-list-link" onClick={(e) => { e.stopPropagation(); navigate(`/tienda/${store.slug}`); }}>
                                Ver tienda <FiExternalLink size={11} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {!loadingStores && !storesError && filtered.length === 0 && (
                      <div className="ms-empty">
                        <span className="ms-empty-icon">🏪</span>
                        <p className="ms-empty-title">Sin tiendas aún</p>
                        <p className="ms-empty-sub">Crea tu primera tienda para empezar</p>
                        <button className="ms-btn-create" onClick={() => navigate("/plan")}><FiPlus size={14} /> Crear tienda</button>
                      </div>
                    )}
                  </div>
                )}
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
