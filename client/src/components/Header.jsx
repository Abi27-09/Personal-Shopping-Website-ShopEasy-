import { useState } from 'react';
import { Search, ShoppingBag, Heart, Menu, X, Store, UserRound, LogOut } from 'lucide-react';
import { useStore } from '../context/Store';
export default function Header({ query, setQuery, go, setAuthMode }) {
  const { cartCount, wishlist, user, logout } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  return <header className="site-header">
    <div className="header-main">
      <button className="brand" onClick={() => go('home')}><span className="brand-mark"><Store size={20}/></span>shop<span>easy</span></button>
      <label className="search-box"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search products, brands and more..." /><kbd>⌘ K</kbd></label>
      <div className="header-actions">
        <button className="icon-action account-action" onClick={() => user ? go('orders') : setAuthMode('login')}><UserRound size={19}/><span>{user ? user.name.split(' ')[0] : 'Account'}</span></button>
        {user?.role === 'admin' && <button className="icon-action" onClick={() => go('admin')}>Admin</button>}
        <button className="icon-action" onClick={() => go('wishlist')}><Heart size={19}/><span>Saved</span><i>{wishlist.length}</i></button>
        <button className="cart-action" onClick={() => go('cart')}><ShoppingBag size={19}/><span>Bag</span><b>{cartCount}</b></button>
        {user && <button className="icon-action logout-action" onClick={logout} title="Sign out"><LogOut size={18}/></button>}
      </div>
      <button className="mobile-menu" onClick={()=>setMobileOpen(!mobileOpen)} aria-label="Toggle menu">{mobileOpen?<X/>:<Menu/>}</button>
    </div>
    <nav className={`nav-row ${mobileOpen ? 'nav-open' : ''}`}>
      <button onClick={() => {go('home');setMobileOpen(false)}}>Discover</button><button onClick={() => {go('category:Fashion');setMobileOpen(false)}}>Fashion</button><button onClick={() => {go('category:Electronics');setMobileOpen(false)}}>Electronics</button><button onClick={() => {go('category:Home');setMobileOpen(false)}}>Home & Living</button><button onClick={() => {go('category:Beauty');setMobileOpen(false)}}>Beauty</button><button onClick={() => {go('category:Sports');setMobileOpen(false)}}>Sports</button>
    </nav>
  </header>;
}
