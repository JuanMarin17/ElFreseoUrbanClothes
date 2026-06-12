import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById, updateProduct } from "../../services/productService";
import { getCategories, createCategory } from "../../services/CategoryService";
import { getBrands, createBrand } from "../../services/BrandService";
import { uploadFile } from "../../../../../utils/uploadService";
import "../UploadProduct/UploadProduct.css";
import PageSpinner from "../../../../../components/ui/PageSpinner.jsx";

const TALLAS_DISPONIBLES = ["S", "M", "L", "XL", "XXL"];

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
    categoryIds: [],
    variants: [],
    images: [],
  });

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const load = async () => {
      setFetching(true);
      try {
        const [product, cats, brnds] = await Promise.all([
          getProductById(id),
          getCategories(),
          getBrands(),
        ]);

        setCategories(Array.isArray(cats) ? cats : []);
        setBrands(Array.isArray(brnds) ? brnds : []);

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
          categoryIds: matchedCategoryIds,
          variants: (product.variants ?? []).map(v => ({
            sku: v.sku ?? "",
            price: v.price ?? 0,
            stock: v.stock ?? 0,
            minStock: v.minStock ?? 0,
          })),
          images: (product.images ?? []).map(img => ({
            cloudinaryUrl: img.url,
            previewUrl: img.url,
            uploading: false,
          })),
        });
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
      variants: [...prev.variants, { sku: "", price: 0, stock: 0, minStock: 0 }],
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
        categoryIds: form.categoryIds,
        images: form.images.map(img => img.cloudinaryUrl).filter(Boolean),
        variants: form.variants,
      });
      setSuccess("✅ Producto actualizado correctamente.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.message ?? "Error al actualizar el producto.");
    } finally {
      setLoading(false);
    }
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
      <main className="mainContent">
        <div className="pageTitleRow">
          <div>
            <h2 className="pageTitle">EDITAR PRODUCTO</h2>
            <p className="protocolText" style={{ fontSize: 11, color: "#555", marginTop: 4 }}>ID: {id}</p>
          </div>
          <div className="topButtons">
            <button className="btnDiscard" onClick={() => navigate(-1)} disabled={loading}>
              ← VOLVER
            </button>
            <button className="btnUpload" onClick={handleSubmit} disabled={loading || fetching}>
              {loading ? "Guardando..." : "ACTUALIZAR PRODUCTO ⇡"}
            </button>
          </div>
        </div>

        {error && <div className="errorMsg">{error}</div>}
        {success && <div className="successMsg">{success}</div>}

        <section className="gridContainer">
          {/* ── Columna formulario ── */}
          <div className="formColumn">
            <div className="card">
              <h3 className="cardTitle"><span className="iconBlue">✎</span> Información General</h3>

              <div className="inputGroup">
                <label>Nombre producto</label>
                <input type="text" name="name" value={form.name} onChange={handleChange}
                  placeholder="e.g. NEON_VAPOR HOODIE" disabled={loading} />
              </div>

              <div className="inputGroup">
                <label>Descripción</label>
                <textarea name="description" value={form.description} onChange={handleChange}
                  placeholder="Especificaciones técnicas y filosofía de diseño..." disabled={loading} />
              </div>

              <BrandSelector brands={brands} value={form.brandId} onChange={handleChange}
                onBrandCreated={b => setBrands(prev => [...prev, b])} disabled={loading} />

              <CategorySelector categories={categories} selectedIds={form.categoryIds}
                onToggle={handleCategoryToggle}
                onCategoryCreated={c => setCategories(prev => [...prev, c])}
                disabled={loading} />
            </div>

            {/* ── Variantes ── */}
            <div className="card">
              <h3 className="cardTitle"><span className="iconBlue">📦</span> Variantes</h3>

              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ color: "#555", fontSize: 10, letterSpacing: 1 }}>
                    <th style={{ textAlign: "left", paddingBottom: 8 }}>SKU</th>
                    <th style={{ textAlign: "left", paddingBottom: 8 }}>Precio</th>
                    <th style={{ textAlign: "left", paddingBottom: 8 }}>Stock</th>
                    <th style={{ textAlign: "left", paddingBottom: 8 }}>Min.</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {form.variants.map((v, i) => (
                    <tr key={i} style={{ borderTop: "1px solid #1a1a1a" }}>
                      <td style={{ padding: "8px 6px 8px 0" }}>
                        <input value={v.sku} onChange={e => handleVariantChange(i, "sku", e.target.value)}
                          placeholder="SKU" disabled={loading}
                          style={{ background: "#000", border: "1px solid #222", color: "#fff", padding: "6px 8px", fontSize: 11, width: "100%" }} />
                      </td>
                      <td style={{ padding: "8px 6px" }}>
                        <input type="number" value={v.price} min="0"
                          onChange={e => handleVariantChange(i, "price", e.target.value)}
                          disabled={loading}
                          style={{ background: "#000", border: "1px solid #222", color: "#fff", padding: "6px 8px", fontSize: 11, width: 80 }} />
                      </td>
                      <td style={{ padding: "8px 6px" }}>
                        <input type="number" value={v.stock} min="0"
                          onChange={e => handleVariantChange(i, "stock", e.target.value)}
                          disabled={loading}
                          style={{ background: "#000", border: "1px solid #222", color: "#fff", padding: "6px 8px", fontSize: 11, width: 60 }} />
                      </td>
                      <td style={{ padding: "8px 6px" }}>
                        <input type="number" value={v.minStock} min="0"
                          onChange={e => handleVariantChange(i, "minStock", e.target.value)}
                          disabled={loading}
                          style={{ background: "#000", border: "1px solid #222", color: "#fff", padding: "6px 8px", fontSize: 11, width: 60 }} />
                      </td>
                      <td style={{ padding: "8px 0 8px 6px" }}>
                        <button type="button" onClick={() => removeVariant(i)} disabled={loading}
                          style={{ background: "none", border: "1px solid #333", color: "#ef4444", padding: "5px 8px", cursor: "pointer", fontSize: 11, borderRadius: 4 }}>
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <button type="button" onClick={addVariant} disabled={loading}
                style={{ marginTop: 12, background: "none", border: "1px dashed #333", color: "#555", padding: "8px 16px", cursor: "pointer", fontSize: 11, width: "100%" }}>
                + Añadir variante
              </button>
            </div>
          </div>

          {/* ── Columna imágenes ── */}
          <div className="previewColumn">
            <div className="card">
              <h3 className="cardTitle"><span className="iconBlue">🖼️</span> Imágenes ({form.images.length}/6)</h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {form.images.map((img, i) => (
                  <div key={i} style={{ position: "relative", background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 6, overflow: "hidden", aspectRatio: "1/1" }}>
                    <img src={img.previewUrl} alt={`img-${i}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover", opacity: img.uploading ? 0.4 : 1 }} />
                    {img.uploading && (
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", fontSize: 11, color: "#fff" }}>
                        Subiendo…
                      </div>
                    )}
                    {!img.uploading && (
                      <button onClick={() => removeImage(i)}
                        style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.8)", border: "1px solid #333", color: "#ef4444", width: 24, height: 24, borderRadius: "50%", cursor: "pointer", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        ✕
                      </button>
                    )}
                  </div>
                ))}

                {form.images.length < 6 && (
                  <div onClick={() => imageInputRef.current?.click()}
                    style={{ background: "#0a0a0a", border: "1px dashed #222", borderRadius: 6, aspectRatio: "1/1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#444", gap: 8 }}>
                    <span style={{ fontSize: 24 }}>📷</span>
                    <small style={{ fontSize: 10 }}>Añadir imagen</small>
                    <input ref={imageInputRef} type="file" accept="image/*" style={{ display: "none" }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleAddImage(f); e.target.value = ""; }} />
                  </div>
                )}
              </div>

              {form.images.length === 0 && (
                <p style={{ color: "#444", fontSize: 11, textAlign: "center", marginTop: 12 }}>
                  Sin imágenes. Añade al menos una para que se muestre en la tienda.
                </p>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
