import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById, updateProduct, increaseStock, decreaseStock } from "../../services/productService";
import { getCategories, createCategory, activateCategory } from "../../services/CategoryService";
import { getBrands, createBrand } from "../../services/BrandService";
import { getSuppliersByStore } from "../../services/SupplierService";
import { uploadFile } from "../../../../../utils/uploadService";
import "../UploadProduct/UploadProduct.css";
import "./EditProduct.css";
import PageSpinner from "../../../../../components/ui/PageSpinner.jsx";

/* ── BrandSelector ── */
const BrandSelector = ({ brands = [], value, onChange, onBrandCreated, disabled }) => {
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createErr, setCreateErr] = useState(null);

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    setCreateErr(null);
    try {
      const created = await createBrand(name);
      onBrandCreated(created);
      onChange({ target: { name: "brandId", value: created.brandId } });
      setNewName("");
      setShowNew(false);
    } catch (e) {
      setCreateErr(e.message ?? "Error al crear marca.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="inputGroup">
      <label>Marca</label>
      <div className="categoryRow">
        <div className="selectWrapper" style={{ flex: 1 }}>
          <span className="selectIcon">◈</span>
          <select name="brandId" value={value} onChange={onChange} disabled={disabled} className="selectWithIcon">
            <option value="">— Sin marca —</option>
            {brands.map((b) => <option key={b.brandId} value={b.brandId}>{b.name}</option>)}
          </select>
        </div>
        <button type="button" className={`btnNewCategory ${showNew ? "btnNewCategoryActive" : ""}`}
          onClick={() => { setShowNew(p => !p); setCreateErr(null); }} disabled={disabled}>
          {showNew ? "✕" : "+ Nueva"}
        </button>
      </div>
      {showNew && (
        <div className="newCategoryBox">
          <input type="text" placeholder="Nombre de la marca…" value={newName}
            onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleCreate()}
            disabled={creating} className="newCategoryInput" autoFocus />
          <button type="button" className="btnConfirmCategory" onClick={handleCreate} disabled={creating || !newName.trim()}>
            {creating ? "…" : "Guardar"}
          </button>
          {createErr && <span className="createCatError">{createErr}</span>}
        </div>
      )}
    </div>
  );
};

/* ── CategorySelector ── */
const CategorySelector = ({ categories, selectedIds, onToggle, onCategoryCreated, disabled }) => {
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createErr, setCreateErr] = useState(null);

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    setCreateErr(null);
    try {
      const created = await createCategory(name);
      if (created?.categoryId) {
        await activateCategory(created.categoryId).catch(() => {});
      }
      onCategoryCreated(created);
      onToggle(created.categoryId);
      setNewName("");
      setShowNew(false);
    } catch (e) {
      setCreateErr(e.message ?? "Error al crear categoría.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="inputGroup">
      <label>Categorías</label>
      {selectedIds.length > 0 && (
        <div className="selectedCategoryPills">
          {selectedIds.map(id => {
            const cat = categories.find(c => c.categoryId === id);
            return cat ? (
              <span key={id} className="categoryPill">
                {cat.name}
                <button type="button" className="pillRemove" onClick={() => onToggle(id)} disabled={disabled}>✕</button>
              </span>
            ) : null;
          })}
        </div>
      )}
      <div className="categoryRow">
        <div className="selectWrapper" style={{ flex: 1 }}>
          <span className="selectIcon">◇</span>
          <select value="" onChange={e => { if (e.target.value) onToggle(e.target.value); }} disabled={disabled} className="selectWithIcon">
            <option value="">— Añadir categoría —</option>
            {categories.filter(c => !selectedIds.includes(c.categoryId)).map(c => (
              <option key={c.categoryId} value={c.categoryId}>{c.name}</option>
            ))}
          </select>
        </div>
        <button type="button" className={`btnNewCategory ${showNew ? "btnNewCategoryActive" : ""}`}
          onClick={() => { setShowNew(p => !p); setCreateErr(null); }} disabled={disabled}>
          {showNew ? "✕" : "+ Nueva"}
        </button>
      </div>
      {showNew && (
        <div className="newCategoryBox">
          <input type="text" placeholder="Nombre de la categoría…" value={newName}
            onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleCreate()}
            disabled={creating} className="newCategoryInput" autoFocus />
          <button type="button" className="btnConfirmCategory" onClick={handleCreate} disabled={creating || !newName.trim()}>
            {creating ? "…" : "Guardar"}
          </button>
          {createErr && <span className="createCatError">{createErr}</span>}
        </div>
      )}
    </div>
  );
};

