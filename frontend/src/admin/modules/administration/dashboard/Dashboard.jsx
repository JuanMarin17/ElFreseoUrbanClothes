import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Package, PackagePlus, ShoppingCart, AlertTriangle,
  BarChart3, ArrowRight, RefreshCw, CheckCircle2,
  TrendingDown, Building2, FileText, Users, Store, Zap, Tag,
} from 'lucide-react';
import { getAllProducts } from '../services/productService';
import { getMembers } from '../services/UsersService';
import { getStoreSettingsByHeader } from '../../../../multi-tenant/pages/services/storeService';
import { useDashboard } from '../promotions/service/usedashboard';
import PromotionModal from '../promotions/PromotionModa';
import ToastStack from '../promotions/Toaststack';
import '../promotions/style/PromotionsDashboards.css';
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

  const userInfo = useMemo(() => parseUserFromJwt(), []);

  const [products,  setProducts]  = useState([]);
  const [members,   setMembers]   = useState([]);
  const [storeInfo, setStoreInfo] = useState(() => {
    const n = localStorage.getItem('storeName');
    return { name: (n && n !== 'null') ? n : null, logo: null };
  });
  const [loading, setLoading] = useState(true);

  // ── Promotions hook ────────────────────────────────────────────────────────
  const {
    filteredPromotions,
    filteredCoupons,
    kpis: promoKpis,
    loading: promoLoading,
    modal: promoModal,
    openCreateModal,
    openEditModal,
    closeModal:   closePromoModal,
    handleCreate: handlePromoCreate,
    handleEdit:   handlePromoEdit,
    toasts:       promoToasts,
  } = useDashboard();

  // Nombre resuelto: busca al usuario actual en la lista de miembros
  const displayName = useMemo(() => {
    if (members.length > 0 && userInfo?.userId) {
      const me = members.find((m) => m.userId === userInfo.userId);
      if (me?.userName) return me.userName;
    }
    return userInfo?.userName ?? null;
  }, [members, userInfo]);

  // ── Products load ──────────────────────────────────────────────────────────
  // fetchData: lógica de fetch pura, sin setLoading(true) síncrono al inicio
  const fetchData = useCallback(async () => {
    try {
      const storeId = localStorage.getItem('storeId');
      if (storeId && storeId !== 'null') {
        getStoreSettingsByHeader(storeId)
          .then((s) => {
            if (s) setStoreInfo((p) => ({ ...p, logo: s.basic?.logoPreview ?? s.logoUrl ?? null }));
          })
          .catch(() => {});
      }
      let sid = storeId;
      if (!sid || sid === 'null') {
        await new Promise((r) => setTimeout(r, 600));
        sid = localStorage.getItem('storeId');
      }
      if (sid && sid !== 'null') {
        const [productsData, membersData] = await Promise.allSettled([
          getAllProducts(sid),
          getMembers(),
        ]);
        if (productsData.status === 'fulfilled') setProducts(Array.isArray(productsData.value) ? productsData.value : []);
        if (membersData.status  === 'fulfilled') setMembers(Array.isArray(membersData.value)  ? membersData.value  : []);
      }
    } catch { /* silencioso */ }
    finally { setLoading(false); }
  }, []);

  // load: botón de refresco — activa spinner y llama fetchData
  const load = useCallback(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── KPIs productos ─────────────────────────────────────────────────────────
  const kpi = useMemo(() => ({
    total:    products.length,
    active:   products.filter((p) => p.status === 'ACTIVE').length,
    inactive: products.filter((p) => p.status !== 'ACTIVE').length,
    lowStock: products.filter((p) => stockStatus(p.variants) === 'low').length,
    outStock: products.filter((p) => stockStatus(p.variants) === 'out').length,
    variants: products.reduce((a, p) => a + (p.variants?.length ?? 0), 0),
  }), [products]);

  // ── Acciones rápidas ───────────────────────────────────────────────────────
  const QUICK_ACTIONS = [
    { icon: Package,       label: 'Inventario',    path: `${adminBase}/productos`,      color: 'blue'   },
    { icon: PackagePlus,   label: 'Nuevo Producto', path: `${adminBase}/subir-producto`, color: 'green'  },
    { icon: ShoppingCart,  label: 'Pedidos',        path: `${adminBase}/pedidos`,        color: 'purple' },
    { icon: AlertTriangle, label: 'Alertas Stock',  path: `${adminBase}/alertas`,        color: 'orange' },
    { icon: Building2,     label: 'Proveedores',    path: `${adminBase}/proveedores`,    color: 'teal'   },
    { icon: BarChart3,     label: 'Informes',       path: `${adminBase}/report`,         color: 'indigo' },
    { icon: Users,         label: 'Usuarios',       path: `${adminBase}/usuarios`,       color: 'pink'   },
    { icon: FileText,      label: 'CMS',            path: `${adminBase}/cms`,            color: 'gray'   },
  ];

  const storeName      = storeInfo.name ?? localStorage.getItem('storeName') ?? 'tu tienda';
  const recentPromos   = filteredPromotions.slice(0, 4);
  const recentCoupons  = filteredCoupons.slice(0, 4);
  const hasPromoData   = recentPromos.length > 0 || recentCoupons.length > 0;
  const handleSubmit   = promoModal.mode === 'create' ? handlePromoCreate : handlePromoEdit;

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
            <div className="db-store-initial">{storeName[0].toUpperCase()}</div>
          ) : (
            <div className="db-store-initial db-store-initial--default"><Store size={22} /></div>
          )}
          <div className="db-banner-text">
            <p className="db-banner-greeting">
              {greeting()}, <strong>{displayName ?? 'Admin'}</strong>
            </p>
            <p className="db-banner-store-label">Tienda</p>
            <h1 className="db-banner-title">{storeName}</h1>
            <p className="db-banner-date">{today()}</p>
          </div>
          <button className="db-refresh-btn" onClick={load} disabled={loading} title="Actualizar datos">
            <RefreshCw size={15} className={loading ? 'db-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── KPIs de productos ────────────────────────────────────────────── */}
      <div className="db-kpi-grid">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonKpi key={i} />)
        ) : (
          <>
            <div className="db-kpi" style={{ '--delay': '0ms' }}>
              <div className="db-kpi-icon db-kpi-icon--blue"><Package size={20} /></div>
              <div><span className="db-kpi-value">{kpi.total}</span><span className="db-kpi-label">Productos</span></div>
            </div>
            <div className="db-kpi" style={{ '--delay': '60ms' }}>
              <div className="db-kpi-icon db-kpi-icon--green"><CheckCircle2 size={20} /></div>
              <div><span className="db-kpi-value">{kpi.active}</span><span className="db-kpi-label">Activos</span></div>
            </div>
            <div className="db-kpi" style={{ '--delay': '120ms' }}>
              <div className="db-kpi-icon db-kpi-icon--orange"><TrendingDown size={20} /></div>
              <div><span className="db-kpi-value">{kpi.lowStock}</span><span className="db-kpi-label">Stock bajo</span></div>
            </div>
            <div className="db-kpi" style={{ '--delay': '180ms' }}>
              <div className="db-kpi-icon db-kpi-icon--red"><AlertTriangle size={20} /></div>
              <div><span className="db-kpi-value">{kpi.outStock}</span><span className="db-kpi-label">Sin stock</span></div>
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

      {/* ══════════════════════════════════════════════════════════════════
          SECCIÓN PROMOCIONES Y CUPONES — usa el sistema vx- del proyecto
         ══════════════════════════════════════════════════════════════════ */}
      <div className="db-section">
        <div className="db-section-header">
          <Tag size={15} className="db-section-icon" />
          <h2 className="db-section-title">Promociones y Cupones</h2>
          <button className="db-section-link" onClick={() => navigate(`${adminBase}/promociones`)}>
            Gestionar <ArrowRight size={13} />
          </button>
        </div>

        {/* ── 4 KPI cards con diseño vx- ── */}
        {promoLoading ? (
          <div className="vx-stats-grid">
            {[0,1,2,3].map((i) => (
              <div key={i} className="vx-skeleton" style={{ height: 110, borderRadius: 'var(--vx-radius-lg)' }} />
            ))}
          </div>
        ) : (
          <div className="vx-stats-grid">
            <div className="vx-stat-card vx-stat-card--cyan">
              <div className="vx-stat-card__header">
                <span className="vx-stat-card__label">Promociones</span>
                <div className="vx-stat-card__icon"><i className="fa-solid fa-tags" /></div>
              </div>
              <div className="vx-stat-card__value">{promoKpis.totalPromotions}</div>
              <div className="vx-stat-card__sub"><span>{promoKpis.activePromotions} activas</span></div>
            </div>

            <div className="vx-stat-card vx-stat-card--green">
              <div className="vx-stat-card__header">
                <span className="vx-stat-card__label">Promos activas</span>
                <div className="vx-stat-card__icon"><i className="fa-solid fa-circle-check" /></div>
              </div>
              <div className="vx-stat-card__value">{promoKpis.activePromotions}</div>
              <div className="vx-stat-card__sub">de {promoKpis.totalPromotions} creadas</div>
            </div>

            <div className="vx-stat-card vx-stat-card--purple">
              <div className="vx-stat-card__header">
                <span className="vx-stat-card__label">Cupones</span>
                <div className="vx-stat-card__icon"><i className="fa-solid fa-ticket" /></div>
              </div>
              <div className="vx-stat-card__value">{promoKpis.totalCoupons}</div>
              <div className="vx-stat-card__sub"><span>{promoKpis.activeCoupons} activos</span></div>
            </div>

            <div className="vx-stat-card vx-stat-card--amber">
              <div className="vx-stat-card__header">
                <span className="vx-stat-card__label">Cupones activos</span>
                <div className="vx-stat-card__icon"><i className="fa-solid fa-circle-check" /></div>
              </div>
              <div className="vx-stat-card__value">{promoKpis.activeCoupons}</div>
              <div className="vx-stat-card__sub">de {promoKpis.totalCoupons} creados</div>
            </div>
          </div>
        )}

        {/* ── Botones de creación ── */}
        <div className="vx-page-header__actions" style={{ justifyContent: 'flex-start' }}>
          <button className="vx-btn vx-btn--primary" onClick={() => openCreateModal('promotion')}>
            <i className="fa-solid fa-plus" aria-hidden="true" /> Nueva promoción
          </button>
          <button className="vx-btn vx-btn--ghost" onClick={() => openCreateModal('coupon')}>
            <i className="fa-solid fa-ticket" aria-hidden="true" /> Nuevo cupón
          </button>
        </div>

        {/* ── Listas recientes ── */}
        {!promoLoading && hasPromoData && (
          <div className="db-promo-recent-grid">
            {/* Últimas promociones */}
            {recentPromos.length > 0 && (
              <div className="vx-table-wrap">
                <div className="vx-table-toolbar" style={{ padding: '12px 18px' }}>
                  <span className="db-promo-col-title">
                    <i className="fa-solid fa-tags" style={{ color: 'var(--vx-cyan)' }} />
                    Últimas promociones
                  </span>
                  <button
                    className="vx-btn vx-btn--icon"
                    style={{ width: 28, height: 28, fontSize: '0.72rem' }}
                    onClick={() => navigate(`${adminBase}/promociones`)}
                    title="Ver todas"
                  >
                    <i className="fa-solid fa-arrow-right" />
                  </button>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Descuento</th>
                      <th>Estado</th>
                      <th style={{ width: 36 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPromos.map((p) => (
                      <tr key={p.promotionId}>
                        <td style={{ fontWeight: 600, fontSize: '0.82rem' }}>{p.name}</td>
                        <td style={{ fontFamily: 'var(--vx-font-display)', fontWeight: 800 }}>
                          {p.discountType === 'PERCENTAGE'
                            ? `${p.discount}%`
                            : `$${Number(p.discount).toLocaleString('es-CO')}`}
                        </td>
                        <td>
                          <span className={`vx-badge ${p.isActive ? 'vx-badge--active' : 'vx-badge--inactive'}`}>
                            {p.isActive ? 'Activa' : 'Inactiva'}
                          </span>
                        </td>
                        <td>
                          <button
                            className="vx-btn vx-btn--icon"
                            style={{ width: 28, height: 28, fontSize: '0.7rem' }}
                            onClick={() => openEditModal('promotion', p)}
                            title="Editar"
                          >
                            <i className="fa-solid fa-pen" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Últimos cupones */}
            {recentCoupons.length > 0 && (
              <div className="vx-table-wrap">
                <div className="vx-table-toolbar" style={{ padding: '12px 18px' }}>
                  <span className="db-promo-col-title">
                    <i className="fa-solid fa-ticket" style={{ color: 'var(--vx-purple)' }} />
                    Últimos cupones
                  </span>
                  <button
                    className="vx-btn vx-btn--icon"
                    style={{ width: 28, height: 28, fontSize: '0.72rem' }}
                    onClick={() => navigate(`${adminBase}/promociones`)}
                    title="Ver todos"
                  >
                    <i className="fa-solid fa-arrow-right" />
                  </button>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Descuento</th>
                      <th>Estado</th>
                      <th style={{ width: 36 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentCoupons.map((c) => (
                      <tr key={c.couponId}>
                        <td>
                          <code style={{
                            background: 'var(--vx-purple-dim)', color: 'var(--vx-purple)',
                            padding: '2px 8px', borderRadius: 5, fontSize: '0.78rem',
                            fontWeight: 800, letterSpacing: '0.8px',
                            border: '1px solid rgba(168,85,247,0.2)',
                          }}>
                            {c.code}
                          </code>
                        </td>
                        <td style={{ fontFamily: 'var(--vx-font-display)', fontWeight: 800 }}>
                          {c.discountType === 'PERCENTAGE'
                            ? `${c.discount}%`
                            : `$${Number(c.discount).toLocaleString('es-CO')}`}
                        </td>
                        <td>
                          <span className={`vx-badge ${c.isActive ? 'vx-badge--active' : 'vx-badge--inactive'}`}>
                            {c.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td>
                          <button
                            className="vx-btn vx-btn--icon"
                            style={{ width: 28, height: 28, fontSize: '0.7rem' }}
                            onClick={() => openEditModal('coupon', c)}
                            title="Editar"
                          >
                            <i className="fa-solid fa-pen" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Estado vacío ── */}
        {!promoLoading && !hasPromoData && (
          <div className="vx-table-empty"
            style={{
              borderRadius: 'var(--vx-radius-lg)',
              border: '1px dashed var(--vx-border)',
              background: 'var(--vx-card)',
              padding: '48px 20px',
            }}
          >
            <i className="fa-solid fa-tags" />
            <p>Aún no tienes promociones ni cupones</p>
            <span style={{ fontSize: '0.78rem', color: 'var(--vx-muted)', display: 'block', marginTop: 6 }}>
              Usa los botones de arriba para crear tu primera promoción o cupón
            </span>
          </div>
        )}
      </div>

      {/* ── Estado de inventario ─────────────────────────────────────────── */}
      {!loading && products.length > 0 && (
        <div className="db-section">
          <div className="db-section-header">
            <Package size={15} className="db-section-icon" />
            <h2 className="db-section-title">Estado del inventario</h2>
            <button className="db-section-link" onClick={() => navigate(`${adminBase}/productos`)}>
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

      {/* ── Estado vacío (sin productos) ─────────────────────────────────── */}
      {!loading && products.length === 0 && (
        <div className="db-empty">
          <Package size={38} className="db-empty-icon" />
          <p className="db-empty-title">Sin productos aún</p>
          <p className="db-empty-sub">Comienza subiendo tu primer producto al catálogo.</p>
          <button className="db-empty-cta" onClick={() => navigate(`${adminBase}/subir-producto`)}>
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

      {/* ── Modal crear / editar ──────────────────────────────────────────── */}
      <PromotionModal
        open={promoModal.open}
        type={promoModal.type}
        mode={promoModal.mode}
        initial={promoModal.initial}
        onSubmit={handleSubmit}
        onClose={closePromoModal}
      />

      <ToastStack toasts={promoToasts} />
    </div>
  );
};

export default Dashboard;
