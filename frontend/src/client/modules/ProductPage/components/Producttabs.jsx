/**
 * ProductTabs
 * Encabezados de navegación por tabs del producto.
 * El contenido de cada panel se renderiza en el componente padre.
 *
 * Props:
 *  - tabs        {Array}    Lista de tabs: [{ id, label }]
 *  - activeTab   {string}   ID del tab activo
 *  - onTabChange {Function} Callback al cambiar de tab
 *  - reviewCount {number}   Total de reseñas (para mostrar en el label)
 *  - qaCount     {number}   Total de preguntas
 */
export default function ProductTabs({
  tabs,
  activeTab,
  onTabChange,
  reviewCount,
  qaCount,
}) {
  const resolveLabel = (tab) => {
    if (tab.id === "reviews")
      return `Reseñas (${reviewCount?.toLocaleString() ?? 0})`;
    if (tab.id === "qa") return `Preguntas (${qaCount ?? 0})`;
    return tab.label;
  };

  return (
    <div className="vx-tabs" role="tablist" aria-label="Secciones del producto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          id={`tab-${tab.id}`}
          aria-controls={`panel-${tab.id}`}
          aria-selected={activeTab === tab.id}
          className={`vx-tab ${activeTab === tab.id ? "is-active" : ""}`}
          onClick={() => onTabChange(tab.id)}
        >
          {resolveLabel(tab)}
        </button>
      ))}
    </div>
  );
}
