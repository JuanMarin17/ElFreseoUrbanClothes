import React from "react";

const StoreCreatedCard = ({ store, styles, components, status, onClick }) => {
  const header = components?.header ?? {
    logo: store?.name ?? "MI TIENDA",
    items: ["HOME", "SHOP"],
    color: styles?.colorTitulo ?? "#fff",
    bg: styles?.headerBg ?? "#000",
    font: styles?.fontTitle ?? "Inter",
    size: 18,
  };
  const img = styles?.bannerImg || "https://via.placeholder.com/150";
  const accentColor = styles?.colorBoton || "#000000";
  const cardBg = styles?.cardBg || "#0f0f0f";
  const cleanFont = (f = "Inter") => {
    const match = typeof f === "string" && f.match(/['"]?([^,'"]+)/);
    return match ? match[1] : f;
  };
  return (
    <div
      className="store-card"
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : undefined, background: cardBg }}
    >
      <div
        style={{
          background: header.bg,
          color: header.color,
          fontFamily: `"${cleanFont(header.font)}", sans-serif`,
          fontWeight: 800,
          boxShadow: `
           0 0 0 3px ${styles.cardBorderColor2 ?? "#ffffff15"},
          ${cardShadow}
           `,
          fontSize: header.size,
          letterSpacing: 2,
          padding: "18px 0 10px 0",
          textAlign: "center",
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          minHeight: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {header.logo}
      </div>
      <div
        className="store-img"
        style={{
          backgroundImage: `url(${img})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: 80,
        }}
      ></div>
      <div className="store-info">
        <h3 style={{ fontFamily: `"${cleanFont(header.font)}", sans-serif` }}>
          {store?.name}
        </h3>
        <p>{store?.subdomain}.freseo.com</p>
        <span className={`status ${status?.toLowerCase()}`}>{status}</span>
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
      </div>
    </div>
  );
};

export default StoreCreatedCard;
