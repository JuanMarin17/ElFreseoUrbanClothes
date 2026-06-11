import React, { useState, useRef, useEffect } from "react";
import "./UploadProduct.css";
import { getCategories, createCategory } from "../../services/categoryService";
import { createProduct } from "../../services/productService";
import { getBrands, createBrand } from "../../services/BrandService";
import { uploadFile } from "../../../../../utils/uploadService";

const TALLAS = ["XS", "S", "M", "L", "XL", "XXL"];
const COLORES = [
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

// ─── CategoryChips ────────────────────────────────────────────────────────────
const CategoryChips = ({ categories, selectedIds, onToggle, onCategoryCreated, disabled }) => {
  const [open, setOpen] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createErr, setCreateErr] = useState(null);
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
              <button key={c.categoryId} type="button" className="up-cat-option"
                onClick={() => { onToggle(c.categoryId); setOpen(false); }}>
                {c.name}
              </button>
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
    </div>
  );
};

// ─── Fila de variante (tabla) ─────────────────────────────────────────────────
const VarianteRow = ({ variante, onChange, disabled }) => {
  const set = (field, value) => onChange(variante._id, field, value);
  const colorObj = COLORES.find(c => c.name === variante.color);
  const hasColor = !!variante.color;
  const hasTalla = !!variante.talla;
  const label =
    hasColor && hasTalla ? `${variante.color} · ${variante.talla}`
    : hasColor            ? variante.color
    : hasTalla            ? variante.talla
    :                       "Única";

  return (
    <div className="up-vt-row">
      <div className="up-vt-cell up-vt-cell--label">
        <span className="up-vt-badge">
          {colorObj && <span className="up-color-dot" style={{ background: colorObj.hex }} />}
          {label}
        </span>
      </div>
      <div className="up-vt-cell">
        <input
          type="text"
          value={variante.sku}
          onChange={e => set("sku", e.target.value)}
          placeholder="SKU"
          disabled={disabled}
          className="up-vt-input"
        />
      </div>
      <div className="up-vt-cell">
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
      <div className="up-vt-cell">
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
      <div className="up-vt-cell">
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

// ─── Componente Principal ─────────────────────────────────────────────────────
const UploadProduct = () => {
  const [producto, setProducto] = useState(estadoInicial);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [dragging, setDragging] = useState(false);

  // Valores de "aplicar a todas"
  const [precioBase, setPrecioBase] = useState("");
  const [stockBase, setStockBase] = useState("");
  const [stockMinBase, setStockMinBase] = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => {
    (async () => {
      setLoadingMeta(true);
      try {
        const [cats, brnds] = await Promise.all([getCategories(), getBrands()]);
        setCategories(Array.isArray(cats) ? cats : []);
        setBrands(Array.isArray(brnds) ? brnds : []);
      } catch (err) {
        setError("Error al cargar categorías y marcas. " + err);
      } finally {
        setLoadingMeta(false);
      }
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProducto(prev => ({ ...prev, [name]: value }));
  };

  const handleBrandCreated = (brand) => setBrands(prev => [...prev, brand]);
  const handleCategoryCreated = (cat) => setCategories(prev => [...prev, cat]);
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
      const newTallas = prev.selectedTallas.includes(talla)
        ? prev.selectedTallas.filter(t => t !== talla)
        : [...prev.selectedTallas, talla];
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
    if (producto.imagenes.length === 0) return setError("Agrega al menos una imagen.");
    if (producto.imagenes.some(img => img.uploading)) return setError("Espera a que terminen de subirse todas las imágenes.");
    if (producto.imagenes.some(img => !img.cloudinaryUrl)) return setError("Algunas imágenes no se subieron correctamente.");
    if (producto.variantes.length === 0) return setError("Agrega al menos una variante.");
    for (const v of producto.variantes) {
      if (!v.sku.trim()) return setError("Todos los SKUs son obligatorios.");
      if (!v.precio || Number(v.precio) <= 0) return setError("El precio de cada variante debe ser mayor que 0.");
      if (Number(v.stock) < 0) return setError("El stock no puede ser negativo.");
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
        categoryIds: producto.categoryIds,
        images: producto.imagenes.map(img => img.cloudinaryUrl),
        variants,
      });

      setSuccess("✅ Producto guardado correctamente.");
      producto.imagenes.forEach(img => URL.revokeObjectURL(img.previewUrl));
      setProducto(estadoInicial());
      setPrecioBase(""); setStockBase(""); setStockMinBase("");
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

  return (
    <div className="up-wrapper">
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
            <label className="up-label">Descripción <span className="up-opt">(opcional)</span></label>
            <textarea name="description" value={producto.description} onChange={handleChange}
              placeholder="Camiseta de algodón 100% unisex" disabled={loading} className="up-textarea" />
          </div>
          <CategoryChips categories={categories} selectedIds={producto.categoryIds}
            onToggle={handleCategoryToggle} onCategoryCreated={handleCategoryCreated}
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
            <span className="up-drop-icon">⬆</span>
            <span className="up-drop-text">+ Subir imagen</span>
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
            <h2 className="up-section-title">3. Tallas y colores <span className="up-req">*</span></h2>
            <p className="up-section-desc">
              Selecciona las tallas y colores disponibles. Las variantes se generan automáticamente.
            </p>
          </div>

          {/* Selector de tallas y colores */}
          <div className="up-matrix">
            <div className="up-matrix-row">
              <span className="up-matrix-label">Tallas</span>
              <div className="up-size-chips">
                {TALLAS.map(t => (
                  <button
                    key={t}
                    type="button"
                    className={`up-size-chip${producto.selectedTallas.includes(t) ? " up-size-chip--on" : ""}`}
                    onClick={() => toggleTalla(t)}
                    disabled={loading}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="up-matrix-row">
              <span className="up-matrix-label">Colores</span>
              <div className="up-color-pills">
                {COLORES.map(({ name, hex }) => (
                  <button
                    key={name}
                    type="button"
                    className={`up-color-pill${producto.selectedColores.includes(name) ? " up-color-pill--on" : ""}`}
                    onClick={() => toggleColor(name)}
                    disabled={loading}
                  >
                    <span className="up-color-dot" style={{ background: hex }} />
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Resumen */}
          <div className="up-variants-summary">
            <span className="up-variants-count">
              {totalVariantes === 1 && !producto.selectedTallas.length && !producto.selectedColores.length
                ? "1 variante (sin talla ni color)"
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
