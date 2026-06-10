/**
 * InventaryStock.jsx
 * ─────────────────────────────────────────────────────────────
 * Gestiona el stock por talla. Recibe las tallas seleccionadas
 * del padre y emite cambios mediante onStockChange.
 *
 * Props:
 *   tallas       string[]                  → tallas activas del producto
 *   stock        Record<string, number>    → { S: 10, M: 5, ... }
 *   onStockChange (talla, cantidad) => void
 * ─────────────────────────────────────────────────────────────
 */
import React, { useCallback } from "react";
import "./InventaryStock.css";

// ── Constantes ────────────────────────────────────────────────
const MIN_STOCK = 0;
const MAX_STOCK = 9999;

// ── Helpers ───────────────────────────────────────────────────
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

const calcularTotalStock = (stock, tallas) =>
  (tallas ?? []).reduce((acc, t) => acc + (stock[t] ?? 0), 0);

const getEstadoBadge = (cantidad) => {
  if (cantidad === 0) return { label: "Sin stock", clase: "badge--danger" };
  if (cantidad <= 5) return { label: "Bajo stock", clase: "badge--warning" };
  return { label: "Disponible", clase: "badge--success" };
};

// ── Sub-componente FilaTalla ──────────────────────────────────
const FilaTalla = ({ talla, cantidad, onChange }) => {
  const { label, clase } = getEstadoBadge(cantidad);

  const handleInput = (e) => {
    const parsed = parseInt(e.target.value, 10);
    onChange(talla, isNaN(parsed) ? 0 : clamp(parsed, MIN_STOCK, MAX_STOCK));
  };

  const incrementar = () =>
    onChange(talla, clamp(cantidad + 1, MIN_STOCK, MAX_STOCK));
  const decrementar = () =>
    onChange(talla, clamp(cantidad - 1, MIN_STOCK, MAX_STOCK));

  return (
    <div className="fila-talla" role="row">
      {/* Talla */}
      <span className="fila-talla__nombre" role="cell">
        {talla}
      </span>

      {/* Stepper */}
      <div className="fila-talla__stepper" role="cell">
        <button
          type="button"
          className="stepper__btn"
          onClick={decrementar}
          disabled={cantidad <= MIN_STOCK}
          aria-label={`Disminuir stock de ${talla}`}
        >
          −
        </button>

        <input
          type="number"
          className="stepper__input"
          value={cantidad}
          min={MIN_STOCK}
          max={MAX_STOCK}
          onChange={handleInput}
          aria-label={`Stock talla ${talla}`}
        />

        <button
          type="button"
          className="stepper__btn"
          onClick={incrementar}
          disabled={cantidad >= MAX_STOCK}
          aria-label={`Aumentar stock de ${talla}`}
        >
          +
        </button>
      </div>

      {/* Badge estado */}
      <span
        className={`badge ${clase}`}
        role="cell"
        aria-label={`Estado: ${label}`}
      >
        {label}
      </span>
    </div>
  );
};

// ── Componente principal ──────────────────────────────────────
const InventaryStock = ({ tallas, stock, onStockChange }) => {
  const handleChange = useCallback(
    (talla, cantidad) => onStockChange(talla, cantidad),
    [onStockChange],
  );

  const totalStock = calcularTotalStock(stock, tallas);

  if (!tallas || tallas.length === 0) {
    return (
      <div className="inventario-vacio">
        <span className="inventario-vacio__icon">📦</span>
        <p>Selecciona al menos una talla para gestionar el stock.</p>
      </div>
    );
  }

  return (
    <div className="inventario-stock">
      {/* Encabezado tabla */}
      <div className="inventario-stock__header" role="row">
        <span role="columnheader">Talla</span>
        <span role="columnheader">Cantidad</span>
        <span role="columnheader">Estado</span>
      </div>

      {/* Filas por talla */}
      <div className="inventario-stock__body" role="rowgroup">
        {tallas.map((talla) => (
          <FilaTalla
            key={talla}
            talla={talla}
            cantidad={stock[talla] ?? 0}
            onChange={handleChange}
          />
        ))}
      </div>

      {/* Resumen total */}
      <div className="inventario-stock__footer">
        <span className="footer__label">TOTAL EN INVENTARIO</span>
        <span className="footer__total">{totalStock} uds.</span>
      </div>
    </div>
  );
};

export default InventaryStock;
