import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./UploadProduct.css";
import { getCategories, createCategory, activateCategory, updateCategory } from "../../services/CategoryService";
import { createProduct } from "../../services/productService";
import { getBrands, createBrand } from "../../services/BrandService";
import { getSuppliersByStore } from "../../services/SupplierService";
import { uploadFile } from "../../../../../utils/uploadService";

const DEFAULT_TALLAS = ["XS", "S", "M", "L", "XL", "XXL"];
const DEFAULT_COLORES = [
  { name: "Negro",    hex: "#111111" },
  { name: "Blanco",   hex: "#F0F0F0" },
  { name: "Gris",     hex: "#6B7280" },
  { name: "Rojo",     hex: "#DC2626" },
  { name: "Azul",     hex: "#1D4ED8" },
  { name: "Verde",    hex: "#16A34A" },
  { name: "Amarillo", hex: "#CA8A04" },
  { name: "Naranja",  hex: "#EA580C" },
  { name: "Morado",   hex: "#7C3AED" },
  { name: "Rosa",     hex: "#EC4899" },
];
const MAX_IMAGENES = 6;

let _varId = 0;

// ─── SKU auto-generado ────────────────────────────────────────────────────────
function generateSku(productName, color, size) {
  const namePart = (productName || "PRD")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, "")
    .trim()
    .split(/\s+/)
    .map(w => w.slice(0, 3))
    .slice(0, 2)
    .join("");
  const colorPart = color
    ? color.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().slice(0, 3)
    : "";
  const sizePart = size ?? "";
  return [namePart, colorPart, sizePart].filter(Boolean).join("-");
}

// ─── Combinaciones de variantes ───────────────────────────────────────────────
function getCombos(tallas, colores) {
  if (!tallas.length && !colores.length) return [{ talla: "", color: "" }];
  if (!tallas.length) return colores.map(c => ({ talla: "", color: c }));
  if (!colores.length) return tallas.map(t => ({ talla: t, color: "" }));
  return colores.flatMap(c => tallas.map(t => ({ talla: t, color: c })));
}

function syncVariantes(prev, tallas, colores, productName) {
  const combos = getCombos(tallas, colores);
  const map = new Map(prev.map(v => [`${v.color}|${v.talla}`, v]));
  return combos.map(({ talla, color }) => {
    const existing = map.get(`${color}|${talla}`);
    if (existing) return existing;
    return {
      _id: ++_varId,
      sku: generateSku(productName, color, talla),
      precio: "",
      stock: "",
      stockMin: "",
      talla,
      color,
    };
  });
}

const estadoInicial = () => ({
  name: "",
  description: "",
  categoryIds: [],
  brandId: "",
  supplierId: "",
  imagenes: [],
  selectedTallas: [],
  selectedColores: [],
  variantes: [{ _id: ++_varId, sku: "", precio: "", stock: "", stockMin: "", talla: "", color: "" }],
});

// ─── BrandSelector ────────────────────────────────────────────────────────────
const BrandSelector = ({ brands = [], value, onChange, onBrandCreated, disabled }) => {
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createErr, setCreateErr] = useState(null);

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    setCreating(true); setCreateErr(null);
    try {
      const created = await createBrand(name);
      onBrandCreated(created);
      onChange({ target: { name: "brandId", value: created.brandId } });
      setNewName(""); setShowNew(false);
    } catch (e) {
      setCreateErr(e.message ?? "Error al crear marca.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="up-field">
      <label className="up-label">Marca <span className="up-opt">(opcional)</span></label>
      <div className="up-select-wrap">
        <select name="brandId" value={value} onChange={onChange} disabled={disabled} className="up-select">
          <option value="">Seleccionar marca</option>
          {brands.map((b) => <option key={b.brandId} value={b.brandId}>{b.name}</option>)}
        </select>
        <span className="up-select-arrow">▾</span>
      </div>
      <button type="button" className="up-link-btn" onClick={() => { setShowNew(p => !p); setCreateErr(null); }} disabled={disabled}>
        {showNew ? "✕ Cancelar" : "+ Nueva marca"}
      </button>
      {showNew && (
        <div className="up-inline-create">
          <input type="text" placeholder="Nombre de la marca…" value={newName}
            onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleCreate()}
            disabled={creating} className="up-input" autoFocus />
          <button type="button" className="up-btn-accent" onClick={handleCreate} disabled={creating || !newName.trim()}>
            {creating ? "…" : "Guardar"}
          </button>
          {createErr && <span className="up-field-error">{createErr}</span>}
        </div>
      )}
    </div>
  );
};

