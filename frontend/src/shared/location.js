import { apiFetch } from './api.js';
export function saveLocation(value){
 const record={...value,capturedAt:new Date().toISOString()};
 localStorage.setItem('projectLocation',JSON.stringify(record));
 localStorage.setItem('userCity',record.city || '');
 localStorage.setItem('userLocationName',[record.city,record.state].filter(Boolean).join(', '));
 window.dispatchEvent(new Event('cityChanged'));
 return record;
}
export function readLocation(){try{return JSON.parse(localStorage.getItem('projectLocation')||'null');}catch{return null;}}
export async function detectLocation(){
 if(!window.isSecureContext)throw new Error('Location requires HTTPS. Enter your city below.');
 if(!navigator.geolocation)throw new Error('Location is unavailable. Enter your city below.');
 const position=await new Promise((resolve,reject)=>navigator.geolocation.getCurrentPosition(resolve,error=>reject(new Error(error.code===1?'Location permission was denied. Enter your city below.':error.code===3?'Location timed out. Try again or enter your city.':'Location is unavailable. Enter your city below.')),{enableHighAccuracy:false,timeout:12000,maximumAge:60000}));
 const {latitude,longitude,accuracy}=position.coords;
 const response=await apiFetch(`/api/location/reverse?lat=${latitude}&lon=${longitude}`,{signal:AbortSignal.timeout(12000)});
 const data=await response.json();
 if(!response.ok)throw new Error(data.message || 'Address lookup failed. Enter your city below.');
 const a=data.address;
 const city=a.city||a.town||a.village||a.state_district;
 if(!city)throw new Error('We could not identify your city. Enter it below.');
 return saveLocation({city,state:a.state||'',pincode:a.postcode||'',latitude,longitude,accuracy,source:'gps'});
}
