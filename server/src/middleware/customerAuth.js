const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const Customer = require('../models/Customer.model');

const CUSTOMER_TOKEN_TTL = '30d';

const signCustomerToken = (customer) =>
  jwt.sign(
    { id: customer._id, type: 'customer', v: customer.tokenVersion },
    process.env.JWT_SECRET,
    { expiresIn: CUSTOMER_TOKEN_TTL }
  );

// Resolves a customer from the Bearer token, or null. Rejects admin tokens
// (no `type`), and tokens issued before the last password change/reset.
async function customerFromRequest(req) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  let decoded;
  try {
    decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
  } catch {
    return null;
  }
  if (decoded.type !== 'customer') return null;
  // +password only so toProfile() can report hasPassword; it never leaves the server.
  const customer = await Customer.findById(decoded.id).select('+password');
  if (!customer || customer.tokenVersion !== decoded.v) return null;
  return customer;
}

const protectCustomer = asyncHandler(async (req, res, next) => {
  const customer = await customerFromRequest(req);
  if (!customer) {
    res.status(401);
    throw new Error('Please sign in to continue.');
  }
  req.customer = customer;
  next();
});

// For routes guests can use too (placing an order): attaches the customer
// when a valid token is present, otherwise carries on as a guest.
const optionalCustomer = asyncHandler(async (req, res, next) => {
  req.customer = await customerFromRequest(req);
  next();
});

module.exports = { signCustomerToken, protectCustomer, optionalCustomer };
