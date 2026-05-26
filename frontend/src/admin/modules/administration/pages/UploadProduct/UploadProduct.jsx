import React, { useState, useRef, useEffect } from "react";
import "./UploadProduct.css";
import { getCategories, createCategory } from "../../services/categoryService";
import { createProduct } from "../../services/productService";
import { getBrands, createBrand } from "../../services/BrandService";
import InventaryStock from "../Inventary/InventaryStock";

// ─── Constantes ───────────────────────────────────────────────────────────────
const TALLAS_DISPONIBLES = ["S", "M", "L", "XL", "XXL"];
const MAX_IMAGENES = 4;
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dcwyyoe7c/image/upload";
const CLOUDINARY_PRESET = "preset";

// ─── Estado inicial ───────────────────────────────────────────────────────────
const estadoInicial = {
  name: "",
  description: "",
  precioVenta: "",
  categoryIds: [],   // ← ahora es array (multi-categoría)
  brandId: "",
  tallas: [],
  stock: {},
  minStock: {},
  imagenes: [],
};

// ─── Utilidades ───────────────────────────────────────────────────────────────
const revocarURLs = (imagenes) =>
  imagenes.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl));

const subirACloudinary = async (file) => {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", CLOUDINARY_PRESET);
  const res = await fetch(CLOUDINARY_URL, { method: "POST", body: fd });
  if (!res.ok) throw new Error(`Cloudinary error: ${res.status}`);
  const data = await res.json();
  return data.secure_url;
};

// ─── SlotImagen ───────────────────────────────────────────────────────────────
const SlotImagen = ({
  imagen, indice, esPrincipal, onAgregar, onEliminar,
  dragging, onDragOver, onDragLeave, onDrop,
}) => {
  const inputRef = useRef(null);
  const handleClick = () => { if (!imagen) inputRef.current?.click(); };
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onAgregar(indice, file);
    e.target.value = "";
  };

  return (
    <div
      className={[esPrincipal ? "mainPreview" : "thumb", dragging ? "draggingOver" : ""].filter(Boolean).join(" ")}
      onClick={handleClick}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, indice)}
      role="button"
      aria-label={imagen ? `Imagen ${indice + 1}` : `Añadir imagen ${indice + 1}`}
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
    >
      <input ref={inputRef} type="file" accept="image/*" className="hiddenInput"
        onChange={handleFileChange} aria-hidden="true" tabIndex={-1} />
      {imagen ? (
        <>
          <img src={imagen.previewUrl} alt={`Vista ${indice + 1}`}
            className={esPrincipal ? "mainImage" : "thumbImage"}
            style={{ opacity: imagen.uploading ? 0.5 : 1, transition: "opacity 0.3s" }} />
          {imagen.uploading && <div className="uploadingOverlay"><span>Subiendo…</span></div>}
          {!imagen.uploading && imagen.cloudinaryUrl && esPrincipal && (
            <div className="primaryTag">✅ Subida</div>
          )}
          {esPrincipal && !imagen.uploading && (
            <div className="floatingActions">
              <button className="roundBtn" aria-label="Eliminar imagen"
                onClick={(e) => { e.stopPropagation(); onEliminar(indice); }}>✕</button>
            </div>
          )}
          {!esPrincipal && !imagen.uploading && (
            <button className="thumbRemoveBtn" aria-label="Eliminar miniatura"
              onClick={(e) => { e.stopPropagation(); onEliminar(indice); }}>✕</button>
          )}
        </>
      ) : (
        <div className="slotVacio">
          <span className="slotIcon">{esPrincipal ? "🖼️" : "📷"}</span>
          <small>{esPrincipal ? "Arrastra o haz click" : "Añadir vista"}</small>
        </div>
      )}
    </div>
  );
};

