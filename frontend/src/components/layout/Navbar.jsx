import React, {useContext,useEffect,useState} from 'react';
import {Link,useLocation} from 'react-router-dom';
import {Menu,X,MapPin,ArrowUpRight} from 'lucide-react';
import {AuthContext} from '../../features/auth/AuthContext.jsx';
export default function Navbar(){
 const {user,logout}=useContext(AuthContext);
 const [open,setOpen]=useState(false);
 const location=useLocation();
 useEffect(()=>setOpen(false),[location.pathname]);
 return <header className="site-header">
  <Link to="/" onClick={()=>{setOpen(false);window.scrollTo({top:0,left:0,behavior:'instant'});}} className="wordmark" aria-label="Tameer Fabricators home">Tameer<span>FABRICATORS · BAREILLY</span></Link>
  <button className="mobile-toggle" aria-label={open?'Close navigation':'Open navigation'} aria-expanded={open} onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button>
  <nav aria-label="Main navigation" className={`main-navigation ${open?'is-open':''}`}>
   <Link to="/#services" onClick={()=>setOpen(false)}>Our shutters</Link>
   <Link to="/#about" onClick={()=>setOpen(false)}>How it works</Link>
   <Link to="/dashboard" className="location-nav"><MapPin size={16}/>Find a fabricator</Link>
   <Link to="/#contact-form" onClick={()=>setOpen(false)}>Contact</Link>
   {user?<><Link to="/my-workshop">My workshop</Link><button onClick={logout}>Log out</button></>:<Link to="/login">Partner login</Link>}
   <a href="tel:+918439860719" className="call-link">Call us <ArrowUpRight size={20}/></a>
  </nav>
 </header>;
}
