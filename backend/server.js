const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS Settings
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.get('/', (req, res) => {
  res.send('Server Running!');
});

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

const PORT = 5001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});