// ─── BrandSelector (con creación inline) ─────────────────────────────────────
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
          <select
            name="brandId"
            value={value}
            onChange={onChange}
            disabled={disabled}
            className="selectWithIcon"
          >
            <option value="">— Sin marca —</option>
            {Array.isArray(brands) &&
              brands.map((b) => (
                <option key={b.brandId} value={b.brandId}>{b.name}</option>
              ))}
          </select>
        </div>
        <button
          type="button"
          className={`btnNewCategory ${showNew ? "btnNewCategoryActive" : ""}`}
          onClick={() => { setShowNew((p) => !p); setCreateErr(null); }}
          disabled={disabled}
          title="Crear nueva marca"
        >
          {showNew ? "✕" : "+ Nueva"}
        </button>
      </div>

      {showNew && (
        <div className="newCategoryBox">
          <input
            type="text"
            placeholder="Nombre de la marca…"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            disabled={creating}
            className="newCategoryInput"
            autoFocus
          />
          <button
            type="button"
            className="btnConfirmCategory"
            onClick={handleCreate}
            disabled={creating || !newName.trim()}
          >
            {creating ? "…" : "Guardar"}
          </button>
          {createErr && <span className="createCatError">{createErr}</span>}
        </div>
      )}
    </div>
  );
};

// ─── CategorySelector (multi-selección con creación inline) ──────────────────
const CategorySelector = ({
  categories, selectedIds, onToggle, onCategoryCreated, disabled,
}) => {
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
      onToggle(created.categoryId); // seleccionarla automáticamente
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

      {/* Pills de categorías seleccionadas */}
      {selectedIds.length > 0 && (
        <div className="selectedCategoryPills">
          {selectedIds.map((id) => {
            const cat = categories.find((c) => c.categoryId === id);
            return cat ? (
              <span key={id} className="categoryPill">
                {cat.name}
                <button
                  type="button"
                  className="pillRemove"
                  onClick={() => onToggle(id)}
                  disabled={disabled}
                  aria-label={`Quitar ${cat.name}`}
                >
                  ✕
                </button>
              </span>
            ) : null;
          })}
        </div>
      )}

      <div className="categoryRow">
        <div className="selectWrapper" style={{ flex: 1 }}>
          <span className="selectIcon">◇</span>
          <select
            value=""
            onChange={(e) => { if (e.target.value) onToggle(e.target.value); }}
            disabled={disabled}
            className="selectWithIcon"
          >
            <option value="">— Añadir categoría —</option>
            {categories
              .filter((c) => !selectedIds.includes(c.categoryId))
              .map((c) => (
                <option key={c.categoryId} value={c.categoryId}>{c.name}</option>
              ))}
          </select>
        </div>
        <button
          type="button"
          className={`btnNewCategory ${showNew ? "btnNewCategoryActive" : ""}`}
          onClick={() => { setShowNew((p) => !p); setCreateErr(null); }}
          disabled={disabled}
          title="Crear nueva categoría"
        >
          {showNew ? "✕" : "+ Nueva"}
        </button>
      </div>

      {showNew && (
        <div className="newCategoryBox">
          <input
            type="text"
            placeholder="Nombre de la categoría…"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            disabled={creating}
            className="newCategoryInput"
            autoFocus
          />
          <button
            type="button"
            className="btnConfirmCategory"
            onClick={handleCreate}
            disabled={creating || !newName.trim()}
          >
            {creating ? "…" : "Guardar"}
          </button>
          {createErr && <span className="createCatError">{createErr}</span>}
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
  const [draggingIndice, setDraggingIndice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchMeta = async () => {
      setLoadingMeta(true);
      try {
        const [cats, brnds] = await Promise.all([getCategories(), getBrands()]);
        setCategories(Array.isArray(cats) ? cats : []);
        setBrands(Array.isArray(brnds) ? brnds : []);
      } catch (err) {
        setError("Error al cargar categorías y marcas.");
      } finally {
        setLoadingMeta(false);
      }
    };
    fetchMeta();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProducto((prev) => ({ ...prev, [name]: value }));
  };

  // ── Marca: agregar nueva a la lista local ──
  const handleBrandCreated = (brand) => {
    setBrands((prev) => [...prev, brand]);
  };

  // ── Categoría: agregar nueva a la lista local ──
  const handleCategoryCreated = (cat) => {
    setCategories((prev) => [...prev, cat]);
  };

  // ── Categoría: toggle multi-selección ──
  const handleCategoryToggle = (categoryId) => {
    setProducto((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter((id) => id !== categoryId)
        : [...prev.categoryIds, categoryId],
    }));
  };

  // ── Tallas ──
  const toggleTalla = (talla) => {
    setProducto((prev) => ({
      ...prev,
      tallas: prev.tallas.includes(talla)
        ? prev.tallas.filter((t) => t !== talla)
        : [...prev.tallas, talla],
    }));
  };

  const handleStockChange = (talla, cantidad) =>
    setProducto((prev) => ({ ...prev, stock: { ...prev.stock, [talla]: cantidad } }));

  const handleMinStockChange = (talla, valor) =>
    setProducto((prev) => ({ ...prev, minStock: { ...prev.minStock, [talla]: Number(valor) } }));

  // ── Imágenes ──
  const agregarImagen = async (indice, file) => {
    const previewUrl = URL.createObjectURL(file);
    setProducto((prev) => {
      const nuevas = [...prev.imagenes];
      if (nuevas[indice]?.previewUrl) URL.revokeObjectURL(nuevas[indice].previewUrl);
      nuevas[indice] = { file, previewUrl, cloudinaryUrl: null, uploading: true };
      return { ...prev, imagenes: nuevas };
    });
    try {
      const cloudinaryUrl = await subirACloudinary(file);
      setProducto((prev) => {
        const nuevas = [...prev.imagenes];
        if (nuevas[indice]) nuevas[indice] = { ...nuevas[indice], cloudinaryUrl, uploading: false };
        return { ...prev, imagenes: nuevas };
      });
    } catch {
      setProducto((prev) => {
        const nuevas = [...prev.imagenes];
        if (nuevas[indice]?.previewUrl) URL.revokeObjectURL(nuevas[indice].previewUrl);
        nuevas.splice(indice, 1);
        return { ...prev, imagenes: nuevas };
      });
      setError("Error al subir imagen a Cloudinary. Intenta de nuevo.");
    }
  };

  const eliminarImagen = (indice) => {
    setProducto((prev) => {
      const nuevas = [...prev.imagenes];
      if (nuevas[indice]?.previewUrl) URL.revokeObjectURL(nuevas[indice].previewUrl);
      nuevas.splice(indice, 1);
      return { ...prev, imagenes: nuevas };
    });
  };

  const handleDragOver = (e, indice) => { e.preventDefault(); setDraggingIndice(indice); };
  const handleDragLeave = () => setDraggingIndice(null);
  const handleDrop = (e, indice) => {
    e.preventDefault();
    setDraggingIndice(null);
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith("image/")) agregarImagen(indice, file);
  };

  // ── Submit ──
  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    if (!producto.name.trim()) return setError("El nombre del producto es obligatorio.");
    if (producto.tallas.length === 0) return setError("Selecciona al menos una talla.");
    if (!producto.precioVenta || Number(producto.precioVenta) <= 0)
      return setError("El precio debe ser mayor que 0.");
    if (producto.imagenes.length === 0) return setError("Agrega al menos una imagen.");
    if (producto.imagenes.some((img) => img.uploading))
      return setError("Espera a que terminen de subirse todas las imágenes.");
    if (producto.imagenes.some((img) => !img.cloudinaryUrl))
      return setError("Algunas imágenes no se subieron correctamente.");

    setLoading(true);
    try {
      const imageUrls = producto.imagenes.map((img) => img.cloudinaryUrl);
      const variants = producto.tallas.map((talla) => ({
        sku: `${producto.name.trim().toUpperCase().replace(/\s+/g, "_")}-${talla}`,
        price: Number(producto.precioVenta),
        stock: producto.stock[talla] ?? 0,
        minStock: producto.minStock[talla] ?? 0,
      }));

      await createProduct({
        name: producto.name.trim(),
        description: producto.description ?? "",
        brandId: producto.brandId || null,
        categoryIds: producto.categoryIds,          // ← array completo
        images: imageUrls,
        variants,
      });

      setSuccess("✅ Producto subido correctamente.");
      revocarURLs(producto.imagenes);
      setProducto(estadoInicial);
    } catch (err) {
      setError(err.message ?? "Error al subir el producto.");
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = () => {
    revocarURLs(producto.imagenes);
    setProducto(estadoInicial);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="adminContainer">
      <main className="mainContent">
        <div className="pageTitleRow">
          <h2 className="pageTitle">SUBIR PRODUCTO</h2>
          <div className="topButtons">
            <button className="btnDiscard" onClick={handleEliminar} disabled={loading}>
              ELIMINAR
            </button>
            <button className="btnUpload" onClick={handleSubmit} disabled={loading || loadingMeta}>
              {loading ? "Subiendo..." : "SUBIR PRODUCTO ⇡"}
            </button>
          </div>
        </div>

        {error && <div className="errorMsg">{error}</div>}
        {success && <div className="successMsg">{success}</div>}
        {loadingMeta && <div className="metaLoading">Cargando marcas y categorías…</div>}

        <section className="gridContainer">
          <div className="formColumn">
            <div className="card">
              <h3 className="cardTitle"><span className="iconBlue">✎</span> Información General</h3>

              <div className="inputGroup">
                <label>Nombre producto</label>
                <input type="text" name="name" value={producto.name} onChange={handleChange}
                  placeholder="e.g. NEON_VAPOR HOODIE" disabled={loading} />
              </div>

              <div className="inputGroup">
                <label>Descripción</label>
                <textarea name="description" value={producto.description} onChange={handleChange}
                  placeholder="Especificaciones técnicas y filosofía de diseño..." disabled={loading} />
              </div>

              <div className="row">
                <div className="inputGroup">
                  <label>Precio (COL $)</label>
                  <div className="priceInput">
                    <span>$</span>
                    <input type="number" name="precioVenta" value={producto.precioVenta}
                      onChange={handleChange} placeholder="0" min="0" disabled={loading} />
                  </div>
                </div>

                {/* ─── Marca con creación inline ─── */}
                <BrandSelector
                  brands={brands}
                  value={producto.brandId}
                  onChange={handleChange}
                  onBrandCreated={handleBrandCreated}
                  disabled={loading || loadingMeta}
                />
              </div>

              {/* ─── Categorías multi-selección con creación inline ─── */}
              <CategorySelector
                categories={categories}
                selectedIds={producto.categoryIds}
                onToggle={handleCategoryToggle}
                onCategoryCreated={handleCategoryCreated}
                disabled={loading || loadingMeta}
              />

              <div className="sizeSection">
                <label>Tallas</label>
                <div className="sizeGrid">
                  {TALLAS_DISPONIBLES.map((t) => (
                    <button key={t} type="button" onClick={() => toggleTalla(t)}
                      className={producto.tallas.includes(t) ? "sizeBtnActive" : "sizeBtnU"}
                      disabled={loading}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {producto.tallas.length > 0 && (
                <div className="inputGroup" style={{ marginTop: 16 }}>
                  <label>Stock mínimo por talla</label>
                  <div className="sizeGrid">
                    {producto.tallas.map((t) => (
                      <div key={t} className="minStockItem">
                        <span>{t}</span>
                        <input type="number" min="0" value={producto.minStock[t] ?? 0}
                          onChange={(e) => handleMinStockChange(t, e.target.value)}
                          disabled={loading} style={{ width: 50, marginLeft: 6 }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="card">
              <h3 className="cardTitle"><span className="iconBlue">📋</span> Inventario</h3>
              <InventaryStock tallas={producto.tallas} stock={producto.stock}
                onStockChange={handleStockChange} />
            </div>
          </div>

          <div className="previewColumn">
            <SlotImagen indice={0} esPrincipal imagen={producto.imagenes[0] ?? null}
              onAgregar={agregarImagen} onEliminar={eliminarImagen}
              dragging={draggingIndice === 0} onDragOver={(e) => handleDragOver(e, 0)}
              onDragLeave={handleDragLeave} onDrop={handleDrop} />
            <div className="thumbnailRow">
              {[1, 2, 3].map((idx) => (
                <SlotImagen key={idx} indice={idx} esPrincipal={false}
                  imagen={producto.imagenes[idx] ?? null}
                  onAgregar={agregarImagen} onEliminar={eliminarImagen}
                  dragging={draggingIndice === idx} onDragOver={(e) => handleDragOver(e, idx)}
                  onDragLeave={handleDragLeave} onDrop={handleDrop} />
              ))}
              <div className="thumbCount">
                <span>{producto.imagenes.length}</span>
                <small>/ {MAX_IMAGENES}</small>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default UploadProduct;