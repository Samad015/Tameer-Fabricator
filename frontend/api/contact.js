import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { name, phone, width, height, message } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ success: false, message: 'Name and phone are required' });
  }

  try {
    let transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.BREVO_API_KEY,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `New Quote Request from ${name}`,
      text: `Name: ${name}\nPhone: ${phone}\nWidth: ${width || 'N/A'}\nHeight: ${height || 'N/A'}\nMessage: ${message || 'N/A'}`,
    });

    return res.status(200).json({ success: true, message: 'Quote request submitted successfully!' });
  } catch (error) {
    console.error('Email Error:', error);
    return res.status(500).json({ success: false, message: 'Server error! Please try again later.' });
  }
}