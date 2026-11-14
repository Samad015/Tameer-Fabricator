import React, {useEffect, useRef, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {Sparkles, X, Send, Loader2, ArrowUpRight, RotateCcw} from 'lucide-react';
import {apiFetch} from '../../shared/api.js';
import './chat.css';

const welcome={role:'assistant',text:'Hi! Tell me about your shutter project. I can help with sizes, estimated prices, shutter options, and local fabricators. English, हिंदी या Hinglish—आप जैसे चाहें।'};
const starters=['Estimate a shutter price','Manual, gear or motorized?','How do I measure my opening?','Find a fabricator near me'];
function AnswerText({text}) {
 return text.split(/(\*\*[^*]+\*\*)/g).map((part,index)=>part.startsWith('**')&&part.endsWith('**')?<strong key={index}>{part.slice(2,-2)}</strong>:part);
}
const rupees=n=>Number(n).toLocaleString('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:2});
export default function ChatWidget(){
 const [open,setOpen]=useState(false),[messages,setMessages]=useState([welcome]),[input,setInput]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const trigger=useRef(null),panel=useRef(null),field=useRef(null),bottom=useRef(null),request=useRef(null),pending=useRef(false);
 const navigate=useNavigate();
 const hasOpened=useRef(false);
 useEffect(()=>()=>request.current?.abort(),[]);
 useEffect(()=>{if(open){hasOpened.current=true;field.current?.focus();}else if(hasOpened.current)trigger.current?.focus();},[open]);
 useEffect(()=>{if(open)bottom.current?.scrollIntoView({block:'nearest'});},[messages,busy,open]);
 const close=()=>{setOpen(false);trigger.current?.focus();};
 function keyboard(event){
  if(event.key==='Escape'){event.preventDefault();close();}
  if(event.key==='Tab'){
   const nodes=[...panel.current.querySelectorAll('button:not(:disabled), a[href], textarea')];
   const first=nodes[0],last=nodes[nodes.length-1];
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
  }
 }
 async function send(text=input){
  text=text.trim();if(!text||pending.current||text.length>2000)return;
  pending.current=true;setBusy(true);setError('');setInput('');
  const history=messages.filter(m=>!m.welcome).slice(1).map(({role,text})=>({role,text:text.slice(0,2000)})).slice(-4);
  // Keep the current user message visible even if a retry is required.
  setMessages(previous=>[...previous,{role:'user',text}]);
  const controller=new AbortController();request.current=controller;
  try{
   const response=await apiFetch('/api/chat',{timeoutMs:60000,method:'POST',headers:{'Content-Type':'application/json'},signal:AbortSignal.any([controller.signal,AbortSignal.timeout(60000)]),body:JSON.stringify({message:text,history:JSON.stringify(history)})});
   const data=await response.json();
   if(!response.ok||!data.success)throw new Error(data.message||'Unable to answer right now.');
   setMessages(previous=>[...previous,{role:'assistant',text:data.reply,sources:data.sources,draft:data.draft,estimates:data.estimates}]);
  }catch(err){if(!controller.signal.aborted){setError(err.name==='TimeoutError'?'The assistant took too long. Please try again.':err.message||'Connection failed. Please try again.');setInput(text);}}
  finally{if(!controller.signal.aborted){pending.current=false;setBusy(false);field.current?.focus();}}
 }
 function useDraft(draft){
  sessionStorage.setItem('tameerInquiryDraft',JSON.stringify(draft));
  navigate('/#contact-form');window.dispatchEvent(new Event('tameer:inquiry-draft'));close();
 }
 return <div className="tameer-chat">
  {open&&<section ref={panel} className="chat-panel" role="dialog" aria-modal="true" aria-labelledby="chat-heading" onKeyDown={keyboard}>
   <header className="chat-header"><div className="chat-avatar"><Sparkles size={22}/></div><div><h2 id="chat-heading">Tameer AI Assistant</h2><p>Shutter expertise, powered by Gemini</p></div><button type="button" aria-label="Start a new chat" disabled={busy} onClick={()=>{setMessages([welcome]);setError('');setInput('');field.current?.focus();}}><RotateCcw size={17}/></button><button type="button" onClick={close} aria-label="Close chat"><X size={20}/></button></header>
   <div className="chat-messages" role="log" aria-live="polite" aria-relevant="additions" aria-busy={busy}>
    {messages.map((message,index)=><div key={index} className={`chat-message chat-message-${message.role}`}>
     <span className="chat-speaker">{message.role==='user'?'You':'Tameer AI'}</span><p>{message.role==='assistant'?<AnswerText text={message.text}/>:message.text}</p>
     {message.estimates?.map((estimate,i)=><div className="chat-estimate" key={i}><strong>{estimate.type} · approximate</strong><dl><div><dt>Area</dt><dd>{estimate.totalSqFt.toFixed(2)} sq ft</dd></div><div><dt>Weight</dt><dd>{estimate.totalWeight.toFixed(2)} kg</dd></div><div><dt>Material rate</dt><dd>{rupees(estimate.appliedRate)}/kg</dd></div><div><dt>Shutter</dt><dd>{rupees(estimate.estimatedPrice)}</dd></div><div><dt>Lock + gear + motor</dt><dd>{rupees(estimate.lockCost+estimate.gearCost+estimate.motorCost)}</dd></div><div><dt>Total estimate</dt><dd><strong>{rupees(estimate.total)}</strong></dd></div></dl><small>{estimate.rateSource}. {estimate.exclusions}</small></div>)}
     {message.sources?.length>0&&<div className="chat-sources" aria-label="Related website sources">{message.sources.filter(s=>/^\/(?:#|dashboard|dealer\/)/.test(s.url)).map(source=><Link key={source.url} to={source.url} onClick={close}>{source.title}<ArrowUpRight size={12}/></Link>)}</div>}
     {message.draft&&<button type="button" className="chat-draft" onClick={()=>useDraft(message.draft)}>Review inquiry in contact form <ArrowUpRight size={15}/></button>}
    </div>)}
    {messages.length===1&&<div className="chat-starters">{starters.map(text=><button type="button" key={text} onClick={()=>send(text)}><span>{text}</span><ArrowUpRight size={14}/></button>)}</div>}
    {busy&&<p className="chat-thinking"><Loader2 size={15} className="animate-spin"/> Checking your project…</p>}
    <div ref={bottom}/>
   </div>
   {error&&<p className="chat-error" role="alert">{error} <Link to="/#contact-form" onClick={close}>Request a callback</Link></p>}
   <form className="chat-compose" onSubmit={event=>{event.preventDefault();send();}}><label className="sr-only" htmlFor="chat-input">Your message</label><textarea ref={field} id="chat-input" rows={2} maxLength={2000} placeholder="e.g. 12 × 10 ft manual shutter in Bareilly" value={input} onChange={event=>setInput(event.target.value)} onKeyDown={event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.nativeEvent.isComposing){event.preventDefault();send();}}}/><button type="submit" disabled={busy||!input.trim()} aria-label="Send message">{busy?<Loader2 size={18} className="animate-spin"/>:<Send size={18}/>}</button></form>
   <p className="chat-note">Messages are sent to Google Gemini. Estimates need fabricator confirmation. Please avoid sensitive details.</p>
  </section>}
  <button ref={trigger} type="button" className="chat-launcher" aria-label={open?'Close Tameer AI assistant':'Open Tameer AI assistant'} aria-expanded={open} onClick={()=>open?close():setOpen(true)}>{open?<X size={22}/>:<Sparkles size={22}/>}<span className="chat-launcher-label"><span>{open?'Close assistant':'Ask Tameer AI'}</span>{!open&&<small>YOUR SHUTTER ASSISTANT</small>}</span>{!open&&<span className="chat-ai-badge">AI</span>}</button>
 </div>;
}