/* ── Componente principal ── */
export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    brandId: "",
    supplierId: "",
    categoryIds: [],
    variants: [],
    images: [],
  });

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [originalVariants, setOriginalVariants] = useState([]);

  useEffect(() => {
    const load = async () => {
      setFetching(true);
      try {
        const [product, cats, brnds, supps] = await Promise.all([
          getProductById(id),
          getCategories(),
          getBrands(),
          getSuppliersByStore().catch(() => []),
        ]);

        setCategories(Array.isArray(cats) ? cats : []);
        setBrands(Array.isArray(brnds) ? brnds : []);
        setSuppliers(Array.isArray(supps) ? supps : []);

        const matchedCategoryIds = (product.categories ?? []).reduce((acc, catName) => {
          const found = (Array.isArray(cats) ? cats : []).find(
            c => c.name?.toLowerCase() === catName?.toLowerCase()
          );
          if (found) acc.push(found.categoryId);
          return acc;
        }, []);

        const matchedBrandId = (Array.isArray(brnds) ? brnds : []).find(
          b => b.name?.toLowerCase() === product.brandName?.toLowerCase()
        )?.brandId ?? "";

        setForm({
          name: product.name ?? "",
          description: product.description ?? "",
          brandId: matchedBrandId,
          supplierId: product.supplierId ?? "",
          categoryIds: matchedCategoryIds,
          variants: (product.variants ?? []).map(v => ({
            variantId: v.variantId ?? null,
            sku: v.sku ?? "",
            price: v.price ?? 0,
            stock: v.stock ?? 0,
            minStock: v.minStock ?? 0,
            // Se conservan tal cual: si no se incluyen en el payload de guardado,
            // el backend los sobreescribe con null y se pierden silenciosamente.
            size: v.size ?? "",
            color: v.color ?? "",
          })),
          images: (product.images ?? []).map(img => ({
            cloudinaryUrl: img.url,
            previewUrl: img.url,
            uploading: false,
          })),
        });
        setOriginalVariants(product.variants ?? []);
      } catch (err) {
        setError(err.message ?? "No se pudo cargar el producto.");
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [id]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryToggle = catId => {
    setForm(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(catId)
        ? prev.categoryIds.filter(c => c !== catId)
        : [...prev.categoryIds, catId],
    }));
  };

  /* ── Variantes ── */
  const handleVariantChange = (index, field, value) => {
    setForm(prev => {
      const updated = [...prev.variants];
      updated[index] = { ...updated[index], [field]: field === "sku" ? value : Number(value) };
      return { ...prev, variants: updated };
    });
  };

  const addVariant = () => {
    setForm(prev => ({
      ...prev,
      variants: [...prev.variants, { variantId: null, sku: "", price: 0, stock: 0, minStock: 0 }],
    }));
  };

  const removeVariant = index => {
    setForm(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  /* ── Imágenes ── */
  const imageInputRef = useRef(null);

  const handleAddImage = async file => {
    if (!file || form.images.length >= 6) return;
    const previewUrl = URL.createObjectURL(file);
    const slot = { previewUrl, cloudinaryUrl: null, uploading: true };
    setForm(prev => ({ ...prev, images: [...prev.images, slot] }));
    try {
      const cloudinaryUrl = await uploadFile(file);
      setForm(prev => {
        const imgs = [...prev.images];
        const idx = imgs.findIndex(i => i.previewUrl === previewUrl && i.uploading);
        if (idx !== -1) imgs[idx] = { previewUrl, cloudinaryUrl, uploading: false };
        return { ...prev, images: imgs };
      });
    } catch {
      setForm(prev => ({
        ...prev,
        images: prev.images.filter(i => i.previewUrl !== previewUrl),
      }));
      setError("Error al subir la imagen. Intenta de nuevo.");
    }
  };

  const removeImage = index => {
    setForm(prev => {
      const imgs = [...prev.images];
      if (imgs[index]?.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(imgs[index].previewUrl);
      }
      imgs.splice(index, 1);
      return { ...prev, images: imgs };
    });
  };

  /* ── Submit ── */
  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    if (!form.name.trim()) return setError("El nombre del producto es obligatorio.");
    const descTrim = form.description.trim();
    if (descTrim.length > 0 && (descTrim.length < 50 || form.description.length > 1000)) {
      return setError("La descripción debe tener entre 50 y 1000 caracteres.");
    }
    if (form.variants.length === 0) return setError("Agrega al menos una variante.");
    if (form.variants.some(v => !v.sku.trim())) return setError("Todas las variantes deben tener SKU.");
    if (form.variants.some(v => v.price <= 0)) return setError("El precio de cada variante debe ser mayor a 0.");
    if (form.images.some(img => img.uploading)) return setError("Espera a que terminen de subirse todas las imágenes.");

    setLoading(true);
    try {
      await updateProduct(id, {
        name: form.name.trim(),
        description: form.description,
        brandId: form.brandId || null,
        supplierId: form.supplierId || null,
        categoryIds: form.categoryIds,
        images: form.images.map(img => img.cloudinaryUrl).filter(Boolean),
        variants: form.variants.map(({ variantId, size, color, ...rest }) => ({
          ...rest,
          ...(size && { size }),
          ...(color && { color }),
        })),
      });

      // Sync stock via variant endpoints for existing variants
      for (const v of form.variants) {
        if (!v.variantId) continue;
        const original = originalVariants.find(ov => ov.variantId === v.variantId);
        const oldStock = original?.stock ?? 0;
        const delta = v.stock - oldStock;
        if (delta > 0) await increaseStock(v.variantId, delta);
        else if (delta < 0) await decreaseStock(v.variantId, Math.abs(delta));
      }

      setOriginalVariants(form.variants.map(v => ({ variantId: v.variantId, stock: v.stock })));
      setSuccess("✅ Producto actualizado correctamente.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.message ?? "Error al actualizar el producto.");
    } finally {
      setLoading(false);
    }
  };

  // Etiquetas de atributo de variante según la categoría del producto (ej.
  // "Capacidad"/"Color" para Tecnología en vez de "Talla"/"Color" por defecto).
  const activeCategory = categories.find(c => c.categoryId === form.categoryIds[0]) ?? null;
  const attr1Label = activeCategory?.attribute1Label || "Talla";
  const attr2Label = activeCategory?.attribute2Label || "Color";

  const stockDot = (stock, minStock) => {
    if (stock === 0) return "ep-stock-dot--out";
    if (stock <= (minStock || 5)) return "ep-stock-dot--low";
    return "ep-stock-dot--ok";
  };

  if (fetching) {
    return (
      <div className="adminContainer">
        <main className="mainContent">
          <PageSpinner label="Cargando producto..." />
        </main>
      </div>
    );
  }

  return (
    <div className="adminContainer">
      <main className="ep-page">

        {/* ── Header ── */}
        <div className="ep-header">
          <div>
            <div className="ep-breadcrumb">
              <button onClick={() => navigate(-1)}>← Productos</button>
              <span className="ep-breadcrumb-sep">/</span>
              <span className="ep-breadcrumb-current">Editar</span>
            </div>
            <h1 className="ep-title">Editar producto</h1>
            <p className="ep-id">ID: {id}</p>
          </div>

          <div className="ep-actions">
            <button className="ep-btn-back" onClick={() => navigate(-1)} disabled={loading}>
              Cancelar
            </button>
            <button className="ep-btn-save" onClick={handleSubmit} disabled={loading || fetching}>
              {loading ? "Guardando…" : "Guardar cambios ↑"}
            </button>
          </div>
        </div>

        {error   && <div className="ep-alert ep-alert--error">⚠ {error}</div>}
        {success && <div className="ep-alert ep-alert--success">{success}</div>}

        <div className="ep-grid">

          {/* ── Columna izquierda ── */}
          <div>

            {/* Información general */}
            <div className="ep-card">
              <h3 className="ep-card-title">
                <span className="ep-card-title-icon ep-icon--blue">✎</span>
                Información general
              </h3>

              <div className="ep-field">
                <label className="ep-label">Nombre del producto</label>
                <input
                  className="ep-input"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ej. Camiseta Urbana Negra"
                  disabled={loading}
                />
              </div>

              <div className="ep-field">
                <label className="ep-label">Descripción</label>
                <textarea
                  className="ep-textarea"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe el producto…"
                  disabled={loading}
                />
                {form.description.trim().length > 0 && (
                  <span className={
                    form.description.trim().length < 50 || form.description.length > 1000
                      ? "ep-field-error"
                      : "ep-hint"
                  }>
                    {form.description.length}/1000 caracteres
                    {form.description.trim().length < 50 && ` — escribe al menos 50 (faltan ${50 - form.description.trim().length})`}
                    {form.description.length > 1000 && " — supera el máximo permitido"}
                  </span>
                )}
              </div>

              <BrandSelector
                brands={brands}
                value={form.brandId}
                onChange={handleChange}
                onBrandCreated={b => setBrands(prev => [...prev, b])}
                disabled={loading}
              />

              <div className="inputGroup">
                <label>Proveedor</label>
                <div className="selectWrapper">
                  <span className="selectIcon">◈</span>
                  <select
                    name="supplierId"
                    value={form.supplierId}
                    onChange={handleChange}
                    disabled={loading || suppliers.length === 0}
                    className="selectWithIcon"
                  >
                    {suppliers.length === 0 ? (
                      <option value="">— Sin proveedores —</option>
                    ) : (
                      <>
                        <option value="">— Sin proveedor —</option>
                        {suppliers.map(s => (
                          <option key={s.supplierId} value={s.supplierId}>{s.name}</option>
                        ))}
                      </>
                    )}
                  </select>
                </div>
              </div>

              <CategorySelector
                categories={categories}
                selectedIds={form.categoryIds}
                onToggle={handleCategoryToggle}
                onCategoryCreated={c => setCategories(prev => [...prev, c])}
                disabled={loading}
              />
            </div>

            {/* Variantes */}
            <div className="ep-card">
              <h3 className="ep-card-title">
                <span className="ep-card-title-icon ep-icon--amber">▦</span>
                Variantes
                <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 500, color: "#555", textTransform: "none", letterSpacing: 0 }}>
                  {form.variants.length} variante{form.variants.length !== 1 ? "s" : ""}
                </span>
              </h3>

              <div className="ep-variant-header">
                <span>SKU</span>
                <span style={{ textAlign: "right" }}>Precio</span>
                <span style={{ textAlign: "right" }}>Stock</span>
                <span style={{ textAlign: "right" }}>Mín.</span>
                <span />
              </div>

              {form.variants.length === 0 && (
                <p className="ep-variants-empty">Sin variantes. Añade al menos una.</p>
              )}

              <div className="ep-variant-list">
                {form.variants.map((v, i) => (
                  <div key={i} className="ep-variant-row">

                    {/* SKU */}
                    <div>
                      <input
                        className="ep-var-input"
                        value={v.sku}
                        onChange={e => handleVariantChange(i, "sku", e.target.value)}
                        placeholder="CAM-NEG-S"
                        disabled={loading}
                      />
                      {(v.size || v.color) && (
                        <small style={{ display: "block", fontSize: 10, color: "#777", marginTop: 2 }}>
                          {[v.size && `${attr1Label}: ${v.size}`, v.color && `${attr2Label}: ${v.color}`]
                            .filter(Boolean).join(" · ")}
                        </small>
                      )}
                    </div>

                    {/* Precio */}
                    <input
                      className="ep-var-input ep-var-input--num"
                      type="number"
                      value={v.price}
                      min="0"
                      onChange={e => handleVariantChange(i, "price", e.target.value)}
                      disabled={loading}
                    />

                    {/* Stock con indicador */}
                    <div className="ep-stock-wrap">
                      <span className={`ep-stock-dot ${stockDot(v.stock, v.minStock)}`} />
                      <input
                        className="ep-var-input ep-var-input--num"
                        type="number"
                        value={v.stock}
                        min="0"
                        onChange={e => handleVariantChange(i, "stock", e.target.value)}
                        disabled={loading}
                        style={{ flex: 1 }}
                      />
                    </div>

                    {/* Min stock */}
                    <input
                      className="ep-var-input ep-var-input--num"
                      type="number"
                      value={v.minStock}
                      min="0"
                      onChange={e => handleVariantChange(i, "minStock", e.target.value)}
                      disabled={loading}
                    />

                    {/* Eliminar */}
                    <button
                      type="button"
                      className="ep-var-remove"
                      onClick={() => removeVariant(i)}
                      disabled={loading}
                      title="Eliminar variante"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <button type="button" className="ep-add-variant" onClick={addVariant} disabled={loading}>
                + Añadir variante
              </button>
            </div>
          </div>

          {/* ── Columna derecha: imágenes ── */}
          <div>
            <div className="ep-card">
              <h3 className="ep-card-title">
                <span className="ep-card-title-icon ep-icon--photo">🖼</span>
                Imágenes
                <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 500, color: "#555", textTransform: "none", letterSpacing: 0 }}>
                  {form.images.length} / 6
                </span>
              </h3>

              <div className="ep-images-grid">
                {form.images.map((img, i) => (
                  <div key={i} className="ep-img-slot">
                    <img
                      src={img.previewUrl}
                      alt={`img-${i}`}
                      style={{ opacity: img.uploading ? 0.35 : 1 }}
                    />
                    {img.uploading && (
                      <div className="ep-img-uploading-overlay">
                        <div className="ep-img-spinner" />
                        <span>Subiendo…</span>
                      </div>
                    )}
                    {!img.uploading && (
                      <button className="ep-img-remove" onClick={() => removeImage(i)} title="Quitar imagen">
                        ✕
                      </button>
                    )}
                  </div>
                ))}

                {form.images.length < 6 && (
                  <div className="ep-img-add" onClick={() => imageInputRef.current?.click()}>
                    <span className="ep-img-add-icon">＋</span>
                    <span className="ep-img-add-text">Añadir foto</span>
                    <span className="ep-img-add-count">{6 - form.images.length} restante{6 - form.images.length !== 1 ? "s" : ""}</span>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={e => {
                        const f = e.target.files?.[0];
                        if (f) handleAddImage(f);
                        e.target.value = "";
                      }}
                    />
                  </div>
                )}
              </div>

              {form.images.length === 0 && (
                <p className="ep-images-empty">
                  Sin imágenes. Añade al menos una para mostrar el producto en la tienda.
                </p>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
