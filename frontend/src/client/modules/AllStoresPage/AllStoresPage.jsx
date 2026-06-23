import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Store, X, ChevronDown, SlidersHorizontal, Star } from 'lucide-react';
import HeaderMarket from '../../../utils/Header/HeaderMarket';
import FooterMarket from '../MarketPage/components/FooterMarket/FooterMarket';
import { getAllStores, getStoreSettingsByHeader } from '../../../multi-tenant/pages/services/storeService';
import './AllStoresPage.css';

const SORT_OPTIONS = [
  { label: 'Nombre A → Z',  value: 'az'       },
  { label: 'Nombre Z → A',  value: 'za'       },
  { label: 'Destacadas',    value: 'featured'  },
];

/* ── helpers ──────────────────────────────────────────────────────── */
const getCover  = (s) => {
  const b = s.settings?.components?.banner;
  if (b?.image) return { type: 'image', src: b.image };
  if (b?.bg)    return { type: 'color', bg: b.bg };
  return { type: 'color', bg: '#111827' };
};
const getLogo   = (s) => {
  const l = s.settings?.basic?.logoPreview ?? s.settings?.components?.header?.logo;
  return l && l.startsWith('http') ? l : null;
};
const getAccent = (s) => s.settings?.styles?.colorBoton ?? '#3e78ff';
const getPlan   = (s) => s.settings?.plan?.name ?? null;

function applyFilters(stores, { search, plan, sort }) {
  let result = [...stores];

  if (search.trim()) {
    const q = search.trim().toLowerCase();
    result = result.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.slug?.toLowerCase().includes(q),
    );
  }

  if (plan && plan !== 'Todos') {
    result = result.filter(
      (s) => (getPlan(s) ?? '').toUpperCase() === plan.toUpperCase(),
    );
  }

  if (sort === 'az')       result.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
  if (sort === 'za')       result.sort((a, b) => (b.name ?? '').localeCompare(a.name ?? ''));
  if (sort === 'featured') result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));

  return result;
}