// ─── Editor de atributos de variante por categoría ───────────────────────────
// Permite que cada categoría reemplace "Talla"/"Color" por los atributos que
// realmente apliquen (ej. Tecnología: Capacidad/Color, Hogar: Material/Tamaño).
// Si se deja vacío, el producto sigue usando Talla/Color por defecto.
const CategoryAttributesEditor = ({ category, onSaved, onClose }) => {
  const [attr1Label, setAttr1Label] = useState(category.attribute1Label ?? "");
  const [attr1Options, setAttr1Options] = useState(category.attribute1Options ?? []);
  const [attr2Label, setAttr2Label] = useState(category.attribute2Label ?? "");
  const [attr2Options, setAttr2Options] = useState(category.attribute2Options ?? []);
  const [attr2IsColor, setAttr2IsColor] = useState(!!category.attribute2IsColor);
  const [opt1Input, setOpt1Input] = useState("");
  const [opt2Input, setOpt2Input] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  const addOpt1 = () => {
    const v = opt1Input.trim();
    if (!v || attr1Options.includes(v)) { setOpt1Input(""); return; }
    setAttr1Options(prev => [...prev, v]); setOpt1Input("");
  };
  const addOpt2 = () => {
    const v = opt2Input.trim();
    if (!v || attr2Options.includes(v)) { setOpt2Input(""); return; }
    setAttr2Options(prev => [...prev, v]); setOpt2Input("");
  };

  const handleSave = async () => {
    setSaving(true); setErr(null);
    try {
      const updated = await updateCategory(category.categoryId, {
        name: category.name,
        attribute1Label: attr1Label.trim(),
        attribute1Options: attr1Options,
        attribute2Label: attr2Label.trim(),
        attribute2Options: attr2Options,
        attribute2IsColor: attr2Label.trim() ? attr2IsColor : false,
      });
      onSaved(updated);
    } catch (e) {
      setErr(e.message ?? "Error al guardar la configuración.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="up-cat-attrs-editor" onClick={e => e.stopPropagation()}>
      <p className="up-cat-attrs-title">Atributos de variante — {category.name}</p>
      <p className="up-cat-attrs-hint">
        Déjalo vacío para usar Talla/Color por defecto. Útil para categorías que no son ropa
        (ej. Tecnología: Capacidad, Hogar: Material).
      </p>

      <label className="up-cat-attrs-label">Primer atributo (ej. Talla, Capacidad)</label>
      <input type="text" className="up-input-sm" value={attr1Label} placeholder="Talla"
        onChange={e => setAttr1Label(e.target.value)} disabled={saving} />
      <div className="up-cat-attrs-opts">
        {attr1Options.map(o => (
          <span key={o} className="up-chip">
            {o}
            <button type="button" className="up-chip-remove" disabled={saving}
              onClick={() => setAttr1Options(prev => prev.filter(x => x !== o))}>×</button>
          </span>
        ))}
        <input type="text" className="up-input-sm" placeholder="+ opción" value={opt1Input}
          onChange={e => setOpt1Input(e.target.value)} disabled={saving}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addOpt1(); } }} />
        <button type="button" className="up-btn-accent-sm" onClick={addOpt1} disabled={saving || !opt1Input.trim()}>+</button>
      </div>

      <label className="up-cat-attrs-label">Segundo atributo <span className="up-opt">(opcional, ej. Color, Material)</span></label>
      <input type="text" className="up-input-sm" value={attr2Label} placeholder="Color"
        onChange={e => setAttr2Label(e.target.value)} disabled={saving} />
      <div className="up-cat-attrs-opts">
        {attr2Options.map(o => (
          <span key={o} className="up-chip">
            {o}
            <button type="button" className="up-chip-remove" disabled={saving}
              onClick={() => setAttr2Options(prev => prev.filter(x => x !== o))}>×</button>
          </span>
        ))}
        <input type="text" className="up-input-sm" placeholder="+ opción" value={opt2Input}
          onChange={e => setOpt2Input(e.target.value)} disabled={saving}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addOpt2(); } }} />
        <button type="button" className="up-btn-accent-sm" onClick={addOpt2} disabled={saving || !opt2Input.trim()}>+</button>
      </div>
      {attr2Label.trim() && (
        <label className="up-cat-attrs-checkbox">
          <input type="checkbox" checked={attr2IsColor} disabled={saving}
            onChange={e => setAttr2IsColor(e.target.checked)} />
          Es un selector de color (muestra el círculo de color)
        </label>
      )}

      {err && <span className="up-field-error">{err}</span>}
      <div className="up-cat-attrs-actions">
        <button type="button" className="up-link-btn" onClick={onClose} disabled={saving}>Cancelar</button>
        <button type="button" className="up-btn-accent-sm" onClick={handleSave} disabled={saving}>
          {saving ? "…" : "Guardar"}
        </button>
      </div>
    </div>
  );
};

