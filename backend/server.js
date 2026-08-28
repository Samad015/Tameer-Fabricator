const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
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

  try {
    // Brevo API Request Payload
    const emailData = {
      sender: { 
        name: "Tameer Fabricators", 
        email: process.env.EMAIL_USER // Aapki verified email ya Brevo sender email
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

    // Send email using Brevo HTTP API (No SMTP / No Port Blocking)
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json',
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