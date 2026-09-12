const express = require('express');
const router = express.Router();

const { 
  register, 
  verifyOtp, 
  login, 
  getProfile, 
  processSubscription,
  completeProfile
} = require('../controllers/authController');

const verifyToken = require('../middlewares/authMiddleware');

// Public Authentication Routes
router.post('/register', register);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);

// Protected Dealer & Session Routes
router.get('/profile', verifyToken, getProfile);
router.get('/me', verifyToken, getProfile); // Session restoration alias
router.post('/subscribe', verifyToken, processSubscription); // ₹999/mo subscription handler

// Workshop Profile Complete Handlers (Both PUT and POST bound to avoid 404 routing errors)
router.put('/complete-profile', verifyToken, completeProfile);
router.post('/complete-profile', verifyToken, completeProfile);

module.exports = router;