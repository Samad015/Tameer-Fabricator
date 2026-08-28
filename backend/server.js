const express = require('express');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Nodemailer Transporter Setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running successfully' });
});

// Contact / Quote Request Route
app.post('/api/contact', async (req, res) => {
  const { name, phone, width, height, message } = req.body;
  
  if (!name || !phone) {
    return res.status(400).json({ success: false, message: 'Name and Phone are required.' });
  }

  try {
    // Email configuration to send details to your inbox
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Apni hi email par notification mangwayenge
      subject: `New Quote Request from ${name}`,
      html: `
        <h2>New Project Inquiry - Tameer Fabricator's</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Width:</strong> ${width || 'N/A'} ft</p>
        <p><strong>Height:</strong> ${height || 'N/A'} ft</p>
        <p><strong>Requirements:</strong> ${message || 'N/A'}</p>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return res.status(200).json({ 
      success: true, 
      message: 'Quote request submitted and email sent successfully!' 
    });

  } catch (error) {
    console.error('Email Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Request saved, but failed to send email. Check backend console.' 
    });
  }
});

// Serve Static Files (Frontend Build) - Only if production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});