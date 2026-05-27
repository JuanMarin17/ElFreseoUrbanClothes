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
import StorePreview from "../components/SelectLayout/StorePreview";
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
      {/* Barra mínima con el nombre y botón volver */}
      <div className="sp-topbar">
        <button className="sp-back" onClick={() => navigate(-1)}>←</button>
        <span className="sp-store-name">{storeName}</span>
        <span className="sp-url">{slug}.freseo.com</span>
      </div>

      <StorePreview layoutType={layoutType} data={previewData} />
    </div>
  );
}
