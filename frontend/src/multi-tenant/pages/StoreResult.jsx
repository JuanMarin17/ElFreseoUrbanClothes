import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useStore } from "./useStore";
import "../components/styles/StoreResult.css";
import StoreFront from "../components/Store/StoreFront.jsx";
import { ExternalLink } from "lucide-react";

const cleanFont = (f = "Inter") => {
  const m = f.match(/['"]([^'"]+)['"]/);
  return m ? m[1] : f;
};

const StoreResult = () => {
  const { state, resetAll } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const previewState = location.state?.previewState;

  useEffect(() => {
    if (location.state?.clearStorage) {
      resetAll();
    }
  }, [location.state, resetAll]);

  const plan = previewState?.plan ?? state.plan ?? {};
  const store = previewState?.store ?? state.store ?? {};
  const layout = previewState?.layout ??
    state.layout ?? { id: "minimalista", title: "MINIMALISTA" };
  const styles = previewState?.styles ?? state.styles ?? {};
  const components = previewState?.components ?? state.components ?? {};
  const widgets = previewState?.widgets ?? state.widgets ?? null;

  const accentColor = styles.colorBoton ?? "#3e78ff";
  const fontTitle = cleanFont(styles.fontTitle ?? "Bebas Neue");
  const layoutClass = layout.id ?? "minimalista";
  const siteUrl = `${store.subdomain ?? "mi-tienda"}.vexio.com`;

  /* "" datos reales para StorePreview "" */
  const header = components.header ?? {
    logo: store.name ?? "MI TIENDA",
    items: ["HOME", "SHOP", "ABOUT"],
    color: "#fff",
    bg: "#000",
    font: "Inter",
    size: 14,
  };
  const banner = components.banner ?? {
    title: styles.textoTitulo ?? "NUEVA COLECCION",
    color: "#fff",
    bg: "#111",
    font: "Bebas Neue",
    size: 60,
    images: [],
  };
  const footer = components.footer ?? {
    text: `(c) ${store.name ?? "Mi Tienda"} 2026`,
    color: "#888",
    bg: "#080808",
    font: "Inter",
    size: 13,
  };
  const products = [
    { name: styles.textoTitulo ?? "PRODUCTO", price: "$85.00" },
    { name: styles.textoTitulo ?? "PRODUCTO", price: "$120.00" },
    { name: styles.textoTitulo ?? "PRODUCTO", price: "$65.00" },
    { name: styles.textoTitulo ?? "PRODUCTO", price: "$95.00" },
  ];

  // widgets: usa los del usuario si existen, si no null (Clasico usara defaults con sidebar visible)
 
  const previewData = { header, banner, footer, products, styles, widgets };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(siteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNewStore = () => {
    resetAll();
    navigate("/plan");
  };

  return (
    <div className="result-page">
      {/* "" Topbar """""""""""""""""""""""""""" */}
      <div className="result-topbar">
        <div className="result-topbar__left">
          <span className="result-badge">" TIENDA CREADA</span>
          <span className="result-store-name">{store.name ?? "Mi Tienda"}</span>
          <span
            className="result-plan-badge"
            style={{ color: accentColor, borderColor: accentColor }}
          >
            {plan.name ?? "PRO"}
          </span>
        </div>

        <div className="result-topbar__center">
          <div className="result-url-box">
            <span className="result-url-text">{siteUrl}</span>
            <button className="result-url-copy" onClick={handleCopyUrl}>
              {copied ? "Copiado!" : "Copiar URL"}
            </button>
          </div>
        </div>

        <div className="result-topbar__right">
          <button
            className="result-btn-secondary"
            onClick={() => navigate("/widgets")}
          >
            Editar
          </button>

          <button
            className="result-btn-primary"
            onClick={handleNewStore}
            style={{ background: accentColor }}
          >
            + Nueva tienda
          </button>
        </div>
      </div>

      {/* "" Summary bar """"""""""""""""""""""" */}
      <div className="result-summary-bar">
        {[
          { label: "PLAN", value: plan.name ?? "" },
          { label: "LAYOUT", value: layout.title ?? "" },
          {
            label: "FUENTE",
            value: fontTitle,
            style: { fontFamily: fontTitle },
          },
          { label: "SUBDOMINIO", value: store.subdomain ?? "" },
        ].map((pill) => (
          <div key={pill.label} className="summary-pill">
            <span className="summary-pill__label">{pill.label}</span>
            <span className="summary-pill__value" style={pill.style}>
              {pill.value}
            </span>
          </div>
        ))}
        <div className="summary-pill">
          <span className="summary-pill__label">ACENTO</span>
          <span
            className="summary-pill__color"
            style={{ background: accentColor }}
          />
          <span className="summary-pill__value">{accentColor}</span>
        </div>
      </div>

      {/* "" Ir a mi tienda """""""""""""""""""""" */}
      <div className="result-goto-section">
        <div className="result-goto-card">
          <div className="result-goto-icon">
            <ExternalLink size={22} />
          </div>
          <div className="result-goto-text">
            <h2 className="result-goto-title">Tu tienda esta lista</h2>
            <p className="result-goto-sub">
              Visita tu tienda ahora o administrala desde el panel
            </p>
            <span className="result-goto-url">{siteUrl}</span>
          </div>
          <div className="result-goto-actions">
            <button
              className="result-goto-btn-primary"
              style={{ background: accentColor }}
              onClick={() => navigate(`/tienda/${store.subdomain}`)}
            >
              Ir a mi tienda
            </button>
            <button
              className="result-goto-btn-secondary"
              onClick={() => navigate("/mis-tiendas")}
            >
              Administrar
            </button>
          </div>
        </div>
      </div>

      {/* "" Preview con layout real del usuario " */}
      <div className="result-preview-container">
        <div className="store-preview">
          <StoreFront layoutType={layoutClass} data={previewData} />
        </div>
      </div>
    </div>
  );
};

export default StoreResult;
