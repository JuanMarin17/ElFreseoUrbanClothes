/* ── Detecta si un color hexadecimal es oscuro ── */
export function isBgDark(color) {
  if (!color || typeof color !== 'string') return true;
  const hex = color.replace('#', '');
  if (hex.length < 6) return true;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return true;
  return (0.299 * r + 0.587 * g + 0.114 * b) < 128;
}

/* ── Extrae nombre de fuente de strings con comillas ── */
export const cf = (f = "Inter") => {
  const m = (f ?? "Inter").match(/['"]([^'"]+)['"]/);
  return m ? m[1] : (f ?? "Inter");
};

export const PRICE_RANGES = [[0, 50000], [50000, 100000], [100000, 200000], [200000, Infinity]];

export const DEMO = {
  header:   { logo: "MI TIENDA", items: ["HOME", "SHOP", "ABOUT", "CONTACTO"], color: "#fff", bg: "#000000", font: "Inter", size: 14 },
  banner:   { title: "NUEVA COLECCIÓN", color: "#fff", bg: "#111111", font: "Bebas Neue", size: 60, images: [] },
  footer:   { text: "© Mi Tienda 2026", color: "#888888", bg: "#080808", font: "Inter", size: 13 },
  products: [
    { name: "PRODUCTO 01", price: "$85.00" },
    { name: "PRODUCTO 02", price: "$120.00" },
    { name: "PRODUCTO 03", price: "$65.00" },
    { name: "PRODUCTO 04", price: "$95.00" },
    { name: "PRODUCTO 05", price: "$75.00" },
    { name: "PRODUCTO 06", price: "$110.00" },
  ],
  styles: {
    colorBoton: "#3e78ff", colorTitulo: "#ffffff", colorParrafo: "#888888",
    cardBg: "#0f0f0f", cardBorderColor1: "#3e78ff", cardBorderColor2: "#6c63ff",
    cardBorderWidth: "2", cardRadius: "12", cardShadow: "0 8px 24px rgba(0,0,0,0.4)",
    btnRadius: "6", fontTitle: "Inter", fontBody: "Inter",
    textoTitulo: "PRODUCTO", textoCuerpo: "Descripción del producto.",
  },
  widgets: null,
};

/* ── Tarjeta con borde gradiente ── */
export function GCard({ b1, b2, bw, br, sh, bg, children }) {
  return (
    <div style={{ background: `linear-gradient(135deg,${b1},${b2})`, padding: bw, borderRadius: br, boxShadow: sh, width: "100%" }}>
      <div style={{ background: bg, borderRadius: `calc(${br} - ${bw})`, overflow: "hidden", height: "100%" }}>
        {children}
      </div>
    </div>
  );
}

/* ── Iconos SVG ── */
export const ChevronRight = ({ color = "#aaa", size = 10 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export const SearchIcon = ({ color = "#aaa", size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export const HeartIcon = ({ color = "#aaa", size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);
