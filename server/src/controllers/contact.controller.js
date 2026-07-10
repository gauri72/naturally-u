const asyncHandler = require('express-async-handler');
const ContactMessage = require('../models/ContactMessage.model');

// @desc    Submit a contact form message
// @route   POST /api/contact
// @access  Public
const submitMessage = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    res.status(400);
    throw new Error('Name, email, and message are required');
  }
  const contactMessage = await ContactMessage.create({ name, email, message });
  res.status(201).json({ message: 'Message received', id: contactMessage._id });
});

module.exports = { submitMessage };
