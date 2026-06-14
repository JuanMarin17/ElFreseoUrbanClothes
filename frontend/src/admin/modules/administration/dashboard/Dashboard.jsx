import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Package, PackagePlus, ShoppingCart, AlertTriangle,
  BarChart3, ArrowRight, RefreshCw, CheckCircle2,
  TrendingDown, Building2, FileText, Users,
  Store, Zap,
} from 'lucide-react';
import { getAllProducts } from '../services/productService';
import { getMembers } from '../services/UsersService';
import { getStoreSettingsByHeader } from '../../../../multi-tenant/pages/services/storeService';
import './Dashboard.css';

// ── Utilities ─────────────────────────────────────────────────────────────────

const stockStatus = (variants) => {
  if (!variants?.length) return 'empty';
  if (variants.every((v) => v.stock === 0)) return 'out';
  if (variants.some((v) => v.stock > 0 && v.stock <= (v.minStock ?? 5))) return 'low';
  return 'ok';
};

function parseUserFromJwt() {
  try {
    const jwt = localStorage.getItem('jwt');
    if (!jwt) return null;
    const d = JSON.parse(atob(jwt.split('.')[1]));
    return {
      userId:   d.user_id ?? null,
      userName: d.sub ?? null,
      userRole: localStorage.getItem('userRole') ?? d.role ?? null,
    };
  } catch { return null; }
}

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
};

const today = () =>
  new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

// ── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonKpi() {
  return (
    <div className="db-kpi db-kpi--skeleton">
      <div className="db-skel db-skel--icon" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div className="db-skel db-skel--val" />
        <div className="db-skel db-skel--label" />
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

const Dashboard = () => {
  const navigate  = useNavigate();
  const { slug }  = useParams();
  const adminBase = slug ? `/tienda/${slug}/admin` : '/admin';

  const userInfo  = useMemo(() => parseUserFromJwt(), []);

  const [products,    setProducts]    = useState([]);
  const [members,     setMembers]     = useState([]);
  const [storeInfo,   setStoreInfo]   = useState(() => {
    const n = localStorage.getItem('storeName');
    return { name: (n && n !== 'null') ? n : null, logo: null };
  });
  const [loading,     setLoading]     = useState(true);

  // Nombre resuelto: busca al usuario actual en la lista de miembros
  // (ese endpoint devuelve el userName real del backend), cae al JWT si no.
  const displayName = useMemo(() => {
    if (members.length > 0 && userInfo?.userId) {
      const me = members.find((m) => m.userId === userInfo.userId);
      if (me?.userName) return me.userName;
    }
    return userInfo?.userName ?? null;
  }, [members, userInfo]);

  // ── Load ───────────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const storeId = localStorage.getItem('storeId');
      if (storeId && storeId !== 'null') {
        getStoreSettingsByHeader(storeId)
          .then((s) => {
            if (s) {
              setStoreInfo((prev) => ({
                ...prev,
                logo: s.basic?.logoPreview ?? s.logoUrl ?? null,
              }));
            }
          })
          .catch(() => {});
      }

      let storeIdResolved = storeId;
      if (!storeIdResolved || storeIdResolved === 'null') {
        await new Promise((r) => setTimeout(r, 600));
        storeIdResolved = localStorage.getItem('storeId');
      }
      if (storeIdResolved && storeIdResolved !== 'null') {
        const [productsData, membersData] = await Promise.allSettled([
          getAllProducts(storeIdResolved),
          getMembers(),
        ]);
        if (productsData.status === 'fulfilled') setProducts(Array.isArray(productsData.value) ? productsData.value : []);
        if (membersData.status  === 'fulfilled') setMembers(Array.isArray(membersData.value)  ? membersData.value  : []);
      }
    } catch {
      // Silencioso — mostramos 0s
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const run = async () => { await load(); };
    run();
  }, [load]);

  // ── KPIs desde productos reales ────────────────────────────────────────────

  const kpi = useMemo(() => ({
    total:    products.length,
    active:   products.filter((p) => p.status === 'ACTIVE').length,
    inactive: products.filter((p) => p.status !== 'ACTIVE').length,
    lowStock: products.filter((p) => stockStatus(p.variants) === 'low').length,
    outStock: products.filter((p) => stockStatus(p.variants) === 'out').length,
    variants: products.reduce((a, p) => a + (p.variants?.length ?? 0), 0),
  }), [products]);

  // ── Acciones rápidas ────────────────────────────────────────────────────────

  const QUICK_ACTIONS = [
    { icon: Package,      label: 'Inventario',    path: `${adminBase}/productos`,      color: 'blue'   },
    { icon: PackagePlus,  label: 'Nuevo Producto', path: `${adminBase}/subir-producto`, color: 'green'  },
    { icon: ShoppingCart, label: 'Pedidos',        path: `${adminBase}/pedidos`,        color: 'purple' },
    { icon: AlertTriangle,label: 'Alertas Stock',  path: `${adminBase}/alertas`,        color: 'orange' },
    { icon: Building2,    label: 'Proveedores',    path: `${adminBase}/proveedores`,    color: 'teal'   },
    { icon: BarChart3,    label: 'Informes',       path: `${adminBase}/report`,         color: 'indigo' },
    { icon: Users,        label: 'Usuarios',       path: `${adminBase}/usuarios`,       color: 'pink'   },
    { icon: FileText,     label: 'CMS',            path: `${adminBase}/cms`,            color: 'gray'   },
  ];

  const storeName = storeInfo.name
    ?? localStorage.getItem('storeName')
    ?? 'tu tienda';

  return (
    <div className="db-view">

      {/* ── Banner de bienvenida ─────────────────────────────────────────── */}
      <div className="db-banner">
        <div className="db-banner-glow db-banner-glow--a" />
        <div className="db-banner-glow db-banner-glow--b" />

        <div className="db-banner-inner">
          {storeInfo.logo ? (
            <img src={storeInfo.logo} alt={storeName} className="db-store-logo" />
          ) : storeName !== 'tu tienda' ? (
            <div className="db-store-initial">
              {storeName[0].toUpperCase()}
            </div>
          ) : (
            <div className="db-store-initial db-store-initial--default">
              <Store size={22} />
            </div>
          )}

          <div className="db-banner-text">
            <p className="db-banner-greeting">
              {greeting()}, <strong>{displayName ?? 'Admin'}</strong>
            </p>
            <p className="db-banner-store-label">Tienda</p>
            <h1 className="db-banner-title">{storeName}</h1>
            <p className="db-banner-date">{today()}</p>
          </div>

          <button
            className="db-refresh-btn"
            onClick={load}
            disabled={loading}
            title="Actualizar datos"
          >
            <RefreshCw size={15} className={loading ? 'db-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── KPIs ─────────────────────────────────────────────────────────── */}
      <div className="db-kpi-grid">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonKpi key={i} />)
        ) : (
          <>
            <div className="db-kpi" style={{ '--delay': '0ms' }}>
              <div className="db-kpi-icon db-kpi-icon--blue"><Package size={20} /></div>
              <div>
                <span className="db-kpi-value">{kpi.total}</span>
                <span className="db-kpi-label">Productos</span>
              </div>
            </div>
            <div className="db-kpi" style={{ '--delay': '60ms' }}>
              <div className="db-kpi-icon db-kpi-icon--green"><CheckCircle2 size={20} /></div>
              <div>
                <span className="db-kpi-value">{kpi.active}</span>
                <span className="db-kpi-label">Activos</span>
              </div>
            </div>
            <div className="db-kpi" style={{ '--delay': '120ms' }}>
              <div className="db-kpi-icon db-kpi-icon--orange"><TrendingDown size={20} /></div>
              <div>
                <span className="db-kpi-value">{kpi.lowStock}</span>
                <span className="db-kpi-label">Stock bajo</span>
              </div>
            </div>
            <div className="db-kpi" style={{ '--delay': '180ms' }}>
              <div className="db-kpi-icon db-kpi-icon--red"><AlertTriangle size={20} /></div>
              <div>
                <span className="db-kpi-value">{kpi.outStock}</span>
                <span className="db-kpi-label">Sin stock</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Acciones rápidas ─────────────────────────────────────────────── */}
      <div className="db-section">
        <div className="db-section-header">
          <Zap size={15} className="db-section-icon" />
          <h2 className="db-section-title">Acciones rápidas</h2>
        </div>
        <div className="db-actions-grid">
          {QUICK_ACTIONS.map((action, i) => {
            const Icon = action.icon;
            return (
              <button
                key={action.path}
                className={`db-action-card db-action-card--${action.color}`}
                onClick={() => navigate(action.path)}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <Icon size={20} className="db-action-icon" />
                <span className="db-action-label">{action.label}</span>
                <ArrowRight size={13} className="db-action-arrow" />
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Estado de inventario ─────────────────────────────────────────── */}
      {!loading && products.length > 0 && (
        <div className="db-section">
          <div className="db-section-header">
            <Package size={15} className="db-section-icon" />
            <h2 className="db-section-title">Estado del inventario</h2>
            <button
              className="db-section-link"
              onClick={() => navigate(`${adminBase}/productos`)}
            >
              Ver todo <ArrowRight size={13} />
            </button>
          </div>

          <div className="db-inventory-cards">
            <div className="db-inv-card">
              <div className="db-inv-bar" style={{ '--fill': `${kpi.total ? (kpi.active / kpi.total) * 100 : 0}%`, '--color': '#10b981' }} />
              <div className="db-inv-info">
                <span className="db-inv-num" style={{ color: '#10b981' }}>{kpi.active}</span>
                <span className="db-inv-label">Activos</span>
              </div>
            </div>
            <div className="db-inv-card">
              <div className="db-inv-bar" style={{ '--fill': `${kpi.total ? (kpi.inactive / kpi.total) * 100 : 0}%`, '--color': '#6b7280' }} />
              <div className="db-inv-info">
                <span className="db-inv-num" style={{ color: '#6b7280' }}>{kpi.inactive}</span>
                <span className="db-inv-label">Inactivos</span>
              </div>
            </div>
            <div className="db-inv-card">
              <div className="db-inv-bar" style={{ '--fill': `${kpi.total ? (kpi.lowStock / kpi.total) * 100 : 0}%`, '--color': '#f59e0b' }} />
              <div className="db-inv-info">
                <span className="db-inv-num" style={{ color: '#f59e0b' }}>{kpi.lowStock}</span>
                <span className="db-inv-label">Stock bajo</span>
              </div>
            </div>
            <div className="db-inv-card">
              <div className="db-inv-bar" style={{ '--fill': `${kpi.total ? (kpi.outStock / kpi.total) * 100 : 0}%`, '--color': '#ef4444' }} />
              <div className="db-inv-info">
                <span className="db-inv-num" style={{ color: '#ef4444' }}>{kpi.outStock}</span>
                <span className="db-inv-label">Sin stock</span>
              </div>
            </div>
            <div className="db-inv-card">
              <div className="db-inv-bar" style={{ '--fill': '100%', '--color': '#3b82f6' }} />
              <div className="db-inv-info">
                <span className="db-inv-num" style={{ color: '#3b82f6' }}>{kpi.variants}</span>
                <span className="db-inv-label">Variantes</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Estado vacío cuando no hay productos ─────────────────────────── */}
      {!loading && products.length === 0 && (
        <div className="db-empty">
          <Package size={38} className="db-empty-icon" />
          <p className="db-empty-title">Sin productos aún</p>
          <p className="db-empty-sub">Comienza subiendo tu primer producto al catálogo.</p>
          <button
            className="db-empty-cta"
            onClick={() => navigate(`${adminBase}/subir-producto`)}
          >
            <PackagePlus size={15} /> Subir producto
          </button>
        </div>
      )}

      {/* ── Equipo de la tienda ───────────────────────────────────────────── */}
      {!loading && members.length > 0 && (
        <div className="db-section">
          <div className="db-section-header">
            <Users size={15} className="db-section-icon" />
            <h2 className="db-section-title">Equipo de la tienda</h2>
            <button
              className="db-section-link"
              onClick={() => navigate(`${adminBase}/usuarios`)}
            >
              Ver todos <ArrowRight size={13} />
            </button>
          </div>

          <div className="db-members-list">
            {members.slice(0, 5).map((m) => {
              const initial = (m.userName ?? m.userEmail ?? '?').charAt(0).toUpperCase();
              const isOwner = m.role === 'OWNER';
              return (
                <div key={m.userId} className="db-member-row">
                  <div className="db-member-avatar">{initial}</div>
                  <div className="db-member-info">
                    <span className="db-member-name">
                      {m.userName || m.userEmail || (
                        <span style={{ fontStyle: 'italic', opacity: 0.5 }}>Sin nombre</span>
                      )}
                    </span>
                    {m.userEmail && (
                      <span className="db-member-email">{m.userEmail}</span>
                    )}
                  </div>
                  <span className={`db-member-role ${isOwner ? 'db-member-role--owner' : 'db-member-role--admin'}`}>
                    {isOwner ? 'Propietario' : 'Admin'}
                  </span>
                  <span
                    className="db-member-dot"
                    style={{ background: m.isActive ? '#10b981' : '#6b7280' }}
                    title={m.isActive ? 'Activo' : 'Inactivo'}
                  />
                </div>
              );
            })}
            {members.length > 5 && (
              <p className="db-members-more">
                +{members.length - 5} miembro{members.length - 5 !== 1 ? 's' : ''} más
              </p>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
