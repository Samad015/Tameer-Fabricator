import React,{createContext,useState,useEffect,useRef,useCallback} from 'react';
export const AuthContext=createContext();
const API_BASE=(import.meta.env.VITE_API_BASE_URL||'').replace(/\/$/,'');
export function AuthProvider({children}){
 const [user,setUser]=useState(null);
 const [loading,setLoading]=useState(true);
 const activeRequest=useRef(null);
 const fetchUserSession=useCallback(async()=>{
  activeRequest.current?.abort();
  const controller=new AbortController();activeRequest.current=controller;
  try{
   const response=await fetch(`${API_BASE}/api/auth/me`,{signal:controller.signal});
   const data=await response.json();
   if(!controller.signal.aborted)setUser(data.success?data.user:null);
  }catch(error){if(error.name!=='AbortError')setUser(null);}
  finally{if(!controller.signal.aborted)setLoading(false);}
 },[]);
 useEffect(()=>{fetchUserSession();return()=>activeRequest.current?.abort();},[fetchUserSession]);
 const loginSession=(_token,userData)=>setUser(userData);
 const logout=async()=>{
  try{const response=await fetch(`${API_BASE}/api/auth/logout`,{method:'POST'});if(!response.ok)throw new Error('Logout failed');setUser(null);window.location.href='/login';}
  catch{window.alert('Unable to log out. Please try again.');}
 };
 return <AuthContext.Provider value={{user,setUser,loading,loginSession,logout,fetchUserSession}}>{children}</AuthContext.Provider>;
}
