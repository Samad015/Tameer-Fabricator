const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Search dealers by pincode
router.get('/search', async (req, res) => {
  try {
    const { pincode } = req.query;
    if (!pincode) {
      return res.status(400).json({ success: false, message: 'Pincode is required' });
    }

    const dealers = await User.find({ 
      pincode: pincode.trim(), 
      role: 'dealer', 
      isVerified: true 
    }).select('-password');

    return res.status(200).json({ success: true, dealers });
  } catch (error) {
    console.error('Dealer Search Error:', error);
    return res.status(500).json({ success: false, message: 'Server error during search' });
  }
});

// Get single dealer profile by ID
router.get('/:id', async (req, res) => {
  try {
    const dealer = await User.findById(req.params.id).select('-password');
    if (!dealer) {
      return res.status(404).json({ success: false, message: 'Dealer not found' });
    }

    return res.status(200).json({ success: true, dealer });
  } catch (error) {
    console.error('Dealer Profile Error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching dealer profile' });
  }
});

module.exports = router;