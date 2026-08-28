const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path'); // Path module import karein
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Transporter Config
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 1. API Route (Form Submit handler)
app.post('/api/contact', async (req, res) => {
  const { name, phone, width, height, message } = req.body;

  if (!name || !phone) {
    return res.status(400).json({
      success: false,
      message: 'Name and Phone number are required fields.',
    });
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: `New Quote Request from ${name}`,
    html: `
      <h2>New Quote Request</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Width:</strong> ${width || 'N/A'} ft</p>
      <p><strong>Height:</strong> ${height || 'N/A'} ft</p>
      <p><strong>Message:</strong> ${message || 'N/A'}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({
      success: true,
      message: 'Quote request submitted successfully!',
    });
  } catch (error) {
    console.error('Mail Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send email.',
    });
  }
});

// 2. FRONTEND SERVE KARNE KA CODE
// (Path update karein apne frontend build folder ke location ke hisab se)
const frontendPath = path.join(__dirname, '../dist'); // Ya '../build' agar CRA use kar rahe hain
app.use(express.static(frontendPath));

// Har route par React Single Page App (index.html) return karo
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Full Stack Server running on port ${PORT}`));