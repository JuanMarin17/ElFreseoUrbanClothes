import React, { useState, useMemo, useEffect } from 'react';
import Header from '../../../landingPage/components/Header/Header';
import SidebarFilters from '../../components/products/SidebarFilters/SidebarFilters';
import ProductGrid from '../../components/products/ProductGrid/ProductGrid';
import { productsMock } from '../../services/productsMock';
import './MainPage.css';

const INITIAL_FILTERS = {
  maxPrice: 165000,
  sizes: [],
  categories: [],
  colors: [],
  tags: [],
};

function MainPage() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [loading, setLoading] = useState(true);

  // ─────────────────────────────────────────────────────────────
  // TODO: REEMPLAZAR ESTE useEffect CON LA LLAMADA AL API
  //
  // Cuando tengas el backend listo, borra este useEffect y usa
  // algo como esto con React Query:
  //
  // const { data: products, isLoading } = useQuery({
  //   queryKey: ['products', filters],
  //   queryFn: () => fetchProducts(filters),
  //   // fetchProducts hace: GET /api/products?maxPrice=...&sizes=...&categories=...
  // });
  //
  // O con fetch nativo:
  //
  // useEffect(() => {
  //   setLoading(true);
  //   const params = new URLSearchParams({
  //     maxPrice: filters.maxPrice,
  //     sizes: filters.sizes.join(','),
  //     categories: filters.categories.join(','),
  //     colors: filters.colors.join(','),
  //     tags: filters.tags.join(','),
  //   });
  //   fetch(`/api/products?${params}`)
  //     .then(res => res.json())
  //     .then(data => { setProducts(data); setLoading(false); })
  //     .catch(err => { console.error(err); setLoading(false); });
  // }, [filters]);
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  // ─────────────────────────────────────────────────────────────
  // TODO: CUANDO CONSUMAS EL API, ELIMINAR ESTE useMemo
  //
  // El filtrado local solo existe porque usamos datos mock.
  // Con el backend, el filtrado lo hace el servidor —
  // simplemente pasa `filters` como parámetros al API arriba
  // y usa directamente `products` que devuelve el servidor.
  // ─────────────────────────────────────────────────────────────
  const filtered = useMemo(() => productsMock.filter(p => {
    if (p.price > filters.maxPrice)                                                                return false;
    if (filters.sizes.length      && !filters.sizes.some(s => (p.sizes ?? []).includes(s)))       return false;
    if (filters.categories.length && !filters.categories.includes(p.category))                    return false;
    if (filters.colors.length     && !filters.colors.includes(p.color))                           return false;
    if (filters.tags.length       && !filters.tags.some(t => (p.tags ?? []).includes(t)))         return false;
    return true;
  }), [filters]);

  return (
    <div className="main-page-container">
      <Header />
      <div className="catalog-content">
        <header className="page-header">
          <h1>CATÁLOGO</h1>
          <p className="page-subtitle">Colección Urbana 2026</p>
        </header>

        {loading ? (
          <div className="loadingWrapper">
            asyn awei
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
    </div>
  );
}

export default MainPage;