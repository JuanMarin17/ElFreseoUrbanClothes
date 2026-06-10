import React, { useState, useRef, useEffect } from "react";
import "./UploadProduct.css";
import { getCategories, createCategory } from "../../services/categoryService";
import { createProduct } from "../../services/productService";
import { getBrands, createBrand } from "../../services/BrandService";
import { uploadFile } from "../../../../../utils/uploadService";

const TALLAS = ["XS", "S", "M", "L", "XL", "XXL"];
const COLORES = ["Negro", "Blanco", "Gris", "Rojo", "Azul", "Verde", "Amarillo", "Naranja", "Morado", "Rosa"];
const MAX_IMAGENES = 6;

let _varId = 0;
const newVariante = () => ({
  _id: ++_varId,
  sku: "", precio: "", stock: "", stockMin: "", talla: "", color: "",
});

const estadoInicial = () => ({
  name: "",
  description: "",
  categoryIds: [],
  brandId: "",
  imagenes: [],
  tiposVariante: { talla: true, color: true },
  variantes: [newVariante()],
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

// ─── VarianteCard ─────────────────────────────────────────────────────────────
const VarianteCard = ({ variante, index, mostrarTalla, mostrarColor, onChange, onEliminar, disabled }) => {
  const set = (field, value) => onChange(variante._id, field, value);

  return (
    <div className="up-variante-card">
      <div className="up-variante-header">
        <span className="up-variante-title">Variante #{index + 1}</span>
        <button type="button" className="up-btn-eliminar" onClick={() => onEliminar(variante._id)} disabled={disabled}>
          🗑 Eliminar
        </button>
      </div>
      <div className="up-variante-row4">
        <div className="up-field">
          <label className="up-label">SKU <span className="up-req">*</span></label>
          <input type="text" value={variante.sku} onChange={e => set("sku", e.target.value)}
            placeholder="CAM-URBAN-NEG-S" disabled={disabled} className="up-input" />
        </div>
        <div className="up-field">
          <label className="up-label">Precio <span className="up-req">*</span></label>
          <input type="number" value={variante.precio} onChange={e => set("precio", e.target.value)}
            placeholder="45000" min="0" disabled={disabled} className="up-input" />
        </div>
        <div className="up-field">
          <label className="up-label">Stock <span className="up-req">*</span></label>
          <input type="number" value={variante.stock} onChange={e => set("stock", e.target.value)}
            placeholder="0" min="0" disabled={disabled} className="up-input" />
        </div>
        <div className="up-field">
          <label className="up-label">Stock mín. <span className="up-req">*</span></label>
          <input type="number" value={variante.stockMin} onChange={e => set("stockMin", e.target.value)}
            placeholder="0" min="0" disabled={disabled} className="up-input" />
        </div>
      </div>
      {(mostrarTalla || mostrarColor) && (
        <div className="up-variante-row2">
          {mostrarTalla && (
            <div className="up-field">
              <label className="up-label">Talla</label>
              <div className="up-select-wrap">
                <select value={variante.talla} onChange={e => set("talla", e.target.value)}
                  disabled={disabled} className="up-select">
                  <option value="">Seleccionar</option>
                  {TALLAS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <span className="up-select-arrow">▾</span>
              </div>
            </div>
          )}
          {mostrarColor && (
            <div className="up-field">
              <label className="up-label">Color</label>
              <div className="up-select-wrap">
                <select value={variante.color} onChange={e => set("color", e.target.value)}
                  disabled={disabled} className="up-select">
                  <option value="">Seleccionar</option>
                  {COLORES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <span className="up-select-arrow">▾</span>
              </div>
            </div>
          )}
        </div>
      )}
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

  // ── Imágenes ──
  const agregarImagen = async (file) => {
    if (!file?.type.startsWith("image/")) return;
    const previewUrl = URL.createObjectURL(file);
    setProducto(prev => {
      if (prev.imagenes.length >= MAX_IMAGENES) {
        URL.revokeObjectURL(previewUrl);
        return prev;
      }
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
    } catch (e){
      URL.revokeObjectURL(previewUrl);
      setProducto(prev => ({ ...prev, imagenes: prev.imagenes.filter(img => img.previewUrl !== previewUrl) }));
      setError("Error al subir la imagen. Intenta de nuevo." + e);
    }
  };

  const eliminarImagen = (previewUrl) => {
    URL.revokeObjectURL(previewUrl);
    setProducto(prev => ({ ...prev, imagenes: prev.imagenes.filter(img => img.previewUrl !== previewUrl) }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files ?? []);
    const slots = MAX_IMAGENES - producto.imagenes.length;
    files.slice(0, slots).forEach(f => agregarImagen(f));
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const files = Array.from(e.dataTransfer.files ?? []);
    const slots = MAX_IMAGENES - producto.imagenes.length;
    files.slice(0, slots).forEach(f => agregarImagen(f));
  };

  // ── Variantes ──
  const handleVarianteChange = (varId, field, value) => {
    setProducto(prev => ({
      ...prev,
      variantes: prev.variantes.map(v => v._id === varId ? { ...v, [field]: value } : v),
    }));
  };

  const agregarVariante = () => setProducto(prev => ({ ...prev, variantes: [...prev.variantes, newVariante()] }));
  const eliminarVariante = (varId) => setProducto(prev => ({
    ...prev,
    variantes: prev.variantes.filter(v => v._id !== varId),
  }));

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
      const imageUrls = producto.imagenes.map(img => img.cloudinaryUrl);
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
        images: imageUrls,
        variants,
      });

      setSuccess("✅ Producto guardado correctamente.");
      producto.imagenes.forEach(img => URL.revokeObjectURL(img.previewUrl));
      setProducto(estadoInicial());
    } catch (err) {
      setError(err.message ?? "Error al guardar el producto.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    producto.imagenes.forEach(img => URL.revokeObjectURL(img.previewUrl));
    setProducto(estadoInicial());
    setError(null); setSuccess(null);
  };

  return (
    <div className="up-wrapper">
      {/* ── Header ── */}
      <div className="up-header">
        <div className="up-header-left">
          <button type="button" className="up-back-btn" onClick={handleCancelar} title="Volver">←</button>
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

        {/* ── Sección 1: Información básica ── */}
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

        {/* ── Sección 2: Imágenes ── */}
        <section className="up-section">
          <div className="up-section-head">
            <h2 className="up-section-title">2. Imágenes del producto</h2>
            <p className="up-section-desc">Sube hasta 6 imágenes. Solo se permiten URLs de Cloudinary.</p>
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

        {/* ── Sección 3: Variantes ── */}
        <section className="up-section">
          <div className="up-section-head">
            <h2 className="up-section-title">3. Variantes del producto <span className="up-req">*</span></h2>
            <p className="up-section-desc">Todo producto necesita al menos una variante con SKU, precio y stock.</p>
          </div>

          <div className="up-variant-config">
            <div className="up-config-row">
              <span className="up-config-label">¿Este producto maneja tallas o colores?</span>
              <label className="up-check-label">
                <input type="checkbox" checked={producto.tiposVariante.talla}
                  onChange={e => setProducto(prev => ({ ...prev, tiposVariante: { ...prev.tiposVariante, talla: e.target.checked } }))} />
                Talla
              </label>
              <label className="up-check-label">
                <input type="checkbox" checked={producto.tiposVariante.color}
                  onChange={e => setProducto(prev => ({ ...prev, tiposVariante: { ...prev.tiposVariante, color: e.target.checked } }))} />
                Color
              </label>
              <button type="button" className="up-btn-add-variant" onClick={agregarVariante} disabled={loading}>
                + Agregar variante
              </button>
            </div>
          </div>

          {producto.variantes.map((v, i) => (
            <VarianteCard key={v._id} variante={v} index={i}
              mostrarTalla={producto.tiposVariante.talla} mostrarColor={producto.tiposVariante.color}
              onChange={handleVarianteChange} onEliminar={eliminarVariante} disabled={loading} />
          ))}

          <div className="up-add-variant-bottom">
            <button type="button" className="up-btn-add-variant" onClick={agregarVariante} disabled={loading}>
              + Agregar variante
            </button>
          </div>
        </section>

        <div className="up-footer-note">
          ℹ Al guardar, recibirás los IDs de cada variante. Úsalos para agregar productos al carrito y gestionar pedidos.
        </div>
      </div>
    </div>
  );
};

export default UploadProduct;
