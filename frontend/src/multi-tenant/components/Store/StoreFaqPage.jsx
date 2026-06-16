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

const CATS = [
  { value: "all",      label: "Todos"     },
  { value: "general",  label: "General"   },
  { value: "pedidos",  label: "Pedidos"   },
  { value: "pagos",    label: "Pagos"     },
  { value: "envios",   label: "Envíos"    },
  { value: "productos",label: "Productos" },
];

export default function StoreFaqPage() {
  const { slug }    = useParams();
  const navigate    = useNavigate();
  const [pageTitle,    setPageTitle]    = useState("Preguntas Frecuentes");
  const [pageSubtitle, setPageSubtitle] = useState("Encuentra respuestas a las preguntas más comunes");
  const [showSearch,   setShowSearch]   = useState(true);
  const [items,        setItems]        = useState([]);
  const [storeName,    setStoreName]    = useState(slug ?? "");
  const [loading,      setLoading]      = useState(true);
  const [expanded,     setExpanded]     = useState(null);
  const [search,       setSearch]       = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    if (!slug) return;
    getStoreBySlug(slug)
      .then(store => {
        const storeId = store?.storeId ?? store?.id ?? store?.store_id;
        setStoreName(store?.name ?? slug);
        if (!storeId) return;
        return getPublicCms(storeId).then(cms => {
          if (!cms?.faq) return;
          const { pageTitle: pt, pageSubtitle: ps, showSearch: ss, items: it } = cms.faq;
          if (pt) setPageTitle(pt);
          if (ps) setPageSubtitle(ps);
          if (ss !== undefined) setShowSearch(ss);
          if (it?.length) setItems(it);
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const filtered = items.filter(f => {
    const matchCat  = activeFilter === "all" || f.category === activeFilter;
    const matchSearch = !search || f.question.toLowerCase().includes(search.toLowerCase()) || f.answer.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // Solo mostrar filtros de categorías que tienen preguntas
  const usedCats = ["all", ...new Set(items.map(f => f.category))];
  const visibleCats = CATS.filter(c => usedCats.includes(c.value));

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
            <Link key={n.to} to={`/tienda/${slug}${n.to}`} className={"scms-nav-link" + (n.to === "/faq" ? " active" : "")}>
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
            <p className="scms-eyebrow">Ayuda</p>
            <h1 className="scms-hero-title">{pageTitle}</h1>
            {pageSubtitle && <p className="scms-hero-sub">{pageSubtitle}</p>}
          </div>

          <div className="scms-body">
            <div className="scms-card">
              {/* Buscador */}
              {showSearch && (
                <div className="scms-search">
                  <i className="fa-solid fa-magnifying-glass scms-search-icon" />
                  <input
                    placeholder="Buscar pregunta..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                  {search && (
                    <i className="fa-solid fa-xmark" style={{ color: "#475569", cursor: "pointer" }}
                       onClick={() => setSearch("")} />
                  )}
                </div>
              )}

              {/* Filtros */}
              {visibleCats.length > 2 && (
                <div className="scms-cat-filters">
                  {visibleCats.map(c => (
                    <button key={c.value} className={"scms-cat-btn" + (activeFilter === c.value ? " active" : "")}
                      onClick={() => setActiveFilter(c.value)}>
                      {c.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Lista FAQ */}
              {filtered.length === 0 ? (
                <div className="scms-empty">No se encontraron preguntas.</div>
              ) : (
                filtered.map(faq => (
                  <div key={faq.id ?? faq.question}
                    className={"scms-faq-item" + (expanded === (faq.id ?? faq.question) ? " open" : "")}>
                    <div className="scms-faq-q"
                      onClick={() => setExpanded(prev => prev === (faq.id ?? faq.question) ? null : (faq.id ?? faq.question))}>
                      {faq.category && faq.category !== "general" && (
                        <span className="scms-faq-cat-badge">
                          {CATS.find(c => c.value === faq.category)?.label ?? faq.category}
                        </span>
                      )}
                      <span className="scms-faq-q-text">{faq.question}</span>
                      <i className="fa-solid fa-chevron-down scms-faq-chevron" />
                    </div>
                    {expanded === (faq.id ?? faq.question) && (
                      <div className="scms-faq-a">{faq.answer}</div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* CTA contacto */}
            <div className="scms-card" style={{ textAlign: "center", padding: "28px" }}>
              <p style={{ margin: "0 0 8px", fontSize: 14, color: "#94a3b8" }}>¿No encontraste lo que buscabas?</p>
              <Link to={`/tienda/${slug}/contacto`} className="scms-submit-btn" style={{ display: "inline-block", textDecoration: "none" }}>
                <i className="fa-solid fa-envelope" style={{ marginRight: 8 }} />
                Contáctanos
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
