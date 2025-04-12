const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Contact form submission endpoint
router.post('/', async (req, res) => {
  try {
    const { name, email, company, useCase, expectedVolume, message } = req.body;

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'vedantdubey.1234@gmail.com',
      subject: 'New API Access Request',
      html: `
        <h2>New API Access Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Company/Organization:</strong> ${company}</p>
        <p><strong>Intended Use Case:</strong> ${useCase}</p>
        <p><strong>Expected Monthly Request Volume:</strong> ${expectedVolume}</p>
        <p><strong>Additional Information:</strong></p>
        <p>${message}</p>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Contact form submitted successfully' });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ message: 'Error submitting contact form' });
  }
});

module.exports = router; 