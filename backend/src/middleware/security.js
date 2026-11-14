const crypto = require('crypto');
const buckets = new Map();
const timer = setInterval(() => { const now = Date.now(); for (const [key, value] of buckets) if (value.until < now) buckets.delete(key); }, 60000);
timer.unref();
function limit(max = 120, windowMs = 60000) {
  return (req, res, next) => {
    const key = `${req.ip}:${req.baseUrl}`;
    const now = Date.now();
    let bucket = buckets.get(key);
    if (!bucket || bucket.until < now) { bucket = { count: 0, until: now + windowMs }; buckets.set(key, bucket); }
    if (++bucket.count > max) { res.set('Retry-After', String(Math.ceil((bucket.until-now)/1000))); return res.status(429).json({success:false,message:'Too many requests. Please try again shortly.'}); }
    next();
  };
}
function inspect(value, depth = 0) {
  if (depth > 12) return false;
  if (!value || typeof value !== 'object') return true;
  return Object.entries(value).every(([key, child]) => !key.startsWith('$') && !key.includes('.') && !['__proto__','constructor','prototype'].includes(key) && inspect(child, depth+1));
}
function security(req,res,next) {
  res.set({'X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'strict-origin-when-cross-origin','Cache-Control':'no-store'});
  if (!inspect(req.body) || !inspect(req.query)) return res.status(400).json({success:false,message:'Invalid request structure.'});
  if (req.body && (!Object.getPrototypeOf(req.body) || Array.isArray(req.body))) return res.status(400).json({success:false,message:'Expected a JSON object.'});
  if (req.body) {
    for (const [key,value] of Object.entries(req.body)) {
      if (key !== 'location' && value !== null && typeof value === 'object') return res.status(400).json({success:false,message:'Invalid field type.'});
      if (typeof value === 'string' && value.length > (req.path === '/api/chat' && key === 'history' ? 18000 : 5000)) return res.status(400).json({success:false,message:'Field exceeds maximum length.'});
    }
    const location=req.body.location;
    if(location !== undefined && location !== null){
      if(typeof location!=='object'||Array.isArray(location))return res.status(400).json({success:false,message:'Invalid location.'});
      const allowed=['city','state','pincode','latitude','longitude','accuracy','source','capturedAt'];
      if(Object.keys(location).some(key=>!allowed.includes(key)))return res.status(400).json({success:false,message:'Invalid location metadata.'});
      for(const key of ['city','state','pincode','source','capturedAt'])if(location[key]!==undefined&&(typeof location[key]!=='string'||location[key].length>120))return res.status(400).json({success:false,message:'Invalid location text.'});
      for(const [key,min,max] of [['latitude',-90,90],['longitude',-180,180],['accuracy',0,100000]])if(location[key]!==undefined&&(typeof location[key]!=='number'||!Number.isFinite(location[key])||location[key]<min||location[key]>max))return res.status(400).json({success:false,message:'Invalid location coordinates.'});
      if((location.latitude===undefined)!==(location.longitude===undefined))return res.status(400).json({success:false,message:'Both coordinates are required.'});
    }
  }
  const origin = req.get('origin');
  const allowed = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:8080').split(',').map(s=>s.trim());
  if (!['GET','HEAD','OPTIONS'].includes(req.method) && origin && !allowed.includes(origin)) return res.status(403).json({success:false,message:'Origin is not allowed.'});
  next();
}
const hashOtp = otp => crypto.createHash('sha256').update(String(otp)).digest('hex');
module.exports = {limit, security, hashOtp};
