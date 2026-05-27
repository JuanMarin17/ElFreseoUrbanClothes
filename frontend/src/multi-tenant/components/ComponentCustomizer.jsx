/**
 * ComponentCustomizer.jsx
 *
 * Paso 5 – Componentes (header, banner, footer)
 * Path: /component
 *
 * ✅ image del banner es string (URL Cloudinary) — compatible con BannerSettingsDTO
 * ✅ addBannerImage sin duplicados, sube a Cloudinary y guarda secure_url
 * ✅ handleBack guarda con saveProgress(5) y vuelve a /customer
 * ✅ handleSave guarda con completeStep(5) y navega a /widgets
 * ✅ Pre-carga state.components al montar
 */

import React, { useState } from "react";
import "../components/styles/ComponentCustomizer.css";
import { useStore } from "../pages/StoreContext";
import { useNavigate } from "react-router-dom";
import StepProgress from "./StepProgress";

const ComponentCustomizer = () => {
  const [activeComponent, setActiveComponent] = useState("BANNER");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { state, completeStep, saveProgress, saveDraft } = useStore();

  const navigate = useNavigate();

  const styles = state.styles ?? {};
  const layout = state.layout ?? {};

  // ✅ Pre-carga lo que el usuario había puesto si regresa a este paso
  const [design, setDesign] = useState(
    state.components ?? {
      header: {
        logo: state.store?.name ?? "FRESEO",
        items: ["HOME", "SHOP"],
        font: "Inter",
        size: 16,
        color: "#ffffff",
        bg: "#000000",
      },
      banner: {
        title: state.styles?.textoTitulo ?? "NEON VAPOR",
        font: "Bebas Neue",
        size: 60,
        color: "#ffffff",
        bg: "#111111",
        image: "", // ✅ string simple — igual que BannerSettingsDTO
      },
      footer: {
        text: `© ${state.store?.name ?? "Mi Tienda"} 2026`,
        font: "Montserrat",
        size: 14,
        color: "#888888",
        bg: "#080808",
      },
    },
  );

  const cleanFont = (f = "Inter") => {
    const match = f.match(/['"]([^'"]+)['"]/);
    return match ? match[1] : f;
  };

  // Colores de borde para gradiente
  const cardBorder1 = styles.cardBorderColor1 ?? "#8b3cf7";
  const cardBorder2 = styles.cardBorderColor2 ?? "#f5c842";
  const cardBorderW = `${styles.cardBorderWidth ?? 3}px`;
  const cardBg = styles.cardBg ?? "#0f0f0f";
  const cardRadius = `${styles.cardRadius ?? 16}px`;
  const cardShadow =
    styles.cardShadow ??
    "0 8px 32px 0 rgba(139,60,247,0.18), 0 1.5px 8px 0 rgba(245,200,66,0.10)";

  const btnRadius = `${styles.btnRadius ?? 4}px`;

  const fontTitle = cleanFont(styles.fontTitle ?? "Bebas Neue");
  const fontBody = cleanFont(styles.fontBody ?? "Inter");

  const productoDesc = styles.textoCuerpo ?? "Streetwear essentials.";

  const layoutClass = layout.id ?? "minimalista";

  const accentColor = styles.colorBoton ?? "#8b3cf7";
  const titleColor =
    layoutClass === "urbano"
      ? "#ffffff"
      : layoutClass === "clasico"
        ? "#1a1a1a"
        : styles.colorTitulo ?? "#ffffff";
  const paraColor =
    layoutClass === "urbano"
      ? "#cccccc"
      : layoutClass === "clasico"
        ? "#444444"
        : styles.colorCuerpo ?? "#aaaaaa";

  const updateSection = (field, value) => {
    setDesign((prev) => ({
      ...prev,
      [activeComponent.toLowerCase()]: {
        ...prev[activeComponent.toLowerCase()],
        [field]: value,
      },
    }));
  };

  const updateHeaderItem = (index, value) => {
    const newItems = [...design.header.items];
    newItems[index] = value;
    updateSection("items", newItems);
  };

  // ✅ Una sola función, limpia — sube a Cloudinary y guarda URL como string
  const addBannerImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "preset"); // ⚠️ CAMBIAR

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dcwyyoe7c/image/upload", // ⚠️ CAMBIAR
        { method: "POST", body: formData },
      );
      const data = await res.json();
      // ✅ Guarda solo la URL como string — compatible con BannerSettingsDTO.image
      updateSection("image", data.secure_url);
    } catch (error) {
      console.error("Error subiendo imagen a Cloudinary:", error);
    }
  };

  const getStyle = (comp) => ({
    fontFamily: `"${comp.font}", sans-serif`,
    fontSize: `${comp.size}px`,
    color: comp.color,
    backgroundColor: comp.bg,
    transition: "0.3s ease",
  });

  // ← Guarda en memoria (no localStorage) y vuelve al paso anterior
  const handleBack = () => {
    saveDraft("components", design);
    navigate("/customer");
  };

  // ✓ Guarda y navega al siguiente paso
  const handleSave = () => {
    completeStep(5, design);
    navigate("/widgets");
  };

  return (
    <div className={`admin-frame ${isFullscreen ? "mode-full" : ""}`}>
      {!isFullscreen && (
        <>
          <header className="admin-nav">
            <button
              onClick={handleBack}
              className="btn-back-arrow"
              title="Volver"
            >
              ←
            </button>

            <div className="brand">
              {state.store?.name ?? "EL FRESEO"} <span>STUDIO V3</span>
            </div>

            <button className="btn-save-top" onClick={handleSave}>
              SIGUIENTE →
            </button>
          </header>
          <StepProgress />
        </>
      )}

      <main className="editor-grid">
        {!isFullscreen && (
          <aside className="control-panel">
            <div className="card-editor">
              <div className="card-header-flex">
                <p className="label-mini">CONFIGURANDO {activeComponent}</p>
                <button
                  className="btn-view-trigger"
                  onClick={() => setIsFullscreen(true)}
                >
                  VISTA FINAL
                </button>
              </div>

              <div className="comp-nav-bottom">
                {["HEADER", "BANNER", "FOOTER"].map((c) => (
                  <button
                    key={c}
                    className={activeComponent === c ? "active" : ""}
                    onClick={() => setActiveComponent(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <div className="scroll-fields-container">
                {/* 1. TEXTO PRINCIPAL */}
                <div className="field-group">
                  <label>Texto Principal</label>
                  <input
                    type="text"
                    className="f-input-dark"
                    value={
                      activeComponent === "HEADER"
                        ? design.header.logo
                        : activeComponent === "BANNER"
                          ? design.banner.title
                          : design.footer.text
                    }
                    onChange={(e) =>
                      updateSection(
                        activeComponent === "HEADER"
                          ? "logo"
                          : activeComponent === "BANNER"
                            ? "title"
                            : "text",
                        e.target.value,
                      )
                    }
                  />
                </div>

                {/* 2. ITEMS DEL MENÚ — solo en HEADER */}
                {activeComponent === "HEADER" && (
                  <div className="field-group">
                    <label>Items del Menú</label>
                    <div className="links-manager">
                      {design.header.items.map((item, index) => (
                        <div key={index} className="link-row">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) =>
                              updateHeaderItem(index, e.target.value)
                            }
                            className="f-input-mini"
                          />
                          <button
                            className="btn-del-link"
                            onClick={() =>
                              updateSection(
                                "items",
                                design.header.items.filter(
                                  (_, i) => i !== index,
                                ),
                              )
                            }
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        className="btn-add-link"
                        onClick={() =>
                          updateSection("items", [
                            ...design.header.items,
                            "NUEVO",
                          ])
                        }
                      >
                        + Añadir
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. IMAGEN DEL BANNER — solo en BANNER */}
                {activeComponent === "BANNER" && (
                  <div className="field-group">
                    <label>Imagen del Banner</label>
                    <input
                      type="file"
                      id="banner-up"
                      hidden
                      accept="image/*"
                      onChange={addBannerImage}
                    />
                    <label htmlFor="banner-up" className="btn-add-media">
                      + Cargar Imagen
                    </label>

                    {/* Vista previa de la imagen activa */}
                    {design.banner.image && (
                      <div className="img-control-card">
                        <div className="img-control-header">
                          <span>Imagen activa</span>
                          <button
                            onClick={() => updateSection("image", "")}
                          >
                            Eliminar
                          </button>
                        </div>
                        <img
                          src={design.banner.image}
                          alt="banner preview"
                          style={{
                            width: "100%",
                            borderRadius: 8,
                            marginTop: 8,
                            objectFit: "cover",
                            maxHeight: 160,
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* 4. TIPOGRAFÍA */}
                <div className="field-group">
                  <label>Fuente</label>
                  <div className="font-grid-mini">
                    {[
                      "Inter",
                      "Bebas Neue",
                      "Syncopate",
                      "Oswald",
                      "Dancing Script",
                    ].map((f) => (
                      <button
                        key={f}
                        className={`f-tag ${
                          design[activeComponent.toLowerCase()].font === f
                            ? "active"
                            : ""
                        }`}
                        onClick={() => updateSection("font", f)}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. COLORES DE TEXTO Y FONDO */}
                <div className="field-group">
                  <label>Paleta de Colores</label>
                  <div className="color-row">
                    <div className="color-pick">
                      <input
                        type="color"
                        value={design[activeComponent.toLowerCase()].color}
                        onChange={(e) => updateSection("color", e.target.value)}
                      />
                      <span>Texto</span>
                    </div>
                    <div className="color-pick">
                      <input
                        type="color"
                        value={design[activeComponent.toLowerCase()].bg}
                        onChange={(e) => updateSection("bg", e.target.value)}
                      />
                      <span>Fondo</span>
                    </div>
                  </div>
                </div>

                {/* 5.1. COLORES DE BORDE DE LA CARTA */}
                <div className="field-group">
                  <label>Colores del borde de la carta</label>
                  <div className="color-row">
                    <div className="color-pick">
                      <input
                        type="color"
                        value={styles.cardBorderColor1 ?? "#8b3cf7"}
                        onChange={(e) =>
                          saveProgress(
                            5,
                            { ...state.components },
                            { ...styles, cardBorderColor1: e.target.value },
                          )
                        }
                      />
                      <span>Borde 1</span>
                    </div>
                    <div className="color-pick">
                      <input
                        type="color"
                        value={styles.cardBorderColor2 ?? "#f5c842"}
                        onChange={(e) =>
                          saveProgress(
                            5,
                            { ...state.components },
                            { ...styles, cardBorderColor2: e.target.value },
                          )
                        }
                      />
                      <span>Borde 2</span>
                    </div>
                  </div>
                  <small>
                    Si solo eliges un color, el borde será sólido. Si eliges
                    dos, será gradiente.
                  </small>
                </div>

                {/* 6. TAMAÑO DE FUENTE */}
                <div className="field-group">
                  <label>
                    Tamaño:{" "}
                    <span>{design[activeComponent.toLowerCase()].size}px</span>
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="150"
                    value={design[activeComponent.toLowerCase()].size}
                    onChange={(e) => updateSection("size", e.target.value)}
                    className="f-range"
                  />
                </div>
              </div>
            </div>
          </aside>
        )}

        <section
          className={`viewport-area ${isFullscreen ? "fullscreen" : ""}`}
        >
          {isFullscreen && (
            <button
              className="btn-exit-full"
              onClick={() => setIsFullscreen(false)}
            >
              VOLVER ×
            </button>
          )}

          <div className={`store-preview ${layoutClass}`}>
            {/* ── HEADER ── */}
            <header
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 32px",
                backgroundColor: design.header.bg,
                color: design.header.color,
                fontFamily: `"${cleanFont(design.header.font)}", sans-serif`,
                fontSize: `${design.header.size}px`,
              }}
            >
              <div style={{ fontWeight: 800, letterSpacing: "3px" }}>
                {design.header.logo}
              </div>

              <nav style={{ display: "flex", gap: "24px" }}>
                {design.header.items.map((it, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: "12px",
                      opacity: 0.85,
                      letterSpacing: "2px",
                    }}
                  >
                    {it}
                  </span>
                ))}
              </nav>

              <button
                style={{
                  background: accentColor,
                  border: "none",
                  color: "#fff",
                  padding: "8px 18px",
                  borderRadius: btnRadius,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                CARRITO
              </button>
            </header>

            {/* ── BANNER ── */}
            <section
              style={{
                backgroundColor: design.banner.bg,
                // ✅ Usa design.banner.image (string) directamente
                backgroundImage: design.banner.image
                  ? `linear-gradient(rgba(0,0,0,0.45),rgba(0,0,0,0.45)),url(${design.banner.image})`
                  : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
                minHeight: "340px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "80px 40px",
                textAlign: "center",
                gap: "20px",
              }}
            >
              <h1
                style={{
                  fontFamily: `"${cleanFont(design.banner.font)}", sans-serif`,
                  fontSize: `clamp(2rem, 5vw, ${design.banner.size}px)`,
                  color: design.banner.color,
                  margin: 0,
                  lineHeight: 1,
                }}
              >
                {design.banner.title}
              </h1>

              <p
                style={{
                  color: paraColor,
                  fontFamily: `"${fontBody}", sans-serif`,
                  letterSpacing: "2px",
                  fontSize: "14px",
                  maxWidth: "500px",
                }}
              >
                {productoDesc}
              </p>

              <button
                style={{
                  background: accentColor,
                  border: "none",
                  color: "#fff",
                  padding: "14px 40px",
                  borderRadius: btnRadius,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                COMPRAR AHORA
              </button>
            </section>

            {/* ── CATÁLOGO ── */}
            <section
              style={{
                padding: "48px 40px",
                backgroundColor:
                  layoutClass === "minimalista"
                    ? "#f8f8f8"
                    : layoutClass === "clasico"
                      ? "#e8eaed"
                      : "#0a0a0a",
              }}
            >
              <h2
                style={{
                  fontFamily: `"${fontTitle}", sans-serif`,
                  fontSize: "13px",
                  letterSpacing: "4px",
                  color: layoutClass === "urbano" ? "#555" : titleColor,
                  marginBottom: "28px",
                }}
              >
                CATÁLOGO
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "20px",
                }}
              >
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    style={{
                      background: `linear-gradient(135deg, ${cardBorder1}, ${cardBorder2})`,
                      padding: cardBorderW,
                      borderRadius: cardRadius,
                      boxShadow: cardShadow,
                      transition: "0.3s",
                    }}
                  >
                    <div
                      style={{
                        background: cardBg,
                        borderRadius: `calc(${cardRadius} - ${cardBorderW})`,
                        overflow: "hidden",
                        height: "100%",
                      }}
                    >
                      <div
                        style={{
                          height: "180px",
                          background: `${accentColor}22`,
                        }}
                      />

                      <div style={{ padding: "16px" }}>
                        <h3
                          style={{
                            color: titleColor,
                            fontFamily: `"${fontTitle}", sans-serif`,
                          }}
                        >
                          {design.banner.title}
                        </h3>

                        <p
                          style={{
                            color: paraColor,
                            fontSize: "13px",
                            lineHeight: 1.5,
                          }}
                        >
                          {productoDesc}
                        </p>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginTop: "14px",
                          }}
                        >
                          <span style={{ color: accentColor, fontWeight: 700 }}>
                            $120.00
                          </span>

                          <button
                            style={{
                              background: accentColor,
                              border: "none",
                              color: "#fff",
                              padding: "8px 16px",
                              borderRadius: btnRadius,
                              cursor: "pointer",
                            }}
                          >
                            COMPRAR
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── FOOTER ── */}
            <footer
              style={{
                backgroundColor: design.footer.bg,
                color: design.footer.color,
                fontFamily: `"${cleanFont(design.footer.font)}", sans-serif`,
                fontSize: `${design.footer.size}px`,
                padding: "28px 40px",
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "20px",
              }}
            >
              <p>{design.footer.text}</p>
            </footer>
          </div>

          {/* Botones flotantes en modo fullscreen */}
          {isFullscreen && (
            <div
              style={{
                position: "fixed",
                bottom: "24px",
                right: "24px",
                display: "flex",
                gap: "10px",
              }}
            >
              <button
                onClick={handleBack}
                style={{
                  background: "#1a1a1a",
                  border: "1px solid #555",
                  color: "#aaa",
                  padding: "10px 18px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "18px",
                }}
                title="Volver"
              >
                ←
              </button>
              <button
                className="btn-save-top"
                onClick={handleSave}
                style={{ padding: "10px 24px" }}
              >
                SIGUIENTE →
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default ComponentCustomizer;