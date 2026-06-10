import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getStoreBySlug } from "../../pages/services/storeService";
import { getPublicCms } from "../../pages/services/cmsService";
import "./StorePages.css";

const NAV = [
  { label: "Catálogo",     to: "" },
  { label: "Nosotros",     to: "/nosotros" },
  { label: "FAQ",          to: "/faq" },
  { label: "Devoluciones", to: "/devoluciones" },
  { label: "Contacto",     to: "/contacto" },
];

const DEFAULT = {
  headline: "", story: "", mission: "", vision: "",
  founded: "", teamSize: "", showTeam: true, showTimeline: true,
};

export default function StoreAboutPage() {
  const { slug }    = useParams();
  const navigate    = useNavigate();
  const [data,    setData]    = useState(DEFAULT);
  const [storeName, setStoreName] = useState(slug ?? "");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    getStoreBySlug(slug)
      .then(store => {
        const storeId = store?.storeId ?? store?.id ?? store?.store_id;
        setStoreName(store?.name ?? slug);
        if (!storeId) return;
        return getPublicCms(storeId).then(cms => {
          if (cms?.about) setData({ ...DEFAULT, ...cms.about });
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const hasStats = data.founded || data.teamSize;

  return (
    <div className="scms-wrap">
      {/* Topbar */}
      <header className="scms-topbar">
        <button className="scms-back-btn" onClick={() => navigate(`/tienda/${slug}`)}>
          <i className="fa-solid fa-arrow-left" style={{ fontSize: 13 }} />
        </button>
        <span className="scms-store-name">{storeName}</span>
        <nav className="scms-nav-links">
          {NAV.map(n => (
            <Link key={n.to} to={`/tienda/${slug}${n.to}`} className={"scms-nav-link" + (n.to === "/nosotros" ? " active" : "")}>
              {n.label}
            </Link>
          ))}
        </nav>
      </header>

      {loading ? (
        <div className="scms-spinner" />
      ) : (
        <>
          {/* Hero */}
          <div className="scms-hero">
            <p className="scms-eyebrow">Nosotros</p>
            {data.headline ? (
              <h1 className="scms-about-headline">{data.headline}</h1>
            ) : (
              <h1 className="scms-hero-title">Quiénes somos</h1>
            )}
          </div>

          <div className="scms-body">
            {/* Stats */}
            {hasStats && (
              <div className="scms-stat-row">
                {data.founded && (
                  <div className="scms-stat">
                    <div className="scms-stat-val">{data.founded}</div>
                    <div className="scms-stat-label">Fundación</div>
                  </div>
                )}
                {data.teamSize && (
                  <div className="scms-stat">
                    <div className="scms-stat-val">{data.teamSize}</div>
                    <div className="scms-stat-label">Equipo</div>
                  </div>
                )}
              </div>
            )}

            {/* Historia */}
            {data.story && (
              <div className="scms-card">
                <p className="scms-card-title">Nuestra historia</p>
                <p className="scms-prose">{data.story}</p>
              </div>
            )}

            {/* Misión y Visión */}
            {(data.mission || data.vision) && (
              <div className="scms-grid-2" style={{ gap: 16 }}>
                {data.mission && (
                  <div className="scms-card">
                    <p className="scms-card-title">
                      <i className="fa-solid fa-bullseye" style={{ marginRight: 6, color: "#6366f1" }} />
                      Misión
                    </p>
                    <p className="scms-prose">{data.mission}</p>
                  </div>
                )}
                {data.vision && (
                  <div className="scms-card">
                    <p className="scms-card-title">
                      <i className="fa-solid fa-eye" style={{ marginRight: 6, color: "#6366f1" }} />
                      Visión
                    </p>
                    <p className="scms-prose">{data.vision}</p>
                  </div>
                )}
              </div>
            )}

            {!data.story && !data.mission && !data.vision && !hasStats && (
              <div className="scms-empty">Información sobre la tienda no configurada aún.</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
