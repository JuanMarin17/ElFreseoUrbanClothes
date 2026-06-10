import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Plus, Edit2, ToggleLeft, ToggleRight, AlertCircle, RotateCw } from "lucide-react";
import {
  getAllProducts,
  activateProduct,
  inactivateProduct,
} from "../../../admin/modules/administration/services/productService";
import { getStoresByUser, getStoreById } from "../../pages/services/storeService";
import StockAlertToast from "../../../admin/modules/administration/components/StockAlertToast/StockAlertToast";
import HeaderMarket from "../../../utils/Header/HeaderMarket";
import "./StoreProductsAdmin.css";

/** Extrae el userId del JWT guardado en localStorage */
function getUserIdFromJwt() {
  try {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) return null;
    const payload = JSON.parse(atob(jwt.split(".")[1]));
    return payload.user_id ?? payload.sub ?? null;
  } catch {
    return null;
  }
}

const isValidId = (v) => !!v && v !== "null" && v !== "undefined";

/** Garantiza que storeId esté en localStorage. Si no está o es inválido, lo pide al backend. */
async function resolveStoreId() {
  const cached = localStorage.getItem("storeId");
  if (isValidId(cached)) return cached;

  // Limpiar posibles valores corruptos
  localStorage.removeItem("storeId");
  localStorage.removeItem("userRole");

  const userId = getUserIdFromJwt();
  if (!userId) throw new Error("No hay sesión activa.");

  const stores = await getStoresByUser(userId);
  const list   = Array.isArray(stores) ? stores : (stores?.data ?? []);
  if (!list.length) throw new Error("No tienes ninguna tienda creada todavía.");

  // Intenta todos los posibles nombres del campo ID
  const storeId = list[0].storeId ?? list[0].store_id ?? list[0].id ?? null;
  if (!isValidId(storeId)) {
    console.error("[resolveStoreId] Respuesta inesperada:", list[0]);
    throw new Error("El servidor devolvió un ID de tienda inválido.");
  }

  const role = list[0].role ?? "OWNER";
  localStorage.setItem("storeId", storeId);
  localStorage.setItem("userRole", role);
  return storeId;
}

const formatCOP = (price) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(price ?? 0);

function ProductAdminCard({ product, onEdit, onToggle, toggling }) {
  const img = product.images?.[0]?.url;
  const variant = product.variants?.[0];
  const isActive = product.status === "ACTIVE";
  const busy = toggling === product.productId;

  return (
    <div className={`spa-card ${!isActive ? "spa-card--inactive" : ""}`}>
      <div className="spa-card__img">
        {img ? (
          <img src={img} alt={product.name} />
        ) : (
          <div className="spa-card__img-placeholder">
            <Package size={30} />
          </div>
        )}
        <span className={`spa-status ${isActive ? "spa-status--active" : "spa-status--inactive"}`}>
          {isActive ? "ACTIVO" : "INACTIVO"}
        </span>
      </div>

      <div className="spa-card__body">
        <h3 className="spa-card__name">{product.name}</h3>

        {product.brandName && (
          <p className="spa-card__brand">{product.brandName}</p>
        )}

        {product.description && (
          <p className="spa-card__desc">{product.description}</p>
        )}

        {product.categories?.length > 0 && (
          <div className="spa-card__tags">
            {product.categories.slice(0, 3).map((cat, i) => (
              <span key={i} className="spa-tag">{cat}</span>
            ))}
          </div>
        )}

        <div className="spa-card__meta">
          <span className="spa-card__variants">
            {product.variants?.length ?? 0} variante{(product.variants?.length ?? 0) !== 1 ? "s" : ""}
          </span>
          {variant && (
            <span className="spa-card__price">{formatCOP(variant.price)}</span>
          )}
        </div>
      </div>

      <div className="spa-card__actions">
        <button
          className="spa-btn spa-btn--edit"
          onClick={() => onEdit(product.productId)}
          disabled={busy}
        >
          <Edit2 size={13} /> Editar
        </button>
        <button
          className={`spa-btn ${isActive ? "spa-btn--off" : "spa-btn--on"}`}
          onClick={() => onToggle(product.productId, isActive)}
          disabled={busy}
        >
          {busy ? (
            <RotateCw size={13} className="spa-spin" />
          ) : isActive ? (
            <><ToggleLeft size={13} /> Inactivar</>
          ) : (
            <><ToggleRight size={13} /> Activar</>
          )}
        </button>
      </div>
    </div>
  );
}

