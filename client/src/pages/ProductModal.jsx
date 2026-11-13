import { useEffect, useState } from 'react';
import { X, ShoppingBag, Star, Check } from 'lucide-react';
import { api } from '../api';
import { useStore } from '../context/Store';
export default function ProductModal({ product, onClose, setAuthMode }) {
  const [details,setDetails]=useState({product,reviews:[]});const [rating,setRating]=useState(5);const [comment,setComment]=useState('');const [message,setMessage]=useState('');
  const {add,user}=useStore();
  useEffect(()=>{api(`/products/${product._id}`).then(setDetails).catch(()=>{});},[product._id]);
  async function review(e){e.preventDefault();if(!user){onClose();setAuthMode('login');return}try{await api(`/products/${product._id}/reviews`,{method:'POST',body:JSON.stringify({rating,comment})});setMessage('Thanks — your review was saved.');const fresh=await api(`/products/${product._id}`);setDetails(fresh)}catch(err){setMessage(err.message)}}
  return <div className="modal-backdrop" onClick={onClose}><section className="product-modal" onClick={e=>e.stopPropagation()}>
    <button className="modal-close" onClick={onClose}><X/></button><div className="product-detail-grid"><img src={product.image} alt={product.name}/><div><span className="eyebrow">{product.category}</span><h2>{product.name}</h2><div className="detail-rating"><Star fill="currentColor" size={16}/> {product.ratingAverage||'New'} <span>({product.ratingCount||0} reviews)</span></div><h3>₹{product.price.toLocaleString('en-IN')}</h3><p>{product.description}</p><p className="stock-note">{product.stock>0?<><Check size={16}/> In stock — {product.stock} available</>:'Currently unavailable'}</p><button className="primary-button" disabled={product.stock<1} onClick={()=>{add(product);setMessage('Added to your bag.')}}><ShoppingBag size={17}/> Add to bag</button>{message&&<p className="success-message">{message}</p>}</div></div>
    <div className="review-area"><h3>Customer reviews</h3>{details.reviews?.length?details.reviews.map(r=><div className="review-item" key={r._id}><strong>{r.name}</strong><span>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span><p>{r.comment}</p></div>):<p className="muted">No reviews yet. Be the first to share your thoughts.</p>}
    <form className="review-form" onSubmit={review}><label>Your rating<select value={rating} onChange={e=>setRating(Number(e.target.value))}>{[5,4,3,2,1].map(n=><option value={n} key={n}>{n} stars</option>)}</select></label><label>Your review<textarea value={comment} onChange={e=>setComment(e.target.value)} maxLength="1000" placeholder="What should other shoppers know?"/></label><button className="secondary-button">Submit review</button></form></div>
  </section></div>;
}
