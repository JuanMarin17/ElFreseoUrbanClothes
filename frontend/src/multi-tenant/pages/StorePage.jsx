/**
 * StorePage.jsx
 * Página pública de una tienda por su slug.
 * Ruta: /tienda/:slug
 *
 * Carga los datos desde el backend y renderiza StorePreview
 * con el layout y estilos que el dueño configuró.
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StoreFront from "../components/Store/StoreFront.jsx";
import { getStoreBySlug, getStoreSettingsByHeader } from "./services/storeService";
import "../components/styles/StorePage.css";

export default function StorePage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [layoutType, setLayoutType]   = useState("minimalista");
  const [storeName, setStoreName]     = useState("");

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    setError(null);

    // 1. Obtener la tienda por slug
    getStoreBySlug(slug)
      .then(async (store) => {
        setStoreName(store.name ?? slug);

        // 2. Obtener los settings con el storeId en el header
        const settings = await getStoreSettingsByHeader(store.storeId);

        // 3. Construir previewData desde los settings
        const components = settings.components ?? {};
        const styles     = settings.styles     ?? {};
        const widgets    = settings.widgets    ?? null;
        const layout     = settings.layout     ?? { id: "minimalista" };

        const header = components.header ?? {
          logo: store.name ?? "MI TIENDA",
          items: ["HOME", "SHOP"],
          color: "#fff", bg: "#000", font: "Inter", size: 14,
        };

        // El banner puede tener image (string) o images (array legacy)
        const bannerRaw = components.banner ?? {};
        const banner = {
          title:  bannerRaw.title  ?? styles.textoTitulo ?? "NUEVA COLECCIÓN",
          color:  bannerRaw.color  ?? "#fff",
          bg:     bannerRaw.bg     ?? "#111",
          font:   bannerRaw.font   ?? "Bebas Neue",
          size:   bannerRaw.size   ?? 60,
          // Normaliza: si viene como string "image", lo envuelve en array para StorePreview
          images: bannerRaw.image
            ? [{ id: 1, url: bannerRaw.image, width: 300, radius: 0 }]
            : (bannerRaw.images ?? []),
        };

        const footer = components.footer ?? {
          text:  `© ${store.name ?? "Mi Tienda"} 2026`,
          color: "#888", bg: "#080808", font: "Inter", size: 13,
        };

        const products = [
          { name: styles.textoTitulo ?? "PRODUCTO", price: "$85.00" },
          { name: styles.textoTitulo ?? "PRODUCTO", price: "$120.00" },
          { name: styles.textoTitulo ?? "PRODUCTO", price: "$65.00" },
          { name: styles.textoTitulo ?? "PRODUCTO", price: "$95.00" },
        ];

        setLayoutType(layout.id ?? "minimalista");
        setPreviewData({ header, banner, footer, products, styles, widgets });
      })
      .catch((err) => {
        console.error("Error cargando tienda:", err);
        setError(err.message ?? "No se pudo cargar la tienda.");
      })
      .finally(() => setLoading(false));
  }, [slug]);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="sp-loading">
        <div className="sp-spinner" />
        <span>Cargando tienda...</span>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="sp-error">
        <span className="sp-error-icon">⚠</span>
        <h2>Tienda no encontrada</h2>
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>← Volver</button>
      </div>
    );
  }

  /* ── Tienda ── */
  return (
    <div className="sp-root">
      <div className="sp-topbar">
        <button className="sp-back" onClick={() => navigate(-1)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Barra de dirección estilo navegador */}
        <div className="sp-addressbar">
          <span className="sp-addressbar-lock">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </span>
          <span className="sp-addressbar-url">
            <span className="sp-addressbar-domain">freseo.com</span>
            <span className="sp-addressbar-path">/{slug}</span>
          </span>
        </div>

        <span className="sp-store-name">{storeName}</span>
      </div>

      <StoreFront layoutType={layoutType} data={previewData} />
    </div>
  );
}