export default function StoreProductsAdmin() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toggling, setToggling] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [storeSlug, setStoreSlug] = useState(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const storeId = await resolveStoreId();
      const [data, storeData] = await Promise.all([
        getAllProducts(storeId),
        getStoreById(storeId),
      ]);
      setProducts(Array.isArray(data) ? data : []);
      if (storeData?.slug) setStoreSlug(storeData.slug);
    } catch (err) {
      setError(err.message ?? "No se pudieron cargar los productos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProducts();
  }, [loadProducts]);

  const handleToggle = async (productId, isActive) => {
    setToggling(productId);
    try {
      if (isActive) {
        await inactivateProduct(productId);
      } else {
        await activateProduct(productId);
      }
      setProducts(prev =>
        prev.map(p =>
          p.productId === productId
            ? { ...p, status: isActive ? "INACTIVE" : "ACTIVE" }
            : p
        )
      );
    } catch (err) {
      setError(err.message ?? "Error al cambiar estado del producto.");
    } finally {
      setToggling(null);
    }
  };

  const filtered = products.filter(p => {
    if (filter === "ACTIVE") return p.status === "ACTIVE";
    if (filter === "INACTIVE") return p.status === "INACTIVE";
    return true;
  });

  const activeCount = products.filter(p => p.status === "ACTIVE").length;
  const inactiveCount = products.filter(p => p.status === "INACTIVE").length;

  return (
    <div className="spa-root">
      <HeaderMarket />
      <StockAlertToast />

      <div className="spa-page">
        {/* ── Header ── */}
        <div className="spa-header">
          <div>
            <h1 className="spa-title">MIS PRODUCTOS</h1>
            <p className="spa-subtitle">
              {loading
                ? "Cargando…"
                : `${products.length} producto${products.length !== 1 ? "s" : ""} · ${activeCount} activo${activeCount !== 1 ? "s" : ""}`}
            </p>
          </div>
          <button
            className="spa-btn-new"
            onClick={() => navigate(`/admin/${storeSlug}/subir-producto`)}
          >
            <Plus size={15} /> NUEVO PRODUCTO
          </button>
        </div>

        {/* ── Filtros ── */}
        {!loading && products.length > 0 && (
          <div className="spa-filters">
            {[
              { key: "ALL", label: `Todos (${products.length})` },
              { key: "ACTIVE", label: `Activos (${activeCount})` },
              { key: "INACTIVE", label: `Inactivos (${inactiveCount})` },
            ].map(f => (
              <button
                key={f.key}
                className={`spa-filter-btn ${filter === f.key ? "spa-filter-btn--active" : ""}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div className="spa-error">
            <AlertCircle size={16} />
            <span>{error}</span>
            <button onClick={loadProducts}>Reintentar</button>
          </div>
        )}

        {/* ── Loading ── */}
        {loading ? (
          <div className="spa-loading">
            <RotateCw size={30} className="spa-spin" />
            <p>Cargando productos…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="spa-empty">
            <Package size={48} />
            <h2>{products.length === 0 ? "Aún no tienes productos" : "Sin resultados"}</h2>
            <p>
              {products.length === 0
                ? "Crea tu primer producto para empezar a vender."
                : "Cambia el filtro para ver otros productos."}
            </p>
            {products.length === 0 && (
              <button
                className="spa-btn-new"
                onClick={() => navigate(`/admin/${storeSlug}/subir-producto`)}
              >
                <Plus size={15} /> CREAR PRIMER PRODUCTO
              </button>
            )}
          </div>
        ) : (
          <div className="spa-grid">
            {filtered.map(product => (
              <ProductAdminCard
                key={product.productId}
                product={product}
                onEdit={id => navigate(`/admin/${storeSlug}/editar-producto/${id}`)}
                onToggle={handleToggle}
                toggling={toggling}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
