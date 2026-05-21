// EditProduct.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./EditProduct.css";

const API_BASE = "http://localhost:8084";
const tallasDisponibles = ["S", "M", "L", "XL", "XXL"];

/**
 * Props:
 *   productId  – ID del producto a editar (string/number).
 *                Si no se pasa, el componente actúa como "crear nuevo producto".
 *   onSuccess  – callback opcional que se ejecuta tras guardar exitosamente.
 */
export default function EditProduct({ productId, onSuccess }) {
  const [producto, setProducto] = useState({
    nombre: "",
    descripcion: "",
    stock: 0,
    precioVenta: 0,
    precioDetal: 0,
    imagen: null,        // URL previsualización (ObjectURL o URL remota)
    imagenFile: null,    // File real para subir
    tallas: [],
    categoria: "",
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // ─── Cargar producto existente si se pasa productId ───────────────────────
  useEffect(() => {
    if (!productId) return;

    const fetchProducto = async () => {
      setFetching(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/products/${productId}`, {
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) throw new Error(`Error al cargar producto (${res.status})`);

        const data = await res.json();

        setProducto({
          nombre:      data.nombre      ?? data.name        ?? "",
          descripcion: data.descripcion ?? data.description ?? "",
          stock:       data.stock       ?? 0,
          precioVenta: data.precioVenta ?? data.salePrice   ?? 0,
          precioDetal: data.precioDetal ?? data.retailPrice ?? 0,
          tallas:      data.tallas      ?? data.sizes       ?? [],
          categoria:   data.categoria   ?? data.category    ?? "",
          imagen:      data.imagenUrl   ?? data.imageUrl    ?? null,
          imagenFile:  null,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setFetching(false);
      }
    };

    fetchProducto();
  }, [productId]);

  // ─── Handlers de formulario ────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProducto((prev) => ({ ...prev, [name]: value }));
  };

  const handleImage = (file) => {
    if (!file) return;
    setProducto((prev) => ({
      ...prev,
      imagen: URL.createObjectURL(file),
      imagenFile: file,
    }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleImage(e.dataTransfer.files[0]);
  };

  const toggleTalla = (talla) => {
    setProducto((prev) => ({
      ...prev,
      tallas: prev.tallas.includes(talla)
        ? prev.tallas.filter((t) => t !== talla)
        : [...prev.tallas, talla],
    }));
  };

  const changeStock = (delta) => {
    setProducto((prev) => ({
      ...prev,
      stock: Math.max(0, prev.stock + delta),
    }));
  };

  // ─── Submit: PUT (editar) o POST (crear) ──────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      // Si hay imagen nueva, usamos multipart/form-data; si no, JSON plano.
      let body;
      let headers = {};

      const payload = {
        nombre:      producto.nombre,
        descripcion: producto.descripcion,
        stock:       Number(producto.stock),
        precioVenta: Number(producto.precioVenta),
        precioDetal: Number(producto.precioDetal),
        tallas:      producto.tallas,
        categoria:   producto.categoria,
      };

      if (producto.imagenFile) {
        const fd = new FormData();
        fd.append("imagen", producto.imagenFile);
        // Adjuntamos el resto de campos como JSON en un campo "data"
        fd.append("data", JSON.stringify(payload));
        body = fd;
        // No poner Content-Type manualmente: el browser agrega el boundary
      } else {
        body = JSON.stringify(payload);
        headers["Content-Type"] = "application/json";
      }

      const url = productId
        ? `${API_BASE}/products/${productId}`
        : `${API_BASE}/products`;

      const method = productId ? "PUT" : "POST";

      const res = await fetch(url, { method, headers, body });

      if (!res.ok) {
        const errData = await res.text();
        throw new Error(errData || `Error del servidor (${res.status})`);
      }

      const saved = await res.json();
      setSuccessMsg(
        productId ? "✅ Producto actualizado correctamente." : "✅ Producto creado correctamente."
      );
      onSuccess?.(saved);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  if (fetching) {
    return (
      <div className="container">
        <p style={{ color: "#94a3b8", textAlign: "center", marginTop: 40 }}>
          Cargando producto…
        </p>
      </div>
    );
  }

  return (
    <div className="container">
      <motion.h1
        className="title"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {productId ? "EDITAR PRODUCTO" : "SUBIR PRODUCTO"}
      </motion.h1>

      {/* Mensajes globales */}
      {error && (
        <div
          style={{
            background: "#7f1d1d",
            border: "1px solid #ef4444",
            color: "#fca5a5",
            borderRadius: 8,
            padding: "10px 16px",
            marginBottom: 16,
          }}
        >
          ⚠️ {error}
        </div>
      )}
      {successMsg && (
        <div
          style={{
            background: "#14532d",
            border: "1px solid #22c55e",
            color: "#86efac",
            borderRadius: 8,
            padding: "10px 16px",
            marginBottom: 16,
          }}
        >
          {successMsg}
        </div>
      )}

      <div className="layout">
        {/* ── FORMULARIO ── */}
        <motion.form
          className="form"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          onSubmit={handleSubmit}
        >
          <label>Nombre del Producto</label>
          <input
            name="nombre"
            value={producto.nombre}
            onChange={handleChange}
            placeholder="Proyecto Neón…"
            required
          />

          <div className="row">
            {/* Stock */}
            <div className="stock-box">
              <label>Cantidad</label>
              <div className="stock-control">
                <button type="button" onClick={() => changeStock(-1)}>-</button>
                <span>{producto.stock}</span>
                <button type="button" onClick={() => changeStock(1)}>+</button>
              </div>
            </div>

            {/* Precio Venta */}
            <div>
              <label>Precio Venta</label>
              <input
                type="number"
                name="precioVenta"
                value={producto.precioVenta}
                onChange={handleChange}
                min="0"
              />
            </div>

            {/* Precio Detal */}
            <div>
              <label>Precio Detal</label>
              <input
                type="number"
                name="precioDetal"
                value={producto.precioDetal}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>

          <label>Categoría</label>
          <input
            name="categoria"
            value={producto.categoria}
            onChange={handleChange}
            placeholder="Ej. Hoodies, Pantalones…"
          />

          <label>Descripción</label>
          <textarea
            name="descripcion"
            value={producto.descripcion}
            onChange={handleChange}
            placeholder="Escribe los detalles aquí…"
          />

          <label>Tallas</label>
          <div className="tallas">
            {tallasDisponibles.map((t) => (
              <motion.button
                key={t}
                type="button"
                onClick={() => toggleTalla(t)}
                className={producto.tallas.includes(t) ? "talla active" : "talla"}
                whileTap={{ scale: 0.9 }}
              >
                {t}
              </motion.button>
            ))}
          </div>

          {/* Dropzone */}
          <div
            className="dropzone"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <p>Arrastra o selecciona imagen</p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImage(e.target.files[0])}
            />
          </div>

          <motion.button
            type="submit"
            className="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
            style={{ opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "GUARDANDO…" : productId ? "ACTUALIZAR" : "PUBLICAR"}
          </motion.button>
        </motion.form>

        {/* ── PREVIEW ── */}
        <motion.div
          className="preview"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {producto.imagen ? (
            <motion.img
              src={producto.imagen}
              alt="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
          ) : (
            <span>Sin previsualización</span>
          )}
        </motion.div>
      </div>
    </div>
  );
}