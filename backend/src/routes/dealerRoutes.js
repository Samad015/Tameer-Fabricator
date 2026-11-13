const listedDealer = require('../models/listedDealer');
const router = require('express').Router();
const mongoose = require('mongoose');
const User = require('../models/User');

// PUBLIC DEALER SEARCH API
router.get('/search', async (req, res) => {
  try {
    const { location, city, area, pincode } = req.query;
    const searchTerm = location || city || area || pincode;

    const baseFilter = listedDealer();

    if (searchTerm) {
      if(typeof searchTerm !== 'string' || searchTerm.length>120) return res.status(400).json({success:false,message:'Invalid location.'});
      const trimmedSearch = searchTerm.trim();
      const regexQuery = new RegExp('^' + trimmedSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

      baseFilter.$and = [{ $or: [
        { city: regexQuery },
        { area: regexQuery },
        { pincode: trimmedSearch },
        { address: regexQuery }
      ] }];
    }

    const dealers = await User.find(baseFilter)
      .select('companyName name phone email address area city pincode perKgPrice pricingDetails servicesOffered gstin experienceYears')
      .sort({ createdAt: -1 }).limit(100);

    return res.status(200).json({
      success: true,
      count: dealers.length,
      dealers
    });
  } catch (error) {
    console.error('Dealer Search Error:', error);
    return res.status(500).json({ success: false, message: 'Server error while searching dealers.' });
  }
});

// SINGLE DEALER PROFILE PUBLIC API
router.get('/:id', async (req, res) => {
  try {
    if(!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({success:false,message:'Invalid dealer reference.'});
    const dealer = await User.findOne({_id:req.params.id,...listedDealer()}).select('companyName name phone email address area city state pincode perKgPrice pricingDetails servicesOffered experienceYears isSubscribed subscriptionDetails.expiresAt');
    if (!dealer) {
      return res.status(404).json({ success: false, message: 'Dealer profile not found.' });
    }

    return res.status(200).json({ success: true, dealer });
  } catch (error) {
    console.error('Single Dealer Fetch Error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching dealer profile.' });
  }
});

module.exports = router;
