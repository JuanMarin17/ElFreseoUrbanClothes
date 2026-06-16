import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../pages/useStore";
import { ArrowLeft, ArrowRight } from "lucide-react";
import "../../components/styles/LayoutSelect.css";
import SelectLayout from "./SelectLayout.jsx";
import { Layout1 } from "./Layout1.jsx";
import StepProgress from "../StepProgress";

import layout1 from "../../../assets/Layout/layout1.png";
import layout2 from "../../../assets/Layout/layout2.png";
import layout3 from "../../../assets/Layout/layout3.png";

const layouts = [
  {
    id: "minimalista",
    title: "MINIMALISTA",
    description: "Diseno limpio y elegante, enfocado en el producto.",
    img: layout1,
  },
  {
    id: "urbano",
    title: "URBANO / STREETWEAR",
    description: "Diseno impactante y moderno, ideal para marcas urbanas.",
    img: layout2,
  },
  {
    id: "clasico",
    title: "CLASICO ECOMMERCE",
    description: "Diseno tradicional, enfocado en conversion y catalogo.",
    img: layout3,
  },
];

const LayoutSelect = () => {
  const { state, completeStep, saveProgress } = useStore();
  const navigate = useNavigate();

  const [showPreview, setShowPreview] = useState(false);

  // Lee del contexto: la IA puede actualizarlo y el componente lo refleja al instante
  const selected = state.layout?.id ?? "minimalista";

  // Cuando elige un layout: persiste en contexto y muestra preview
  const handleSelect = (id) => {
    const layoutData = layouts.find((l) => l.id === id);
    saveProgress("layout", layoutData);
    setShowPreview(true);
  };

  const handleBack = () => navigate("/crear-tienda/pagos");

  const handleContinue = () => {
    const layoutData = layouts.find((l) => l.id === selected);
    completeStep(3, layoutData);
    navigate("/customer");
  };

  return (
    <div className="layout-select-page">
      <StepProgress />

      <main className="layout-main-content">

        {/* " VISTA: Seleccion de layout " */}
        {!showPreview && (
          <section className="selection-area">

            <div className="selection-header">
              {/* Flecha atras */}
              <button
                onClick={handleBack}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "inherit",
                  fontSize: "22px",
                  cursor: "pointer",
                  padding: "0",
                }}
                title="Volver al paso anterior"
              ><ArrowLeft size={16} /></button>
              <div>
                <h1>ELEGIR LAYOUT</h1>
                <p>Selecciona la estructura base de tu tienda</p>
              </div>
            </div>

            <div className="options-grid">
              {layouts.map((layout) => (
                <SelectLayout
                  key={layout.id}
                  layout={layout}
                  isSelected={selected === layout.id}
                  onSelect={handleSelect} 
                />
              ))}
            </div>

            <div className="actions">
              <button className="btn-continue" onClick={handleContinue}>
                CONTINUAR
              </button>
            </div>
          </section>
        )}

        {/* " VISTA: Preview del layout elegido " */}
        {showPreview && (
          <section className="preview-area">

            <div className="preview-topbar">
              {/* Volver a la seleccion */}
              <button
                className="btn-back-preview"
                onClick={() => setShowPreview(false)}
              >
                <ArrowLeft size={14} /> Cambiar layout
              </button>

              <span className="preview-label">
                Vista previa:{" "}
                <strong>
                  {layouts.find((l) => l.id === selected)?.title}
                </strong>
              </span>

              <button className="btn-continue-small" onClick={handleContinue}>
                CONFIRMAR Y CONTINUAR <ArrowRight size={14} />
              </button>
            </div>

            {/* Layout1 recibe el id del layout elegido y cambia su estilo */}
            <div className="layout-preview-wrapper">
              <Layout1 layoutType={selected} />
            </div>

          </section>
        )}

      </main>
    </div>
  );
};

export default LayoutSelect;