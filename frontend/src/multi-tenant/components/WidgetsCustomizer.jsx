import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import "./styles/WidgetsCustomizer.css";
import { useStore } from "../pages/useStore";
import { useNavigate } from "react-router-dom";
import StepProgress from "./StepProgress";

const FONTS = ["Inter", "Bebas Neue", "Oswald", "Montserrat", "Syncopate"];

const WidgetsCustomizer = () => {
  const [activeWidget, setActiveWidget] = useState("SIDEBAR");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { state, completeStep, saveProgress } = useStore();
  const navigate = useNavigate();

  const [design, setDesign] = useState(
    state.widgets ?? {
      sidebar: {
        visible: true,
        bg: "#0d1520",
        color: "#d0dde8",
        font: "Inter",
        width: 240,
        items: ["Inicio", "Productos", "Categorias", "Ofertas", "Contacto"],
        borderColor: "#1a2535",
        borderWidth: 1,
        radius: 0,
      },
      searchbar: {
        visible: true,
        bg: "#060a10",
        color: "#d0dde8",
        placeholderColor: "#3a5a7a",
        font: "Inter",
        borderColor: "#1a2535",
        borderWidth: 1,
        radius: 8,
        placeholder: "Buscar productos...",
        showIcon: true,
        iconColor: "#3e78ff",
      },
    }
  );

  const updateWidget = (widget, field, value) => {
    setDesign((prev) => ({
      ...prev,
      [widget.toLowerCase()]: {
        ...prev[widget.toLowerCase()],
        [field]: value,
      },
    }));
  };

  const updateSidebarItem = (index, value) => {
    const newItems = [...design.sidebar.items];
    newItems[index] = value;
    updateWidget("sidebar", "items", newItems);
  };

  const addSidebarItem = () => {
    updateWidget("sidebar", "items", [...design.sidebar.items, "Nuevo"]);
  };

  const removeSidebarItem = (index) => {
    updateWidget("sidebar", "items", design.sidebar.items.filter((_, i) => i !== index));
  };

  //  Vuelve al paso anterior
  const handleBack = () => {
    saveProgress("widgets", design);
    navigate("/component");
  };

  // " Guarda y avanza a crear tienda
  const handleFinish = () => {
    completeStep("widgets", design);
    navigate("/cms");
  };

  const sb = design.sidebar;
  const srch = design.searchbar;
  const styles = state.styles ?? {};
  const accentColor = styles.colorBoton ?? "#3e78ff";

  return (
    <div className={`admin-frame ${isFullscreen ? "mode-full" : ""}`}>
      {!isFullscreen && (
        <>
          <header className="admin-nav">
            <button onClick={handleBack} className="btn-back-arrow" title="Volver">
              <ArrowLeft size={16} />
            </button>
            <div className="brand">
              {state.store?.name ?? "EL vexio"} <span>WIDGETS</span>
            </div>
            <button className="btn-save-top" onClick={handleFinish}>
              SIGUIENTE <ArrowRight size={14} />
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
                <p className="label-mini">CONFIGURANDO {activeWidget}</p>
                <button className="btn-view-trigger" onClick={() => setIsFullscreen(true)}>
                  VISTA FINAL
                </button>
              </div>

              <div className="comp-nav-bottom">
                {["SIDEBAR", "BUSCADOR"].map((w) => (
                  <button
                    key={w}
                    className={activeWidget === w ? "active" : ""}
                    onClick={() => setActiveWidget(w)}
                  >
                    {w}
                  </button>
                ))}
              </div>

              <div className="scroll-fields-container">

                {/* "" SIDEBAR "" */}
                {activeWidget === "SIDEBAR" && (
                  <>
                    <div className="field-group">
                      <label>Visibilidad</label>
                      <label className="wc-toggle">
                        <input
                          type="checkbox"
                          checked={sb.visible}
                          onChange={(e) => updateWidget("sidebar", "visible", e.target.checked)}
                        />
                        <span className={`wc-toggle-track ${sb.visible ? "checked" : ""}`}>
                          <span className="wc-toggle-thumb" />
                        </span>
                        <span className="wc-toggle-label">{sb.visible ? "Visible" : "Oculto"}</span>
                      </label>
                    </div>

                    <div className="field-group">
                      <label>Items del menu</label>
                      <div className="links-manager">
                        {sb.items.map((item, index) => (
                          <div key={index} className="link-row">
                            <input
                              type="text"
                              value={item}
                              onChange={(e) => updateSidebarItem(index, e.target.value)}
                              className="f-input-mini"
                            />
                            <button className="btn-del-link" onClick={() => removeSidebarItem(index)}>X</button>
                          </div>
                        ))}
                     
                      </div>
                    </div>

                    <div className="field-group">
                      <label>Fuente</label>
                      <div className="font-grid-mini">
                        {FONTS.map((f) => (
                          <button
                            key={f}
                            className={`f-tag ${sb.font === f ? "active" : ""}`}
                            onClick={() => updateWidget("sidebar", "font", f)}
                          >{f}</button>
                        ))}
                      </div>
                    </div>

                    <div className="field-group">
                      <label>Colores</label>
                      <div className="color-row">
                        <div className="color-pick">
                          <input type="color" value={sb.bg} onChange={(e) => updateWidget("sidebar", "bg", e.target.value)} />
                          <span>Fondo</span>
                        </div>
                        <div className="color-pick">
                          <input type="color" value={sb.color} onChange={(e) => updateWidget("sidebar", "color", e.target.value)} />
                          <span>Texto</span>
                        </div>
                        <div className="color-pick">
                          <input type="color" value={sb.borderColor} onChange={(e) => updateWidget("sidebar", "borderColor", e.target.value)} />
                          <span>Borde</span>
                        </div>
                      </div>
                    </div>

                    <div className="field-group">
                      <label>Ancho: <span>{sb.width}px</span></label>
                      <input type="range" min="160" max="400" value={sb.width} onChange={(e) => updateWidget("sidebar", "width", Number(e.target.value))} className="f-range" />
                    </div>

                    <div className="field-group">
                      <label>Borde redondeado: <span>{sb.radius}px</span></label>
                      <input type="range" min="0" max="24" value={sb.radius} onChange={(e) => updateWidget("sidebar", "radius", Number(e.target.value))} className="f-range" />
                    </div>
                  </>
                )}

                {/* "" BUSCADOR "" */}
                {activeWidget === "BUSCADOR" && (
                  <>
                    <div className="field-group">
                      <label>Visibilidad</label>
                      <label className="wc-toggle">
                        <input
                          type="checkbox"
                          checked={srch.visible}
                          onChange={(e) => updateWidget("searchbar", "visible", e.target.checked)}
                        />
                        <span className={`wc-toggle-track ${srch.visible ? "checked" : ""}`}>
                          <span className="wc-toggle-thumb" />
                        </span>
                        <span className="wc-toggle-label">{srch.visible ? "Visible" : "Oculto"}</span>
                      </label>
                    </div>

                    <div className="field-group">
                      <label>Texto placeholder</label>
                      <input
                        type="text"
                        className="f-input-dark"
                        value={srch.placeholder}
                        onChange={(e) => updateWidget("searchbar", "placeholder", e.target.value)}
                      />
                    </div>

                    <div className="field-group">
                      <label>Fuente</label>
                      <div className="font-grid-mini">
                        {FONTS.map((f) => (
                          <button
                            key={f}
                            className={`f-tag ${srch.font === f ? "active" : ""}`}
                            onClick={() => updateWidget("searchbar", "font", f)}
                          >{f}</button>
                        ))}
                      </div>
                    </div>

                    <div className="field-group">
                      <label>Colores</label>
                      <div className="color-row">
                        <div className="color-pick">
                          <input type="color" value={srch.bg} onChange={(e) => updateWidget("searchbar", "bg", e.target.value)} />
                          <span>Fondo</span>
                        </div>
                        <div className="color-pick">
                          <input type="color" value={srch.color} onChange={(e) => updateWidget("searchbar", "color", e.target.value)} />
                          <span>Texto</span>
                        </div>
                        <div className="color-pick">
                          <input type="color" value={srch.iconColor} onChange={(e) => updateWidget("searchbar", "iconColor", e.target.value)} />
                          <span>Icono</span>
                        </div>
                      </div>
                      <div className="color-row" style={{ marginTop: 8 }}>
                        <div className="color-pick">
                          <input type="color" value={srch.borderColor} onChange={(e) => updateWidget("searchbar", "borderColor", e.target.value)} />
                          <span>Borde</span>
                        </div>
                        <div className="color-pick">
                          <input type="color" value={srch.placeholderColor} onChange={(e) => updateWidget("searchbar", "placeholderColor", e.target.value)} />
                          <span>Placeholder</span>
                        </div>
                      </div>
                    </div>

                    <div className="field-group">
                      <label>Borde redondeado: <span>{srch.radius}px</span></label>
                      <input type="range" min="0" max="32" value={srch.radius} onChange={(e) => updateWidget("searchbar", "radius", Number(e.target.value))} className="f-range" />
                    </div>

                    <div className="field-group">
                      <label>Mostrar icono de busqueda</label>
                      <label className="wc-toggle">
                        <input
                          type="checkbox"
                          checked={srch.showIcon}
                          onChange={(e) => updateWidget("searchbar", "showIcon", e.target.checked)}
                        />
                        <span className={`wc-toggle-track ${srch.showIcon ? "checked" : ""}`}>
                          <span className="wc-toggle-thumb" />
                        </span>
                        <span className="wc-toggle-label">{srch.showIcon ? "Visible" : "Oculto"}</span>
                      </label>
                    </div>
                  </>
                )}
              </div>
            </div>
          </aside>
        )}

        {/* VIEWPORT */}
        <section className={`viewport-area ${isFullscreen ? "fullscreen" : ""}`}>
          {isFullscreen && (
            <button className="btn-exit-full" onClick={() => setIsFullscreen(false)}>VOLVER</button>
          )}

          <div className="wc-preview-shell">
            {/* Searchbar preview */}
            {srch.visible && (
              <div className="wc-preview-searchbar-wrap" style={{ background: "#060a10", padding: "12px 20px", borderBottom: `1px solid ${srch.borderColor}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, background: srch.bg, border: `${srch.borderWidth}px solid ${srch.borderColor}`, borderRadius: srch.radius, padding: "10px 16px", maxWidth: 480, fontFamily: `"${srch.font}", sans-serif` }}>
                  {srch.showIcon && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={srch.iconColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  )}
                  <span style={{ fontSize: 13, color: srch.placeholderColor, fontFamily: `"${srch.font}", sans-serif`, flex: 1 }}>
                    {srch.placeholder}
                  </span>
                  <button style={{ background: accentColor, border: "none", color: "#fff", padding: "5px 14px", borderRadius: Math.max(0, srch.radius - 2), fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                    Buscar
                  </button>
                </div>
              </div>
            )}

            {/* Body: sidebar + content */}
            <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
              {sb.visible && (
                <nav style={{ width: sb.width, minWidth: sb.width, background: sb.bg, borderRight: `${sb.borderWidth}px solid ${sb.borderColor}`, borderRadius: sb.radius, padding: "24px 0", display: "flex", flexDirection: "column", gap: 2, flexShrink: 0, fontFamily: `"${sb.font}", sans-serif` }}>
                  <div style={{ padding: "0 20px 20px", borderBottom: `1px solid ${sb.borderColor}`, marginBottom: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: sb.color, opacity: 0.4, letterSpacing: 2, textTransform: "uppercase" }}>MENU</span>
                  </div>
                  {sb.items.map((item, i) => (
                    <div key={i} style={{ padding: "11px 20px", fontSize: 13, color: i === 0 ? accentColor : sb.color, fontWeight: i === 0 ? 700 : 400, borderLeft: i === 0 ? `3px solid ${accentColor}` : "3px solid transparent", background: i === 0 ? `${accentColor}10` : "transparent", cursor: "pointer", letterSpacing: 0.3 }}>
                      {item}
                    </div>
                  ))}
                </nav>
              )}

              <div style={{ flex: 1, background: "#080c14", padding: "28px 24px", display: "flex", flexDirection: "column", gap: 16, overflow: "auto" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, color: "#3a5a7a", letterSpacing: 3, textTransform: "uppercase" }}>CATALOGO</span>
                  <span style={{ fontSize: 11, color: "#1a2535" }}>4 productos</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} style={{ background: "#0d1520", border: "1px solid #1a2535", borderRadius: 8, overflow: "hidden" }}>
                      <div style={{ height: 100, background: `${accentColor}15` }} />
                      <div style={{ padding: "10px 12px" }}>
                        <div style={{ height: 8, background: "#1a2535", borderRadius: 4, marginBottom: 6, width: "70%" }} />
                        <div style={{ height: 6, background: "#111c2e", borderRadius: 4, width: "50%" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Botones fullscreen */}
          {isFullscreen && (
            <div style={{ position: "fixed", bottom: 24, right: 24, display: "flex", gap: 10 }}>
              <button onClick={handleBack} style={{ background: "#1a1a1a", border: "1px solid #555", color: "#aaa", padding: "10px 18px", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center" }}>
                <ArrowLeft size={16} />
              </button>
              <button className="btn-save-top" onClick={handleFinish} style={{ padding: "10px 24px" }}>SIGUIENTE <ArrowRight size={14} /></button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default WidgetsCustomizer;
