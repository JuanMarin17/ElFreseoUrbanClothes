import { useState } from 'react';

export function useCart() {
  const [cartItems, setCartItems] = useState([]);
  const [justAdded, setJustAdded] = useState(null);

  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  const addToCart = (product, idx) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.name === product.name);
      if (existing) {
        return prev.map(item =>
          item.name === product.name ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
    setJustAdded(idx);
    setTimeout(() => setJustAdded(null), 1200);
  };

  return { cartItems, cartCount, addToCart, justAdded };
}
