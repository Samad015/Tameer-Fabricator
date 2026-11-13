const listedDealer = require('../models/listedDealer');
const router = require('express').Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Lead = require('../models/Lead');
const sendBrevoEmail = require('../utils/email');
const {validateName,validatePhone} = require('../utils/validators');

// Contact / Quote Request Route (Saves Lead to DB + Notifies Dealer + Notifies Admin)
router.post('/', async (req, res) => {
  const { name, phone, width, height, unit, shutterType, message, dealerId } = req.body;

  const nameCheck=validateName(name),phoneCheck=validatePhone(phone);
  if(!nameCheck.valid || !phoneCheck.valid) return res.status(400).json({success:false,message:nameCheck.message || phoneCheck.message});
  for(const value of [width,height]) if(value !== undefined && value !== '' && (!Number.isFinite(Number(value)) || Number(value)<=0 || Number(value)>10000)) return res.status(400).json({success:false,message:'Measurements must be positive and under 10,000.'});
  if(unit && !['Feet','Inches'].includes(unit)) return res.status(400).json({success:false,message:'Invalid measurement unit.'});
  if(shutterType && !['Manual','Gear','Motorized'].includes(shutterType)) return res.status(400).json({success:false,message:'Invalid shutter type.'});
  if(message && (typeof message!=='string' || message.length>2000)) return res.status(400).json({success:false,message:'Requirements must be under 2,000 characters.'});
  if(dealerId && !mongoose.isValidObjectId(dealerId)) return res.status(400).json({success:false,message:'Invalid dealer reference.'});
  try {
    const dealer=dealerId ? await User.findOne({_id:dealerId,...listedDealer()}) : null;
    if(dealerId && !dealer) return res.status(404).json({success:false,message:'This workshop is currently unavailable.'});
    // 1. Save Lead to Database (linked to dealer)
    const newLead = new Lead({
      dealer: dealer?._id,
      name: nameCheck.value,
      phone: phoneCheck.value,
      location: req.body.location,
      width: width || '',
      height: height || '',
      unit: unit || 'Feet',
      shutterType: shutterType || 'Manual',
      message: message || ''
    });
    await newLead.save();

    const dealerName=dealer?.companyName || 'Tameer Fabricators';
    const escape=value=>String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const leadDetailsHtml = `
      <p><strong>Dealer:</strong> ${escape(dealerName || 'Unknown')}</p>
      <p><strong>Customer Name:</strong> ${escape(name)}</p>
      <p><strong>Phone:</strong> ${escape(phone)}</p>
      <p><strong>Width:</strong> ${escape(width || 'N/A')} ${escape(unit || '')}</p>
      <p><strong>Height:</strong> ${escape(height || 'N/A')} ${escape(unit || '')}</p>
      <p><strong>Shutter Type:</strong> ${escape(shutterType || 'N/A')}</p>
      <p><strong>Requirements:</strong> ${escape(message || 'N/A')}</p>
    `;

    // 2. Notify the Dealer (non-blocking, best-effort)
    sendBrevoEmail({
      toEmail: dealer?.email || process.env.EMAIL_USER,
      toName: dealerName || 'Dealer',
      subject: `New Quote Request from ${name}`,
      htmlContent: `<h2>New Project Inquiry - Tameer Fabricators</h2>${leadDetailsHtml}`
    });

    // 3. Notify Admin/Site Owner that this dealer received a lead (non-blocking, best-effort)
    sendBrevoEmail({
      toEmail: process.env.EMAIL_USER,
      toName: 'Admin',
      subject: `Lead Alert: ${dealerName || 'A dealer'} got a new quote request`,
      htmlContent: `<h2>Dealer Lead Notification</h2><p>${escape(dealerName)} just received a quote request via the website.</p>${leadDetailsHtml}`
    });

    return res.status(200).json({ success: true, message: 'Quote request submitted successfully!' });
  } catch (error) {
    console.error('Contact/Lead Save Error:', error.message || error);
    return res.status(500).json({ success: false, message: 'Failed to submit quote request.' });
  }
});

module.exports = router;
