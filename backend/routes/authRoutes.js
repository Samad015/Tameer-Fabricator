const express = require('express');
const router = express.Router();


const { register, verifyOtp, login, getProfile } = require('../controllers/authController');

router.post('/register', register);       
router.post('/verify-otp', verifyOtp);  
router.post('/login', login);
router.get('/get-profile', getProfile);

module.exports = router;