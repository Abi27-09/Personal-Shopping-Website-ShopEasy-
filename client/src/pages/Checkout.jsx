import { useState } from 'react';
import { ArrowLeft, ShieldCheck, CreditCard } from 'lucide-react';
import { api } from '../api';
import { useStore } from '../context/Store';
export default function Checkout({go,setAuthMode}) {
  const {cart,total,user,setCart}=useStore();const [busy,setBusy]=useState(false);const [error,setError]=useState('');
  async function pay(){
    if(!user){setAuthMode('login');return}
    setBusy(true);setError('');
    try{
      const order=await api('/orders/checkout',{method:'POST',body:JSON.stringify({items:cart.map(i=>({productId:i._id,quantity:i.quantity}))})});
      const scriptOk=await new Promise(resolve=>{
        if(window.Razorpay)return resolve(true);
        const script=document.createElement('script');script.src='https://checkout.razorpay.com/v1/checkout.js';script.onload=()=>resolve(true);script.onerror=()=>resolve(false);document.body.appendChild(script);
      });
      if(!scriptOk)throw new Error('Could not load payment gateway. Check your internet connection.');
      const gateway=new window.Razorpay({
        key:order.keyId,amount:order.amount,currency:order.currency,name:'ShopEasy',description:'Marketplace purchase',
        order_id:order.razorpayOrderId,prefill:{name:user.name,email:user.email},theme:{color:'#203d32'},
        handler:async response=>{
          try{await api('/orders/verify-payment',{method:'POST',body:JSON.stringify({...response,orderId:order.orderId})});setCart([]);go('orders')}
          catch(err){setError(`Payment was submitted but verification needs attention: ${err.message}`)}
        },
        modal:{ondismiss:()=>setBusy(false)}
      });
      gateway.on('payment.failed',response=>{setError(response.error?.description||'Payment failed. Please try again.');setBusy(false)});
      gateway.open();
    }catch(err){setError(err.message);setBusy(false)}
  }
  return <section className="page-section checkout-layout"><div><button className="back-link" onClick={()=>go('cart')}><ArrowLeft size={16}/> Back to bag</button><span className="eyebrow">SECURE CHECKOUT</span><h1>Almost yours.</h1><p className="muted">Review your order before continuing to secure payment.</p><div className="checkout-items">{cart.map(i=><div className="checkout-item" key={i._id}><img src={i.image} alt=""/><div><strong>{i.name}</strong><p>Qty {i.quantity}</p></div><b>₹{(i.price*i.quantity).toLocaleString('en-IN')}</b></div>)}</div></div>
  <aside className="summary-card"><h3>Order summary</h3><div className="summary-row"><span>Subtotal</span><span>₹{total.toLocaleString('en-IN')}</span></div><div className="summary-row"><span>Shipping</span><span className="free-label">Calculated later</span></div><div className="summary-total"><span>Total</span><strong>₹{total.toLocaleString('en-IN')}</strong></div>{error&&<p className="error-message">{error}</p>}<button className="primary-button full-button" onClick={pay} disabled={!cart.length||busy}>{busy?'Processing…':'Pay securely'} <CreditCard size={18}/></button><p className="secure-note"><ShieldCheck size={16}/> Payments processed by Razorpay. Card details are not stored by ShopEasy.</p>{!user&&<p className="muted">You'll be asked to sign in before paying.</p>}</aside></section>;
}
