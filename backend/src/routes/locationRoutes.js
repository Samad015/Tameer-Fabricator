const router=require('express').Router();
const {limit}=require('../middleware/security');
const cache=new Map();let busy=false;let lastRequest=0;
router.use(limit(12));
router.get('/reverse',async(req,res)=>{
 const lat=Number(req.query.lat),lon=Number(req.query.lon);
 if(typeof req.query.lat!=='string'||typeof req.query.lon!=='string'||!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)return res.status(400).json({success:false,message:'Invalid coordinates.'});
 const provider = process.env.GEOCODER_URL || 'https://nominatim.openstreetmap.org/';
 const key=`${lat.toFixed(2)},${lon.toFixed(2)}`;
 if(cache.has(key))return res.json(cache.get(key));
 if(busy || Date.now()-lastRequest<1100)return res.status(429).json({success:false,message:'Please wait a moment and try again, or enter your city.'});
 busy=true;lastRequest=Date.now();
 try{
  const url=new URL('reverse',provider.replace(/\/?$/,'/'));
  url.search=new URLSearchParams({format:'jsonv2',lat:lat.toFixed(2),lon:lon.toFixed(2),zoom:'10',addressdetails:'1'});
  const response=await fetch(url,{signal:AbortSignal.timeout(8000),headers:{'User-Agent':process.env.GEOCODER_USER_AGENT||'TameerFabricators/1.0'}});
  if(!response.ok)throw new Error('Provider unavailable');
  const data=await response.json();if(!data.address)throw new Error('No address');
  const value={address:data.address,attribution:'© OpenStreetMap contributors'};
  if(cache.size>=500)cache.delete(cache.keys().next().value);cache.set(key,value);res.json(value);
 }catch{res.status(502).json({success:false,message:'Address lookup is unavailable. Please enter your city manually.'});}finally{busy=false;}
});
module.exports=router;
