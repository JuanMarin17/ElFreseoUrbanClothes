import "./style/PromotionsDashboards.css";
import { useDashboard } from "./service/useDashboard";
import StatsGrid from "./StatsGrid";
import PromotionsTable from "./PromotionStable";
import CouponsTable from "./CouponsTable";
import PromotionModal from "./PromotionModa";
import ToastStack from "./ToastStack";

export default function PromotionsDashboards() {
  const {
    filteredPromotions,
    filteredCoupons,
    kpis,
    loading,
    error,
    toasts,
    modal,
    openCreateModal,
    openEditModal,
    closeModal,
    handleCreate,
    handleEdit,
    handleDeactivatePromotion,
    handleDeactivateCoupon,
    activeTab,
    setActiveTab,
    searchPromo,
    setSearchPromo,
    searchCoupon,
    setSearchCoupon,
  } = useDashboard();

  const handleSubmit = modal.mode === "create" ? handleCreate : handleEdit;

  return (
    <div className="vx-promo-page vx-noise">

      {/* Page header */}
      <div className="vx-page-header">
        <div className="vx-page-header__text">
          <h1>Promociones y <span>Cupones</span></h1>
          <p>Gestiona descuentos, vigencias y condiciones de aplicación</p>
        </div>
        <div className="vx-page-header__actions">
          <button className="vx-btn vx-btn--ghost" onClick={() => openCreateModal("coupon")}>
            <i className="fa-solid fa-ticket" aria-hidden="true" /> Nuevo cupón
          </button>
          <button className="vx-btn vx-btn--primary" onClick={() => openCreateModal("promotion")}>
            <i className="fa-solid fa-plus" aria-hidden="true" /> Nueva promoción
          </button>
        </div>
      </div>

      {/* KPIs */}
      {loading ? (
        <div className="vx-stats-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="vx-skeleton" style={{ height: 120, borderRadius: "var(--vx-radius-lg)" }} />
          ))}
        </div>
      ) : (
        <StatsGrid kpis={kpis} />
      )}

      {/* Error global */}
      {error && (
        <div className="vx-toast vx-toast--error" role="alert" style={{ maxWidth: 500 }}>
          <i className="fa-solid fa-circle-exclamation" aria-hidden="true" />
          {error}
        </div>
      )}

      {/* Tabs de sección */}
      <div className="vx-section-tabs" role="tablist" aria-label="Secciones">
        <button
          role="tab"
          className={`vx-section-tab ${activeTab === "promotions" ? "is-active" : ""}`}
          onClick={() => setActiveTab("promotions")}
          aria-selected={activeTab === "promotions"}
        >
          <i className="fa-solid fa-tags" aria-hidden="true" />
          Promociones
          <span className="vx-section-tab__count">{kpis.totalPromotions}</span>
        </button>
        <button
          role="tab"
          className={`vx-section-tab ${activeTab === "coupons" ? "is-active" : ""}`}
          onClick={() => setActiveTab("coupons")}
          aria-selected={activeTab === "coupons"}
        >
          <i className="fa-solid fa-ticket" aria-hidden="true" />
          Cupones
          <span className="vx-section-tab__count">{kpis.totalCoupons}</span>
        </button>
      </div>

      {/* Tabla de promociones */}
      {activeTab === "promotions" && (
        <div role="tabpanel" aria-label="Promociones">
          {loading ? (
            <div className="vx-skeleton" style={{ height: 300, borderRadius: "var(--vx-radius-lg)" }} />
          ) : (
            <PromotionsTable
              promotions={filteredPromotions}
              search={searchPromo}
              onSearch={setSearchPromo}
              onEdit={(promo) => openEditModal("promotion", promo)}
              onDeactivate={handleDeactivatePromotion}
              onNew={() => openCreateModal("promotion")}
            />
          )}
        </div>
      )}

      {/* Tabla de cupones */}
      {activeTab === "coupons" && (
        <div role="tabpanel" aria-label="Cupones">
          {loading ? (
            <div className="vx-skeleton" style={{ height: 300, borderRadius: "var(--vx-radius-lg)" }} />
          ) : (
            <CouponsTable
              coupons={filteredCoupons}
              search={searchCoupon}
              onSearch={setSearchCoupon}
              onEdit={(coupon) => openEditModal("coupon", coupon)}
              onDeactivate={handleDeactivateCoupon}
              onNew={() => openCreateModal("coupon")}
            />
          )}
        </div>
      )}

      {/* Modal crear / editar */}
      <PromotionModal
        open={modal.open}
        type={modal.type}
        mode={modal.mode}
        initial={modal.initial}
        onSubmit={handleSubmit}
        onClose={closeModal}
      />

      {/* Toasts */}
      <ToastStack toasts={toasts} />
    </div>
  );
}
