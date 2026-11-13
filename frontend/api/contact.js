export default async function handler(req,res){
 if(req.method!=='POST')return res.status(405).json({success:false,message:'Method not allowed.'});
 if(!process.env.BACKEND_ORIGIN)return res.status(503).json({success:false,message:'Backend is not configured.'});
 try{const response=await fetch(new URL('/api/contact',process.env.BACKEND_ORIGIN),{method:'POST',signal:AbortSignal.timeout(15000),headers:{'Content-Type':'application/json'},body:JSON.stringify(req.body)});res.status(response.status).json(await response.json());}catch{res.status(502).json({success:false,message:'Unable to submit request. Please try again.'});}
}
