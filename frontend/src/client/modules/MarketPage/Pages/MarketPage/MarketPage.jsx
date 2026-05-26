import React from 'react';
// 🔌 Descomenta cuando conectes auth:
// import { useAuth } from '../../../../../admin/modules/auth/pages/hook/Useauth';
import HeaderMarket from '../../../../../utils/Header/HeaderMarket';
import HeroPromoSection from '../../components/HeroPromoSection/HeroPromo';
import CategoriesBubble from '../../components/CategoriesBubble/CategoriesBubble';
import FeaturedStores from '../../components/FeaturedStores/FeaturedStores';
import ProductGrid from '../../components/ProductGrid/ProductGrid';
import CreateStoreSection from '../../components/CreateStoreSection/CreateStoreSection';
import FooterMarket from '../../components/FooterMarket/FooterMarket';
import './MarketPage.css';

// ─────────────────────────────────────────────
// DATOS QUEMADOS — Reemplazar con llamadas API
// 🔌 GET /api/products?sort=sales&limit=6
const bestSellers = [
  { id: 101, title: "Vestido floral de tirantes",   price: 16.99, badge: "1.2K+ vendidos", image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&q=80" },
  { id: 102, title: "Bolso de hombro casual",        price: 14.50, badge: "856 vendidos",   image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80" },
  { id: 103, title: "Zapatillas deportivas White",   price: 22.99, badge: "2.3K+ vendidos", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80" },
  { id: 104, title: "Paleta de sombras 9 tonos",     price: 6.99,  badge: "3.1K+ vendidos", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80" },
  { id: 105, title: "Gafas de sol cuadradas Dark",   price: 5.99,  badge: "1.8K+ vendidos", image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&q=80" },
  { id: 106, title: "Funda de cojín decorativa",     price: 4.99,  badge: "965 vendidos",   image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400&q=80" },
];

// 🔌 GET /api/products?sort=createdAt&limit=6
const newArrivals = [
  { id: 201, title: "Top corto de tirantes",        price: 7.99,  badge: "Nuevo",  image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80" },
  { id: 202, title: "Shorts denim vintage",          price: 12.99, badge: "Nuevo",  image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&q=80" },
  { id: 203, title: "Pendientes dorados Pearl",      price: 3.99,  badge: "Nuevo",  image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80" },
  { id: 204, title: "Reloj inteligente Smart",       price: 18.99, badge: "Nuevo",  image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400&q=80" },
  { id: 205, title: "Camiseta estampada Street",     price: 8.99,  badge: "Nuevo",  image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400&q=80" },
  { id: 206, title: "Difusor de aromas Zen",         price: 6.50,  badge: "Nuevo",  image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&q=80" },
];

export default function MarketPage() {
  return (
    <div className="vexio-market-root">
      {/* Header con auth integrado y animación hide-on-scroll */}
      <HeaderMarket />

      <main className="vx-market-viewport">
        <HeroPromoSection />
        <CategoriesBubble />
        <FeaturedStores />
        <ProductGrid title="Más vendidos" products={bestSellers} />
        <CreateStoreSection />
        <ProductGrid title="Nuevas llegadas" products={newArrivals} />
      </main>

      <FooterMarket />
    </div>
  );
}
