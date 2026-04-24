import "./ProductGrid.css";
import ProductCard from "./ProductCard";

const ProductGrid = ({ products }) => (
  <section className="gridContainer">
    <p className="resultsCount">{products.length} productos encontrados</p>
    <div className="grid">
      {products.length === 0 ? (
        <div className="empty">
          <span>🔍</span>
          No se encontraron productos con estos filtros.
        </div>
      ) : (
        products.map((product, index) => (
          <ProductCard key={`product-${product.id}`} product={product} index={index} />
        ))
      )}
    </div>
  </section>
);

export default ProductGrid;