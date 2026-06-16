// @refresh reset
/**
 * StoreContext.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Persiste todo el flujo de creación de tienda en localStorage.
 * Añade el campo `storeId` para guardar el UUID devuelto por el backend
 * al crear la tienda con POST /api/stores.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useCallback } from "react";
import { StoreContext } from "../context/storeContextDef";

const STORAGE_KEY = "mt_store_flow";

const DEFAULT_STATE = {
  storeId: null, // ← UUID devuelto por el backend (POST /api/stores)
  completedStep: 0,
  plan: null, // paso 1  – { id, name, price, features }
  basic: null, // paso 2a – { name, description, logoPreview }
  legal: null, // paso 2b – { legalName, idNumber, documentName }
  payment: null, // paso 2c – { paymentMethod, shipping }
  store: null, // paso 2d – { name, subdomain, accepted, storeId }
  layout: null, // paso 3  – { id, title, description }
  styles: null, // paso 4  – { colorBoton, cardBg, fontTitle, ... }
  components: null, // paso 5  – { header, banner, footer }
  widgets: null, // paso 6  – { sidebar, searchbar }
  cms: null, // paso 8 — contenido de páginas
};

/* ── Helpers localStorage ─────────────────────────── */
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_STATE, ...JSON.parse(raw) } : DEFAULT_STATE;
  } catch {
    return DEFAULT_STATE;
  }
}

function persist(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Error guardando en localStorage:", e);
  }
}

/**
 * Resuelve el nombre del campo en el estado a partir de un número o string.
 */
const NUMERIC_MAP = {
  1: "plan",
  2: "store",
  3: "layout",
  4: "styles",
  5: "components",
  6: "widgets",
  8: "cms",
  9: "store",
  10: "resultado",
};

function resolveField(key) {
  if (typeof key === "number") return NUMERIC_MAP[key] ?? null;
  return key;
}

const STEP_ORDER = [
  "plan", // 0 → /plan
  "basic", // 1 → /crear-tienda/basico
  "legal", // 2 → /crear-tienda/legal
  "payment", // 3 → /crear-tienda/pagos
  "layout", // 4 → /layout
  "styles", // 5 → /customer
  "components", // 6 → /component
  "widgets", // 7 → /widgets
  "cms", // 8 → /cms
  "store", // 9 → /crear-tienda (términos + crear)
  "resultado",
];

function stepIndex(key) {
  const field = resolveField(key);
  const idx = STEP_ORDER.indexOf(field);
  return idx >= 0 ? idx : -1;
}

/* ── Context ──────────────────────────────────────── */
export const StoreProvider = ({ children }) => {
  const [state, setState] = useState(load);

  /**
   * Guarda los datos de un paso y lo marca como completado.
   * Si data contiene `storeId`, también lo persiste en el estado raíz
   * para que esté disponible en cualquier parte de la app.
   */
  const completeStep = useCallback((key, data = {}) => {
    const field = resolveField(key);
    if (!field) return;
    const idx = stepIndex(key);
    setState((prev) => {
      const next = {
        ...prev,
        [field]: data,
        completedStep: Math.max(
          prev.completedStep,
          idx >= 0 ? idx + 1 : typeof key === "number" ? key : 0,
        ),
        // Si el paso incluye storeId (viene del backend), lo guardamos en la raíz
        ...(data.storeId ? { storeId: data.storeId } : {}),
      };
      persist(next);
      return next;
    });
  }, []);

  /**
   * Guarda progreso parcial SIN avanzar el paso y SIN persistir en localStorage.
   * Úsalo al retroceder para no perder lo escrito, pero que se limpie al salir.
   */
  const saveDraft = useCallback((key, data = {}) => {
    const field = resolveField(key);
    if (!field) return;
    // Solo actualiza el estado en memoria, NO llama a persist()
    setState((prev) => ({ ...prev, [field]: data }));
  }, []);

  /**
   * Guarda progreso parcial SIN avanzar el paso.
   */
  const saveProgress = useCallback((key, data = {}) => {
    const field = resolveField(key);
    if (!field) return;
    setState((prev) => {
      const next = { ...prev, [field]: data };
      persist(next);
      return next;
    });
  }, []);

  /** Limpia todo el flujo */
  const resetAll = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(DEFAULT_STATE);
  }, []);

  /** Reinicia un paso específico y todos los siguientes */
  const resetStep = useCallback((key) => {
    const idx = stepIndex(key);
    setState((prev) => {
      const next = { ...prev, completedStep: Math.max(0, idx - 1) };
      STEP_ORDER.slice(idx).forEach((f) => {
        next[f] = null;
      });
      persist(next);
      return next;
    });
  }, []);

  /** Compatibilidad con el update() original */
  const update = useCallback((field, value) => {
    setState((prev) => {
      const next = { ...prev, [field]: value };
      persist(next);
      return next;
    });
  }, []);

  return (
    <StoreContext.Provider
      value={{
        state,
        store: state,
        update,
        completeStep,
        saveProgress,
        saveDraft,
        resetAll,
        resetStep,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};
