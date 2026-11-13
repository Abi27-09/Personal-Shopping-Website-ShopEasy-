import { createContext, useContext, useEffect, useMemo, useState } from 'react';
const StoreContext = createContext(null);
export function StoreProvider({ children }) {
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('market_cart') || '[]'));
  const [wishlist, setWishlist] = useState(() => JSON.parse(localStorage.getItem('market_wishlist') || '[]'));
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('market_user') || 'null'));
  useEffect(() => localStorage.setItem('market_cart', JSON.stringify(cart)), [cart]);
  useEffect(() => localStorage.setItem('market_wishlist', JSON.stringify(wishlist)), [wishlist]);
  const add = (product) => setCart(old => {
    const existing = old.find(i => i._id === product._id);
    return existing ? old.map(i => i._id === product._id ? { ...i, quantity: Math.min(20, i.quantity + 1) } : i)
      : [...old, { ...product, quantity: 1 }];
  });
  const quantity = (id, amount) => setCart(old => old.map(i => i._id === id ? { ...i, quantity: Math.max(1, Math.min(20, amount)) } : i));
  const remove = id => setCart(old => old.filter(i => i._id !== id));
  const toggleWish = id => setWishlist(old => old.includes(id) ? old.filter(x => x !== id) : [...old, id]);
  const logout = () => { localStorage.removeItem('market_token'); localStorage.removeItem('market_user'); setUser(null); };
  const value = useMemo(() => ({ cart, setCart, wishlist, user, setUser, add, quantity, remove, toggleWish, logout,
    cartCount: cart.reduce((n,i) => n+i.quantity,0), total: cart.reduce((n,i) => n+i.price*i.quantity,0) }),
    [cart,wishlist,user]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
export const useStore = () => useContext(StoreContext);
