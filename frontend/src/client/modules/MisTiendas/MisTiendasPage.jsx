import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Store, Plus, ExternalLink, Settings2, Copy, Check,
  AlertCircle, Globe, Calendar, Shield, Zap, Search, X,
} from "lucide-react";
import HeaderMarket from "../../../utils/Header/HeaderMarket";
import { useAuth } from "../../../admin/modules/auth/pages/hook/Useauth";
import {
  getStoresByUser,
  getStoreById,
  getStoreSettingsByHeader,
} from "../../../multi-tenant/pages/services/storeService";
import { getLimits, getSubscription } from "../../../multi-tenant/pages/services/transactionService";
import { getAllProducts } from "../../../admin/modules/administration/services/productService";
import "./MisTiendasPage.css";

/* ── Constantes ─────────────────────────────────────────────────────────── */

const ROLE_LABEL = { OWNER: "Propietario", ADMIN: "Admin", STAFF: "Staff" };
const ROLE_CLASS = { OWNER: "owner", ADMIN: "admin", STAFF: "staff" };

const PLAN_CLASS = {
  GRATUITO: "free", BASICO: "basic", PRO: "pro", PREMIUM: "premium",
};
const PLAN_LABEL = {
  GRATUITO: "Gratis", BASICO: "Básico", PRO: "Pro", PREMIUM: "Premium",
};

const UNLIMITED = 9999;

function isUnlimited(n) { return !n || n >= UNLIMITED; }

