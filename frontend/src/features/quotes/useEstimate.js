import {useEffect,useRef,useState} from 'react';
import {apiFetch} from '../../shared/api.js';
export function useEstimate({width,height,unit,shutterType,rate}){
 const [result,setResult]=useState(null),[calculating,setCalculating]=useState(false),[calculationError,setError]=useState('');
 const active=useRef(null);
 useEffect(()=>{active.current?.abort();setResult(null);setError('');setCalculating(false);return()=>active.current?.abort();},[width,height,unit,shutterType,rate]);
 async function calculateEstimate(event){
  event.preventDefault();active.current?.abort();const controller=new AbortController();active.current=controller;
  setCalculating(true);setResult(null);setError('');
  try{
   const response=await apiFetch('/api/chat/estimate',{method:'POST',headers:{'Content-Type':'application/json'},signal:AbortSignal.any([controller.signal,AbortSignal.timeout(12000)]),body:JSON.stringify({width:Number(width),height:Number(height),unit,shutterType,rate:Number(rate)})});
   const data=await response.json();if(controller.signal.aborted)return;
   if(!response.ok||!data.success)throw new Error(data.message||'Unable to calculate.');
   setResult(data.result);
  }catch(error){if(!controller.signal.aborted)setError(error.name==='TimeoutError'?'Calculation timed out. Please try again.':error.message||'Unable to calculate. Please try again.');}
  finally{if(!controller.signal.aborted)setCalculating(false);}
 }
 return {result,setResult,calculating,calculationError,calculateEstimate};
}
