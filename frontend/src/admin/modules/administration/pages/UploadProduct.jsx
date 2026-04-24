// SubirProducto.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import "./UploadProduct.css";

const tallasDisponibles = ["S", "M", "L", "XL"];

export default function UploadProduct() {
  const [producto, setProducto] = useState({
    nombre: "",
    descripcion: "",
    stock: 0,
    precioVenta: 0,
    precioDetal: 0,
    imagen: null,
    tallas: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProducto((prev) => ({ ...prev, [name]: value }));
  };

  const handleImage = (file) => {
    if (file) {
      setProducto((prev) => ({
        ...prev,
        imagen: URL.createObjectURL(file),
      }));
    }
  };
  const changePrice = (field, value) => {
    setProducto((prev) => ({
      ...prev,
      [field]: Math.max(0, prev[field] + value),
    }));
  };

  const categorias = [
    { id: 1, name: "Pantalon" },
    { id: 2, name: "Camiseta" },
    { id: 3, name: "Zapatos" },
  ];

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    handleImage(file);
  };
  const handlePriceChange = (e) => {
    const { name, value } = e.target;

    const numero = Number(value);

    setProducto((prev) => ({
      ...prev,
      [name]: numero < 0 ? 0 : numero,
    }));
  };

  const toggleTalla = (talla) => {
    setProducto((prev) => ({
      ...prev,
      tallas: prev.tallas.includes(talla)
        ? prev.tallas.filter((t) => t !== talla)
        : [...prev.tallas, talla],
    }));
  };

  const changeStock = (value) => {
    setProducto((prev) => ({
      ...prev,
      stock: Math.max(0, prev.stock + value),
    }));
  };

  return (
    <div className="container">
      <motion.h1 className="title">SUBIR PRODUCTO</motion.h1>

      <div className="layout">
        {/* FORM */}
        <div className="form">
          <label>Nombre del Producto</label>
          <input
            name="nombre"
            value={producto.nombre}
            onChange={handleChange}
            placeholder="Proyecto Neón..."
            className="input"
          />

          {/* STOCK SEPARADO */}
          <div className="stock-wrapper">
            <label>Cantidad</label>
            <div className="stock-control">
              <button onClick={() => changeStock(-1)}>-</button>
              <span>{producto.stock}</span>
              <button onClick={() => changeStock(1)}>+</button>
            </div>
          </div>

          <div className="row">
            {/* PRECIO VENTA */}
            <div className="price-box">
              <label>Precio Venta</label>
              <div className="price-control">
                <button onClick={() => changePrice("precioVenta", -1)}>
                  -
                </button>
                <input
                  type="number"
                  name="precioVenta"
                  value={producto.precioVenta}
                  onChange={handlePriceChange}
                  min="0"
                  className="input"
                />

                <button onClick={() => changePrice("precioVenta", 1)}>+</button>
              </div>
            </div>

            {/* PRECIO DETAL */}
            <div className="price-box">
              <label>Precio Detal</label>
              <div className="price-control">
                <button onClick={() => changePrice("precioDetal", -1)}>
                  -
                </button>
                <input
                  type="number"
                  name="precioDetal"
                  value={producto.precioDetal}
                  onChange={handlePriceChange}
                />
                <button onClick={() => changePrice("precioDetal", 1)}>+</button>
              </div>
            </div>
          </div>

          <label>Descripción</label>
          <textarea
            name="descripcion"
            onChange={handleChange}
            placeholder="Escribe los detalles aquí..."
            className="input textarea"
          />
          <label>Categorias</label>
          <div className="categorias">
            <select name="categorias" id="categorias">
              {categorias.map((c) => {
                return (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="tallas">
            <label>Tallas</label>
            {tallasDisponibles.map((t) => (
              <button
                key={t}
                onClick={() => toggleTalla(t)}
                className={
                  producto.tallas.includes(t) ? "talla active" : "talla"
                }
              >
                {t}
              </button>
            ))}
          </div>

          {/* DROPZONE ARREGLADO */}
          <div
            className="dropzone"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <p>Arrastra o haz click para subir imagen</p>
            <input
              type="file"
              onChange={(e) => handleImage(e.target.files[0])}
            />
          </div>

          <button className="submit">PUBLICAR</button>
        </div>

        {/* PREVIEW + ESPACIO IA */}
        <div className="side-panel">
          <div className="preview">
            {producto.imagen ? (
              <img src={producto.imagen} alt="preview" />
            ) : (
              <span>Sin previsualización</span>
            )}
          </div>

          <div className="ai-box">
            <p>🤖 Sugerencias IA aparecerán aquí...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
