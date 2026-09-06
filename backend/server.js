const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const User = require('./models/User'); // User / Dealer Model

connectDB();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running successfully' });
});

// Auth Routes (Register, Verify OTP, Login)
app.use('/api/auth', authRoutes);

// PUBLIC DEALER SEARCH API (Customer Location Based Search)
app.get('/api/dealers/search', async (req, res) => {
  try {
    const { pincode } = req.query;
    
    if (!pincode) {
      return res.status(400).json({ success: false, message: 'Pincode is required.' });
    }

    const dealers = await User.find({
      pincode: pincode.trim(),
      role: 'dealer',
      isVerified: true,
      isSubscriptionActive: true
    }).select('companyName name phone address area city pricingDetails gstin');

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

// Contact / Quote Request Route
app.post('/api/contact', async (req, res) => {
  const { name, phone, width, height, message } = req.body;
  
  if (!name || !phone) {
    return res.status(400).json({ success: false, message: 'Name and Phone are required.' });
  }

  if (!process.env.BREVO_API_KEY) {
    return res.status(500).json({ success: false, message: 'Server configuration error: Brevo API key missing.' });
  }

  try {
    const emailData = {
      sender: { name: "Tameer Fabricators", email: process.env.EMAIL_USER },
      to: [{ email: process.env.EMAIL_USER, name: "Admin" }],
      subject: `New Quote Request from ${name}`,
      htmlContent: `
        <h2>New Project Inquiry - Tameer Fabricator's</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Width:</strong> ${width || 'N/A'} ft</p>
        <p><strong>Height:</strong> ${height || 'N/A'} ft</p>
        <p><strong>Requirements:</strong> ${message || 'N/A'}</p>
      `,
    };

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
      },
      body: JSON.stringify(emailData),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to send email via Brevo API');

    return res.status(200).json({ success: true, message: 'Quote request submitted successfully!' });
  } catch (error) {
    console.error('Email Error:', error.message || error);
    return res.status(500).json({ success: false, message: 'Failed to send email.' });
  }
});

// Serve Static Frontend Files in Production
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