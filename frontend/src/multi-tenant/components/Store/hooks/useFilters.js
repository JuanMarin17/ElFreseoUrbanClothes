import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { PRICE_RANGES } from '../storeUtils.jsx';

export function useFilters(products, categories = []) {
  const [searchQuery,    setSearchQueryRaw] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(0);
  const [activePrices,   setActivePrices]   = useState([]);
  const [activeSizes,    setActiveSizes]    = useState([]);
  const [sortBy,         setSortBy]         = useState('relevant');

  const timerRef = useRef(null);

  const setSearchQuery = useCallback((val) => {
    setSearchQueryRaw(val);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedQuery(val), 250);
  }, []);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const togglePrice = (i) =>
    setActivePrices(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);

  const toggleSize = (size) =>
    setActiveSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);

  const clearFilters = useCallback(() => {
    setSearchQueryRaw('');
    setDebouncedQuery('');
    setActiveCategory(0);
    setActivePrices([]);
    setActiveSizes([]);
    setSortBy('relevant');
  }, []);

  // Parse COP-formatted price string ("$ 50.000") to number (50000)
  const parsePrice = (raw) => parseFloat((raw ?? '0').replace(/[^\d]/g, '')) || 0;

  const filteredProducts = useMemo(() => {
    let result = products;

    if (activeCategory > 0 && categories[activeCategory]) {
      const cat = categories[activeCategory].toLowerCase();
      result = result.filter(p => p.categories?.some(c => c.toLowerCase() === cat));
    }

    if (debouncedQuery.trim()) {
      const q = debouncedQuery.toLowerCase();
      result = result.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }

    if (activePrices.length > 0) {
      result = result.filter(p => {
        const price = parsePrice(p.price);
        return activePrices.some(i => price >= PRICE_RANGES[i][0] && price < PRICE_RANGES[i][1]);
      });
    }

    if (activeSizes.length > 0) {
      result = result.filter(p =>
        p.sizes?.some(s => activeSizes.includes(s))
      );
    }

    if (sortBy === 'price_asc') {
      result = [...result].sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    } else if (sortBy === 'price_desc') {
      result = [...result].sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
    }

    return result;
  }, [products, categories, activeCategory, debouncedQuery, activePrices, activeSizes, sortBy]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    activeCategory > 0 ||
    activePrices.length > 0 ||
    activeSizes.length > 0 ||
    sortBy !== 'relevant';

  return {
    searchQuery, setSearchQuery,
    activeCategory, setActiveCategory,
    activePrices, togglePrice,
    activeSizes, toggleSize,
    sortBy, setSortBy,
    clearFilters, filteredProducts, hasActiveFilters,
  };
}
