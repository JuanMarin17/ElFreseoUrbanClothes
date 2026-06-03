import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  TrendingDown, 
  RefreshCw, 
  ShoppingCart, 
  Search, 
  SlidersHorizontal,
  CheckCircle,
  PackageX
} from 'lucide-react';
import './StockAlerts.css';

const INITIAL_ALERTS = [
  {
    id: "SKU-9921-X1",
    name: "Zapatillas Pro X1 - Negras (42)",
    category: "Calzado",
    currentStock: 2,
    minRequired: 15,
    unitPrice: 120.00,
    severity: "Critico", // Crítico: Stock menor o igual a 3
    supplier: "Nike Distribuciones Latam"
  },
  {
    id: "SKU-3012-UB",
    name: "Mochila Urban 30L - Gris",
    category: "Accesorios",
    currentStock: 1,
    minRequired: 10,
    unitPrice: 89.00,
    severity: "Critico",
    supplier: "Urban Gear Co."
  },
  {
    id: "SKU-5500-BT",
    name: "Audífonos BT-500 Pro",
    category: "Electrónica",
    currentStock: 5,
    minRequired: 20,
    unitPrice: 80.00,
    severity: "Advertencia", // Advertencia: Cerca del límite mínimo
    supplier: "SoundTech Import"
  },
  {
    id: "SKU-8823-SV",
    name: "Reloj Smart V3 - Active Black",
    category: "Electrónica",
    currentStock: 4,
    minRequired: 12,
    unitPrice: 85.00,
    severity: "Advertencia",
    supplier: "SoundTech Import"
  },
  {
    id: "SKU-1122-CN",
    name: "Camiseta Entrenamiento Neon (M)",
    category: "Ropa",
    currentStock: 0,
    minRequired: 30,
    unitPrice: 34.99,
    severity: "Agotado", // Agotado: 0 unidades
    supplier: "Textiles del Norte"
  }
];

export default function StockAlerts() {
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Todos");

  // Lógica de filtrado dinámico
  const filteredAlerts = alerts.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab = activeTab === "Todos" || item.severity === activeTab;

    return matchesSearch && matchesTab;
  });

  // Simulación de acción: Reabastecer stock rápidamente
  const handleRestock = (id, name) => {
    alert(`Solicitud de orden de compra enviada al proveedor para: ${name} (${id})`);
  };

  // Calcular impacto financiero estimado (Monto que se está dejando de vender)
  const lossImpact = alerts.reduce((acc, item) => acc + ((item.minRequired - item.currentStock) * item.unitPrice), 0);

  return (
    <div className="stock-alerts-container">
      
      {/* ── ENCABEZADO DE LA PÁGINA ── */}
      <div className="alerts-page-header">
        <div>
          <h1 className="alerts-title">Alertas de Stock e Inventario</h1>
          <p className="alerts-subtitle">Auditoría automática de SKUs en niveles críticos. Evita quiebres de stock en tus canales de venta.</p>
        </div>
      </div>

      {/* ── TARJETAS DE MÉTRICAS OPERATIVAS ── */}
      <div className="alerts-stats-grid">
        <div className="stock-kpi-card danger">
          <div className="kpi-icon-box">
            <ShieldAlert size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-tag">Riesgo Crítico</span>
            <h3 className="kpi-num">{alerts.filter(a => a.severity === "Critico" || a.severity === "Agotado").length} SKUs</h3>
            <span className="kpi-subtext text-danger">Requieren acción inmediata</span>
          </div>
        </div>

        <div className="stock-kpi-card warning">
          <div className="kpi-icon-box">
            <AlertTriangle size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-tag">Advertencias en Espera</span>
            <h3 className="kpi-num">{alerts.filter(a => a.severity === "Advertencia").length} SKUs</h3>
            <span className="kpi-subtext text-warning">Próximos a agotarse</span>
          </div>
        </div>

        <div className="stock-kpi-card money">
          <div className="kpi-icon-box">
            <TrendingDown size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-tag">Costo de Ruptura Est.</span>
            <h3 className="kpi-num">${lossImpact.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
            <span className="kpi-subtext text-muted">Capital faltante para stock ideal</span>
          </div>
        </div>
      </div>

      {/* ── CONTROL DE FILTROS Y NAVEGACIÓN INTERNA ── */}
      <div className="alerts-filters-row">
        {/* Pestañas de estado (Tabs) */}
        <div className="alerts-tabs">
          {["Todos", "Critico", "Advertencia", "Agotado"].map((tab) => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "Critico" ? "Críticos" : tab === "Advertencia" ? "Advertencias" : tab}
            </button>
          ))}
        </div>

        {/* Buscador */}
        <div className="alerts-search-wrapper">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por SKU, producto o proveedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="alerts-search-input"
          />
        </div>
      </div>

      {/* ── TABLA DE CONTROL DE INVENTARIO CRÍTICO ── */}
      <div className="alerts-table-wrapper">
        <table className="alerts-table">
          <thead>
            <tr>
              <th>SKU / ID</th>
              <th>Nombre del Producto</th>
              <th>Categoría</th>
              <th className="text-center">Stock Actual</th>
              <th className="text-center">Mín. Requerido</th>
              <th>Proveedor Principal</th>
              <th>Estado de Alerta</th>
              <th className="text-right">Acción Operativa</th>
            </tr>
          </thead>
          <tbody>
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map((item) => (
                <tr key={item.id} className={`alert-row-status-${item.severity.toLowerCase()}`}>
                  <td className="font-mono text-cyan">{item.id}</td>
                  <td>
                    <div className="product-meta-cell">
                      <span className="product-title-name">{item.name}</span>
                      <span className="product-price-label">Precio Unitario: ${item.unitPrice.toFixed(2)}</span>
                    </div>
                  </td>
                  <td className="text-dim">{item.category}</td>
                  <td className="text-center font-bold">
                    <span className={`stock-count-badge ${item.currentStock === 0 ? "zero" : "low"}`}>
                      {item.currentStock} uds.
                    </span>
                  </td>
                  <td className="text-center text-dim">{item.minRequired} uds.</td>
                  <td className="text-dim font-sm">{item.supplier}</td>
                  <td>
                    <span className={`severity-badge badge-${item.severity.toLowerCase()}`}>
                      {item.severity}
                    </span>
                  </td>
                  <td>
                    <div className="alerts-actions-cell">
                      <button 
                        className="action-btn restock-btn" 
                        title="Generar Orden de Compra"
                        onClick={() => handleRestock(item.id, item.name)}
                      >
                        <ShoppingCart size={13} />
                        <span>Pedir</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="alerts-empty-state">
                  <PackageX size={32} className="empty-box-icon" />
                  <h4>Todo en orden por aquí</h4>
                  <p>Ningún producto coincide con el filtro de stock seleccionado.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}