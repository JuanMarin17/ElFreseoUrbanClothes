import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, SlidersHorizontal, X, ChevronDown, Store,
  Heart, ShoppingBag, Sparkles, ArrowUpDown, Grid2X2,
  Rows3, ShoppingCart, CheckCircle, AlertCircle, Minus, Plus,
} from "lucide-react";
import HeaderMarket from "../../../utils/Header/HeaderMarket.jsx";
import FooterMarket from "../MarketPage/components/FooterMarket/FooterMarket.jsx";
import {
  fetchCatalogProducts,
  getUserTastes,
  scoreProductForTastes,
} from "./catalogoService.js";
import { addItem } from "../../../multi-tenant/pages/services/cartService.js";
import { isWishlisted, toggleInWishlist } from "../../../utils/wishlistService.js";
import "./CatalogoPage.css";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES  = [
  "Camisetas", "Hoodies", "Chaquetas", "Pantalones", "Gorras", "Accesorios",
  "Smartphones", "Portátiles", "Auriculares", "Gaming", "Tablets", "Wearables", "Accesorios Tech",
];
const SIZES       = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"];
const SORT_OPTIONS = [
  { value: "relevancia",  label: "Relevancia" },
  { value: "precio-asc",  label: "Menor precio" },
  { value: "precio-desc", label: "Mayor precio" },
  { value: "nombre",      label: "A → Z" },
];
const COLORS_FILTER = [
  { label: "Negro",    key: "negro",    hex: "#111111" },
  { label: "Blanco",   key: "blanco",   hex: "#F0EDE8" },
  { label: "Azul",     key: "azul",     hex: "#1D4ED8" },
  { label: "Gris",     key: "gris",     hex: "#6B7280" },
  { label: "Verde",    key: "verde",    hex: "#16A34A" },
  { label: "Rojo",     key: "rojo",     hex: "#DC2626" },
  { label: "Amarillo", key: "amarillo", hex: "#CA8A04" },
  { label: "Rosado",   key: "rosado",   hex: "#EC4899" },
  { label: "Beige",    key: "beige",    hex: "#D4B896" },
];
const DEFAULT_FILTERS = {
  categories: [], colors: [], sizes: [], priceMax: 500000, sort: "relevancia",
};

// ─── Quick-Add Modal ──────────────────────────────────────────────────────────