// ─── CategoryChips ────────────────────────────────────────────────────────────
const CategoryChips = ({ categories, selectedIds, onToggle, onCategoryCreated, onCategoryUpdated, disabled }) => {
  const [open, setOpen] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createErr, setCreateErr] = useState(null);
  const [configCategoryId, setConfigCategoryId] = useState(null);
  const dropRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    setCreating(true); setCreateErr(null);
    try {
      const created = await createCategory(name);
      // Activate so it appears in future product selections (backend creates inactive by default)
      if (created?.categoryId) {
        await activateCategory(created.categoryId).catch(() => {});
      }
      onCategoryCreated(created);
      onToggle(created.categoryId);
      setNewName(""); setShowNew(false); setOpen(false);
    } catch (e) {
      setCreateErr(e.message ?? "Error al crear categoría.");
    } finally {
      setCreating(false);
    }
  };

  const available = categories.filter(c => !selectedIds.includes(c.categoryId));

  return (
    <div className="up-field">
      <label className="up-label">Categorías <span className="up-opt">(opcional)</span></label>
      <div className="up-chips-field" ref={dropRef}>
        {selectedIds.map(id => {
          const cat = categories.find(c => c.categoryId === id);
          return cat ? (
            <span key={id} className="up-chip">
              {cat.name}
              <button type="button" className="up-chip-config" disabled={disabled}
                title="Configurar atributos de variante para esta categoría"
                onClick={() => setConfigCategoryId(p => p === id ? null : id)}>⚙</button>
              <button type="button" className="up-chip-remove" onClick={() => onToggle(id)} disabled={disabled}>×</button>
            </span>
          ) : null;
        })}
        <button type="button" className="up-add-cat-btn" onClick={() => setOpen(p => !p)} disabled={disabled}>
          + Agregar categoría
        </button>
        {open && (
          <div className="up-cat-dropdown">
            {available.map(c => (
              <div key={c.categoryId} className="up-cat-option-row">
                <button type="button" className="up-cat-option"
                  onClick={() => { onToggle(c.categoryId); setOpen(false); }}>
                  {c.name}
                </button>
                <button type="button" className="up-chip-config" disabled={disabled}
                  title="Configurar atributos de variante para esta categoría"
                  onClick={(e) => { e.stopPropagation(); setConfigCategoryId(p => p === c.categoryId ? null : c.categoryId); }}>⚙</button>
              </div>
            ))}
            {!showNew ? (
              <button type="button" className="up-cat-option up-cat-option--new" onClick={() => setShowNew(true)}>
                + Crear categoría nueva
              </button>
            ) : (
              <div className="up-cat-create">
                <input type="text" placeholder="Nombre…" value={newName} className="up-input-sm"
                  onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleCreate()}
                  disabled={creating} autoFocus />
                <button type="button" className="up-btn-accent-sm" onClick={handleCreate} disabled={creating || !newName.trim()}>
                  {creating ? "…" : "OK"}
                </button>
                {createErr && <span className="up-field-error">{createErr}</span>}
              </div>
            )}
          </div>
        )}
      </div>
      {configCategoryId && (() => {
        const cat = categories.find(c => c.categoryId === configCategoryId);
        if (!cat) return null;
        return (
          <CategoryAttributesEditor
            category={cat}
            onClose={() => setConfigCategoryId(null)}
            onSaved={(updated) => { onCategoryUpdated?.(updated); setConfigCategoryId(null); }}
          />
        );
      })()}
    </div>
  );
};

// ─── Fila de variante (tabla) ─────────────────────────────────────────────────
const VarianteRow = ({ variante, onChange, disabled, colores = DEFAULT_COLORES, attr1Label = "Talla", isColorMode = true }) => {
  const set = (field, value) => onChange(variante._id, field, value);
  const colorObj = isColorMode ? colores.find(c => c.name === variante.color) : null;
  const hasColor = !!variante.color;
  const hasTalla = !!variante.talla;
  const tallaLabel = variante.talla === "ÚNICA" ? `${attr1Label} única` : variante.talla;
  const label =
    hasColor && hasTalla ? `${tallaLabel} / ${variante.color}`
    : hasColor            ? variante.color
    : hasTalla            ? tallaLabel
    :                       "Sin variante";

  return (
    <div className="up-vt-row">
      <div className="up-vt-cell up-vt-cell--label">
        <span className="up-vt-badge">
          {colorObj && <span className="up-color-dot" style={{ background: colorObj.hex }} />}
          {label}
        </span>
      </div>
      <div className="up-vt-cell" data-label="SKU">
        <input
          type="text"
          value={variante.sku}
          onChange={e => set("sku", e.target.value)}
          placeholder="SKU"
          disabled={disabled}
          className="up-vt-input"
        />
      </div>
      <div className="up-vt-cell" data-label="Precio">
        <input
          type="number"
          value={variante.precio}
          onChange={e => set("precio", e.target.value)}
          placeholder="45000"
          min="0"
          disabled={disabled}
          className="up-vt-input"
        />
      </div>
      <div className="up-vt-cell" data-label="Stock">
        <input
          type="number"
          value={variante.stock}
          onChange={e => set("stock", e.target.value)}
          placeholder="0"
          min="0"
          disabled={disabled}
          className="up-vt-input"
        />
      </div>
      <div className="up-vt-cell" data-label="Stock mín.">
        <input
          type="number"
          value={variante.stockMin}
          onChange={e => set("stockMin", e.target.value)}
          placeholder="0"
          min="0"
          disabled={disabled}
          className="up-vt-input"
        />
      </div>
    </div>
  );
};

// ─── Step Badge ──────────────────────────────────────────────────────────────
const StepBadge = ({ n, done, label }) => (
  <div className={`up-step ${done ? 'up-step--done' : ''}`}>
    <div className="up-step-circle">
      {done
        ? <svg viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5 6.5-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        : <span>{n}</span>
      }
    </div>
    <span className="up-step-label">{label}</span>
  </div>
);

