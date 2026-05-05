import React from "react";
import "./UploadProduct.css";

const UploadProduct = () => {
  return (
    <div className="adminContainer">
      {/* Sidebar */}

      {/* Main Content */}
      <main className="mainContent">

        <div className="pageTitleRow">
          <div>
            <h2 className="pageTitle">SUBIR PRODUCTO</h2>
          </div>
          <div className="topButtons">
            <button className="btnDiscard">ELIMINAR</button>
            <button className="btnUpload">EDITAR PRODUCTO ⇡</button>
          </div>
        </div>

        <section className="gridContainer">
          {/* Form Side */}
          <div className="formColumn">
            <div className="card">
              <h3 className="cardTitle">
                <span className="iconBlue">✎</span> Editar
              </h3>

              <div className="inputGroup">
                <label>Nombre producto</label>
                <input type="text" placeholder="e.g. NEON_VAPOR HOODIE" />
              </div>

              <div className="inputGroup">
                <label>Descripción</label>
                <textarea placeholder="TECHNICAL SPECIFICATIONS AND DESIGN PHILOSOPHY..."></textarea>
              </div>

              <div className="row">
                <div className="inputGroup">
                  <label>Precio (COL)</label>
                  <div className="priceInput">
                    <span>$</span>
                    <input type="text" defaultValue="0.00" />
                  </div>
                </div>
                <div className="inputGroup">
                  <label>Categoria</label>
                  <select>
                    <option>Pantalones</option>
                  </select>
                </div>
              </div>

              <div className="sizeSection">
                <label>Tallas</label>
                <div className="sizeGrid">
                  {["S", "M", "L", "XL", "XXL"].map((size) => (
                    <button
                      key={size}
                      className={size === "M" ? "sizeBtnActive" : "sizeBtnU"}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="cardTitle">
                <span className="iconBlue">📋</span> Inventario
              </h3>
              <div className="statusPlaceholder"></div>
            </div>
          </div>

          {/* Preview Side */}
          <div className="previewColumn">
            <div className="mainPreview">
              <div className="primaryTag">Primera vista</div>
              <div className="imageContainer">
                <div className="mainImagePlaceholder"></div>
                <div className="imageOverlayText">Vista</div>
              </div>
              <div className="floatingActions">
                <button className="roundBtn">🔍</button>
                <button className="roundBtn">✂️</button>
              </div>
            </div>

            <div className="thumbnailRow">
              <div className="thumb thumbActive"></div>
              <div className="thumb"></div>
              <div className="thumb"></div>
              <div className="thumbAdd">
                <span>📷</span>
                <small>Añadir vista</small>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default UploadProduct;
