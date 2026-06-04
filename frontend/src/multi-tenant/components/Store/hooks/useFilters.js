import { useState, useMemo } from 'react';
import { PRICE_RANGES } from '../storeUtils.jsx';

export function useFilters(products) {
  const [searchQuery,    setSearchQuery]    = useState('');
  const [activeCategory, setActiveCategory] = useState(0);
  const [activePrices,   setActivePrices]   = useState([]);
  const [activeSizes,    setActiveSizes]    = useState([]);

  const togglePrice = (i) =>
    setActivePrices(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);

  const toggleSize = (size) =>
    setActiveSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);

  const clearFilters = () => {
    setSearchQuery('');
    setActiveCategory(0);
    setActivePrices([]);
    setActiveSizes([]);
  };

  const filteredProducts = useMemo(() => {
    let result = products;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }
    if (activePrices.length > 0) {
      result = result.filter(p => {
        const price = parseFloat((p.price ?? '0').replace(/[^0-9.]/g, ''));
        return activePrices.some(i => price >= PRICE_RANGES[i][0] && price < PRICE_RANGES[i][1]);
      });
    }
    return result;
  }, [products, searchQuery, activePrices]);

  const hasActiveFilters = searchQuery.trim() !== '' || activePrices.length > 0 || activeSizes.length > 0;

  return {
    searchQuery, setSearchQuery,
    activeCategory, setActiveCategory,
    activePrices, togglePrice,
    activeSizes, toggleSize,
    clearFilters, filteredProducts, hasActiveFilters,
  };
}
