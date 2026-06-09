import { cf } from './storeUtils.jsx';

export default function StoreHero({ banner, theme }) {
  const { accent, btnR, desc, titleC, paraC, pageBg, isDark, isMin, isUrb } = theme;
  const bannerImageUrl = banner._imageUrl ?? null;

  /* ── MINIMALISTA ─────────────────────────────────────────── */
  if (isMin) return (
    <section style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))",
      minHeight: 340,
      overflow: "hidden",
    }}>
      {/* Panel de texto */}
      <div style={{
        padding: "clamp(36px,6vw,72px) clamp(24px,4vw,56px)",
        display: "flex", flexDirection: "column", justifyContent: "center", gap: 20,
        background: pageBg,
        borderRight: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)"}`,
        transition: "background 0.3s ease",
      }}>
        <span style={{
          fontSize: 10, letterSpacing: 4, color: accent,
          textTransform: "uppercase", fontWeight: 700,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <span style={{ display: "inline-block", width: 20, height: 1, background: accent }} />
          Nueva colección
        </span>

        <h1 style={{
          fontFamily: `"${cf(banner.font)}",sans-serif`,
          fontSize: "clamp(2.2rem,5vw,3.6rem)",
          color: isDark ? titleC : "#333",
          lineHeight: 1.0,
          margin: 0,
          letterSpacing: -1,
          fontWeight: 900,
        }}>
          {banner.title}
        </h1>

        <p style={{
          fontSize: 13,
          color: paraC ?? "#64748b",
          lineHeight: 1.75,
          maxWidth: 360,
          margin: 0,
        }}>
          {desc}
        </p>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
          <button style={{
            background: accent, border: "none", color: "#fff",
            padding: "12px 32px", borderRadius: btnR,
            fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
            cursor: "pointer", textTransform: "uppercase",
          }}>
            Ver colección
          </button>
          <button style={{
            background: "transparent",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.15)"}`,
            color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)",
            padding: "12px 22px", borderRadius: btnR,
            fontSize: 11, fontWeight: 600, letterSpacing: 0.5,
            cursor: "pointer",
          }}>
            Ver todo
          </button>
        </div>
      </div>

      {/* Panel de imagen */}
      <div style={{
        background: bannerImageUrl
          ? `url(${bannerImageUrl}) center/cover`
          : `linear-gradient(135deg, ${accent}14 0%, transparent 60%)`,
        minHeight: 280,
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden",
        backgroundColor: isDark ? "#0d1020" : "#e8eef8",
        transition: "background-color 0.3s ease",
      }}>
        {!bannerImageUrl && (
          <>
            <div style={{
              position: "absolute", inset: 0,
              background: `radial-gradient(ellipse at center, ${accent}12 0%, transparent 70%)`,
            }} />
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.02) 39px, rgba(255,255,255,0.02) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.02) 39px, rgba(255,255,255,0.02) 40px)`,
            }} />
            <span style={{ fontSize: 10, color: accent, letterSpacing: 6, opacity: 0.3, fontWeight: 700, position: "relative" }}>
              IMAGEN
            </span>
          </>
        )}
      </div>
    </section>
  );

  /* ── URBANO (dark fullscreen) ────────────────────────────── */
  if (isUrb) return (
    <section style={{
      position: "relative",
      minHeight: "clamp(320px,52vw,580px)",
      background: bannerImageUrl
        ? `linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.75) 100%), url(${bannerImageUrl}) center/cover`
        : banner.bg ?? "#050505",
      display: "flex", flexDirection: "column", justifyContent: "flex-end",
      padding: "0 clamp(20px,4vw,56px) clamp(32px,6vw,60px)",
      overflow: "hidden",
    }}>
      {!bannerImageUrl && (
        <>
          <div style={{
            position: "absolute", inset: 0,
            background: `repeating-linear-gradient(-45deg, transparent 0px, transparent 60px, rgba(255,255,255,0.015) 60px, rgba(255,255,255,0.015) 61px)`,
          }} />
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: "50%",
            background: "linear-gradient(to top, #000, transparent)",
          }} />
        </>
      )}

      <div style={{ position: "relative" }}>
        <span style={{
          fontSize: 10, letterSpacing: 6, color: accent,
          textTransform: "uppercase", marginBottom: 16, fontWeight: 700,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ display: "inline-block", width: 28, height: 1, background: accent }} />
          DROP 2026
        </span>

        <h1 style={{
          fontFamily: `"${cf(banner.font)}",sans-serif`,
          fontSize: "clamp(3.5rem,10vw,8rem)",
          color: banner.color ?? "#fff",
          lineHeight: 0.88,
          margin: "0 0 28px",
          textTransform: "uppercase",
          letterSpacing: -2,
          wordBreak: "break-word",
          fontWeight: 900,
        }}>
          {banner.title}
        </h1>

        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <button style={{
            background: accent, border: "none",
            color: accent === "#ffffff" ? "#000" : "#000",
            padding: "14px 40px", borderRadius: btnR,
            fontSize: 11, fontWeight: 900, letterSpacing: 3,
            cursor: "pointer", textTransform: "uppercase",
          }}>
            SHOP NOW
          </button>
          <button style={{
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.5)",
            padding: "14px 28px", borderRadius: btnR,
            fontSize: 11, fontWeight: 600, letterSpacing: 2,
            cursor: "pointer", textTransform: "uppercase",
          }}>
            LOOKBOOK
          </button>
        </div>
      </div>
    </section>
  );

  /* ── CLÁSICO (dark premium) ──────────────────────────────── */
  return (
    <section style={{
      background: bannerImageUrl
        ? `linear-gradient(rgba(0,0,0,0.6),rgba(0,0,0,0.55)), url(${bannerImageUrl}) center/cover`
        : `linear-gradient(135deg, #0d1020 0%, ${accent}44 100%)`,
      padding: "clamp(40px,6vw,72px) clamp(20px,4vw,56px)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 28, minHeight: 220, flexWrap: "wrap",
      position: "relative", overflow: "hidden",
    }}>
      {!bannerImageUrl && (
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 70% 50%, rgba(255,255,255,0.03) 0%, transparent 60%)",
        }} />
      )}

      <div style={{ flex: 1, minWidth: 220, position: "relative" }}>
        <span style={{
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(4px)",
          color: "rgba(255,255,255,0.8)",
          fontSize: 10, fontWeight: 800,
          padding: "5px 12px", borderRadius: 20,
          letterSpacing: 1.5, marginBottom: 14,
          display: "inline-flex", alignItems: "center", gap: 5,
        }}>
          <span style={{ color: accent }}>✦</span> Oferta especial
        </span>

        <h1 style={{
          fontFamily: `"${cf(banner.font)}",sans-serif`,
          fontSize: "clamp(1.8rem,4vw,3rem)",
          color: "#fff", margin: "10px 0 12px", lineHeight: 1.1,
          fontWeight: 900, letterSpacing: -0.5,
        }}>
          {banner.title}
        </h1>

        <p style={{
          fontSize: 13,
          color: "rgba(255,255,255,0.55)",
          maxWidth: 380, lineHeight: 1.75, margin: 0,
        }}>
          {desc}
        </p>
      </div>

      <div style={{
        display: "flex", flexDirection: "column",
        gap: 10, alignItems: "flex-end", position: "relative",
      }}>
        <button style={{
          background: accent, border: "none", color: "#fff",
          padding: "14px 32px", borderRadius: btnR,
          fontSize: 12, fontWeight: 800, cursor: "pointer",
          whiteSpace: "nowrap", letterSpacing: 0.5,
        }}>
          Comprar ahora →
        </button>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: 1 }}>
          Válido hasta agotar stock
        </span>
      </div>
    </section>
  );
}