/* ── StoreCard ────────────────────────────────────────────────────── */
function StoreCard({ store, onClick }) {
  const cover  = getCover(store);
  const logo   = getLogo(store);
  const accent = getAccent(store);
  const plan   = getPlan(store);
  const desc   = store.description ?? store.settings?.components?.banner?.title ?? '';

  return (
    <article
      className="ase-card"
      style={{ '--ase-accent': accent }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      {/* Cover */}
      <div className="ase-card-cover">
        {cover.type === 'image'
          ? <img src={cover.src} alt={store.name} className="ase-card-cover-img" loading="lazy" />
          : <div className="ase-card-cover-bg" style={{ background: cover.bg }} />
        }
        <div className="ase-card-overlay" />
        {(store.isFeatured || store.featured) && (
          <span className="ase-card-featured-badge"><Star size={10} fill="currentColor" /> Destacada</span>
        )}
        {plan && <span className="ase-card-plan">{plan}</span>}
      </div>

      {/* Avatar */}
      <div className="ase-card-avatar-ring">
        {logo
          ? <img src={logo} alt="" className="ase-card-avatar" />
          : <div className="ase-card-avatar-init" style={{ background: accent }}>
              {store.name?.[0]?.toUpperCase() ?? 'T'}
            </div>
        }
      </div>

      {/* Info */}
      <div className="ase-card-body">
        <h3 className="ase-card-name">{store.name}</h3>
        {desc && <p className="ase-card-desc">{desc}</p>}
        <p className="ase-card-url">{store.slug}.VEXIO.com</p>
        <div className="ase-card-divider" />
        <button className="ase-card-btn">Visitar tienda →</button>
      </div>
    </article>
  );
}

/* ── Skeleton ─────────────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="ase-skeleton">
      <div className="ase-skeleton-cover" />
      <div className="ase-skeleton-avatar" />
      <div className="ase-skeleton-body">
        <div className="ase-skeleton-line ase-skeleton-line--title" />
        <div className="ase-skeleton-line" />
        <div className="ase-skeleton-line ase-skeleton-line--short" />
      </div>
    </div>
  );
}

/* ── Página principal ─────────────────────────────────────────────── */
export default function AllStoresPage() {
  const navigate = useNavigate();

  const [allStores, setAllStores] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  const [search, setSearch] = useState('');
  const [plan,   setPlan]   = useState('Todos');
  const [sort,   setSort]   = useState('az');

  /* Opciones de plan extraídas de los datos reales */
  const planOptions = useMemo(() => {
    const plans = [...new Set(allStores.map((s) => getPlan(s)).filter(Boolean))];
    return ['Todos', ...plans.sort()];
  }, [allStores]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getAllStores()
      .then(async (data) => {
        if (cancelled) return;
        const all = Array.isArray(data)
          ? data
          : (data?.content ?? data?.stores ?? data?.data ?? []);

        const active = all.filter((s) => s.isActive);

        const withSettings = await Promise.all(
          active.map(async (store) => {
            try {
              const settings = await getStoreSettingsByHeader(store.storeId);
              return { ...store, settings: settings ?? {} };
            } catch {
              return { ...store, settings: {} };
            }
          }),
        );

        if (!cancelled) setAllStores(withSettings);
      })
      .catch((err) => { if (!cancelled) setError(err.message ?? 'No se pudieron cargar las tiendas.'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(
    () => applyFilters(allStores, { search, plan, sort }),
    [allStores, search, plan, sort],
  );

  const clearFilters = () => { setSearch(''); setPlan('Todos'); setSort('az'); };

  const hasActiveFilters = search.trim() || plan !== 'Todos';

  return (
    <div className="ase-root">
      <HeaderMarket />

      <main className="ase-main">

        {/* ── Hero ── */}
        <section className="ase-hero">
          <div className="ase-hero-inner">
            <span className="ase-hero-tag">DIRECTORIO</span>
            <h1 className="ase-hero-title">Todas las tiendas</h1>
            <p className="ase-hero-sub">
              {loading
                ? 'Cargando tiendas…'
                : `${allStores.length} tienda${allStores.length !== 1 ? 's' : ''} activas en la plataforma`
              }
            </p>
          </div>
        </section>

        {/* ── Filtros ── */}
        <section className="ase-filters-bar">
          <div className="ase-filters-inner">

            {/* Búsqueda */}
            <div className="ase-search-wrap">
              <Search size={15} className="ase-search-icon" />
              <input
                type="text"
                className="ase-search"
                placeholder="Buscar tienda por nombre, descripción o slug…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className="ase-search-clear" onClick={() => setSearch('')} aria-label="Limpiar búsqueda">
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="ase-filters-row">
              {/* Pills de plan */}
              <div className="ase-plan-pills">
                <SlidersHorizontal size={13} className="ase-filter-icon" />
                {planOptions.map((p) => (
                  <button
                    key={p}
                    className={`ase-plan-pill${plan === p ? ' ase-plan-pill--on' : ''}`}
                    onClick={() => setPlan(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Ordenar */}
              <div className="ase-sort-wrap">
                <ChevronDown size={13} className="ase-sort-arrow" />
                <select
                  className="ase-sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* ── Contador de resultados ── */}
        {!loading && !error && (
          <div className="ase-results-bar">
            <span className="ase-results-count">
              {filtered.length === allStores.length
                ? `${filtered.length} tiendas`
                : `${filtered.length} de ${allStores.length} tiendas`
              }
            </span>
            {hasActiveFilters && (
              <button className="ase-clear-filters" onClick={clearFilters}>
                <X size={12} /> Limpiar filtros
              </button>
            )}
          </div>
        )}

        {/* ── Grid ── */}
        <section className="ase-grid-section">

          {loading && (
            <div className="ase-grid">
              {[...Array(8)].map((_, i) => <Skeleton key={i} />)}
            </div>
          )}

          {!loading && error && (
            <div className="ase-empty">
              <Store size={36} />
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="ase-empty">
              <Store size={36} />
              <p>No hay tiendas que coincidan con tu búsqueda.</p>
              <button className="ase-empty-clear" onClick={clearFilters}>
                Limpiar filtros
              </button>
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="ase-grid">
              {filtered.map((store) => (
                <StoreCard
                  key={store.storeId}
                  store={store}
                  onClick={() => navigate(`/tienda/${store.slug}`)}
                />
              ))}
            </div>
          )}

        </section>
      </main>

      <FooterMarket />
    </div>
  );
}
