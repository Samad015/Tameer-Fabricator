export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { name, phone, width, height, message } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ success: false, message: 'Name and phone are required' });
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { email: process.env.EMAIL_USER },
        to: [{ email: process.env.EMAIL_USER }],
        subject: `New Quote Request from ${name}`,
        textContent: `Name: ${name}\nPhone: ${phone}\nWidth: ${width || 'N/A'}\nHeight: ${height || 'N/A'}\nMessage: ${message || 'N/A'}`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Brevo API Error:', data);
      return res.status(500).json({ success: false, message: 'Failed to send email via Brevo.' });
    }

    return res.status(200).json({ success: true, message: 'Quote request submitted successfully!' });
  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ success: false, message: 'Server error! Please try again later.' });
  }
}