/**
 * StatsGrid
 * Tarjetas KPI del dashboard de promociones.
 *
 * Props:
 *  - kpis {object} { totalPromotions, activePromotions, totalCoupons, activeCoupons }
 */
export default function StatsGrid({ kpis }) {
  const cards = [
    {
      id: "total-promos",
      label: "Promociones totales",
      value: kpis.totalPromotions,
      sub: (
        <>
          <span>{kpis.activePromotions} activas</span> en este momento
        </>
      ),
      icon: "fa-solid fa-tags",
      variant: "cyan",
    },
    {
      id: "active-promos",
      label: "Promociones activas",
      value: kpis.activePromotions,
      sub: <>Disponibles para los clientes</>,
      icon: "fa-solid fa-fire-flame-curved",
      variant: "green",
    },
    {
      id: "total-coupons",
      label: "Cupones totales",
      value: kpis.totalCoupons,
      sub: (
        <>
          <span>{kpis.activeCoupons} activos</span> disponibles
        </>
      ),
      icon: "fa-solid fa-ticket",
      variant: "amber",
    },
    {
      id: "active-coupons",
      label: "Cupones activos",
      value: kpis.activeCoupons,
      sub: <>Canjeables por clientes</>,
      icon: "fa-solid fa-percent",
      variant: "purple",
    },
  ];

  return (
    <div className="vx-stats-grid">
      {cards.map((card) => (
        <div
          key={card.id}
          className={`vx-stat-card vx-stat-card--${card.variant}`}
        >
          <div className="vx-stat-card__header">
            <span className="vx-stat-card__label">{card.label}</span>
            <div className="vx-stat-card__icon">
              <i className={card.icon} aria-hidden="true" />
            </div>
          </div>
          <div className="vx-stat-card__value">{card.value}</div>
          <p className="vx-stat-card__sub">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}
