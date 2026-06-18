import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useStore } from "./useStore";
import { useAuth } from "../../admin/modules/auth/pages/hook/Useauth";
import "../components/styles/MyStore.css";
import "../../admin/modules/administration/components/AdminLayout/AdminLayout.css";
import { FiPlus, FiExternalLink, FiCopy, FiCheck } from "react-icons/fi";
import { Store, CreditCard, Users, BarChart2, Home } from "lucide-react";
import { getStoresByUser, getStoreSettingsByHeader, getAllStores, toggleStoreStatus } from "./services/storeService";
import PlatformUsersPanel from "./PlatformUsers/PlatformUsersPanel";
import Sidebar from "../../admin/modules/administration/components/Sidebar/Sidebar";
import AdminHeader from "../../admin/modules/administration/components/AdminHeader/AdminHeader";
import IAAdmin from "../../admin/modules/administration/pages/IAAdmin/AIAdmin";
import Transaction from "../../multi-tenant/pages/Transaction/Transaction";
import SalesReport from "./SalesReport/SalesReport";
import DisableStoreModal from "./DisableStoreModal/DisableStoreModal";

const SUPERADMIN_MENU = [
  { path: "/market",         label: "INICIO",            icon: Home       },
  { path: "/mis-tiendas",   label: "TIENDAS",           icon: Store      },
  { path: "/transacciones", label: "TRANSACCIONES",     icon: CreditCard },
  { path: "/usuarios",      label: "USUARIOS",          icon: Users      },
  { path: "/informe-ventas",label: "INFORME DE VENTAS", icon: BarChart2  },
];

const ADMIN_MENU = [
  { path: "/mis-tiendas", label: "MIS TIENDAS", icon: Store },
];

