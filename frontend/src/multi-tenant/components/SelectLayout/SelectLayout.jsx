import React, { useState } from "react";
// ``import HeaderMultiTenant from "../HeaderMultiTenant/HeaderMultiTenant.jsx";``
import LayoutSelect from "./LayoutSelect.jsx";
import "../styles/SelectLayout.css";

const SelectLayout = ({ layout, isSelected, onSelect }) => {

  return (
    <div
      className={`layout-card ${isSelected ? "selected" : ""}`}
      onClick={() => onSelect(layout.id)}
      role="radio"
      aria-checked={isSelected}
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect(layout.id)}
    >
      <div className="layout-preview">
        <img src={layout.img} alt={layout.title} />
        <div className="preview-placeholder">
          <div className="cross-line line-1"></div>
          <div className="cross-line line-2"></div>
          <div className="preview-dot"></div>
        </div>
      </div>
      <div className="layout-info">
        <h3 className="layout-title">{layout?.title}</h3>
        <p className="layout-description">{layout?.description}</p>
      </div>

      <div className="radio-container">
        <div className="radio-outer">
          {isSelected && <div className="radio-inner"></div>}
        </div>
      </div>
    </div>
  );
};

export default SelectLayout;