// ─── Componente Principal ─────────────────────────────────────────────────────
const UploadProduct = () => {
  const navigate   = useNavigate();
  const { slug }   = useParams();
  const adminBase  = slug ? `/tienda/${slug}/admin` : '/admin';

  const [producto, setProducto] = useState(estadoInicial);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [dragging, setDragging] = useState(false);

  // Tallas y colores dinámicos (incluye personalizados)
  const [tallasDisponibles,  setTallasDisponibles]  = useState(DEFAULT_TALLAS);
  const [coloresDisponibles, setColoresDisponibles] = useState(DEFAULT_COLORES);

  // UI para añadir nuevas tallas/colores
  const [showAddTalla,  setShowAddTalla]  = useState(false);
  const [newTalla,      setNewTalla]      = useState("");
  const [showAddColor,  setShowAddColor]  = useState(false);
  const [newColorName,  setNewColorName]  = useState("");
  const [newColorHex,   setNewColorHex]   = useState("#6366f1");

  // Valores de "aplicar a todas"
  const [precioBase, setPrecioBase] = useState("");
  const [stockBase, setStockBase] = useState("");
  const [stockMinBase, setStockMinBase] = useState("");

  const fileInputRef = useRef(null);

  // ── Categoría activa: define qué atributos de variante se muestran ──────
  // (Talla/Color por defecto, o los personalizados de la primera categoría
  // seleccionada — ej. Capacidad/Color para Tecnología).
  const primaryCategoryId = producto.categoryIds[0] ?? null;
  const activeCategory = categories.find(c => c.categoryId === primaryCategoryId) ?? null;
  const attr1Label = activeCategory?.attribute1Label || "Talla";
  const attr1LabelPlural = activeCategory?.attribute1Label || "Tallas";
  const attr2Label = activeCategory?.attribute2Label || "Color";
  const attr2LabelPlural = activeCategory?.attribute2Label || "Colores";
  const hasAttr2 = !activeCategory?.attribute1Label || !!activeCategory?.attribute2Label;
  const attr2IsColorUI = activeCategory?.attribute1Label ? !!activeCategory?.attribute2IsColor : true;

  const isInitialAttrRender = useRef(true);
  useEffect(() => {
    // Las opciones disponibles para elegir dependen de la categoría activa.
    const opts1 = activeCategory?.attribute1Label ? (activeCategory.attribute1Options ?? []) : DEFAULT_TALLAS;
    setTallasDisponibles(opts1);

    if (activeCategory?.attribute1Label && activeCategory.attribute2Label) {
      const opts2 = activeCategory.attribute2Options ?? [];
      setColoresDisponibles(opts2.map(name => ({ name, hex: "#6366f1" })));
    } else if (activeCategory?.attribute1Label) {
      setColoresDisponibles([]); // sin segundo atributo configurado
    } else {
      setColoresDisponibles(DEFAULT_COLORES);
    }

    // Al cambiar de categoría (y por lo tanto el significado de los
    // atributos), limpia la selección previa para no mezclar, por ejemplo,
    // una "Capacidad: 128GB" elegida bajo Tecnología con Ropa.
    if (!isInitialAttrRender.current) {
      setProducto(prev => ({
        ...prev,
        selectedTallas: [],
        selectedColores: [],
        variantes: syncVariantes([], [], [], prev.name),
      }));
    }
    isInitialAttrRender.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [primaryCategoryId]);

  useEffect(() => {
    let alive = true;

    const loadMeta = async (isRetry = false) => {
      setLoadingMeta(true);
      try {
        const [cats, brnds, supps] = await Promise.all([
          getCategories(),
          getBrands(),
          getSuppliersByStore().catch(() => []),
        ]);
        if (!alive) return;
        setCategories(Array.isArray(cats) ? cats : []);
        setBrands(Array.isArray(brnds) ? brnds : []);
        setSuppliers(Array.isArray(supps) ? supps : []);
        setError("");
      } catch (err) {
        if (!alive) return;
        // El timeout (AbortError) suele ser el backend respondiendo lento,
        // no un error real — reintenta una vez antes de mostrar el aviso.
        if (err?.name === "AbortError" && !isRetry) {
          loadMeta(true);
          return;
        }
        setError(
          err?.name === "AbortError"
            ? "El servidor está tardando en responder. Verifica tu conexión y vuelve a intentarlo."
            : "Error al cargar categorías y marcas. Intenta de nuevo.",
        );
      } finally {
        if (alive) setLoadingMeta(false);
      }
    };

    loadMeta();
    return () => { alive = false; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProducto(prev => ({ ...prev, [name]: value }));
  };

  const handleBrandCreated = (brand) => setBrands(prev => [...prev, brand]);
  const handleCategoryCreated = (cat) => setCategories(prev => [...prev, cat]);
  const handleCategoryUpdated = (updated) => {
    setCategories(prev => prev.map(c => c.categoryId === updated.categoryId ? updated : c));
    // Si se editó la categoría actualmente activa, refresca las opciones
    // disponibles de inmediato (el efecto por id no se dispara solo).
    if (updated.categoryId === primaryCategoryId) {
      const opts1 = updated.attribute1Label ? (updated.attribute1Options ?? []) : DEFAULT_TALLAS;
      setTallasDisponibles(opts1);
      if (updated.attribute1Label && updated.attribute2Label) {
        setColoresDisponibles((updated.attribute2Options ?? []).map(name => ({ name, hex: "#6366f1" })));
      } else if (updated.attribute1Label) {
        setColoresDisponibles([]);
      } else {
        setColoresDisponibles(DEFAULT_COLORES);
      }
    }
  };
  const handleCategoryToggle = (categoryId) => {
    setProducto(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter(id => id !== categoryId)
        : [...prev.categoryIds, categoryId],
    }));
  };

  // ── Tallas y Colores ──
  const toggleTalla = (talla) => {
    setProducto(prev => {
      let newTallas;
      if (talla === "ÚNICA") {
        // ÚNICA es excluyente: desactiva todas las demás
        newTallas = prev.selectedTallas.includes("ÚNICA") ? [] : ["ÚNICA"];
      } else {
        // Cualquier talla normal elimina ÚNICA si estaba activa
        const sinUnica = prev.selectedTallas.filter(t => t !== "ÚNICA");
        newTallas = sinUnica.includes(talla)
          ? sinUnica.filter(t => t !== talla)
          : [...sinUnica, talla];
      }
      return {
        ...prev,
        selectedTallas: newTallas,
        variantes: syncVariantes(prev.variantes, newTallas, prev.selectedColores, prev.name),
      };
    });
  };

  const toggleColor = (color) => {
    setProducto(prev => {
      const newColores = prev.selectedColores.includes(color)
        ? prev.selectedColores.filter(c => c !== color)
        : [...prev.selectedColores, color];
      return {
        ...prev,
        selectedColores: newColores,
        variantes: syncVariantes(prev.variantes, prev.selectedTallas, newColores, prev.name),
      };
    });
  };

  // ── Añadir / eliminar tallas personalizadas ──
  const handleAddTalla = () => {
    const val = newTalla.trim().toUpperCase();
    if (!val || tallasDisponibles.includes(val)) { setNewTalla(""); setShowAddTalla(false); return; }
    setTallasDisponibles(prev => [...prev, val]);
    setNewTalla("");
    setShowAddTalla(false);
  };

  const removeFromTallas = (talla) => {
    setTallasDisponibles(prev => prev.filter(t => t !== talla));
    setProducto(prev => {
      if (!prev.selectedTallas.includes(talla)) return prev;
      const newTallas = prev.selectedTallas.filter(t => t !== talla);
      return { ...prev, selectedTallas: newTallas, variantes: syncVariantes(prev.variantes, newTallas, prev.selectedColores, prev.name) };
    });
  };

  // ── Añadir / eliminar colores personalizados ──
  const handleAddColor = () => {
    const nombre = newColorName.trim();
    if (!nombre || coloresDisponibles.some(c => c.name.toLowerCase() === nombre.toLowerCase())) {
      setNewColorName(""); setShowAddColor(false); return;
    }
    setColoresDisponibles(prev => [...prev, { name: nombre, hex: newColorHex }]);
    setNewColorName(""); setNewColorHex("#6366f1"); setShowAddColor(false);
  };

  const removeFromColores = (nombre) => {
    setColoresDisponibles(prev => prev.filter(c => c.name !== nombre));
    setProducto(prev => {
      if (!prev.selectedColores.includes(nombre)) return prev;
      const newColores = prev.selectedColores.filter(c => c !== nombre);
      return { ...prev, selectedColores: newColores, variantes: syncVariantes(prev.variantes, prev.selectedTallas, newColores, prev.name) };
    });
  };

  // ── Aplicar a todas ──
  const handleApplyPrecio = () => {
    if (!precioBase) return;
    setProducto(prev => ({
      ...prev,
      variantes: prev.variantes.map(v => ({ ...v, precio: precioBase })),
    }));
  };

  const handleApplyStock = () => {
    if (!stockBase) return;
    setProducto(prev => ({
      ...prev,
      variantes: prev.variantes.map(v => ({ ...v, stock: stockBase })),
    }));
  };

  const handleApplyStockMin = () => {
    if (!stockMinBase) return;
    setProducto(prev => ({
      ...prev,
      variantes: prev.variantes.map(v => ({ ...v, stockMin: stockMinBase })),
    }));
  };

  // ── Imágenes ──
  const agregarImagen = async (file) => {
    if (!file?.type.startsWith("image/")) return;
    const previewUrl = URL.createObjectURL(file);
    setProducto(prev => {
      if (prev.imagenes.length >= MAX_IMAGENES) { URL.revokeObjectURL(previewUrl); return prev; }
      return { ...prev, imagenes: [...prev.imagenes, { previewUrl, cloudinaryUrl: null, uploading: true }] };
    });
    try {
      const cloudinaryUrl = await uploadFile(file);
      setProducto(prev => ({
        ...prev,
        imagenes: prev.imagenes.map(img =>
          img.previewUrl === previewUrl ? { ...img, cloudinaryUrl, uploading: false } : img
        ),
      }));
    } catch (e) {
      URL.revokeObjectURL(previewUrl);
      setProducto(prev => ({ ...prev, imagenes: prev.imagenes.filter(img => img.previewUrl !== previewUrl) }));
      setError("Error al subir la imagen. " + e);
    }
  };

  const eliminarImagen = (previewUrl) => {
    URL.revokeObjectURL(previewUrl);
    setProducto(prev => ({ ...prev, imagenes: prev.imagenes.filter(img => img.previewUrl !== previewUrl) }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files ?? []);
    files.slice(0, MAX_IMAGENES - producto.imagenes.length).forEach(f => agregarImagen(f));
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    Array.from(e.dataTransfer.files ?? [])
      .slice(0, MAX_IMAGENES - producto.imagenes.length)
      .forEach(f => agregarImagen(f));
  };

  // ── Variantes ──
  const handleVarianteChange = (varId, field, value) => {
    setProducto(prev => ({
      ...prev,
      variantes: prev.variantes.map(v => v._id === varId ? { ...v, [field]: value } : v),
    }));
  };

  // ── Submit ──
  const handleSubmit = async () => {
    setError(null); setSuccess(null);
    if (!producto.name.trim()) return setError("El nombre del producto es obligatorio.");
    const descTrim = producto.description.trim();
    if (descTrim.length > 0 && (descTrim.length < 50 || producto.description.length > 1000)) {
      return setError("La descripción debe tener entre 50 y 1000 caracteres.");
    }
    if (producto.imagenes.length === 0) return setError("Agrega al menos una imagen.");
    if (producto.imagenes.some(img => img.uploading)) return setError("Espera a que terminen de subirse todas las imágenes.");
    if (producto.imagenes.some(img => !img.cloudinaryUrl)) return setError("Algunas imágenes no se subieron correctamente.");
    if (producto.variantes.length === 0) return setError("Agrega al menos una variante.");
    for (const v of producto.variantes) {
      if (!v.sku.trim()) return setError("Todos los SKUs son obligatorios.");
      if (!v.precio || Number(v.precio) <= 0) return setError("El precio de cada variante debe ser mayor que 0.");
      if (v.stock === "" || v.stock === null || v.stock === undefined) return setError("El stock es obligatorio en cada variante (puede ser 0 si aún no hay inventario).");
      if (Number(v.stock) < 0) return setError("El stock no puede ser negativo.");
      if (v.stockMin === "" || v.stockMin === null || v.stockMin === undefined) return setError("El stock mínimo es obligatorio en cada variante.");
      if (Number(v.stockMin) < 0) return setError("El stock mínimo no puede ser negativo.");
    }

    setLoading(true);
    try {
      const variants = producto.variantes.map(v => ({
        sku: v.sku.trim(),
        price: Number(v.precio),
        stock: Number(v.stock) || 0,
        minStock: Number(v.stockMin) || 0,
        ...(v.talla && { size: v.talla }),
        ...(v.color && { color: v.color }),
      }));

      await createProduct({
        name: producto.name.trim(),
        description: producto.description ?? "",
        brandId: producto.brandId || null,
        supplierId: producto.supplierId || null,
        categoryIds: producto.categoryIds,
        images: producto.imagenes.map(img => img.cloudinaryUrl),
        variants,
      });

      producto.imagenes.forEach(img => URL.revokeObjectURL(img.previewUrl));
      navigate(`${adminBase}/productos`);
    } catch (err) {
      setError(err.message ?? "Error al guardar el producto.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    producto.imagenes.forEach(img => URL.revokeObjectURL(img.previewUrl));
    setProducto(estadoInicial());
    setPrecioBase(""); setStockBase(""); setStockMinBase("");
    setError(null); setSuccess(null);
  };

  const totalVariantes = producto.variantes.length;
  const hayVariantes = totalVariantes > 0;

  const step1Done = producto.name.trim().length > 0;
  const step2Done = producto.imagenes.length > 0 && producto.imagenes.every(i => !i.uploading);
  const step3Done = producto.variantes.some(v => v.precio && Number(v.precio) > 0);

  return (
    <div className="up-wrapper">
      {/* ── Stepper ── */}
      <div className="up-stepper">
        <StepBadge n={1} done={step1Done} label="Información" />
        <div className={`up-step-line ${step1Done ? 'up-step-line--done' : ''}`} />
        <StepBadge n={2} done={step2Done} label="Imágenes" />
        <div className={`up-step-line ${step2Done ? 'up-step-line--done' : ''}`} />
        <StepBadge n={3} done={step3Done} label="Variantes" />
      </div>

      {/* ── Header ── */}
      <div className="up-header">
        <div className="up-header-left">
          <div>
            <h1 className="up-page-title">Crear producto</h1>
            <nav className="up-breadcrumb">Productos › Crear nuevo producto</nav>
          </div>
        </div>
        <div className="up-header-actions">
          <button type="button" className="up-btn-cancel" onClick={handleCancelar} disabled={loading}>
            Cancelar
          </button>
          <button type="button" className="up-btn-save" onClick={handleSubmit} disabled={loading || loadingMeta}>
            {loading ? "Guardando…" : "Guardar producto"}
          </button>
        </div>
      </div>

      <div className="up-body">
        {error   && <div className="up-alert up-alert--error">{error}</div>}
        {success && <div className="up-alert up-alert--success">{success}</div>}
        {loadingMeta && <div className="up-alert up-alert--info">Cargando datos…</div>}

        {/* ── 1. Información básica ── */}
        <section className="up-section">
          <div className="up-section-head">
            <h2 className="up-section-title">1. Información básica</h2>
            <p className="up-section-desc">Completa los datos principales de tu producto.</p>
          </div>
          <div className="up-two-col">
            <div className="up-field">
              <label className="up-label">Nombre del producto <span className="up-req">*</span></label>
              <input type="text" name="name" value={producto.name} onChange={handleChange}
                placeholder="Camiseta Urban Classic" disabled={loading} className="up-input" />
              <small className="up-hint">El nombre debe ser único dentro de tu tienda</small>
            </div>
            <BrandSelector brands={brands} value={producto.brandId} onChange={handleChange}
              onBrandCreated={handleBrandCreated} disabled={loading || loadingMeta} />
          </div>
          <div className="up-field">
            <label className="up-label">Proveedor <span className="up-opt">(opcional)</span></label>
            <div className="up-select-wrap">
              <select
                name="supplierId"
                value={producto.supplierId}
                onChange={handleChange}
                disabled={loading || loadingMeta || suppliers.length === 0}
                className="up-select"
              >
                {suppliers.length === 0 ? (
                  <option value="">— Sin proveedores (créalos en Proveedores) —</option>
                ) : (
                  <>
                    <option value="">Sin proveedor</option>
                    {suppliers.map(s => (
                      <option key={s.supplierId} value={s.supplierId}>{s.name}</option>
                    ))}
                  </>
                )}
              </select>
              <span className="up-select-arrow">▾</span>
            </div>
          </div>
          <div className="up-field">
            <label className="up-label">Descripción <span className="up-opt">(opcional)</span></label>
            <textarea name="description" value={producto.description} onChange={handleChange}
              placeholder="Camiseta de algodón 100% unisex" disabled={loading} className="up-textarea" />
            {producto.description.trim().length > 0 && (
              <small className={
                producto.description.trim().length < 50 || producto.description.length > 1000
                  ? "up-field-error"
                  : "up-hint"
              }>
                {producto.description.length}/1000 caracteres
                {producto.description.trim().length < 50 && ` — escribe al menos 50 (faltan ${50 - producto.description.trim().length})`}
                {producto.description.length > 1000 && " — supera el máximo permitido"}
              </small>
            )}
          </div>
          <CategoryChips categories={categories} selectedIds={producto.categoryIds}
            onToggle={handleCategoryToggle} onCategoryCreated={handleCategoryCreated}
            onCategoryUpdated={handleCategoryUpdated}
            disabled={loading || loadingMeta} />
        </section>

        {/* ── 2. Imágenes ── */}
        <section className="up-section">
          <div className="up-section-head">
            <h2 className="up-section-title">2. Imágenes del producto</h2>
            <p className="up-section-desc">Sube hasta 6 imágenes.</p>
          </div>
          <div
            className={`up-drop-zone${dragging ? " up-drop-zone--active" : ""}`}
            onClick={() => producto.imagenes.length < MAX_IMAGENES && fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            role="button" tabIndex={0}
            onKeyDown={e => e.key === "Enter" && fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="up-hidden-input"
              onChange={handleFileChange} tabIndex={-1} aria-hidden="true" />
            <span className={`up-drop-icon ${dragging ? 'up-drop-icon--active' : ''}`}>
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 28V12M20 12L14 18M20 12L26 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 32h20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
            </span>
            <span className="up-drop-text">{dragging ? 'Suelta para subir' : '+ Subir imagen'}</span>
            <small className="up-drop-hint">PNG / JPG · Máx {MAX_IMAGENES} imágenes · Cloudinary</small>
          </div>
          {producto.imagenes.length > 0 && (
            <div className="up-image-grid">
              {producto.imagenes.map((img, i) => (
                <div key={img.previewUrl} className="up-thumb">
                  <img src={img.previewUrl} alt={`Imagen ${i + 1}`} className="up-thumb-img"
                    style={{ opacity: img.uploading ? 0.5 : 1 }} />
                  {img.uploading && <div className="up-thumb-overlay">Subiendo…</div>}
                  {!img.uploading && (
                    <button type="button" className="up-thumb-delete"
                      onClick={() => eliminarImagen(img.previewUrl)} aria-label="Eliminar imagen">
                      🗑
                    </button>
                  )}
                </div>
              ))}
              {producto.imagenes.length < MAX_IMAGENES && (
                <div className="up-image-add" role="button" tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={e => e.key === "Enter" && fileInputRef.current?.click()}>
                  <span className="up-image-add-icon">+</span>
                  <span className="up-image-add-text">Agregar imagen</span>
                  <span className="up-image-add-count">{producto.imagenes.length} / {MAX_IMAGENES}</span>
                </div>
              )}
            </div>
          )}
        </section>

        {/* ── 3. Tallas, colores y variantes ── */}
        <section className="up-section">
          <div className="up-section-head">
            <h2 className="up-section-title">
              3. {attr1LabelPlural}{hasAttr2 ? ` y ${attr2LabelPlural.toLowerCase()}` : ""} <span className="up-req">*</span>
            </h2>
            <p className="up-section-desc">
              {activeCategory?.attribute1Label
                ? `Selecciona los valores disponibles para "${activeCategory.name}". Las variantes se generan automáticamente.`
                : "Selecciona las tallas y colores disponibles. Las variantes se generan automáticamente."}
            </p>
          </div>

          {/* Selector de tallas y colores */}
          <div className="up-matrix">
            {/* Fila Tallas */}
            <div className="up-matrix-row">
              <span className="up-matrix-label">{attr1LabelPlural}</span>
              <div className="up-matrix-content">
                <div className="up-size-chips">
                  {/* Botón ÚNICA — excluyente con todas las demás opciones */}
                  <button
                    type="button"
                    className={`up-size-chip up-size-chip--unica${producto.selectedTallas.includes("ÚNICA") ? " up-size-chip--on" : ""}`}
                    onClick={() => toggleTalla("ÚNICA")}
                    disabled={loading}
                    title={`Para productos sin ${attr1Label.toLowerCase()} específica`}
                  >
                    ÚNICA
                  </button>
                  {tallasDisponibles.map(t => (
                    <div key={t} className="up-chip-wrap">
                      <button
                        type="button"
                        className={`up-size-chip${producto.selectedTallas.includes(t) ? " up-size-chip--on" : ""}`}
                        onClick={() => toggleTalla(t)}
                        disabled={loading}
                      >
                        {t}
                      </button>
                      {!DEFAULT_TALLAS.includes(t) && (
                        <button
                          type="button"
                          className="up-chip-del"
                          onClick={() => removeFromTallas(t)}
                          disabled={loading}
                          title="Eliminar talla"
                        >×</button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="up-matrix-add">
                  {showAddTalla ? (
                    <div className="up-add-inline">
                      <input
                        type="text"
                        className="up-add-inline-input"
                        placeholder="ej: XXXL"
                        value={newTalla}
                        maxLength={8}
                        autoFocus
                        onChange={e => setNewTalla(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter") handleAddTalla();
                          if (e.key === "Escape") { setShowAddTalla(false); setNewTalla(""); }
                        }}
                      />
                      <button type="button" className="up-add-inline-ok" onClick={handleAddTalla} disabled={!newTalla.trim()}>Agregar</button>
                      <button type="button" className="up-add-inline-cancel" onClick={() => { setShowAddTalla(false); setNewTalla(""); }}>Cancelar</button>
                    </div>
                  ) : (
                    <button type="button" className="up-add-new-btn" onClick={() => setShowAddTalla(true)} disabled={loading}>
                      + Nueva opción de {attr1Label.toLowerCase()}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Fila Colores (o el segundo atributo que defina la categoría) */}
            {hasAttr2 && (
              <div className="up-matrix-row">
                <span className="up-matrix-label">{attr2LabelPlural}</span>
                <div className="up-matrix-content">
                  <div className="up-color-pills">
                    {coloresDisponibles.map(({ name, hex }) => (
                      <div key={name} className="up-chip-wrap">
                        <button
                          type="button"
                          className={`up-color-pill${producto.selectedColores.includes(name) ? " up-color-pill--on" : ""}`}
                          onClick={() => toggleColor(name)}
                          disabled={loading}
                        >
                          {attr2IsColorUI && <span className="up-color-dot" style={{ background: hex }} />}
                          {name}
                        </button>
                        {!DEFAULT_COLORES.some(c => c.name === name) && (
                          <button
                            type="button"
                            className="up-chip-del"
                            onClick={() => removeFromColores(name)}
                            disabled={loading}
                            title={`Eliminar ${attr2Label.toLowerCase()}`}
                          >×</button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="up-matrix-add">
                    {showAddColor ? (
                      <div className="up-add-color-inline">
                        {attr2IsColorUI && (
                          <label className="up-color-picker-wrap" title="Elige un color">
                            <span className="up-color-preview" style={{ background: newColorHex }} />
                            <input
                              type="color"
                              className="up-color-input-hidden"
                              value={newColorHex}
                              onChange={e => setNewColorHex(e.target.value)}
                            />
                          </label>
                        )}
                        <input
                          type="text"
                          className="up-add-inline-input"
                          placeholder={`Nombre de ${attr2Label.toLowerCase()}`}
                          value={newColorName}
                          maxLength={20}
                          autoFocus
                          onChange={e => setNewColorName(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === "Enter") handleAddColor();
                            if (e.key === "Escape") { setShowAddColor(false); setNewColorName(""); }
                          }}
                        />
                        <button type="button" className="up-add-inline-ok" onClick={handleAddColor} disabled={!newColorName.trim()}>Agregar</button>
                        <button type="button" className="up-add-inline-cancel" onClick={() => { setShowAddColor(false); setNewColorName(""); setNewColorHex("#6366f1"); }}>Cancelar</button>
                      </div>
                    ) : (
                      <button type="button" className="up-add-new-btn" onClick={() => setShowAddColor(true)} disabled={loading}>
                        + Nueva opción de {attr2Label.toLowerCase()}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Resumen */}
          <div className="up-variants-summary">
            <span className="up-variants-count">
              {totalVariantes === 1 && !producto.selectedTallas.length && !producto.selectedColores.length
                ? `1 variante (sin ${attr1Label.toLowerCase()}${hasAttr2 ? ` ni ${attr2Label.toLowerCase()}` : ""})`
                : `${totalVariantes} variante${totalVariantes !== 1 ? "s" : ""}`}
            </span>
          </div>

          {/* Aplicar a todas */}
          {hayVariantes && (
            <div className="up-apply-bar">
              <div className="up-apply-group">
                <span className="up-apply-label">Precio base</span>
                <div className="up-apply-row">
                  <input
                    type="number"
                    className="up-apply-input"
                    placeholder="45000"
                    value={precioBase}
                    onChange={e => setPrecioBase(e.target.value)}
                    min="0"
                    disabled={loading}
                  />
                  <button type="button" className="up-apply-btn" onClick={handleApplyPrecio} disabled={loading || !precioBase}>
                    Aplicar a todas
                  </button>
                </div>
              </div>
              <div className="up-apply-group">
                <span className="up-apply-label">Stock base</span>
                <div className="up-apply-row">
                  <input
                    type="number"
                    className="up-apply-input"
                    placeholder="10"
                    value={stockBase}
                    onChange={e => setStockBase(e.target.value)}
                    min="0"
                    disabled={loading}
                  />
                  <button type="button" className="up-apply-btn" onClick={handleApplyStock} disabled={loading || !stockBase}>
                    Aplicar a todas
                  </button>
                </div>
              </div>
              <div className="up-apply-group">
                <span className="up-apply-label">Stock mínimo base</span>
                <div className="up-apply-row">
                  <input
                    type="number"
                    className="up-apply-input"
                    placeholder="3"
                    value={stockMinBase}
                    onChange={e => setStockMinBase(e.target.value)}
                    min="0"
                    disabled={loading}
                  />
                  <button type="button" className="up-apply-btn" onClick={handleApplyStockMin} disabled={loading || !stockMinBase}>
                    Aplicar a todas
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tabla de variantes */}
          {hayVariantes && (
            <div className="up-vt-wrapper">
              <div className="up-vt-head">
                <div className="up-vt-cell up-vt-cell--label">Variante</div>
                <div className="up-vt-cell">SKU <span className="up-req">*</span></div>
                <div className="up-vt-cell">Precio <span className="up-req">*</span></div>
                <div className="up-vt-cell">Stock <span className="up-req">*</span></div>
                <div className="up-vt-cell">Stock mín.</div>
              </div>
              {producto.variantes.map(v => (
                <VarianteRow
                  key={v._id}
                  variante={v}
                  onChange={handleVarianteChange}
                  disabled={loading}
                  colores={coloresDisponibles}
                  attr1Label={attr1Label}
                  isColorMode={attr2IsColorUI}
                />
              ))}
            </div>
          )}
        </section>

        <div className="up-footer-note">
          ℹ Puedes cambiar el precio o stock de cualquier variante individualmente después de aplicar los valores base.
        </div>
      </div>
    </div>
  );
};

export default UploadProduct;
