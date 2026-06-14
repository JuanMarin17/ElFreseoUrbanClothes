import { useState, useEffect } from "react";
import "./PromoBar.css";

const API_BASE = "http://46.225.21.146:8080/api/v1";

/* ── Public fetchers (no JWT required) ── */
async function fetchPublicPromotions(storeId) {
  try {
    const res = await fetch(`${API_BASE}/promotions/getActivePromotions`, {
      headers: { "X-Store-Id": storeId },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return normalize(json);
  } catch { return []; }
}

async function fetchPublicCoupons(storeId) {
  try {
    const res = await fetch(`${API_BASE}/coupons/getActiveCoupons`, {
      headers: { "X-Store-Id": storeId },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return normalize(json);
  } catch { return []; }
}

function normalize(raw) {
  if (Array.isArray(raw))          return raw;
  if (Array.isArray(raw?.data))    return raw.data;
  if (Array.isArray(raw?.content)) return raw.content;
  return [];
}

/* ── Metadata from localStorage (set by admin) ── */
function loadMeta(key, id) {
  try {
    const all = JSON.parse(localStorage.getItem(key) ?? "{}");
    return all[id] ?? {};
  } catch { return {}; }
}

function isWithinPeriod(meta) {
  if (!meta.startDate && !meta.endDate) return true;
  const now  = new Date();
  const from = meta.startDate ? new Date(meta.startDate + "T00:00:00") : null;
  const to   = meta.endDate   ? new Date(meta.endDate   + "T23:59:59") : null;
  if (from && now < from) return false;
  if (to   && now > to  ) return false;
  return true;
}

function fmtDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("es-CO", { day: "2-digit", month: "short" });
}

function fmtDiscount(item) {
  return item.discountType === "PERCENTAGE"
    ? `${item.discount}% OFF`
    : `$${Number(item.discount).toLocaleString("es-CO")} OFF`;
}

/* ════════════════════════════════════════
   PromoBar
   Muestra alertas de promociones y cupones
   activos para la tienda actual.
════════════════════════════════════════ */
export default function PromoBar({ storeId }) {
  const [items,     setItems]     = useState([]);
  const [dismissed, setDismissed] = useState(() => {
    try { return new Set(JSON.parse(sessionStorage.getItem("promo_dismissed") ?? "[]")); }
    catch { return new Set(); }
  });
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    if (!storeId) return;
    Promise.all([
      fetchPublicPromotions(storeId),
      fetchPublicCoupons(storeId),
    ]).then(([promos, cups]) => {
      const enrichedPromos = promos
        .map((p) => ({ ...p, _type: "promo",  _id: p.promotionId, _meta: loadMeta("vexio_promo_meta",  p.promotionId) }))
        .filter((p) => isWithinPeriod(p._meta));

      const enrichedCups = cups
        .map((c) => ({ ...c, _type: "coupon", _id: c.couponId,    _meta: loadMeta("vexio_coupon_meta", c.couponId) }))
        .filter((c) => isWithinPeriod(c._meta));

      setItems([...enrichedPromos, ...enrichedCups]);
    });
  }, [storeId]);

  const visible = items.filter((i) => !dismissed.has(i._id));
  if (visible.length === 0) return null;

  const dismiss = (id) => {
    setDismissed((prev) => {
      const next = new Set([...prev, id]);
      try { sessionStorage.setItem("promo_dismissed", JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  const copyCode = (code, id) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="promo-bar" role="region" aria-label="Promociones activas">
      {visible.map((item) => {
        const meta     = item._meta;
        const isCoupon = item._type === "coupon";
        const label    = meta.message || (isCoupon ? `Cupón ${item.code}` : item.name);

        return (
          <div
            key={item._id}
            className={`promo-bar__item promo-bar__item--${item._type}`}
            role="alert"
          >
            {/* Icon */}
            <span className="promo-bar__icon" aria-hidden="true">
              {isCoupon
                ? <i className="fa-solid fa-ticket" />
                : <i className="fa-solid fa-tag" />}
            </span>

            {/* Content */}
            <span className="promo-bar__content">
              <span className="promo-bar__label">{label}</span>

              <span className="promo-bar__badge">{fmtDiscount(item)}</span>

              {/* Coupon code with copy button */}
              {isCoupon && (
                <button
                  className={`promo-bar__copy ${copied === item._id ? "promo-bar__copy--done" : ""}`}
                  onClick={() => copyCode(item.code, item._id)}
                  title="Copiar código"
                  aria-label={`Copiar código ${item.code}`}
                >
                  <code>{item.code}</code>
                  {copied === item._id
                    ? <i className="fa-solid fa-check" aria-hidden="true" />
                    : <i className="fa-regular fa-copy" aria-hidden="true" />}
                </button>
              )}

              {/* Validity */}
              {meta.endDate && (
                <span className="promo-bar__until">
                  <i className="fa-regular fa-clock" aria-hidden="true" />
                  {" Hasta "}
                  {fmtDate(meta.endDate)}
                </span>
              )}

              {/* Min purchase hint */}
              {meta.minPurchase && (
                <span className="promo-bar__until">
                  Compra mín. ${Number(meta.minPurchase).toLocaleString("es-CO")}
                </span>
              )}
            </span>

            {/* Dismiss */}
            <button
              className="promo-bar__dismiss"
              onClick={() => dismiss(item._id)}
              aria-label="Cerrar alerta"
              title="Cerrar"
            >
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
