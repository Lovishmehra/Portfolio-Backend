// contact.js
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post('/api/contact', async (req, res) => {
  console.log('Received POST to /api/contact', req.body);
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO || process.env.EMAIL_USER,
      replyTo: email, // set reply-to to user's email
      subject: `Portfolio Contact from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      html: `<p><b>Name:</b> ${name}</p><p><b>Email:</b> ${email}</p><p><b>Message:</b><br/>${message}</p>`
    });

    res.json({ success: true, message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Nodemailer error:', error);
    
    // Check for specific error types
    if (error.code === 'EAUTH') {
      res.status(500).json({ error: 'Email authentication failed. Please check your email credentials.' });
    } else if (error.code === 'ECONNECTION') {
      res.status(500).json({ error: 'Connection failed. Please check your internet connection.' });
    } else {
      res.status(500).json({ error: `Failed to send email: ${error.message}` });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Contact backend running on port ${PORT}`);
}); 