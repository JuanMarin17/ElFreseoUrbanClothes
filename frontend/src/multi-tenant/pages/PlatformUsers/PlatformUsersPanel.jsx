import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Store, Crown, Shield, Search, RefreshCw,
  ChevronRight, UserCheck, AlertTriangle,
} from 'lucide-react';
import { getAllStores, getUsersByStore } from '../services/storeService';
import './PlatformUsersPanel.css';

// ── Helpers ───────────────────────────────────────────────────────────────────

const initials = (name) =>
  (name ?? '?')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

const ROLE_CONFIG = {
  OWNER: { label: 'Propietario', cls: 'pu-role--owner', icon: Crown  },
  ADMIN: { label: 'Administrador', cls: 'pu-role--admin', icon: Shield },
  STAFF: { label: 'Personal',       cls: 'pu-role--staff', icon: Users  },
};

const primaryRole = (stores) =>
  stores.some((s) => s.role === 'OWNER') ? 'OWNER'
  : stores.some((s) => s.role === 'ADMIN') ? 'ADMIN'
  : 'STAFF';

// ── Component ─────────────────────────────────────────────────────────────────

export default function PlatformUsersPanel() {
  const navigate = useNavigate();

  const [users,   setUsers]   = useState([]);
  const [stores,  setStores]  = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('all'); // all | owner | admin | staff

  // ── Load ─────────────────────────────────────────────────────────────────────

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await getAllStores();
      const storeList = Array.isArray(raw)
        ? raw
        : (raw?.content ?? raw?.stores ?? raw?.data ?? []);
      setStores(storeList);

      const results = await Promise.allSettled(
        storeList.map((store) =>
          getUsersByStore(store.storeId)
            .then((members) => ({ store, members: Array.isArray(members) ? members : [] }))
            .catch(() => ({ store, members: [] }))
        ),
      );

      // Aggregate: one entry per userId, collecting all store associations
      const map = new Map();
      results.forEach((r) => {
        if (r.status !== 'fulfilled') return;
        const { store, members } = r.value;
        members.forEach((m) => {
          if (!m?.userId) return;
          if (!map.has(m.userId)) {
            map.set(m.userId, {
              userId:    m.userId,
              userName:  m.userName  ?? null,
              userEmail: m.userEmail ?? null,
              isActive:  m.isActive  ?? true,
              stores:    [],
            });
          }
          map.get(m.userId).stores.push({
            storeId:   store.storeId,
            storeName: store.name,
            storeSlug: store.slug,
            role:      m.role ?? 'STAFF',
          });
        });
      });

      setUsers(Array.from(map.values()));
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los usuarios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ── Derived data ──────────────────────────────────────────────────────────────

  const enriched = useMemo(
    () => users.map((u) => ({ ...u, role: primaryRole(u.stores) })),
    [users],
  );

  const kpi = useMemo(() => ({
    total:   enriched.length,
    owners:  enriched.filter((u) => u.role === 'OWNER').length,
    admins:  enriched.filter((u) => u.role === 'ADMIN').length,
    tiendas: stores.length,
  }), [enriched, stores]);

  const displayed = useMemo(() => {
    let list = enriched;
    if (filter === 'owner') list = list.filter((u) => u.role === 'OWNER');
    if (filter === 'admin') list = list.filter((u) => u.role === 'ADMIN');
    if (filter === 'staff') list = list.filter((u) => u.role === 'STAFF');
    if (search.trim()) {
      const t = search.toLowerCase();
      list = list.filter(
        (u) =>
          u.userName?.toLowerCase().includes(t) ||
          u.userEmail?.toLowerCase().includes(t),
      );
    }
    return list;
  }, [enriched, filter, search]);

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="pu-container">

      {/* Header */}
      <div className="pu-header">
        <div>
          <h1 className="pu-title">Usuarios</h1>
          <p className="pu-subtitle">
            {enriched.length > 0
              ? `${enriched.length} usuario${enriched.length !== 1 ? 's' : ''} vinculado${enriched.length !== 1 ? 's' : ''} a tiendas`
              : 'Directorio de usuarios de la plataforma'}
          </p>
        </div>
        <button className="pu-refresh" onClick={load} disabled={loading} title="Recargar">
          <RefreshCw size={15} className={loading ? 'pu-spin' : ''} />
        </button>
      </div>

      {/* KPIs */}
      <div className="pu-kpi-row">
        {[
          { icon: Users,     cls: 'blue',   label: 'Total usuarios', value: kpi.total   },
          { icon: Crown,     cls: 'gold',   label: 'Propietarios',   value: kpi.owners  },
          { icon: Shield,    cls: 'purple', label: 'Admins',         value: kpi.admins  },
          { icon: Store,     cls: 'green',  label: 'Tiendas',        value: kpi.tiendas },
        ].map(({ icon: Icon, cls, label, value }, i) => (
          <div key={label} className="pu-kpi" style={{ animationDelay: `${i * 60}ms` }}>
            <Icon size={18} className={`pu-kpi-icon pu-kpi-icon--${cls}`} />
            <div>
              <span className="pu-kpi-label">{label}</span>
              <span className="pu-kpi-value">{value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="pu-toolbar">
        <div className="pu-tabs">
          {[
            ['all',   'Todos'],
            ['owner', 'Propietarios'],
            ['admin', 'Admins'],
            ['staff', 'Personal'],
          ].map(([k, lbl]) => (
            <button
              key={k}
              className={`pu-tab ${filter === k ? 'pu-tab--active' : ''}`}
              onClick={() => setFilter(k)}
            >
              {lbl}
            </button>
          ))}
        </div>
        <div className="pu-search-wrap">
          <Search size={13} className="pu-search-icon" />
          <input
            className="pu-search-input"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="pu-alert">
          <AlertTriangle size={15} /> {error}
        </div>
      )}

      {/* Result count */}
      {!loading && displayed.length !== enriched.length && (
        <p className="pu-result-count">
          {displayed.length} de {enriched.length} usuarios
        </p>
      )}

      {/* Table */}
      {loading ? (
        <SkeletonList />
      ) : displayed.length === 0 ? (
        <EmptyState hasFilter={filter !== 'all' || !!search} onClear={() => { setFilter('all'); setSearch(''); }} />
      ) : (
        <div className="pu-table">
          <div className="pu-table-head">
            <span>Usuario</span>
            <span>Tipo</span>
            <span>Tiendas</span>
            <span>Estado</span>
            <span />
          </div>

          {displayed.map((user, index) => {
            const rc = ROLE_CONFIG[user.role] ?? ROLE_CONFIG.STAFF;
            const RoleIcon = rc.icon;
            return (
              <div
                key={user.userId}
                className="pu-row"
                style={{ animationDelay: `${Math.min(index * 45, 300)}ms` }}
              >
                {/* User info */}
                <div className="pu-cell-user">
                  <div className={`pu-avatar pu-avatar--${user.role.toLowerCase()}`}>
                    {initials(user.userName)}
                  </div>
                  <div className="pu-user-text">
                    <span className="pu-user-name">{user.userName ?? '—'}</span>
                    <span className="pu-user-email">{user.userEmail ?? '—'}</span>
                  </div>
                </div>

                {/* Role badge */}
                <div className="pu-cell-role">
                  <span className={`pu-role-badge ${rc.cls}`}>
                    <RoleIcon size={10} /> {rc.label}
                  </span>
                </div>

                {/* Stores */}
                <div className="pu-cell-stores">
                  {user.stores.slice(0, 2).map((s) => (
                    <button
                      key={s.storeId}
                      className="pu-store-chip"
                      onClick={() => navigate(`/tienda/${s.storeSlug}`)}
                      title={`Ir a ${s.storeName}`}
                    >
                      {s.storeName}
                    </button>
                  ))}
                  {user.stores.length > 2 && (
                    <span className="pu-store-chip pu-store-chip--more">
                      +{user.stores.length - 2}
                    </span>
                  )}
                </div>

                {/* Status */}
                <div className="pu-cell-status">
                  <span className={`pu-status ${user.isActive ? 'pu-status--active' : 'pu-status--inactive'}`}>
                    <span className="pu-dot" />
                    {user.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                {/* Actions */}
                <div className="pu-cell-actions">
                  {user.stores[0]?.storeSlug && (
                    <button
                      className="pu-btn-admin"
                      onClick={() => navigate(`/tienda/${user.stores[0].storeSlug}/admin/dashboard`)}
                      title="Ir al panel admin de su tienda"
                    >
                      Admin <ChevronRight size={12} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="pu-disclaimer">
        * Solo se muestran usuarios vinculados a tiendas. Clientes sin tienda requieren integración con el endpoint <code>/usuarios</code>.
      </p>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonList() {
  return (
    <div className="pu-table">
      <div className="pu-table-head">
        <span>Usuario</span><span>Tipo</span><span>Tiendas</span><span>Estado</span><span />
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="pu-row pu-row--skeleton" style={{ animationDelay: `${i * 55}ms` }}>
          <div className="pu-cell-user">
            <div className="pu-skel-circle" />
            <div className="pu-skel-lines">
              <div className="pu-skel-line pu-skel-line--lg" />
              <div className="pu-skel-line pu-skel-line--sm" />
            </div>
          </div>
          <div className="pu-skel-pill" />
          <div className="pu-skel-lines" style={{ flexDirection: 'row', gap: 6 }}>
            <div className="pu-skel-pill pu-skel-pill--wide" />
          </div>
          <div className="pu-skel-pill" />
          <div />
        </div>
      ))}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ hasFilter, onClear }) {
  return (
    <div className="pu-empty">
      <UserCheck size={36} className="pu-empty-icon" />
      <p className="pu-empty-title">{hasFilter ? 'Sin resultados' : 'Sin usuarios'}</p>
      <p className="pu-empty-sub">
        {hasFilter
          ? 'No hay usuarios que coincidan con el filtro.'
          : 'No se encontraron usuarios vinculados a tiendas.'}
      </p>
      {hasFilter && (
        <button className="pu-clear-btn" onClick={onClear}>Limpiar filtros</button>
      )}
    </div>
  );
}
