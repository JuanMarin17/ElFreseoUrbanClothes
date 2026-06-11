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
  email: "", phone: "", whatsapp: "", instagram: "", tiktok: "",
  hours: "", formTitle: "Escríbenos", formSubtitle: "Respondemos en menos de 24 horas",
  showForm: true, showSocials: true,
};

export default function StoreContactPage() {
  const { slug }    = useParams();
  const navigate    = useNavigate();
  const [data,    setData]    = useState(DEFAULT);
  const [storeName, setStoreName] = useState(slug ?? "");
  const [loading, setLoading] = useState(true);
  const [msgSent, setMsgSent] = useState(false);
  const [form,    setForm]    = useState({ name: "", email: "", message: "" });

  useEffect(() => {
    if (!slug) return;
    getStoreBySlug(slug)
      .then(store => {
        const storeId = store?.storeId ?? store?.id ?? store?.store_id;
        setStoreName(store?.name ?? slug);
        if (!storeId) return;
        return getPublicCms(storeId).then(cms => {
          if (cms?.contact) setData({ ...DEFAULT, ...cms.contact });
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const handleSend = (e) => {
    e.preventDefault();
    setMsgSent(true);
    setForm({ name: "", email: "", message: "" });
    setTimeout(() => setMsgSent(false), 4000);
  };

  const infoItems = [
    data.email    && { icon: "fa-solid fa-envelope",   label: "Correo",          value: data.email },
    data.phone    && { icon: "fa-solid fa-phone",      label: "Teléfono",        value: data.phone },
    data.whatsapp && { icon: "fa-brands fa-whatsapp",  label: "WhatsApp",        value: data.whatsapp },
    data.hours    && { icon: "fa-solid fa-clock",      label: "Horario",         value: data.hours },
  ].filter(Boolean);

  const socialItems = [
    data.instagram && { icon: "fa-brands fa-instagram", label: "@" + data.instagram.replace(/^@/, "") },
    data.tiktok    && { icon: "fa-brands fa-tiktok",    label: "@" + data.tiktok.replace(/^@/, "")    },
  ].filter(Boolean);

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
            <Link key={n.to} to={`/tienda/${slug}${n.to}`} className={"scms-nav-link" + (n.to === "/contacto" ? " active" : "")}>
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
            <p className="scms-eyebrow">Contacto</p>
            <h1 className="scms-hero-title">{data.formTitle || "Ponte en contacto"}</h1>
            {data.formSubtitle && <p className="scms-hero-sub">{data.formSubtitle}</p>}
          </div>

          <div className="scms-body">
            {/* Info de contacto */}
            {infoItems.length > 0 && (
              <div className="scms-card">
                <p className="scms-card-title">Información de contacto</p>
                {infoItems.map((it, i) => (
                  <div className="scms-info-row" key={i}>
                    <div className="scms-info-icon"><i className={it.icon} /></div>
                    <div>
                      <div className="scms-info-label">{it.label}</div>
                      <div className="scms-info-value">{it.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Redes sociales */}
            {data.showSocials && socialItems.length > 0 && (
              <div className="scms-card">
                <p className="scms-card-title">Redes sociales</p>
                <div className="scms-social-row">
                  {data.instagram && (
                    <a className="scms-social-btn" href={`https://instagram.com/${data.instagram.replace(/^@/, "")}`} target="_blank" rel="noreferrer">
                      <i className="fa-brands fa-instagram" />
                      @{data.instagram.replace(/^@/, "")}
                    </a>
                  )}
                  {data.tiktok && (
                    <a className="scms-social-btn" href={`https://tiktok.com/@${data.tiktok.replace(/^@/, "")}`} target="_blank" rel="noreferrer">
                      <i className="fa-brands fa-tiktok" />
                      @{data.tiktok.replace(/^@/, "")}
                    </a>
                  )}
                  {data.whatsapp && (
                    <a className="scms-social-btn" href={`https://wa.me/${data.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                      <i className="fa-brands fa-whatsapp" />
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Formulario */}
            {data.showForm && (
              <div className="scms-card">
                <p className="scms-card-title">Envíanos un mensaje</p>
                {msgSent ? (
                  <div style={{ textAlign: "center", padding: "24px 0", color: "#4ade80", fontSize: 14 }}>
                    <i className="fa-solid fa-circle-check" style={{ fontSize: 32, marginBottom: 10, display: "block" }} />
                    ¡Mensaje enviado! Te respondemos pronto.
                  </div>
                ) : (
                  <form className="scms-contact-form" onSubmit={handleSend}>
                    <div className="scms-grid-2">
                      <input placeholder="Tu nombre" value={form.name}
                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                      <input type="email" placeholder="Tu correo" value={form.email}
                        onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
                    </div>
                    <textarea placeholder="Tu mensaje..." value={form.message}
                      onChange={e => setForm(p => ({ ...p, message: e.target.value }))} required />
                    <button className="scms-submit-btn" type="submit">
                      <i className="fa-solid fa-paper-plane" style={{ marginRight: 8 }} />
                      Enviar mensaje
                    </button>
                  </form>
                )}
              </div>
            )}

            {infoItems.length === 0 && !data.showForm && (
              <div className="scms-empty">Información de contacto no configurada aún.</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
