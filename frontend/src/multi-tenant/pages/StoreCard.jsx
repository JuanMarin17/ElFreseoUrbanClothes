// frontend/multi-tenant/components/StoreCard.jsx
import React from "react";

const StoreCard = ({ name, url, status, img, accentColor, onClick }) => (
  <div
    className="store-card"
    onClick={onClick}
    style={{ cursor: onClick ? "pointer" : undefined }}
  >
    <div className="store-img" style={{ backgroundImage: `url(${img})` }}></div>
    <div className="store-info">
      <h3>{name}</h3>
      <p>{url}</p>
      <span className={`status ${status?.toLowerCase()}`}>{status}</span>
      {accentColor && (
        <span
          style={{
            display: "block",
            marginTop: 8,
            width: 24,
            height: 4,
            background: accentColor,
                        borderRadius: 2,
                        
            
          }}
        />
      )}
    </div>
  </div>
);

export default StoreCard;
