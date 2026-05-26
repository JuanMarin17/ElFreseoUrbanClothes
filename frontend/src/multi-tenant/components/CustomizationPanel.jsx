
import React, { useState } from "react";
import "../components/styles/CustomatizacionPanel.css";
import { useStore } from "../pages/StoreContext";
import { useNavigate } from "react-router-dom";
import StepProgress from "../components/StepProgress";

const CustomizationPanel = () => {
  const [activeTab, setActiveTab] = useState("colores");
  const { state, completeStep, saveProgress } = useStore();
  const navigate = useNavigate();

  // ✅ Pre-carga lo que el usuario había puesto si regresa a este paso
  const [design, setDesign] = useState(
    state.styles ?? {
      colorBoton: "#3e78ff",
      colorTitulo: "#ffffff",
      colorParrafo: "#7a7a7a",
      textoTitulo: "NEON HOODIE",
      textoCuerpo: "Streetwear essentials designed for the urban landscape.",
      cardBg: "#0f0f0f",
      cardBorderColor1: "#1a1a1a",
      cardBorderColor2: "#3e78ff",
      cardBorderWidth: "2",
      cardRadius: "12",
      cardShadow: "0 10px 30px rgba(0,0,0,0.5)",
      btnRadius: "4",
      btnShadow: "none",
      fontTitle: "Bebas Neue",
      fontBody: "Inter",
    },
  );

  const handleUpdate = (key, value) => {
    setDesign((prev) => ({ ...prev, [key]: value }));
  };

  // ← Guarda lo que lleva y vuelve al paso 3
  const handleBack = () => {
    saveProgress(4, design); // guarda sin marcar como completado
    navigate("/layout");
  };

  // → Guarda y avanza al paso 5
  const handleSave = () => {
    completeStep(4, design); // guarda design directamente como styles
    navigate("/component");
  };

  const dynamicStyles = {
    // ── Solo variables de la tarjeta de preview ──
    // --accent se aplica SOLO en la tarjeta, no aquí
    "--title-color": design.colorTitulo,
    "--text-color": design.colorParrafo,
    "--card-bg": design.cardBg,
    "--card-b1": design.cardBorderColor1,
    "--card-b2": design.cardBorderColor2,
    "--card-w": `${design.cardBorderWidth}px`,
    "--card-r": `${design.cardRadius}px`,
    "--card-sh": design.cardShadow,
    "--btn-r": `${design.btnRadius}px`,
    "--font-h": design.fontTitle,
    "--font-p": design.fontBody,
  };

  // Estilos solo para la tarjeta de preview
  const previewCardStyles = {
    "--accent": design.colorBoton,
  };

  return (
    <div className="admin-layout" style={dynamicStyles}>
      <div className="admin-layout-inner">
        <StepProgress />
        <main className="main-content">
        <header className="top-header">
          {/* ← Vuelve al paso anterior guardando el progreso */}
          <button
            onClick={handleBack}
            className="btn-back-arrow"
            title="Volver"
          >
            ←
          </button>

          <div className="store-name">
            {state.store?.name ?? "EDITOR PROFESIONAL"}
          </div>

          {/* → Guarda y continúa al paso 5 */}
          <button className="btn-save-primary" onClick={handleSave}>
            GUARDAR Y CONTINUAR →
          </button>
        </header>

        <section className="editor-grid">
          <div className="control-panel">
            <div className="tabs-header">
              {["colores", "tarjetas", "botones", "tipografía"].map((tab) => (
                <button
                  key={tab}
                  className={`tab-link ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="controls-container">
              {activeTab === "colores" && (
                <div className="control-group animate-fade">
                  <label className="section-title">PALETA GLOBAL</label>
                  <div className="input-field">
                    <span>Títulos</span>
                    <input
                      type="color"
                      value={design.colorTitulo}
                      onChange={(e) =>
                        handleUpdate("colorTitulo", e.target.value)
                      }
                    />
                  </div>
                  <div className="input-field">
                    <span>Párrafos</span>
                    <input
                      type="color"
                      value={design.colorParrafo}
                      onChange={(e) =>
                        handleUpdate("colorParrafo", e.target.value)
                      }
                    />
                  </div>
                  <div className="input-field">
                    <span>Botón</span>
                    <input
                      type="color"
                      value={design.colorBoton}
                      onChange={(e) =>
                        handleUpdate("colorBoton", e.target.value)
                      }
                    />
                  </div>
                </div>
              )}

              {activeTab === "tarjetas" && (
                <div className="control-group animate-fade">
                  <label className="section-title">
                    BORDES Y SOMBRAS DE CARTA
                  </label>
                  <div className="input-field">
                    <span>Fondo</span>
                    <input
                      type="color"
                      value={design.cardBg}
                      onChange={(e) => handleUpdate("cardBg", e.target.value)}
                    />
                  </div>
                  <div className="dual-input">
                    <div className="input-field">
                      <span>Borde 1</span>
                      <input
                        type="color"
                        value={design.cardBorderColor1}
                        onChange={(e) =>
                          handleUpdate("cardBorderColor1", e.target.value)
                        }
                      />
                    </div>
                    <div className="input-field">
                      <span>Borde 2</span>
                      <input
                        type="color"
                        value={design.cardBorderColor2}
                        onChange={(e) =>
                          handleUpdate("cardBorderColor2", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div className="range-field">
                    <span>Grosor Borde: {design.cardBorderWidth}px</span>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={design.cardBorderWidth}
                      onChange={(e) =>
                        handleUpdate("cardBorderWidth", e.target.value)
                      }
                    />
                  </div>
                  <div className="range-field">
                    <span>Redondeado: {design.cardRadius}px</span>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={design.cardRadius}
                      onChange={(e) =>
                        handleUpdate("cardRadius", e.target.value)
                      }
                    />
                  </div>
                  <div className="select-field">
                    <span>Sombra</span>
                    <select
                      value={design.cardShadow}
                      onChange={(e) =>
                        handleUpdate("cardShadow", e.target.value)
                      }
                    >
                      <option value="none">Sin Sombra</option>
                      <option value="0 10px 30px rgba(0,0,0,0.5)">Suave</option>
                      <option value={`0 0 20px ${design.colorBoton}44`}>
                        Resplandor
                      </option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === "botones" && (
                <div className="control-group animate-fade">
                  <label className="section-title">ESTILO DE BOTONES</label>
                  <div className="range-field">
                    <span>Border Radius: {design.btnRadius}px</span>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      value={design.btnRadius}
                      onChange={(e) =>
                        handleUpdate("btnRadius", e.target.value)
                      }
                    />
                  </div>
                </div>
              )}

              {activeTab === "tipografía" && (
                <div className="control-group animate-fade">
                  <label className="section-title">FUENTES Y CONTENIDO</label>
                  <div className="edit-block">
                    <span>Título producto</span>
                    <input
                      type="text"
                      value={design.textoTitulo}
                      onChange={(e) =>
                        handleUpdate("textoTitulo", e.target.value)
                      }
                    />
                  </div>
                  <div className="edit-block">
                    <span>Descripción producto</span>
                    <input
                      type="text"
                      value={design.textoCuerpo}
                      onChange={(e) =>
                        handleUpdate("textoCuerpo", e.target.value)
                      }
                    />
                  </div>
                  <div className="select-field">
                    <span>Fuente Títulos</span>
                    <select
                      value={design.fontTitle}
                      onChange={(e) =>
                        handleUpdate("fontTitle", e.target.value)
                      }
                    >
                      <option value="'Bebas Neue', sans-serif">
                        Bebas Neue
                      </option>
                      <option value="'Montserrat', sans-serif">
                        Montserrat
                      </option>
                      <option value="'Inter', sans-serif">Inter Bold</option>
                    </select>
                  </div>
                  <div className="select-field">
                    <span>Fuente Cuerpo</span>
                    <select
                      value={design.fontBody}
                      onChange={(e) => handleUpdate("fontBody", e.target.value)}
                    >
                      <option value="'Inter', sans-serif">Inter</option>
                      <option value="'Roboto', sans-serif">Roboto</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* VISTA PREVIA EN VIVO */}
          <div className="preview-panel">
            <div className="product-card-preview" style={previewCardStyles}>
              <div className="card-border-layer">
                <div className="card-content">
                  <div className="img-placeholder">IMAGE</div>
                  <h2 className="preview-title">{design.textoTitulo}</h2>
                  <p className="preview-text">{design.textoCuerpo}</p>
                  <button className="preview-btn-main">COMPRAR</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      </div>
    </div>
  );
};

export default CustomizationPanel;