function UsageBar({ used, max, label, icon: Icon }) {
  if (!max && max !== 0) return null;
  const unlimited = isUnlimited(max);
  const pct = unlimited ? 0 : Math.min((used / max) * 100, 100);
  const colorClass = pct >= 90 ? "danger" : pct >= 70 ? "warn" : "ok";

  return (
    <div className="mtp-usage-row">
      <div className="mtp-usage-label">
        {Icon && <Icon size={11} />}
        <span>{label}</span>
      </div>
      <div className="mtp-usage-right">
        {unlimited ? (
          <span className="mtp-usage-val mtp-usage-val--free">ilimitado</span>
        ) : (
          <>
            <div className="mtp-bar-track">
              <div
                className={`mtp-bar-fill mtp-bar-fill--${colorClass}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className={`mtp-usage-val mtp-usage-val--${colorClass}`}>
              {used ?? "—"}<span className="mtp-usage-max">/{max}</span>
            </span>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Skeleton ────────────────────────────────────────────────────────────── */

function SkeletonCard() {
  return (
    <div className="mtp-skeleton">
      <div className="mtp-sk-banner" />
      <div className="mtp-sk-body">
        <div className="mtp-sk-line mtp-sk-line--title" />
        <div className="mtp-sk-line mtp-sk-line--sub" />
        <div className="mtp-sk-line mtp-sk-line--plan" />
        <div className="mtp-sk-line mtp-sk-line--bar" />
        <div className="mtp-sk-line mtp-sk-line--bar" />
        <div className="mtp-sk-actions" />
      </div>
    </div>
  );
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function formatDate(raw) {
  if (!raw) return null;
  try {
    return new Intl.DateTimeFormat("es-CO", {
      day: "2-digit", month: "short", year: "numeric",
    }).format(new Date(raw));
  } catch { return null; }
}

/* ── Componente principal ────────────────────────────────────────────────── */

export default function MisTiendasPage() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const userId    = user?.id ?? user?.userId ?? null;

  const [stores,   setStores]   = useState([]);
  const [settings, setSettings] = useState({});  // storeId → settings
  const [usage,    setUsage]    = useState({});   // storeId → { limits, productCount }
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [search,   setSearch]   = useState("");

  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    let alive = true;
    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        /* 1. Relaciones usuario → tienda */
        const raw  = await getStoresByUser(userId);
        const rels = Array.isArray(raw) ? raw : (raw?.content ?? raw?.stores ?? raw?.data ?? []);

        /* 2. Enriquecer con datos completos de cada tienda */
        const enriched = await Promise.all(
          rels.map(async (rel) => {
            if (rel.name && rel.slug) return rel;
            try {
              const full = await getStoreById(rel.storeId);
              return { ...rel, ...(full ?? {}) };
            } catch { return rel; }
          })
        );

        if (!alive) return;
        setStores(enriched);

        /* 3. Settings, límites y conteo de productos en paralelo */
        const settingsMap = {};
        const usageMap    = {};

        await Promise.all(
          enriched.map(async (s) => {
            const id = s.storeId;

            /* Settings */
            try { settingsMap[id] = await getStoreSettingsByHeader(id); }
            catch { settingsMap[id] = null; }

            /* Suscripción activa (fuente más fiable del plan) */
            let subscription = null;
            try { subscription = await getSubscription(id); }
            catch { /* sin suscripción */ }

            /* Límites del plan (para maxProducts, maxPages, etc.) */
            let limits = null;
            try { limits = await getLimits(id); }
            catch { /* sin plan activo */ }

            /* Conteo de productos */
            let productCount = null;
            try {
              const prods = await getAllProducts(id);
              productCount = Array.isArray(prods) ? prods.length : 0;
            } catch { /* sin acceso */ }

            usageMap[id] = { subscription, limits, productCount };
          })
        );

        if (alive) {
          setSettings(settingsMap);
          setUsage(usageMap);
        }
      } catch (err) {
        if (alive) setError(err.message ?? "No se pudieron cargar las tiendas");
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();
    return () => { alive = false; };
  }, [userId]);

  const handleCopy = (id, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getBannerStyle = (storeId) => {
    const s = settings[storeId];
    if (s?.components?.banner?.image) return { backgroundImage: `url(${s.components.banner.image})` };
    if (s?.components?.banner?.bg)    return { background: s.components.banner.bg };
    return {};
  };

  const getLogoUrl = (storeId) => {
    const s    = settings[storeId];
    const logo = s?.basic?.logoPreview ?? s?.components?.header?.logo;
    return logo && logo.startsWith("http") ? logo : null;
  };

  /* ── Filtrado de tiendas ────────────────────────────────────────────────── */
  const query = search.trim().toLowerCase();
  const filteredStores = query
    ? stores.filter(s => {
        // Campos de texto
        const desc     = settings[s.storeId]?.basic?.description ?? s.description ?? "";

        // Plan: combinar todas las fuentes igual que en el render
        const su       = usage[s.storeId] ?? {};
        const subPlan  = (su.subscription?.planName  ?? "").toUpperCase();
        const limPlan  = (su.limits?.planName        ?? "").toUpperCase();
        const setPlan  = (settings[s.storeId]?.plan?.name ?? "").toUpperCase();
        const planKey  = subPlan || limPlan || setPlan || "GRATUITO";
        const planLbl  = (PLAN_LABEL[planKey] ?? planKey).toLowerCase();

        // Rol y estado
        const roleKey  = (s.role ?? "OWNER").toUpperCase();
        const roleLbl  = (ROLE_LABEL[roleKey] ?? roleKey).toLowerCase();
        const status   = s.isActive ? "activa" : "borrador";

        return (
          (s.name  ?? "").toLowerCase().includes(query) ||
          (s.slug  ?? "").toLowerCase().includes(query) ||
          desc.toLowerCase().includes(query)            ||
          planLbl.includes(query)                       ||
          roleLbl.includes(query)                       ||
          status.includes(query)
        );
      })
    : stores;

  /* ── Sin sesión ─────────────────────────────────────────────────────────── */
  if (!loading && !user) {
    return (
      <>
        <HeaderMarket />
        <div className="mtp-bg" />
        <div className="mtp-page">
          <div className="mtp-empty">
            <div className="mtp-empty-icon"><Store size={40} /></div>
            <h2 className="mtp-empty-title">Inicia sesión para ver tus tiendas</h2>
            <p className="mtp-empty-sub">Crea y gestiona tus tiendas desde aquí.</p>
            <button className="mtp-btn-primary mtp-btn-lg" onClick={() => navigate("/login")}>
              Iniciar sesión
            </button>
          </div>
        </div>
      </>
    );
  }

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    <>
      <HeaderMarket />
      <div className="mtp-bg" />
      <div className="mtp-page">

        {/* Encabezado */}
        <div className="mtp-header">
          <div>
            <h1 className="mtp-title">Mis Tiendas</h1>
            <p className="mtp-sub">
              {loading
                ? "Cargando tus tiendas…"
                : query
                  ? `${filteredStores.length} resultado${filteredStores.length !== 1 ? "s" : ""} para "${search.trim()}"`
                  : stores.length > 0
                    ? `${stores.length} tienda${stores.length !== 1 ? "s" : ""} en tu cuenta`
                    : "Gestiona y accede a tus tiendas"}
            </p>
          </div>
          {!loading && stores.length > 0 && (
            <button className="mtp-btn-primary" onClick={() => navigate("/plan")}>
              <Plus size={14} /> Nueva tienda
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mtp-error">
            <AlertCircle size={16} />
            <span>{error}</span>
            <button onClick={() => window.location.reload()}>Reintentar</button>
          </div>
        )}

        {/* Buscador */}
        {!loading && stores.length > 0 && (
          <div className="mtp-toolbar">
            <div className="mtp-search-wrap">
              <Search size={15} className="mtp-search-icon" />
              <input
                className="mtp-search-input"
                type="text"
                placeholder="Nombre, URL, plan, rol, estado…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoComplete="off"
              />
              {search && (
                <button
                  className="mtp-search-clear"
                  onClick={() => setSearch("")}
                  aria-label="Limpiar búsqueda"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="mtp-grid">
            {[0, 1, 2].map(i => <SkeletonCard key={i} />)}
          </div>

        /* Empty — sin tiendas */
        ) : !error && stores.length === 0 ? (
          <div className="mtp-empty">
            <div className="mtp-empty-icon"><Store size={44} /></div>
            <h2 className="mtp-empty-title">Aún no tienes tiendas</h2>
            <p className="mtp-empty-sub">
              Crea tu primera tienda en minutos y empieza a vender en la plataforma.
            </p>
            <button className="mtp-btn-primary mtp-btn-lg" onClick={() => navigate("/plan")}>
              <Plus size={16} /> Crear mi primera tienda
            </button>
          </div>

        /* Empty — sin resultados de búsqueda */
        ) : !error && filteredStores.length === 0 ? (
          <div className="mtp-empty">
            <div className="mtp-empty-icon"><Search size={38} /></div>
            <h2 className="mtp-empty-title">Sin resultados</h2>
            <p className="mtp-empty-sub">
              No hay tiendas que coincidan con &ldquo;{search.trim()}&rdquo;.
            </p>
            <button className="mtp-btn-primary" onClick={() => setSearch("")}>
              Limpiar búsqueda
            </button>
          </div>

        /* Cards */
        ) : (
          <div className="mtp-grid">
            {filteredStores.map((store, i) => {
              const logoUrl     = getLogoUrl(store.storeId);
              const desc        = settings[store.storeId]?.basic?.description ?? store.description ?? null;
              const createdAt   = formatDate(store.createdAt ?? store.created_at);
              const roleKey     = (store.role ?? "OWNER").toUpperCase();
              const storeUsage    = usage[store.storeId] ?? {};
              const subscription  = storeUsage.subscription ?? null;
              const limits        = storeUsage.limits ?? null;
              const productCount  = storeUsage.productCount;

              // Fuente de plan en orden de prioridad:
              // 1. suscripción activa, 2. límites, 3. settings del wizard
              const subPlan      = (subscription?.planName ?? "").toUpperCase();
              const limitsPlan   = (limits?.planName ?? "").toUpperCase();
              const settingsPlan = (settings[store.storeId]?.plan?.name ?? "").toUpperCase();
              const planKey      = subPlan || limitsPlan || settingsPlan || "GRATUITO";

              const isPaidPlan    = planKey !== "GRATUITO";
              const subInactive   = subscription
                ? subscription.status?.toUpperCase() !== "ACTIVE"
                : isPaidPlan && limits?.active === false;

              return (
                <article
                  key={store.storeId}
                  className="mtp-card"
                  style={{ "--i": i }}
                  onClick={() => navigate(`/tienda/${store.slug}/admin`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && navigate(`/tienda/${store.slug}/admin`)}
                  aria-label={`Gestionar tienda ${store.name}`}
                >
                  {/* Banner */}
                  <div className="mtp-card-banner" style={getBannerStyle(store.storeId)}>
                    <span className={`mtp-status mtp-status--${store.isActive ? "active" : "draft"}`}>
                      {store.isActive && <span className="mtp-status-dot" />}
                      {store.isActive ? "Activa" : "Borrador"}
                    </span>
                    {logoUrl ? (
                      <img src={logoUrl} alt={`Logo ${store.name}`} className="mtp-logo" />
                    ) : (
                      <div className="mtp-logo mtp-logo--init" aria-hidden="true">
                        {store.name?.[0]?.toUpperCase() ?? "T"}
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="mtp-card-body">

                    {/* Nombre + rol */}
                    <div className="mtp-name-row">
                      <h3 className="mtp-store-name">{store.name ?? "Sin nombre"}</h3>
                      <span className={`mtp-role mtp-role--${ROLE_CLASS[roleKey] ?? "owner"}`}>
                        <Shield size={9} />
                        {ROLE_LABEL[roleKey] ?? roleKey}
                      </span>
                    </div>

                    {/* URL */}
                    <p className="mtp-store-url">
                      <Globe size={11} />
                      {store.slug ? `${store.slug}.vexio.com` : "—"}
                    </p>

                    {/* Descripción */}
                    {desc && <p className="mtp-desc">{desc}</p>}

                    {/* Fecha creación */}
                    {createdAt && (
                      <p className="mtp-created">
                        <Calendar size={10} /> Creada el {createdAt}
                      </p>
                    )}

                    {/* ── Uso del plan ───────────────────────────────────── */}
                    <div className="mtp-plan-box">
                      <div className="mtp-plan-header">
                        <span className={`mtp-plan-badge mtp-plan-badge--${PLAN_CLASS[planKey] ?? "free"}`}>
                          {PLAN_LABEL[planKey] ?? (limits?.planName ?? "Sin plan")}
                        </span>
                        {subInactive && (
                          <span className="mtp-plan-inactive">inactivo</span>
                        )}
                      </div>

                      {limits ? (
                        <div className="mtp-usage-list">
                          <UsageBar
                            used={productCount ?? 0}
                            max={limits.maxProducts}
                            label="Productos"
                            icon={Store}
                          />
                          <UsageBar
                            used={null}
                            max={limits.maxPages}
                            label="Páginas"
                          />
                          <UsageBar
                            used={null}
                            max={limits.maxAiCalls}
                            label="IA / mes"
                            icon={Zap}
                          />
                        </div>
                      ) : productCount !== null ? (
                        <p className="mtp-usage-fallback">
                          <Store size={11} /> {productCount} producto{productCount !== 1 ? "s" : ""}
                        </p>
                      ) : (
                        <p className="mtp-plan-nodata">Límites no disponibles</p>
                      )}
                    </div>

                    {/* ID copiable */}
                    <div className="mtp-id-row">
                      <span className="mtp-id-label">ID</span>
                      <code className="mtp-id" title={store.storeId}>
                        {store.storeId?.slice(0, 12)}…
                      </code>
                      <button
                        className={`mtp-copy${copiedId === store.storeId ? " copied" : ""}`}
                        onClick={(e) => handleCopy(store.storeId, e)}
                        title="Copiar ID completo"
                        aria-label="Copiar ID"
                      >
                        {copiedId === store.storeId ? <Check size={11} /> : <Copy size={11} />}
                      </button>
                    </div>

                    {/* Acciones */}
                    <div className="mtp-actions">
                      <button
                        className="mtp-btn-config"
                        onClick={(e) => { e.stopPropagation(); navigate(`/tienda/${store.slug}/admin`); }}
                      >
                        <Settings2 size={13} /> Configurar
                      </button>
                      <button
                        className="mtp-btn-view"
                        onClick={(e) => { e.stopPropagation(); window.open(`/tienda/${store.slug}`, "_blank"); }}
                        title="Abrir tienda pública en nueva pestaña"
                      >
                        <ExternalLink size={13} /> Ver tienda
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
