const jwt = require('jsonwebtoken');
const User = require('../models/User');
module.exports = async (req,res,next) => {
  const cookie = (req.headers.cookie || '').split(';').map(s=>s.trim()).find(s=>s.startsWith('tameer_session='));
  const token = cookie?.slice('tameer_session='.length);
  if (!token) return res.status(401).json({success:false,message:'Please log in to continue.'});
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {algorithms:['HS256']});
    const user = await User.findById(decoded.id);
    if (!user || !user.isVerified || (decoded.version || 0) !== (user.tokenVersion || 0)) return res.status(401).json({success:false,message:'Session expired. Please log in again.'});
    req.user = decoded; next();
  } catch { return res.status(401).json({success:false,message:'Invalid or expired session.'}); }
};
