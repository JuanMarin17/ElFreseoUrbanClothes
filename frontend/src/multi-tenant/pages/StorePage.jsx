/**
 * StorePage.jsx
 * Página pública de una tienda por su slug.
 * Ruta: /tienda/:slug
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StoreFront from "../components/Store/StoreFront.jsx";
import { getStoreBySlug, getStoreSettingsByHeader } from "./services/storeService";
import { getPublicActiveProducts } from "../../admin/modules/administration/services/productService";
import "../components/styles/StorePage.css";

const formatCOP = (price) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(price ?? 0);

export default function StorePage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [layoutType, setLayoutType]   = useState("minimalista");
  const [storeName, setStoreName]     = useState("");
  const [storeId, setStoreId]         = useState(null);
  const [isOwner, setIsOwner]         = useState(false);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    setError(null);

    getStoreBySlug(slug)
      .then(async (store) => {
        if (!store) throw new Error("Tienda no encontrada");

        // El backend puede devolver el ID con distintos nombres de campo
        const resolvedStoreId = store.storeId ?? store.id ?? store.store_id ?? null;

        console.log("[StorePage] store response:", store);
        console.log("[StorePage] resolvedStoreId:", resolvedStoreId);

        if (!resolvedStoreId) throw new Error("La tienda no devolvió un ID válido.");

        setStoreName(store.name ?? slug);
        setStoreId(resolvedStoreId);

        // Verificar si el usuario logueado es dueño de esta tienda
        const myStoreId = localStorage.getItem("storeId");
        setIsOwner(!!myStoreId && myStoreId === resolvedStoreId);

        const settings = await getStoreSettingsByHeader(resolvedStoreId);

        const components = settings?.components ?? {};
        const styles     = settings?.styles     ?? {};
        const widgets    = settings?.widgets    ?? null;
        const layout     = settings?.layout     ?? { id: "minimalista" };

        const header = components.header ?? {
          logo: store.name ?? "MI TIENDA",
          items: ["HOME", "SHOP"],
          color: "#fff", bg: "#000", font: "Inter", size: 14,
        };

        const bannerRaw = components.banner ?? {};
        const banner = {
          title:  bannerRaw.title  ?? styles.textoTitulo ?? "NUEVA COLECCIÓN",
          color:  bannerRaw.color  ?? "#fff",
          bg:     bannerRaw.bg     ?? "#111",
          font:   bannerRaw.font   ?? "Bebas Neue",
          size:   bannerRaw.size   ?? 60,
          images: bannerRaw.image
            ? [{ id: 1, url: bannerRaw.image, width: 300, radius: 0 }]
            : (bannerRaw.images ?? []),
        };

        const footer = components.footer ?? {
          text:  `© ${store.name ?? "Mi Tienda"} 2026`,
          color: "#888", bg: "#080808", font: "Inter", size: 13,
        };

        let products = [];
        try {
          const rawProducts = await getPublicActiveProducts(resolvedStoreId);
          if (Array.isArray(rawProducts) && rawProducts.length > 0) {
            products = rawProducts.map(p => ({
              id:          p.productId,
              name:        p.name,
              description: p.description ?? "",
              price:       formatCOP(p.variants?.[0]?.price ?? 0),
              images:      p.images ?? [],
            }));
          }
        } catch {
          // La tienda se muestra aunque no carguen productos
        }

        setLayoutType(layout.id ?? "minimalista");
        setPreviewData({ header, banner, footer, products, styles, widgets });
      })
      .catch((err) => {
        console.error("Error cargando tienda:", err);
        setError(err.message ?? "No se pudo cargar la tienda.");
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="sp-loading">
        <div className="sp-spinner" />
        <span>Cargando tienda...</span>
      </div>
    );
  }

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

  return (
    <div className="sp-root">
      {/* Barra de navegador */}
      <div className="sp-topbar">
        <button className="sp-back" onClick={() => navigate(-1)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
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

      <StoreFront layoutType={layoutType} data={previewData} isOwner={isOwner} storeId={storeId} />
    </div>
  );
}
