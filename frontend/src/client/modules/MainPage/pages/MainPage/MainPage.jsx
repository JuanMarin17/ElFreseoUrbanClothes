import React, { useState, useMemo, useEffect } from 'react';
import Header from "../../../landingPage/components/Header/Header";
import SidebarFilters from '../../components/products/SidebarFilters/SidebarFilters';
import ProductGrid from '../../components/products/ProductGrid/ProductGrid';
import ModalTastes from '../../components/ModalTastes/ModalTastes';
import { FavoritesProvider, useFavorites } from '../../components/products/FavoritesContext';
import { productsMock } from '../../services/productsMock';
import './MainPage.css';

const INITIAL_FILTERS = {
  maxPrice: 165000,
  sizes: [],
  categories: [],
  colors: [],
  tags: [],
  onlyFavorites: false,
};

const CatalogContent = () => {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [loading, setLoading] = useState(true);
  const { favorites } = useFavorites();

  // ─────────────────────────────────────────────────────────────
  // TODO: REEMPLAZAR ESTE useEffect CON LA LLAMADA AL API
  //
  // const { data: products, isLoading } = useQuery({
  //   queryKey: ['products', filters],
  //   queryFn: () => fetchProducts(filters),
  // });
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  // ─────────────────────────────────────────────────────────────
  // TODO: ELIMINAR ESTE useMemo CUANDO CONSUMAS EL API
  // El filtrado lo hará el servidor — pasa `filters` como params.
  // ─────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const source = filters.onlyFavorites ? favorites : productsMock;
    return source.filter(p => {
      if (p.price > filters.maxPrice) return false;
      if (filters.sizes.length && !filters.sizes.some(s => (p.sizes ?? []).includes(s))) return false;
      if (filters.categories.length && !filters.categories.includes(p.category)) return false;
      if (filters.colors.length && !filters.colors.includes(p.color)) return false;
      if (filters.tags.length && !filters.tags.some(t => (p.tags ?? []).includes(t))) return false;
      return true;
    });
  }, [filters, favorites]);

  return (
    <div className="catalog-content">
      <header className="page-header">
        <h1>CATÁLOGO</h1>
      </header>

      {loading ? (
        <div className="loadingWrapper">
          <div className="spinner" />
          <p className="loadingText">Cargando productos...</p>
        </div>
      ) : (
        <div className="layout-grid">
          <SidebarFilters filters={filters} setFilters={setFilters} />
          {/* TODO: cambiar `filtered` por `products` cuando consumas el API */}
          <ProductGrid products={filtered} />
        </div>
      )}
    </div>
  );
};

function MainPage() {
  return (
    <FavoritesProvider>
      <div className="main-page-container">
        <Header />
        <ModalTastes />
        <CatalogContent />
      </div>
    </FavoritesProvider>
  );
}

export default MainPage;