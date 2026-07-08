const asyncHandler = require('express-async-handler');

// Minimal stub - wire up to a Subscriber model or a provider
// (Mailchimp/SendGrid) API here. Kept separate from Order/Admin
// models since subscriber growth is a marketing concern, not commerce.
const subscribe = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400);
    throw new Error('Email is required');
  }
  // TODO: persist to Subscriber collection or forward to ESP
  res.status(201).json({ message: 'Subscribed', email });
});

module.exports = { subscribe };
