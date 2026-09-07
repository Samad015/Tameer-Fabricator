const express = require('express');
const router = express.Router();

const { 
  register, 
  verifyOtp, 
  login, 
  getProfile, 
  updateProfile 
} = require('../controllers/authController');

let verifyToken;
try {
  verifyToken = require('../middleware/authMiddleware');
} catch (e) {
  verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ success: false, message: "No token provided" });
    next();
  };
}

if (typeof register === 'function') router.post('/register', register);
if (typeof verifyOtp === 'function') router.post('/verify-otp', verifyOtp);
if (typeof login === 'function') router.post('/login', login);
if (typeof getProfile === 'function') router.get('/profile', verifyToken, getProfile);
if (typeof updateProfile === 'function') router.put('/update-profile', verifyToken, updateProfile);

module.exports = router;