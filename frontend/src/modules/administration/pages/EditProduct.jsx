// SubirProducto.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import "./EditProduct.css";

const tallasDisponibles = ["S", "M", "L", "XL"];

export default function SubirProducto() {
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

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleImage(file);
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
      <motion.h1
        className="title"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        SUBIR PRODUCTO
      </motion.h1>

      <div className="layout">
        {/* FORM */}
        <motion.div
          className="form"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <label>Nombre del Producto</label>
          <input
            name="nombre"
            value={producto.nombre}
            onChange={handleChange}
            placeholder="Proyecto Neón..."
          />

          <div className="row">
            <div className="stock-box">
              <label>Cantidad</label>
              <div className="stock-control">
                <button onClick={() => changeStock(-1)}>-</button>
                <span>{producto.stock}</span>
                <button onClick={() => changeStock(1)}>+</button>
              </div>
            </div>

            <div>
              <label>Precio Venta</label>
              <input
                type="number"
                name="precioVenta"
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Precio Detal</label>
              <input
                type="number"
                name="precioDetal"
                onChange={handleChange}
              />
            </div>
          </div>

          <label>Descripción</label>
          <textarea
            name="descripcion"
            onChange={handleChange}
            placeholder="Escribe los detalles aquí..."
          />

          <label>Tallas</label>
          <div className="tallas">
            {tallasDisponibles.map((t) => (
              <motion.button
                key={t}
                onClick={() => toggleTalla(t)}
                className={
                  producto.tallas.includes(t) ? "talla active" : "talla"
                }
                whileTap={{ scale: 0.9 }}
              >
                {t}
              </motion.button>
            ))}
          </div>

          <div
            className="dropzone"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <p>Arrastra o selecciona imagen</p>
            <input
              type="file"
              onChange={(e) => handleImage(e.target.files[0])}
            />
          </div>

          <motion.button
            className="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            PUBLICAR
          </motion.button>
        </motion.div>

        {/* PREVIEW */}
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

