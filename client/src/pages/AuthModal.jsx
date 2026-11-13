import { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { api } from '../api';
import { useStore } from '../context/Store';
export default function AuthModal({ mode, setMode, onClose }) {
  const [name,setName]=useState(''); const [email,setEmail]=useState(''); const [password,setPassword]=useState('');
  const [error,setError]=useState(''); const [busy,setBusy]=useState(false);
  const {setUser}=useStore();
  async function submit(e) {
    e.preventDefault(); setBusy(true);setError('');
    try {
      const result=await api(`/auth/${mode==='signup'?'register':'login'}`,{method:'POST',body:JSON.stringify({name,email,password})});
      localStorage.setItem('market_token',result.token);localStorage.setItem('market_user',JSON.stringify(result.user));setUser(result.user);onClose();
    } catch(err){setError(err.message)} finally{setBusy(false)}
  }
  return <div className="modal-backdrop" onClick={onClose}><section className="auth-modal" onClick={e=>e.stopPropagation()}>
    <button className="modal-close" onClick={onClose}><X/></button><span className="eyebrow">WELCOME TO SHOPEASY</span>
    <h2>{mode==='signup'?'Create your account':'Good to see you again.'}</h2><p>Sign in to save favourites and track your orders.</p>
    <form onSubmit={submit} className="stack-form">
      {mode==='signup'&&<label>Full name<input value={name} onChange={e=>setName(e.target.value)} required minLength="2" autoComplete="name"/></label>}
      <label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email"/></label>
      <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength="8" autoComplete={mode==='signup'?'new-password':'current-password'}/></label>
      {error&&<p className="error-message">{error}</p>}<button className="primary-button" disabled={busy}>{busy?'Please wait':'Continue'} <ArrowRight size={17}/></button>
    </form>
    <p className="auth-switch">{mode==='signup'?'Already have an account?':'New to ShopEasy?'} <button onClick={()=>setMode(mode==='signup'?'login':'signup')}>{mode==='signup'?'Sign in':'Create account'}</button></p>
  </section></div>;
}
