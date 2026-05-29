import { cf } from './storeUtils.jsx';

export default function StoreHero({ banner, theme }) {
  const { accent, btnR, fT, desc, isMin, isUrb, isCls } = theme;
  const bannerImageUrl = banner._imageUrl ?? null;

  if (isMin) return (
    <section style={{
      display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))",
      minHeight: 320, overflow: "hidden",
    }}>
      <div style={{
        padding: "clamp(32px,5vw,64px) clamp(20px,4vw,52px)",
        display: "flex", flexDirection: "column", justifyContent: "center", gap: 18,
        background: "#fff",
      }}>
        <span style={{ fontSize: 10, letterSpacing: 4, color: accent, textTransform: "uppercase", fontWeight: 700 }}>
          ✦ Nueva colección
        </span>
        <h1 style={{
          fontFamily: `"${cf(banner.font)}",sans-serif`,
          fontSize: "clamp(2rem,4.5vw,3.2rem)",
          color: "#111", lineHeight: 1.05, margin: 0, letterSpacing: -0.5,
        }}>
          {banner.title}
        </h1>
        <p style={{ fontSize: 13, color: "#888", lineHeight: 1.8, maxWidth: 340, margin: 0 }}>
          {desc}
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
          <button style={{
            background: accent, border: "none", color: "#fff",
            padding: "12px 32px", borderRadius: btnR, fontSize: 11,
            fontWeight: 700, letterSpacing: 1.5, cursor: "pointer",
          }}>
            VER COLECCIÓN
          </button>
          <button style={{
            background: "transparent", border: "1.5px solid #ddd", color: "#666",
            padding: "12px 22px", borderRadius: btnR, fontSize: 11,
            fontWeight: 600, letterSpacing: 0.5, cursor: "pointer",
          }}>
            Ver todo
          </button>
        </div>
      </div>
      <div style={{
        background: bannerImageUrl
          ? `url(${bannerImageUrl}) center/cover`
          : `linear-gradient(135deg, ${accent}18, ${accent}06)`,
        minHeight: 260,
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden",
      }}>
        {!bannerImageUrl && (
          <>
            <div style={{ position: "absolute", inset: 0, background: `repeating-linear-gradient(45deg, ${accent}08 0px, ${accent}08 1px, transparent 1px, transparent 24px)` }} />
            <span style={{ fontSize: 11, color: accent, letterSpacing: 4, opacity: 0.5, fontWeight: 700 }}>IMAGEN</span>
          </>
        )}
      </div>
    </section>
  );

  if (isUrb) return (
    <section style={{
      position: "relative",
      minHeight: "clamp(280px,48vw,500px)",
      background: bannerImageUrl
        ? `linear-gradient(rgba(0,0,0,.6),rgba(0,0,0,.55)) center/cover, url(${bannerImageUrl}) center/cover`
        : banner.bg ?? "#050505",
      display: "flex", flexDirection: "column", justifyContent: "flex-end",
      padding: "0 clamp(18px,3vw,48px) clamp(28px,5vw,52px)",
      overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: 0, left: "clamp(18px,3vw,48px)", width: 1, height: "60%", background: "rgba(255,255,255,0.08)" }} />
      {!bannerImageUrl && (
        <div style={{ position: "absolute", inset: 0, background: `repeating-linear-gradient(-45deg, transparent 0px, transparent 40px, ${accent}06 40px, ${accent}06 41px)` }} />
      )}
      <span style={{ fontSize: 10, letterSpacing: 5, color: accent, textTransform: "uppercase", marginBottom: 14, fontWeight: 700, position: "relative" }}>— DROP 2026</span>
      <h1 style={{
        fontFamily: `"${cf(banner.font)}",sans-serif`,
        fontSize: "clamp(3rem,9vw,7rem)",
        color: banner.color ?? "#fff", lineHeight: 0.88, margin: "0 0 24px",
        textTransform: "uppercase", letterSpacing: -3, wordBreak: "break-word", position: "relative",
      }}>
        {banner.title}
      </h1>
      <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", position: "relative" }}>
        <button style={{
          background: accent, border: "none", color: "#000",
          padding: "13px 36px", borderRadius: btnR, fontSize: 11,
          fontWeight: 900, letterSpacing: 3, cursor: "pointer", textTransform: "uppercase",
        }}>
          SHOP NOW
        </button>
        <button style={{
          background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)",
          padding: "13px 24px", borderRadius: btnR, fontSize: 11,
          fontWeight: 600, letterSpacing: 2, cursor: "pointer", textTransform: "uppercase",
        }}>
          LOOKBOOK
        </button>
      </div>
    </section>
  );

  /* clásico */
  return (
    <section style={{
      background: bannerImageUrl
        ? `linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)), url(${bannerImageUrl}) center/cover`
        : `linear-gradient(135deg, ${banner.bg ?? "#1a1a2e"}, ${accent}cc)`,
      padding: "clamp(28px,5vw,56px) clamp(18px,3vw,48px)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 24, minHeight: 180, flexWrap: "wrap",
    }}>
      <div style={{ flex: 1, minWidth: 200 }}>
        <span style={{
          background: "rgba(255,255,255,0.15)", color: "#fff", backdropFilter: "blur(4px)",
          fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 20,
          letterSpacing: 1.5, marginBottom: 12, display: "inline-block",
        }}>
          ✦ OFERTA ESPECIAL
        </span>
        <h1 style={{
          fontFamily: `"${cf(banner.font)}",sans-serif`,
          fontSize: "clamp(1.5rem,3.5vw,2.6rem)", color: "#fff", margin: "10px 0 10px", lineHeight: 1.1,
        }}>
          {banner.title}
        </h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,.75)", maxWidth: 360, lineHeight: 1.7 }}>
          {desc}
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end" }}>
        <button style={{
          background: "#fff", border: "none", color: accent,
          padding: "13px 28px", borderRadius: btnR, fontSize: 13,
          fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap",
        }}>
          COMPRAR AHORA →
        </button>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,.5)", letterSpacing: 1 }}>
          Válido hasta agotar stock
        </span>
      </div>
    </section>
  );
}
