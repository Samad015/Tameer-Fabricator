const router = require('express').Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const c = require('../controllers/authController');
const auth = require('../middleware/verifyToken');
const {limit,hashOtp} = require('../middleware/security');
const {validateEmail,validatePassword} = require('../utils/validators');
router.use(limit(30, 15*60000));
router.post('/register', c.register);
router.post('/verify-otp', c.verifyOtp);
router.post('/login', c.login);
router.post('/logout', (req,res)=> {res.clearCookie('tameer_session',{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/'});res.json({success:true});});
router.post('/subscribe',auth,c.processSubscription);
router.put('/complete-profile',auth,c.completeProfile);
router.get('/me',auth,c.getProfile);
router.get('/profile',auth,c.getProfile);
router.get('/my-leads',auth,c.getMyLeads);
router.put('/update-price',auth,c.updatePrice);
router.post('/forgot-password', async(req,res)=>{
  const check=validateEmail(req.body.email);
  if(!check.valid) return res.status(400).json({success:false,message:check.message});
  const user=await User.findOne({email:check.value});
  if(user && (!user.otpExpires || user.otpExpires.getTime()-9*60000 < Date.now())) {
    const otp=crypto.randomInt(100000,1000000).toString();
    user.otp=hashOtp(otp);user.otpPurpose='reset';user.otpExpires=new Date(Date.now()+600000);user.otpAttempts=0;await user.save();
    if(process.env.SMTP_HOST) {
      try { await nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT||587),secure:process.env.SMTP_PORT==='465',auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS},connectionTimeout:10000,socketTimeout:10000}).sendMail({from:process.env.EMAIL_USER,to:user.email,subject:'Reset your Tameer password',text:`Your reset code is ${otp}. It expires in 10 minutes.`}); } catch { console.error('Password reset email delivery failed'); }
    } else if(process.env.BREVO_API_KEY) {
      try { const r=await fetch('https://api.brevo.com/v3/smtp/email',{method:'POST',signal:AbortSignal.timeout(10000),headers:{'Content-Type':'application/json','api-key':process.env.BREVO_API_KEY},body:JSON.stringify({sender:{email:process.env.EMAIL_USER,name:'Tameer Fabricators'},to:[{email:user.email}],subject:'Reset your Tameer password',textContent:`Your reset code is ${otp}. It expires in 10 minutes.`})});if(!r.ok)throw Error(); } catch {console.error('Password reset email delivery failed');}
    }
  }
  res.json({success:true,message:'If the account exists, a reset code has been sent.'});
});
router.post('/reset-password',async(req,res)=>{
  const email=validateEmail(req.body.email), password=validatePassword(req.body.newPassword);
  if(!email.valid || !password.valid || typeof req.body.otp!=='string' || !/^\d{6}$/.test(req.body.otp)) return res.status(400).json({success:false,message:password.message || 'Invalid reset details.'});
  const user=await User.findOne({email:email.value});
  if(!user || user.otpPurpose!=='reset' || !user.otpExpires || user.otpExpires<Date.now() || user.otpAttempts>=5) return res.status(400).json({success:false,message:'Invalid or expired reset code.'});
  if(user.otp!==hashOtp(req.body.otp)) {await User.updateOne({_id:user._id},{$inc:{otpAttempts:1}});return res.status(400).json({success:false,message:'Invalid or expired reset code.'});}
  user.password=await bcrypt.hash(req.body.newPassword,12);user.otp=undefined;user.otpExpires=undefined;user.otpPurpose=undefined;user.tokenVersion=(user.tokenVersion||0)+1;await user.save();
  res.clearCookie('tameer_session',{path:'/'});res.json({success:true,message:'Password updated. Please log in.'});
});
module.exports=router;
