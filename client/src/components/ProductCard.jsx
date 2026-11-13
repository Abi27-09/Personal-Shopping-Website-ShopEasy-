import { Heart, ShoppingBag, Star } from 'lucide-react';
import { useStore } from '../context/Store';
export default function ProductCard({ product, onOpen }) {
  const { add, wishlist, toggleWish } = useStore();
  return <article className="product-card">
    <button className="product-image-button" onClick={() => onOpen(product)} aria-label={`View ${product.name}`}>
      <img className="product-image" src={product.image || 'https://placehold.co/700x600?text=ShopEasy'} alt={product.name} loading="lazy" />
      <span className="category-chip">{product.category}</span>
    </button>
    <button className={`wish-button ${wishlist.includes(product._id) ? 'is-wished' : ''}`} onClick={() => toggleWish(product._id)} aria-label="Toggle wishlist"><Heart size={18} fill={wishlist.includes(product._id) ? 'currentColor' : 'none'} /></button>
    <div className="product-meta"><button className="product-name" onClick={() => onOpen(product)}>{product.name}</button><span className="rating"><Star size={14} fill="currentColor" /> {product.ratingAverage || 'New'} <small>({product.ratingCount || 0})</small></span></div>
    <div className="product-bottom"><strong>₹{product.price.toLocaleString('en-IN')}</strong><button className="add-button" onClick={() => add(product)}><ShoppingBag size={16}/> Add</button></div>
  </article>;
}
