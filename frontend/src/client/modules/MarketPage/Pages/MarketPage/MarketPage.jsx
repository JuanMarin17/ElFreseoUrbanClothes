import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Grid2X2 } from 'lucide-react';
import { fetchCatalogProducts } from '../../../Catalogo/catalogoService';
import HeaderMarket        from '../../../../../utils/Header/HeaderMarket';
import HeroPromoSection    from '../../components/HeroPromoSection/HeroPromo';
import StatsSection        from '../../components/StatsSection/StatsSection';
import CategoriesBubble    from '../../components/CategoriesBubble/CategoriesBubble';
import FeaturedStores      from '../../components/FeaturedStores/FeaturedStores';
import ProductGrid         from '../../components/ProductGrid/ProductGrid';
import WhyChooseUs         from '../../components/WhyChooseUs/WhyChooseUs';
import ReviewsSection      from '../../components/ReviewsSection/ReviewsSection';
import CreateStoreSection  from '../../components/CreateStoreSection/CreateStoreSection';
import FooterMarket        from '../../components/FooterMarket/FooterMarket';
import './MarketPage.css';

function useMarketProducts() {
  const [all,     setAll]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchCatalogProducts()
      .then(data => {
        if (cancelled) return;
        setAll(data);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // "Destacados": productos con más stock (proxy de popularidad), tomar los primeros 8.
  // Tiebreak por id: el backend no garantiza el mismo orden entre peticiones para
  // productos con el mismo stock, así que sin esto el listado (y sus fotos) cambiaba
  // de una carga a otra aunque los datos fueran los mismos.
  const bestSellers = all.length > 0
    ? [...all]
        .sort((a, b) => (b.stock ?? 0) - (a.stock ?? 0) || String(a.id).localeCompare(String(b.id)))
        .slice(0, 8)
        .map(p => ({ ...p, badge: p.stock > 50 ? 'Más vendido' : 'Destacado' }))
    : [];

  // "Nuevas llegadas": los últimos 8 del array (el backend suele devolver más recientes al final)
  const newArrivals = all.length > 0
    ? [...all]
        .reverse()
        .slice(0, 8)
        .map(p => ({ ...p, badge: 'Nuevo' }))
    : [];

  return { bestSellers, newArrivals, loading, total: all.length };
}

export default function MarketPage() {
  const { bestSellers, newArrivals, loading, total } = useMarketProducts();
  const navigate = useNavigate();

  return (
    <div className="vexio-market-root">
      <HeaderMarket />

      <main className="vx-market-viewport">
        {/* 1 · Hero */}
        <HeroPromoSection />

        {/* 2 · Stats */}
        <StatsSection />

        {/* 3 · Categorías */}
        <CategoriesBubble
          onCategorySelect={(name) => navigate(`/catalogo?categoria=${encodeURIComponent(name)}`)}
          onViewAll={() => navigate('/catalogo')}
        />

        {/* 4 · Más vendidos — datos reales */}
        <div id="market-products">
          <ProductGrid
            title="Más vendidos"
            products={bestSellers}
            loading={loading}
            emptyText="Cargando productos de las tiendas..."
          />
        </div>

        {/* 5 · Nuevas llegadas — datos reales */}
        <div id="market-new-arrivals">
          <ProductGrid
            title="Nuevas llegadas"
            products={newArrivals}
            loading={loading}
            emptyText="Cargando productos de las tiendas..."
          />
        </div>

        {/* 6 · Tiendas activas */}
        <div id="market-stores">
          <FeaturedStores />
        </div>

        {/* 7 · CTA Catálogo */}
        <section className="vx-catalog-cta">
          <div className="vx-catalog-cta__inner">
            <div className="vx-catalog-cta__head">
              <Grid2X2 size={22} className="vx-catalog-cta__icon" />
              <h2 className="vx-catalog-cta__title">CATÁLOGO COMPLETO</h2>
            </div>
            <p className="vx-catalog-cta__sub">
              Explora {total > 0 ? `los ${total.toLocaleString('es-CO')} productos` : 'todos los productos'} de
              nuestras tiendas con filtros avanzados, búsqueda instantánea y
              sugerencias personalizadas para ti.
            </p>
            <Link to="/catalogo" className="vx-catalog-cta__btn">
              VER TODO EL CATÁLOGO <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        {/* 8 · Beneficios */}
        <WhyChooseUs />

        {/* 9 · Reseñas */}
        <ReviewsSection />

        {/* 10 · B2B */}
        <CreateStoreSection />
      </main>

      <FooterMarket />
    </div>
  );
}
