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
  title: "Política de Devoluciones y Cambios",
  intro: "", days: "30", conditions: "", process: "", exceptions: "",
  refundMethod: "original", allowExchanges: true, allowRefunds: true,
  requireReceipt: true, contactEmail: "",
};

const REFUND_LABELS = {
  original: "Método de pago original",
  store:    "Crédito en tienda",
  both:     "Ambas opciones",
};

export default function StoreReturnsPage() {
  const { slug }    = useParams();
  const navigate    = useNavigate();
  const [data,    setData]     = useState(DEFAULT);
  const [storeName, setStoreName] = useState(slug ?? "");
  const [loading, setLoading]  = useState(true);

  useEffect(() => {
    if (!slug) return;
    getStoreBySlug(slug)
      .then(store => {
        const storeId = store?.storeId ?? store?.id ?? store?.store_id;
        setStoreName(store?.name ?? slug);
        if (!storeId) return;
        return getPublicCms(storeId).then(cms => {
          if (cms?.returns) setData({ ...DEFAULT, ...cms.returns });
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

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
            <Link key={n.to} to={`/tienda/${slug}${n.to}`} className={"scms-nav-link" + (n.to === "/devoluciones" ? " active" : "")}>
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
            <p className="scms-eyebrow">Devoluciones</p>
            <h1 className="scms-hero-title">{data.title}</h1>
            {data.intro && <p className="scms-hero-sub">{data.intro}</p>}
          </div>

          <div className="scms-body">
            {/* Destacado días */}
            <div className="scms-card">
              <p className="scms-card-title">Resumen de la política</p>
              <div className="scms-days-highlight">
                <span className="scms-days-num">{data.days || 30}</span>
                <span className="scms-days-label">días para solicitar devolución</span>
              </div>
              <div className="scms-badge-row">
                <span className={"scms-badge " + (data.allowExchanges ? "green" : "red")}>
                  <i className={"fa-solid " + (data.allowExchanges ? "fa-check" : "fa-xmark")} />
                  Cambios {data.allowExchanges ? "permitidos" : "no permitidos"}
                </span>
                <span className={"scms-badge " + (data.allowRefunds ? "green" : "red")}>
                  <i className={"fa-solid " + (data.allowRefunds ? "fa-check" : "fa-xmark")} />
                  Reembolsos {data.allowRefunds ? "permitidos" : "no permitidos"}
                </span>
                <span className={"scms-badge " + (data.requireReceipt ? "blue" : "green")}>
                  <i className="fa-solid fa-receipt" />
                  {data.requireReceipt ? "Requiere comprobante" : "Sin comprobante"}
                </span>
                <span className="scms-badge blue">
                  <i className="fa-solid fa-rotate-left" />
                  {REFUND_LABELS[data.refundMethod] ?? data.refundMethod}
                </span>
              </div>
            </div>

            {/* Condiciones */}
            {data.conditions && (
              <div className="scms-card">
                <p className="scms-card-title">Condiciones para devolución</p>
                <p className="scms-prose">{data.conditions}</p>
              </div>
            )}

            {/* Proceso */}
            {data.process && (
              <div className="scms-card">
                <p className="scms-card-title">Proceso de devolución</p>
                <p className="scms-prose">{data.process}</p>
              </div>
            )}

            {/* Excepciones */}
            {data.exceptions && (
              <div className="scms-card">
                <p className="scms-card-title">Excepciones (no aplican)</p>
                <p className="scms-prose">{data.exceptions}</p>
              </div>
            )}

            {/* Contacto devoluciones */}
            {data.contactEmail && (
              <div className="scms-card">
                <p className="scms-card-title">¿Necesitas ayuda?</p>
                <div className="scms-info-row">
                  <div className="scms-info-icon"><i className="fa-solid fa-envelope" /></div>
                  <div>
                    <div className="scms-info-label">Correo de devoluciones</div>
                    <div className="scms-info-value">{data.contactEmail}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
