import React, { useState } from "react";
import SelectLayout from "./SelectLayout.jsx";

// Ejemplo de layouts disponibles
const layouts = [
  {
    id: 1,
    img: "https://placehold.co/200x120?text=Layout+1",
    title: "Layout Moderno",
    description: "Un diseño moderno y limpio para tu tienda.",
  },
  {
    id: 2,
    img: "https://placehold.co/200x120?text=Layout+2",
    title: "Layout Clásico",
    description: "Un diseño clásico y elegante para tu tienda.",
  },
  {
    id: 3,
    img: "https://placehold.co/200x120?text=Layout+3",
    title: "Layout Minimalista",
    description: "Un diseño minimalista y funcional.",
  },
];

const SelectLayoutStep = ({ selectedLayout, setSelectedLayout }) => {
  const [selected, setSelected] = useState(selectedLayout || null);

  const handleSelect = (id) => {
    setSelected(id);
    if (setSelectedLayout) setSelectedLayout(id);
  };

  return (
    <div>
      <h2>Selecciona un layout para tu tienda</h2>
      <div style={{ display: "flex", gap: 24 }}>
        {layouts.map((layout) => (
          <SelectLayout
            key={layout.id}
            layout={layout}
            isSelected={selected === layout.id}
            onSelect={handleSelect}
          />
        ))}
      </div>
      {selected && (
        <p style={{ marginTop: 16 }}>
          Seleccionado: {layouts.find((l) => l.id === selected)?.title}
        </p>
      )}
    </div>
  );
};

export default SelectLayoutStep;