function QuickAddModal({ product, onClose }) {
  const navigate = useNavigate();
  const variants = product.rawVariants ?? [];

  // Derivar colores y tallas únicos disponibles
  const colors = product.colors ?? [];
  const [selColor, setSelColor] = useState(colors[0]?.name ?? null);

  const sizesForColor = useMemo(() => {
    if (!variants.length) return product.sizes ?? [];
    const filtered = variants.filter(v => !selColor || v.color === selColor);
    const seen = new Set();
    return filtered.filter(v => v.size && !seen.has(v.size) && seen.add(v.size)).map(v => v.size);
  }, [variants, selColor, product.sizes]);

  const [selSize, setSelSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");

  // Al cambiar color, reset talla si no está disponible
  useEffect(() => {
    if (selSize && !sizesForColor.includes(selSize)) setSelSize(null);
  }, [selSize, sizesForColor]);

  const activeVariant = useMemo(() =>
    variants.find(v =>
      (!selColor || v.color === selColor) &&
      (!selSize  || v.size  === selSize)
    ),
  [variants, selColor, selSize]);

  const stock        = activeVariant?.stock ?? (selSize ? 0 : null);
  const displayPrice = activeVariant?.price ?? product.price;
  const priceStr     = new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", maximumFractionDigits: 0,
  }).format(displayPrice);

  const canAdd = selSize && (stock === null || stock > 0) && status !== "loading";

  const handleAdd = async () => {
    if (!canAdd) return;

    const jwt = localStorage.getItem("jwt");
    if (!jwt || jwt === "null") {
      setStatus("error");
      setErrorMsg("Debes iniciar sesión para agregar al carrito");
      return;
    }

    if (!product.storeId) {
      navigate(`/products/${product.id}?src=catalog`);
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      localStorage.setItem("storeId", product.storeId);
      await addItem(product.storeId, {
        productId: product.id,
        variantId: activeVariant?.variantId ?? null,
        quantity:  qty,
      });
      window.dispatchEvent(new Event("cart-updated"));
      setStatus("success");
      setTimeout(onClose, 1600);
    } catch (e) {
      setStatus("error");
      setErrorMsg(e.message ?? "No se pudo agregar al carrito");
    }
  };

  return (
    <motion.div
      className="cat-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="cat-modal"
        initial={{ opacity: 0, y: 56, scale: 0.88 }}
        animate={{ opacity: 1, y: 0,  scale: 1 }}
        exit={{   opacity: 0, y: 24,  scale: 0.92, transition: { duration: 0.16 } }}
        transition={{ type: "spring", stiffness: 340, damping: 30 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button className="cat-modal-close" onClick={onClose}><X size={18} /></button>

        <div className="cat-modal-inner">
          {/* Image */}
          <div className="cat-modal-img">
            {product.image
              ? <img src={product.image} alt={product.name} />
              : <ShoppingBag size={40} />
            }
          </div>

          {/* Info */}
          <div className="cat-modal-info">
            {product.storeName && (
              <span className="cat-modal-store"><Store size={11} />{product.storeName}</span>
            )}
            {product.brand && <p className="cat-modal-brand">{product.brand}</p>}
            <h2 className="cat-modal-name">{product.name}</h2>
            <p className="cat-modal-price">{priceStr}</p>

            {/* Color selector */}
            {colors.length > 0 && (
              <div className="cat-modal-section">
                <span className="cat-modal-label">
                  Color: <strong>{selColor}</strong>
                </span>
                <div className="cat-modal-colors">
                  {colors.map(c => (
                    <button
                      key={c.name}
                      className={`cat-modal-color-btn ${selColor === c.name ? "active" : ""}`}
                      style={{ background: c.hex }}
                      onClick={() => setSelColor(c.name)}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size selector */}
            <div className="cat-modal-section">
              <span className="cat-modal-label">
                Talla: {selSize ? <strong>{selSize}</strong> : <em>Selecciona una talla</em>}
              </span>
              <div className="cat-modal-sizes">
                {sizesForColor.map(s => {
                  const v = variants.find(vv =>
                    (!selColor || vv.color === selColor) && vv.size === s
                  );
                  const available = !v || v.stock > 0;
                  return (
                    <button
                      key={s}
                      className={`cat-modal-size-btn ${selSize === s ? "active" : ""} ${!available ? "unavailable" : ""}`}
                      onClick={() => available && setSelSize(s)}
                      disabled={!available}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stock indicator */}
            {selSize && stock !== null && (
              <p className={`cat-modal-stock ${stock <= 5 ? "low" : ""} ${stock === 0 ? "out" : ""}`}>
                {stock === 0 ? "Sin stock" : stock <= 5 ? `Solo ${stock} disponibles` : `${stock} disponibles`}
              </p>
            )}

            {/* Quantity */}
            <div className="cat-modal-qty">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1}><Minus size={14} /></button>
              <span>{qty}</span>
              <button onClick={() => setQty(q => Math.min(stock ?? 99, q + 1))} disabled={stock !== null && qty >= stock}><Plus size={14} /></button>
            </div>

            {/* Error */}
            <AnimatePresence>
              {status === "error" && (
                <motion.p className="cat-modal-error"
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <AlertCircle size={14} /> {errorMsg}
                </motion.p>
              )}
            </AnimatePresence>

            {/* CTA */}
            <button
              className={`cat-modal-cta ${status}`}
              onClick={status === "success" ? undefined : handleAdd}
              disabled={!canAdd || status === "loading" || status === "success"}
            >
              {status === "loading" && <span className="cat-modal-spinner" />}
              {status === "success" && <CheckCircle size={16} />}
              {status === "idle"    && <ShoppingCart size={16} />}
              {status === "loading" ? "Agregando…"
               : status === "success" ? "¡Agregado al carrito!"
               : !selSize           ? "Selecciona una talla"
               : stock === 0        ? "Sin stock"
               : "Agregar al carrito"}
            </button>

            {/* Ver producto completo */}
            <button className="cat-modal-link" onClick={() => { const jwt = localStorage.getItem("jwt"); if (!jwt || jwt === "null") { navigate("/login"); return; } if (product.storeId) localStorage.setItem("storeId", product.storeId); navigate(`/products/${product.id}?src=catalog`); }}>
              Ver detalle del producto →
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="cat-skeleton">
      <div className="cat-sk-img" />
      <div className="cat-sk-body">
        <div className="cat-sk-line short" />
        <div className="cat-sk-line" />
        <div className="cat-sk-line medium" />
      </div>
    </div>
  );
}

// ─── Product card ─────────────────────────────────────────────────────────────

const cardVariants = {
  hidden:  { opacity: 0, y: 20, scale: 0.97 },
  visible: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.3, delay: Math.min(i * 0.04, 0.25), ease: [0.22, 1, 0.36, 1] },
  }),
  exit:    { opacity: 0, scale: 0.95, transition: { duration: 0.16 } },
};

function ProductCard({ product, index, onQuickAdd }) {
  const navigate  = useNavigate();
  const [liked,    setLiked]    = useState(() => isWishlisted(product.id));
  const [imgError, setImgError] = useState(false);

  const go = useCallback(() => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt || jwt === "null") { navigate("/login"); return; }
    if (product.storeId) localStorage.setItem("storeId", product.storeId);
    navigate(`/products/${product.id}?src=catalog`);
  }, [product.id, product.storeId, navigate]);

  const handleWishlist = useCallback((e) => {
    e.stopPropagation();
    const jwt = localStorage.getItem("jwt");
    if (!jwt || jwt === "null") { navigate("/login"); return; }
    const newState = toggleInWishlist({
      id:             product.id,
      name:           product.name,
      priceFormatted: product.priceFormatted,
      image:          product.image,
      storeId:        product.storeId ?? null,
      storeSlug:      null,
    });
    setLiked(newState);
  }, [product.id, product.name, product.priceFormatted, product.image, product.storeId, navigate]);

  return (
    <motion.article
      className="cat-card"
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      onClick={go}
    >
      <div className="cat-card-img-wrap">
        {!imgError && product.image
          ? <img src={product.image} alt={product.name} className="cat-card-img" onError={() => setImgError(true)} loading="lazy" />
          : <div className="cat-card-no-img"><ShoppingBag size={28} /></div>
        }

        {product.storeName && (
          <span className="cat-store-badge"><Store size={9} />{product.storeName}</span>
        )}

        <button
          className={`cat-wish ${liked ? "active" : ""}`}
          onClick={handleWishlist}
          aria-label={liked ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          <Heart size={14} fill={liked ? "currentColor" : "none"} />
        </button>

        {product.colors?.length > 0 && (
          <div className="cat-dots">
            {product.colors.slice(0, 4).map((c, i) => (
              <span key={i} className="cat-dot" style={{ background: c.hex }} title={c.name} />
            ))}
          </div>
        )}

        <div className="cat-hover-overlay">
          <button
            className="cat-quick-view"
            onClick={e => { e.stopPropagation(); onQuickAdd(product); }}
          >
            <ShoppingCart size={13} /> Agregar al carrito
          </button>
        </div>
      </div>

      <div className="cat-card-body">
        {product.brand && <span className="cat-card-brand">{product.brand}</span>}
        <h3 className="cat-card-name">{product.name}</h3>

        {/* Estrellas */}
        <div className="cat-stars-row">
          {[1,2,3,4,5].map(n => (
            <span
              key={n}
              className={`cat-star${product.rating && n <= Math.round(product.rating) ? " cat-star--on" : ""}`}
            >★</span>
          ))}
          {product.reviewCount > 0 && (
            <span className="cat-stars-count">({product.reviewCount})</span>
          )}
        </div>

        <div className="cat-card-footer">
          <span className="cat-card-price">{product.priceFormatted}</span>
          {product.sizes?.length > 0 && (
            <div className="cat-sizes-row">
              {product.sizes.slice(0, 3).map(s => <span key={s} className="cat-sz">{s}</span>)}
              {product.sizes.length > 3 && <span className="cat-sz more">+{product.sizes.length - 3}</span>}
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}

// ─── Filter accordion ─────────────────────────────────────────────────────────

function FilterSection({ title, count = 0, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="cat-fs">
      <button className="cat-fs-header" onClick={() => setOpen(o => !o)}>
        <span className="cat-fs-title">
          {title}
          {count > 0 && <span className="cat-fs-count">{count}</span>}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={15} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="cat-fs-body">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Sidebar content ──────────────────────────────────────────────────────────

function SidebarContent({ filters, setFilters, onApply, onClear, resultCount }) {
  const toggle = (key, value) =>
    setFilters(f => {
      const arr = f[key];
      return { ...f, [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] };
    });

  const activeCount = filters.categories.length + filters.colors.length + filters.sizes.length;

  return (
    <>
      <div className="cat-sb-header">
        <span className="cat-sb-title">Filtros</span>
        {activeCount > 0 && (
          <button className="cat-sb-clear" onClick={onClear}>Limpiar ({activeCount})</button>
        )}
      </div>

      <div className="cat-sb-body">
        <FilterSection title="Ordenar">
          <div className="cat-radio-group">
            {SORT_OPTIONS.map(o => (
              <label key={o.value} className={`cat-radio-item ${filters.sort === o.value ? "active" : ""}`}>
                <input type="radio" name="sort" value={o.value}
                  checked={filters.sort === o.value}
                  onChange={() => setFilters(f => ({ ...f, sort: o.value }))} />
                {o.label}
              </label>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Categorías" count={filters.categories.length}>
          <div className="cat-pill-col">
            {CATEGORIES.map(cat => (
              <button key={cat}
                className={`cat-pill ${filters.categories.includes(cat) ? "active" : ""}`}
                onClick={() => toggle("categories", cat)}>
                {cat} {filters.categories.includes(cat) && <X size={11} />}
              </button>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Colores" count={filters.colors.length}>
          <div className="cat-color-grid">
            {COLORS_FILTER.map(c => (
              <button key={c.key}
                className={`cat-color-btn ${filters.colors.includes(c.key) ? "active" : ""}`}
                onClick={() => toggle("colors", c.key)}>
                <span className="cat-swatch" style={{ background: c.hex }} />
                <span>{c.label}</span>
              </button>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Tallas" count={filters.sizes.length}>
          <div className="cat-pill-row">
            {SIZES.map(s => (
              <button key={s}
                className={`cat-sz-pill ${filters.sizes.includes(s) ? "active" : ""}`}
                onClick={() => toggle("sizes", s)}>
                {s}
              </button>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Precio máximo" defaultOpen={false}>
          <div className="cat-price-wrap">
            <div className="cat-price-labels">
              <span>$0</span>
              <span className="cat-price-val">
                {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })
                  .format(filters.priceMax)}
              </span>
            </div>
            <input type="range" min={0} max={500000} step={10000} value={filters.priceMax}
              className="cat-range"
              onChange={e => setFilters(f => ({ ...f, priceMax: +e.target.value }))} />
          </div>
        </FilterSection>
      </div>

      <div className="cat-sb-footer">
        <button className="cat-apply-btn" onClick={onApply}>
          Ver {resultCount} producto{resultCount !== 1 ? "s" : ""}
        </button>
      </div>
    </>
  );
}

// ─── Para Ti card ─────────────────────────────────────────────────────────────

function ForYouCard({ product, index, onQuickAdd }) {
  const navigate  = useNavigate();
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      className="cat-fy-card"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.028, 0.26), duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => {
        const jwt = localStorage.getItem("jwt");
        if (!jwt || jwt === "null") { navigate("/login"); return; }
        if (product.storeId) localStorage.setItem("storeId", product.storeId);
        navigate(`/products/${product.id}?src=catalog`);
      }}
    >
      <div className="cat-fy-img">
        {!imgError && product.image
          ? <img src={product.image} alt={product.name} onError={() => setImgError(true)} />
          : <ShoppingBag size={22} />
        }
        <button
          className="cat-fy-cart-btn"
          onClick={e => { e.stopPropagation(); onQuickAdd(product); }}
          aria-label="Agregar al carrito"
        >
          <ShoppingCart size={12} />
        </button>
      </div>
      <div className="cat-fy-info">
        <span className="cat-fy-name">{product.name}</span>
        <span className="cat-fy-price">{product.priceFormatted}</span>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CatalogoPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products,    setProducts]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [search,      setSearch]      = useState(searchParams.get("q") ?? "");
  const [debSearch,   setDebSearch]   = useState(search);
  const [filters,     setFilters]     = useState(() => {
    const catParam = searchParams.get("categoria");
    return catParam
      ? { ...DEFAULT_FILTERS, categories: [catParam] }
      : DEFAULT_FILTERS;
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [gridCompact, setGridCompact] = useState(false);
  const [userTastes,  setUserTastes]  = useState(null);
  const [quickProd,   setQuickProd]   = useState(null); // modal
  const searchRef = useRef(null);

  // Scroll to top on mount
  useEffect(() => { window.scrollTo({ top: 0, behavior: "auto" }); }, []);

  // Si llega un ?categoria= nuevo desde fuera de esta página (ej. al hacer clic
  // en una tarjeta de categoría desde Market/Landing mientras ya estás en
  // /catalogo con otro filtro), React Router no remonta el componente porque
  // la ruta es la misma — sin esto, el scroll se queda donde estaba sobre un
  // listado distinto. No depende de "q" para no saltar al tope en cada tecla
  // de la búsqueda en vivo.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("categoria")]);

  // Load
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    fetchCatalogProducts()
      .then(data => { if (alive) setProducts(data); })
      .catch(e   => { if (alive) setError(e.message); })
      .finally(  () => { if (alive) setLoading(false); });
    getUserTastes().then(t => { if (alive) setUserTastes(t); });
    return () => { alive = false; };
  }, []);

  // Debounce search — también elimina el param categoria de la URL al buscar/limpiar
  useEffect(() => {
    const t = setTimeout(() => {
      setDebSearch(search);
      const params = {};
      if (search) params.q = search;
      setSearchParams(params, { replace: true });
    }, 300);
    return () => clearTimeout(t);
  }, [search, setSearchParams]);

  // Lock scroll when sidebar or modal open
  useEffect(() => {
    document.body.style.overflow = (sidebarOpen || quickProd) ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen, quickProd]);

  // Filtered + sorted
  const filtered = useMemo(() => {
    let list = [...products];

    if (debSearch.trim()) {
      const q = debSearch.toLowerCase().trim();
      list = list.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.storeName?.toLowerCase().includes(q) ||
        p.categories?.some(c => c.toLowerCase().includes(q))
      );
    }

    if (filters.categories.length) {
      const matchesCategoryTag = (p) =>
        p.categories?.some(c =>
          filters.categories.some(fc =>
            c.toLowerCase().includes(fc.toLowerCase()) || fc.toLowerCase().includes(c.toLowerCase())
          )
        );
      // Las categorías de las tarjetas de inicio (ej. "Mujer", "Joyería") no
      // siempre coinciden con cómo cada tienda nombró sus propias categorías.
      // Si nadie etiquetó nada con ese término exacto, no devuelvas una lista
      // vacía: amplía la búsqueda a nombre/marca/tienda antes de rendirte.
      const hasTagMatch = products.some(matchesCategoryTag);
      if (hasTagMatch) {
        list = list.filter(matchesCategoryTag);
      } else {
        const terms = filters.categories.map(fc => fc.toLowerCase());
        list = list.filter(p =>
          terms.some(fc =>
            p.name?.toLowerCase().includes(fc) ||
            p.brand?.toLowerCase().includes(fc) ||
            p.storeName?.toLowerCase().includes(fc)
          )
        );
      }
    }

    if (filters.colors.length) {
      list = list.filter(p =>
        p.colors?.some(c =>
          filters.colors.some(fc => c.name.toLowerCase().includes(fc))
        )
      );
    }

    if (filters.sizes.length) {
      list = list.filter(p => p.sizes?.some(s => filters.sizes.includes(s)));
    }

    list = list.filter(p => p.price <= filters.priceMax);

    switch (filters.sort) {
      case "precio-asc":  list.sort((a, b) => a.price - b.price); break;
      case "precio-desc": list.sort((a, b) => b.price - a.price); break;
      case "nombre":      list.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: break;
    }
    return list;
  }, [products, debSearch, filters]);

  // Para Ti
  const forYouProducts = useMemo(() => {
    if (!userTastes || !products.length) return [];
    return [...products]
      .map(p => ({ ...p, _score: scoreProductForTastes(p, userTastes) }))
      .filter(p => p._score > 0)
      .sort((a, b) => b._score - a._score)
      .slice(0, 10);
  }, [products, userTastes]);

  const showForYou = forYouProducts.length > 0 && !debSearch && !filters.categories.length;

  const activeFilterCount = filters.categories.length + filters.colors.length + filters.sizes.length;

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSearch("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const removeFilter = useCallback((key, value) =>
    setFilters(f => ({ ...f, [key]: f[key].filter(v => v !== value) }))
  , []);

  return (
    <div className="cat-root">
      {/* Header */}
      <HeaderMarket />

      {/* Search topbar */}
      <div className="cat-topbar">
        <div className="cat-search-wrap">
          <Search size={15} className="cat-search-icon" />
          <input
            ref={searchRef}
            type="text"
            className="cat-search-input"
            placeholder="Buscar productos, marcas, tiendas..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <AnimatePresence>
            {search && (
              <motion.button className="cat-search-clear"
                initial={{ scale: 0.82, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.82, opacity: 0 }} transition={{ duration: 0.14 }}
                onClick={() => { setSearch(""); searchRef.current?.focus(); }}>
                <X size={13} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <button
          className={`cat-filter-btn ${activeFilterCount > 0 ? "has-active" : ""}`}
          onClick={() => setSidebarOpen(o => !o)}
        >
          <SlidersHorizontal size={15} />
          <span className="cat-filter-label">Filtrar</span>
          {activeFilterCount > 0 && (
            <span className="cat-filter-badge">{activeFilterCount}</span>
          )}
        </button>
      </div>

      {/* Body */}
      <div className="cat-body">

        {/* Sidebar overlay (mobile) */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div className="cat-overlay"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              onClick={() => setSidebarOpen(false)} />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <aside className={`cat-sidebar ${sidebarOpen ? "open" : ""}`}>
          <SidebarContent
            filters={filters} setFilters={setFilters}
            onApply={() => { setSidebarOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            onClear={clearFilters}
            resultCount={filtered.length}
          />
        </aside>

        {/* Main */}
        <main className="cat-main">

          {/* Active chips */}
          <AnimatePresence>
            {(activeFilterCount > 0 || debSearch) && (
              <motion.div className="cat-chips-row"
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
                <div className="cat-chips-inner">
                  {debSearch && (
                    <motion.button className="cat-chip"
                      initial={{ scale: 0.82, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.82, opacity: 0 }} onClick={() => setSearch("")}>
                      &ldquo;{debSearch}&rdquo; <X size={11} />
                    </motion.button>
                  )}
                  {filters.categories.map(c => (
                    <motion.button key={c} className="cat-chip"
                      initial={{ scale: 0.82, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.82, opacity: 0 }} onClick={() => removeFilter("categories", c)}>
                      {c} <X size={11} />
                    </motion.button>
                  ))}
                  {filters.sizes.map(s => (
                    <motion.button key={s} className="cat-chip"
                      initial={{ scale: 0.82, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.82, opacity: 0 }} onClick={() => removeFilter("sizes", s)}>
                      Talla {s} <X size={11} />
                    </motion.button>
                  ))}
                  {filters.colors.map(c => (
                    <motion.button key={c} className="cat-chip"
                      initial={{ scale: 0.82, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.82, opacity: 0 }} onClick={() => removeFilter("colors", c)}>
                      {c} <X size={11} />
                    </motion.button>
                  ))}
                  <button className="cat-chip clear" onClick={clearFilters}>Limpiar todo</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results bar */}
          <div className="cat-results-bar">
            <span className="cat-count">
              {loading ? "Cargando productos…"
               : error  ? "Error al cargar"
               : `${filtered.length.toLocaleString("es-CO")} producto${filtered.length !== 1 ? "s" : ""}`}
            </span>
            <div className="cat-bar-right">
              <div className="cat-sort-wrap">
                <ArrowUpDown size={13} />
                <select className="cat-sort-sel" value={filters.sort}
                  onChange={e => setFilters(f => ({ ...f, sort: e.target.value }))}>
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="cat-view-btns">
                <button className={`cat-view-btn ${!gridCompact ? "active" : ""}`} onClick={() => setGridCompact(false)}>
                  <Grid2X2 size={15} />
                </button>
                <button className={`cat-view-btn ${gridCompact ? "active" : ""}`} onClick={() => setGridCompact(true)}>
                  <Rows3 size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* Error state */}
          {!loading && error && (
            <motion.div className="cat-error-banner" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <AlertCircle size={18} />
              <span>No se pudieron cargar los productos. Verifica tu conexión.</span>
              <button onClick={() => window.location.reload()}>Reintentar</button>
            </motion.div>
          )}

          {/* Para Ti */}
          <AnimatePresence>
            {!loading && !error && showForYou && (
              <motion.section className="cat-for-you"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
                <div className="cat-fy-header">
                  <Sparkles size={15} className="cat-sparkle-icon" />
                  <h2 className="cat-fy-title">Para ti</h2>
                  <span className="cat-fy-sub">Basado en tus gustos</span>
                </div>
                <div className="cat-fy-scroll">
                  {forYouProducts.map((p, i) => (
                    <ForYouCard key={p.id} product={p} index={i} onQuickAdd={setQuickProd} />
                  ))}
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Grid */}
          {loading ? (
            <div className={`cat-grid ${gridCompact ? "compact" : ""}`}>
              {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : !error && filtered.length === 0 ? (
            <motion.div className="cat-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="cat-empty-icon"><Search size={36} /></div>
              <h3>
                {products.length === 0
                  ? "No hay productos disponibles"
                  : filters.categories.length > 0
                    ? `Sin resultados para "${filters.categories.join(", ")}"`
                    : "Sin resultados"}
              </h3>
              <p>
                {products.length === 0
                  ? "Aún no hay productos publicados. Vuelve pronto."
                  : filters.categories.length > 0
                    ? "Aún no hay productos en esta categoría. Prueba con otra o explora el catálogo completo."
                    : "Ajusta los filtros o prueba con otra búsqueda"}
              </p>
              {products.length > 0 && (
                <button className="cat-empty-btn" onClick={clearFilters}>Limpiar filtros</button>
              )}
            </motion.div>
          ) : (
            <motion.div className={`cat-grid ${gridCompact ? "compact" : ""}`} layout>
              <AnimatePresence mode="popLayout">
                {filtered.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} onQuickAdd={setQuickProd} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </main>
      </div>

      {/* Footer */}
      <FooterMarket />

      {/* Quick-Add Modal */}
      <AnimatePresence>
        {quickProd && (
          <QuickAddModal product={quickProd} onClose={() => setQuickProd(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
