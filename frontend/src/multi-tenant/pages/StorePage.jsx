/**
 * StorePage.jsx
 * Página pública de una tienda por su slug.
 * Ruta: /tienda/:slug
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StoreFront from "../components/Store/StoreFront.jsx";
import { getStoreBySlug, getStoreSettingsByHeader, checkIsOwner } from "./services/storeService";
import { getPublicActiveProducts } from "../../admin/modules/administration/services/productService";
import "../components/styles/StorePage.css";

function getUserIdFromJwt() {
  try {
    const jwt = localStorage.getItem("jwt");
    if (!jwt || jwt === "null") return null;
    const payload = JSON.parse(atob(jwt.split(".")[1]));
    return payload.user_id ?? payload.userId ?? payload.sub ?? payload.id ?? null;
  } catch {
    return null;
  }
}

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

    getStoreBySlug(slug)
      .then(async (store) => {
        if (!store) throw new Error("Tienda no encontrada");

        // El backend puede devolver el ID con distintos nombres de campo
        const resolvedStoreId = store.storeId ?? store.id ?? store.store_id ?? null;
        
        if (!resolvedStoreId) throw new Error("La tienda no devolvió un ID válido.");

        setStoreName(store.name ?? slug);
        setStoreId(resolvedStoreId);
        localStorage.setItem("storeId", resolvedStoreId);
        localStorage.setItem("storeSlug", slug);
        localStorage.setItem("storeName", store.name ?? slug);

        // Verificar ownership contra el backend (GET /stores/:storeId/isOwner/:userId)
        // El endpoint responde con el rol del usuario en la tienda (ej. "OWNER"), no un booleano.
        const userId = getUserIdFromJwt();
        if (userId) {
          checkIsOwner(resolvedStoreId, userId)
            .then((owner) => {
              setIsOwner(owner === true || String(owner).toUpperCase() === "OWNER");
            })
            .catch((e) => {
              console.warn("[StorePage] Error verificando ownership:", e.status, e.message);
              setIsOwner(false);
            });
        } else {
          setIsOwner(false);
        }

        const settings = await getStoreSettingsByHeader(resolvedStoreId);

        const components = settings?.components ?? {};
        const styles     = settings?.styles     ?? {};
        const widgets    = settings?.widgets    ?? null;
        const layout     = settings?.layout     ?? { id: "minimalista" };

        const rawHeader = components.header ?? {
          logo: store.name ?? "MI TIENDA",
          items: ["HOME", "SHOP"],
          color: "#fff", bg: "#000", font: "Inter", size: 14,
        };
        // logoUrl: primero del CMS del header, fallback al logo subido en el wizard
        const header = {
          ...rawHeader,
          logoUrl:   rawHeader.logoUrl ?? settings?.basic?.logoPreview ?? null,
          storeName: store.name ?? slug,
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
          // El backend puede devolver array directo o respuesta paginada { content: [...] }
          const items = Array.isArray(rawProducts)
            ? rawProducts
            : (rawProducts?.content ?? rawProducts?.items ?? []);
          products = items.map(p => {
            const variants = p.variants ?? [];
            const sizes = [...new Set(
              variants.flatMap(v => [v.size, v.talla, v.sizeName].filter(Boolean))
            )];
            return {
              id:          p.productId ?? p.id,
              name:        p.name,
              description: p.description ?? "",
              price:       formatCOP(variants[0]?.price ?? p.price ?? 0),
              images:      p.images ?? [],
              sizes,
              categories:  p.categories ?? [],
            };
          });
        } catch (e) {
          console.warn("[StorePage] Error cargando productos:", e.message);
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
        <div className="sp-orbital">
          <div className="sp-orbital-ring sp-orbital-ring--a" />
          <div className="sp-orbital-ring sp-orbital-ring--b" />
          <div className="sp-orbital-core" />
        </div>
        <p className="sp-loading-text">Cargando tienda</p>
        <div className="sp-loading-bar" />
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
    <StoreFront layoutType={layoutType} data={previewData} isOwner={isOwner} storeId={storeId} storeSlug={slug} storeName={storeName} headerTopOffset={0} />
  );
}