const MyStore = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  useStore();
  const { user, logout } = useAuth();

  const userId = user?.id ?? user?.userId ?? null;
  const name   = user?.userName ?? user?.name ?? null;

  // Rol real desde JWT
  const role = (() => {
    try {
      const jwt = localStorage.getItem("jwt");
      if (!jwt || jwt === "null") return "OWNER";
      const decoded = JSON.parse(atob(jwt.split(".")[1]));
      return decoded.role ?? localStorage.getItem("userRole") ?? "OWNER";
    } catch { return "OWNER"; }
  })();

  const isSuperAdmin = role === "SUPERADMIN";
  const menuItems    = isSuperAdmin ? SUPERADMIN_MENU : ADMIN_MENU;
  const isTransacciones  = location.pathname === "/transacciones";
  const isUsuarios       = location.pathname === "/usuarios";
  const isInformeVentas  = location.pathname === "/informe-ventas";

  // "" Estados """"""""""""""""""""""""""""""""""""""""""
  const [isAiOpen,       setIsAiOpen]       = useState(false);
  const [stores,         setStores]         = useState([]);
  const [storeSettings,  setStoreSettings]  = useState({});
  const [loadingStores,  setLoadingStores]  = useState(false);
  const [storesError,    setStoresError]    = useState(null);
  const [copiedId,       setCopiedId]       = useState(null);
  const [search,         setSearch]         = useState("");
  const [disableTarget,  setDisableTarget]  = useState(null);
  const [togglingId,     setTogglingId]     = useState(null);
  const [actionError,    setActionError]    = useState(null); // { storeId, message }

  const describeToggleError = (err, fallback) => {
    if (err.status === 403) {
      return err.message || "Solo un SUPERADMIN puede inhabilitar o habilitar tiendas.";
    }
    if (err.status === 404) {
      return "Esta tienda ya no existe. Se actualizó la lista.";
    }
    if (err.status === 400) {
      return err.message || "Solicitud inválida al actualizar el estado de la tienda.";
    }
    return err.message || fallback;
  };

  const handleDisableStore = async (storeId, reason) => {
    setTogglingId(storeId);
    setActionError(null);
    try {
      const updated = await toggleStoreStatus(storeId, false, reason);
      setStores((prev) =>
        prev.map((s) => s.storeId === storeId ? { ...s, ...updated } : s)
      );
      setDisableTarget(null);
    } catch (err) {
      if (err.status === 404) {
        setStores((prev) => prev.filter((s) => s.storeId !== storeId));
        setDisableTarget(null);
      }
      setActionError({ storeId, message: describeToggleError(err, "No se pudo inhabilitar la tienda.") });
    } finally {
      setTogglingId(null);
    }
  };

  const handleEnableStore = async (storeId) => {
    setTogglingId(storeId);
    setActionError(null);
    try {
      const updated = await toggleStoreStatus(storeId, true, null);
      setStores((prev) =>
        prev.map((s) => s.storeId === storeId ? { ...s, ...updated } : s)
      );
    } catch (err) {
      if (err.status === 404) {
        setStores((prev) => prev.filter((s) => s.storeId !== storeId));
      }
      setActionError({ storeId, message: describeToggleError(err, "No se pudo habilitar la tienda.") });
    } finally {
      setTogglingId(null);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoadingStores(true);
      setStoresError(null);
      const fetchStores = isSuperAdmin
        ? () => getAllStores()
        : () => getStoresByUser(userId);
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
  }, [userId, location.key]);

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

      {/* "" Sidebar """""""""""""""""""""""""""""""""""""" */}
      <Sidebar
        menuItems={menuItems}
        brandName="VEXIO"
        brandSub={isSuperAdmin ? "SUPER ADMIN" : "ADMIN"}
        onLogout={logout}
        useImageLogo={true}
        logoUrl={storeSettings[stores[0]?.storeId]?.basic?.logoPreview ?? null}
      />

      <div className="admin-main-section">

        {/* "" Header """""""""""""""""""""""""""""""""""" */}
        <AdminHeader
          isAiOpen={isAiOpen}
          setIsAiOpen={setIsAiOpen}
          showAi={true}
          showBell={true}
          showSettings={true}
          isSuperAdmin={isSuperAdmin}
          searchValue={search}
          onSearchChange={(e) => setSearch(e.target.value)}
          searchPlaceholder={isTransacciones ? "Buscar transaccion..." : isInformeVentas ? "Buscar plan..." : "Buscar tienda o ID..."}
          userName={name ?? "Usuario"}
          userRole={role}
        />

        <div className="admin-workspace-split">

          <main className="admin-page-body">

            {/* "" Vista condicional """""""""""""""""""""""" */}
            {isTransacciones && isSuperAdmin ? (
              <Transaction />
            ) : isUsuarios ? (
              <PlatformUsersPanel />
            ) : isInformeVentas ? (
              <SalesReport />
            ) : (
              <>
                <div className="ms-section-header">
                  <div>
                    <h1 className="ms-section-title">{isSuperAdmin ? "Tiendas" : "Mis tiendas"}</h1>
                    <div className="ms-section-meta">
                      <p className="ms-section-sub">{isSuperAdmin ? "Todas las tiendas de la plataforma" : "Gestiona y accede a tus tiendas"}</p>
                      {stores.length > 0 && (
                        <span className="ms-section-count">{stores.length} tienda{stores.length !== 1 ? "s" : ""}</span>
                      )}
                    </div>
                  </div>
                  <button className="ms-btn-create" onClick={() => navigate("/plan")}>
                    <FiPlus size={14} /> Nueva tienda
                  </button>
                </div>

      {loadingStores && (
        <div className="ms-grid">
          {[0, 1, 2].map(i => (
            <div key={i} className="ms-skeleton-card">
              <div className="ms-skeleton-banner" />
              <div className="ms-skeleton-body">
                <div className="ms-skeleton-line ms-skeleton-line--title" />
                <div className="ms-skeleton-line ms-skeleton-line--sub" />
                <div className="ms-skeleton-line ms-skeleton-line--id" />
              </div>
            </div>
          ))}
        </div>
      )}

      {storesError && (
        <div className="ms-state ms-state--error">
          <span> {storesError}</span>
        </div>
      )}

      {actionError && !disableTarget && (
        <div className="ms-state ms-state--error">
          <span>{actionError.message}</span>
          <button
            className="ms-state-dismiss"
            onClick={() => setActionError(null)}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
      )}

                <div className="ms-grid">
                  {!loadingStores &&
                    filtered.map((store, index) => (
                      <div
                        key={store.storeId}
                        className="ms-store-card"
                        style={{ '--i': index }}
                        onClick={() => navigate(`/tienda/${store.slug}`)}
                      >
                        <div
                          className="ms-store-banner"
                          style={{
                            backgroundImage: storeSettings[store.storeId]?.components?.banner?.image
                              ? `url(${storeSettings[store.storeId].components.banner.image})`
                              : undefined,
                          }}
                        >
                          <span className={`ms-store-badge ms-store-badge--${store.isActive ? "activa" : store.disabledReason ? "inhabilitada" : "borrador"}`}>
                            {store.isActive && <span className="ms-badge-dot" />}
                            {store.isActive ? "ACTIVA" : store.disabledReason ? "INHABILITADA" : "BORRADOR"}
                          </span>
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
                          <h3 className="ms-store-name">{store.name}</h3>
                          <p className="ms-store-url">{store.slug}.vexio.com</p>
                          <div className="ms-store-id-row">
                            <span className="ms-store-id-label">ID</span>
                            <code className="ms-store-id">{store.storeId}</code>
                            <button
                              className={`ms-copy-btn${copiedId === store.storeId ? " ms-copy-btn--copied" : ""}`}
                              onClick={(e) => { e.stopPropagation(); handleCopyId(store.storeId); }}
                              title="Copiar ID"
                            >
                              {copiedId === store.storeId ? <FiCheck size={11} /> : <FiCopy size={11} />}
                            </button>
                          </div>
                          <div className="ms-store-footer">
                            <span className="ms-store-plan">
                              {storeSettings[store.storeId]?.plan?.name ?? ""}
                            </span>
                            <button
                              className="ms-store-link"
                              onClick={(e) => { e.stopPropagation(); navigate(`/tienda/${store.slug}`); }}
                            >
                              Ver tienda <FiExternalLink size={11} />
                            </button>
                          </div>

                          {isSuperAdmin && (
                            <div className="ms-store-actions">
                              <button
                                className={`ms-toggle-btn ms-toggle-btn--${store.isActive ? "disable" : "enable"}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActionError(null);
                                  if (store.isActive) {
                                    setDisableTarget(store);
                                  } else {
                                    handleEnableStore(store.storeId);
                                  }
                                }}
                                disabled={togglingId === store.storeId}
                              >
                                {togglingId === store.storeId
                                  ? "Procesando…"
                                  : store.isActive ? "Inhabilitar" : "Habilitar"}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                  {!loadingStores && !storesError && filtered.length === 0 && (
                    <div className="ms-empty">
                      <span className="ms-empty-icon"></span>
                      <p className="ms-empty-title">Sin tiendas aun</p>
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

          {/* "" Panel IA """"""""""""""""""""""""""""""" */}
          <IAAdmin isOpen={isAiOpen} setIsOpen={setIsAiOpen} />

        </div>
      </div>

      {/* Modal inhabilitación */}
      {disableTarget && (
        <DisableStoreModal
          store={disableTarget}
          onConfirm={handleDisableStore}
          onClose={() => {
            if (togglingId) return;
            setDisableTarget(null);
            setActionError(null);
          }}
          loading={togglingId === disableTarget?.storeId}
          error={actionError?.storeId === disableTarget.storeId ? actionError.message : null}
        />
      )}
    </div>
  );
};

export default MyStore;
