import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useStore } from "./useStore";
import { useAuth } from "../../admin/modules/auth/pages/hook/Useauth";
import "../components/styles/MyStore.css";
import { FiPlus, FiExternalLink, FiCopy, FiCheck, FiSettings } from "react-icons/fi";
import {
  getStoresByUser,
  getStoreById,
  getStoreSettingsByHeader,
  getAllStores,
  toggleStoreStatus,
} from "./services/storeService";
import DisableStoreModal from "./DisableStoreModal/DisableStoreModal";

// El chrome (Sidebar/AdminHeader) ya lo provee MyStoreLayout — este
// componente solo renderiza el contenido de "Mis tiendas".
const MyStore = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  useStore();
  const { user } = useAuth();

  const userId = user?.userId ?? null;
  const role   = user?.rolId ?? "OWNER";
  const isSuperAdmin = role === "SUPERADMIN";

  // "" Estados """"""""""""""""""""""""""""""""""""""""""
  const [stores,         setStores]         = useState([]);
  const [storeSettings,  setStoreSettings]  = useState({});
  const [loadingStores,  setLoadingStores]  = useState(false);
  const [storesError,    setStoresError]    = useState(null);
  const [copiedId,       setCopiedId]       = useState(null);
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
    if (togglingId) return; // evita doble submit mientras hay un toggle en vuelo
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
    if (togglingId) return; // evita doble submit mientras hay un toggle en vuelo
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
      try {
        const data = role === "SUPERADMIN"
          ? await getAllStores()
          : await getStoresByUser(userId);
        const rels = Array.isArray(data)
          ? data
          : (data?.content ?? data?.stores ?? data?.data ?? []);

        // getStoresByUser solo devuelve { userId, storeId, role }: hay que
        // completar nombre/slug con el detalle de cada tienda.
        const tiendas = await Promise.all(
          rels.map(async (rel) => {
            if (rel.name && rel.slug) return rel;
            try {
              const full = await getStoreById(rel.storeId);
              return { ...rel, ...(full ?? {}) };
            } catch {
              return rel;
            }
          }),
        );
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
                  <div className="ms-store-links">
                    <button
                      className="ms-store-btn ms-store-btn--config"
                      onClick={(e) => { e.stopPropagation(); navigate(`/tienda/${store.slug}/admin/configuracion`); }}
                    >
                      <FiSettings size={12} /> Configurar
                    </button>
                    <button
                      className="ms-store-btn ms-store-btn--view"
                      onClick={(e) => { e.stopPropagation(); navigate(`/tienda/${store.slug}`); }}
                    >
                      <FiExternalLink size={12} /> Ver tienda
                    </button>
                  </div>
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
    </>
  );
};

export default MyStore;
