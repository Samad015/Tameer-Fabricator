const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Debug logs to verify environment variables load correctly
console.log("Loaded API Key:", process.env.BREVO_API_KEY ? "Key Present (Length: " + process.env.BREVO_API_KEY.length + ")" : "KEY IS MISSING!");
console.log("Loaded Email:", process.env.EMAIL_USER);

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware - CORS configuration for local development and production
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

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

  // Check if Brevo API key exists in environment variables
  if (!process.env.BREVO_API_KEY) {
    console.error('Email Error: Brevo API key missing');
    return res.status(500).json({ 
      success: false, 
      message: 'Server configuration error: Brevo API key missing.' 
    });
  }

  try {
    const emailData = {
      sender: { 
        name: "Tameer Fabricators", 
        email: process.env.EMAIL_USER 
      },
      to: [
        { 
          email: process.env.EMAIL_USER, 
          name: "Admin" 
        }
      ],
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

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send email via Brevo API');
    }

    console.log('Email sent successfully via Brevo!');

    return res.status(200).json({ 
      success: true, 
      message: 'Quote request submitted and email sent successfully!' 
    });

  } catch (error) {
    console.error('Email Error:', error.message || error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to send email. Check backend console.' 
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