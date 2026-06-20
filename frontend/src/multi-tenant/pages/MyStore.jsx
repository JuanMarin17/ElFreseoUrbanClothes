import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useStore } from "./useStore";
import { useAuth } from "../../admin/modules/auth/pages/hook/Useauth";
import "../components/styles/MyStore.css";
import { FiPlus, FiExternalLink, FiCopy, FiCheck } from "react-icons/fi";
import { getStoresByUser, getStoreSettingsByHeader, getAllStores } from "./services/storeService";

// El chrome (Sidebar/AdminHeader) ya lo provee MyStoreLayout — este
// componente solo renderiza el contenido de "Mis tiendas".
const MyStore = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  useStore();
  const { user } = useAuth();

  const userId = user?.userId ?? null;
  const role   = user?.rolId ?? "OWNER";

  // "" Estados """"""""""""""""""""""""""""""""""""""""""
  const [stores,         setStores]         = useState([]);
  const [storeSettings,  setStoreSettings]  = useState({});
  const [loadingStores,  setLoadingStores]  = useState(false);
  const [storesError,    setStoresError]    = useState(null);
  const [copiedId,       setCopiedId]       = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoadingStores(true);
      setStoresError(null);
      try {
        const data = role === "SUPERADMIN"
          ? await getAllStores()
          : await getStoresByUser(userId);
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
  }, [location.key, role, userId]);

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = stores;

  return (
    <>
      <div className="ms-section-header">
        <div>
          <h1 className="ms-section-title">Mis tiendas</h1>
          <div className="ms-section-meta">
            <p className="ms-section-sub">Gestiona y accede a tus tiendas</p>
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
                <span className={`ms-store-badge ms-store-badge--${store.isActive ? "activa" : "borrador"}`}>
                  {store.isActive && <span className="ms-badge-dot" />}
                  {store.isActive ? "ACTIVA" : "BORRADOR"}
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
  );
};

export default MyStore;
