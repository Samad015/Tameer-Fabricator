const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Search dealers dynamically by location, city or area
router.get('/search', async (req, res) => {
  try {
    // Yahan location, city aur area teeno ko check kiya gaya hai
    const searchTerm = req.query.location || req.query.city || req.query.area;

    if (!searchTerm) {
      return res.status(400).json({ success: false, message: 'Location is required' });
    }

    const regexQuery = new RegExp('^' + searchTerm.trim() + '$', 'i');

    const dealers = await User.find({
      role: 'dealer',
      isVerified: true,
      $or: [
        { city: regexQuery },
        { area: regexQuery }
      ]
    }).select('-password');

    return res.status(200).json({ 
      success: true, 
      count: dealers.length, 
      dealers 
    });
  } catch (error) {
    console.error('Dealer Search Error:', error);
    return res.status(500).json({ success: false, message: 'Server error during search' });
  }
});

module.exports = router;