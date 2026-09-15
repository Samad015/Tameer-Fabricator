const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const User = require('./models/User'); // User / Dealer Model
const Lead = require('./models/Lead'); // Customer Lead / Inquiry Model

connectDB();

const app = express();
const PORT = process.env.PORT || 5001;

// CORS configuration optimized for Render deployment & Preflight handling
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Explicitly handle preflight OPTIONS requests for all routes to prevent CORS blocks
app.options('*', cors());

app.use(express.json());

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Tameer Backend is running successfully' });
});

// Authentication & Dealer Auth Routes
app.use('/api/auth', authRoutes);

// PUBLIC DEALER SEARCH API
app.get('/api/dealers/search', async (req, res) => {
  try {
    const { location, city, area, pincode } = req.query;
    const searchTerm = location || city || area || pincode;

    const baseFilter = {
      role: 'dealer',
      isSubscribed: true,
      isProfileComplete: true
    };

    if (searchTerm) {
      const trimmedSearch = searchTerm.trim();
      const regexQuery = new RegExp('^' + trimmedSearch, 'i');

      baseFilter.$or = [
        { city: regexQuery },
        { area: regexQuery },
        { pincode: trimmedSearch }
      ];
    }

    const dealers = await User.find(baseFilter)
      .select('companyName name phone email address area city pincode perKgPrice pricingDetails servicesOffered gstin experienceYears')
      .sort({ createdAt: -1 });

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
app.get('/api/dealers/:id', async (req, res) => {
  try {
    const dealer = await User.findById(req.params.id).select('-password -otp -otpExpires');
    if (!dealer) {
      return res.status(404).json({ success: false, message: 'Dealer profile not found.' });
    }

    if (!dealer.isSubscribed) {
      return res.status(403).json({ success: false, message: 'Dealer subscription is inactive.' });
    }

    return res.status(200).json({ success: true, dealer });
  } catch (error) {
    console.error('Single Dealer Fetch Error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching dealer profile.' });
  }
});

// Contact / Quote Request Route (Saves Lead to DB + Sends Email Notification)
app.post('/api/contact', async (req, res) => {
  const { name, phone, width, height, unit, shutterType, message, dealerId, dealerName, dealerEmail } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ success: false, message: 'Name and Phone are required.' });
  }

  if (!dealerId) {
    return res.status(400).json({ success: false, message: 'Dealer reference is missing. Cannot route this lead.' });
  }

  try {
    // 1. Save Lead to Database (linked to dealer)
    const newLead = new Lead({
      dealer: dealerId,
      name,
      phone,
      width: width || '',
      height: height || '',
      unit: unit || 'Feet',
      shutterType: shutterType || 'Manual',
      message: message || ''
    });
    await newLead.save();

    // 2. Send Email Notification via Brevo (Non-blocking for the lead save itself)
    if (process.env.BREVO_API_KEY && process.env.EMAIL_USER) {
      try {
        const emailData = {
          sender: { name: "Tameer Fabricators", email: process.env.EMAIL_USER },
          to: [{ email: dealerEmail || process.env.EMAIL_USER, name: dealerName || "Dealer" }],
          subject: `New Quote Request from ${name}`,
          htmlContent: `
            <h2>New Project Inquiry - Tameer Fabricators</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Width:</strong> ${width || 'N/A'} ${unit || ''}</p>
            <p><strong>Height:</strong> ${height || 'N/A'} ${unit || ''}</p>
            <p><strong>Shutter Type:</strong> ${shutterType || 'N/A'}</p>
            <p><strong>Requirements:</strong> ${message || 'N/A'}</p>
          `,
        };

        await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'api-key': process.env.BREVO_API_KEY,
          },
          body: JSON.stringify(emailData),
        });
      } catch (emailErr) {
        console.error('Brevo Email Delivery Failed (Lead was still saved):', emailErr.message);
      }
    }

    return res.status(200).json({ success: true, message: 'Quote request submitted successfully!' });
  } catch (error) {
    console.error('Contact/Lead Save Error:', error.message || error);
    return res.status(500).json({ success: false, message: 'Failed to submit quote request.' });
  }
});

// Serve Static Frontend Files in Production (Render Monorepo or Combined Setup)
if (process.env.NODE_ENV === 'production') {
  const possiblePaths = [
    path.join(__dirname, '../frontend/dist'),
    path.join(process.cwd(), 'frontend/dist'),
    path.join(__dirname, 'frontend/dist')
  ];

  const frontendPath = possiblePaths.find(p => fs.existsSync(p)) || possiblePaths[0];
  app.use(express.static(frontendPath));
  
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    const indexPath = path.join(frontendPath, 'index.html');
    if (fs.existsSync(indexPath)) res.sendFile(indexPath);
    else res.status(404).send('Frontend build not found.');
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;