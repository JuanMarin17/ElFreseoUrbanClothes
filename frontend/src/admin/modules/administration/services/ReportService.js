// ============================================================
//  reportService.js
//  Integración con el módulo de reportes del backend
//  Base URL: http://46.225.21.146:8080/api/v1
// ============================================================

const BASE = "http://46.225.21.146:8080/api/v1";

/**
 * Construye los headers requeridos por todos los endpoints.
 * Requiere que "jwt" y "storeId" estén guardados en localStorage.
 */
const buildHeaders = () => {
  const jwt = localStorage.getItem("jwt");
  const storeId = localStorage.getItem("storeId");

  if (!storeId) {
    console.error("[reportService] X-Store-Id no encontrado en localStorage");
  }
  if (!jwt) {
    console.warn("[reportService] JWT no encontrado en localStorage");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${jwt}`,
    "X-Store-Id": storeId,
  };
};

/**
 * Wrapper genérico de fetch con manejo de errores.
 * @param {string} path       - Ruta relativa (ej. "/reports/dashboard")
 * @param {object} [options]  - Opciones adicionales para fetch
 */
async function apiFetch(path, options = {}) {
  const url = `${BASE}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...buildHeaders(),
      ...(options.headers || {}),
    },
  });

  if (response.status === 400) {
    throw new Error("STORE_ID_MISSING"); // X-Store-Id es requerido
  }
  if (response.status === 401) {
    throw new Error("UNAUTHORIZED"); // JWT inválido o expirado
  }
  if (response.status === 500) {
    throw new Error("SERVER_ERROR"); // Servicio dependiente caído
  }
  if (!response.ok) {
    throw new Error(`HTTP_ERROR_${response.status}`);
  }

  return response.json();
}

// ──────────────────────────────────────────────────────────────
//  ENDPOINTS
// ──────────────────────────────────────────────────────────────

/**
 * GET /reports/dashboard
 * Resumen general: productos, órdenes, ingresos y top productos.
 *
 * @returns {Promise<{
 *   totalProducts: number,
 *   activeProducts: number,
 *   inactiveProducts: number,
 *   totalVariants: number,
 *   lowStockVariants: number,
 *   outOfStockVariants: number,
 *   stockValue: number,
 *   totalOrders: number,
 *   pendingOrders: number,
 *   confirmedOrders: number,
 *   processingOrders: number,
 *   shippedOrders: number,
 *   deliveredOrders: number,
 *   cancelledOrders: number,
 *   refundedOrders: number,
 *   totalRevenue: number,
 *   todayRevenue: number,
 *   weekRevenue: number,
 *   monthRevenue: number,
 *   topProducts: Array<{productId: string|null, productName: string, unitsSold: number, revenue: number}>
 * }>}
 */
export const getDashboard = () => apiFetch("/reports/dashboard");

/**
 * GET /reports/stock
 * Estado detallado del inventario por variante y categoría.
 *
 * @returns {Promise<{
 *   summary: {
 *     totalProducts: number,
 *     activeProducts: number,
 *     inactiveProducts: number,
 *     totalVariants: number,
 *     lowStockVariants: number,
 *     outOfStockVariants: number,
 *     healthyStockVariants: number,
 *     totalStockValue: number
 *   },
 *   lowStockItems: Array<{productId: string, productName: string, sku: string, currentStock: number, minStock: number, price: number}>,
 *   outOfStockItems: Array<{productId: string, productName: string, sku: string, currentStock: number, minStock: number, price: number}>,
 *   byCategory: Array<{categoryName: string, productCount: number, totalStock: number, lowStockCount: number, outOfStockCount: number}>
 * }>}
 */
export const getStockReport = () => apiFetch("/reports/stock");

/**
 * GET /reports/orders
 * Estadísticas de órdenes por período.
 *
 * @param {0|7|30|90} [days=30]
 *   0  → todo el histórico
 *   7  → última semana
 *   30 → último mes (default)
 *   90 → últimos 3 meses
 *
 * @returns {Promise<{
 *   summary: {
 *     total: number, pending: number, confirmed: number,
 *     processing: number, shipped: number, delivered: number,
 *     cancelled: number, refunded: number,
 *     totalRevenue: number, averageOrderValue: number
 *   },
 *   dailyBreakdown: Array<{date: string, orderCount: number, revenue: number}>,
 *   topProducts: Array<{productName: string, unitsSold: number, revenue: number}>
 * }>}
 */
export const getOrdersReport = (days = 30) =>
  apiFetch(`/reports/orders?days=${days}`);

/**
 * GET /reports/sales
 * Ingresos y ventas (solo órdenes con pago APPROVED).
 *
 * @param {0|7|30|90} [days=30] - Igual que en getOrdersReport
 *
 * @returns {Promise<{
 *   summary: {
 *     totalRevenue: number, todayRevenue: number,
 *     weekRevenue: number, monthRevenue: number,
 *     totalOrdersPaid: number, averageTicket: number
 *   },
 *   dailyBreakdown: Array<{date: string, revenue: number, orderCount: number}>,
 *   byPaymentMethod: Array<{method: string, count: number, total: number, percentage: number}>,
 *   topProductsByRevenue: Array<{productName: string, unitsSold: number, revenue: number}>
 * }>}
 */
export const getSalesReport = (days = 30) =>
  apiFetch(`/reports/sales?days=${days}`);

// ──────────────────────────────────────────────────────────────
//  UTILIDADES
// ──────────────────────────────────────────────────────────────

/**
 * Maneja errores de la API de forma centralizada.
 * Llama a la función correspondiente o redirige si es necesario.
 *
 * @param {Error} error
 * @param {{ onUnauthorized?: () => void, onStoreIdMissing?: () => void }} [handlers]
 */
export function handleApiError(error, handlers = {}) {
  switch (error.message) {
    case "UNAUTHORIZED":
      console.error("[reportService] JWT inválido o expirado. Redirigiendo...");
      handlers.onUnauthorized?.();
      break;
    case "STORE_ID_MISSING":
      console.error(
        "[reportService] X-Store-Id es requerido pero no está configurado.",
      );
      handlers.onStoreIdMissing?.();
      break;
    case "SERVER_ERROR":
      console.error(
        "[reportService] Error 500: servicio dependiente caído (Product u OrderPayment).",
      );
      break;
    default:
      console.error("[reportService] Error inesperado:", error.message);
  }
}

/**
 * Formatea un número como moneda colombiana (COP).
 * Ejemplo: 95000000 → "$95.000.000"
 */
export const formatCOP = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

/**
 * Convierte el parámetro de período del selector de UI
 * al valor `days` que acepta el backend.
 *
 * "7D" → 7, "30D" → 30, "90D" → 90, "ALL" → 0
 */
export const periodToDays = (period) => {
  const map = { "7D": 7, "30D": 30, "90D": 90, ALL: 0 };
  return map[period] ?? 30;
};
