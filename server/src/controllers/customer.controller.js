const asyncHandler = require('express-async-handler');
const { OAuth2Client } = require('google-auth-library');
const Customer = require('../models/Customer.model');
const Order = require('../models/Order.model');
const Product = require('../models/Product.model');
const { signCustomerToken } = require('../middleware/customerAuth');
const { sendAccountEmail } = require('../services/email.service');
const logger = require('../utils/logger');

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;
const RESET_TTL_MS = 60 * 60 * 1000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ADDRESS_FIELDS = ['line1', 'line2', 'city', 'state', 'postalCode', 'country'];

// Links in emails point at the storefront. SITE_URL wins; otherwise the
// first CLIENT_URL entry (https://naturallyu.nl in production).
const siteUrl = () =>
  (process.env.SITE_URL || (process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0])
    .trim()
    .replace(/\/+$/, '');

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const clean = (v, max = 200) => String(v ?? '').trim().slice(0, max);

const authResponse = (customer) => ({ token: signCustomerToken(customer), customer: customer.toProfile() });

async function sendVerificationEmail(customer) {
  const token = customer.createEmailToken('verify', VERIFY_TTL_MS);
  await customer.save();
  try {
    await sendAccountEmail({
      to: customer.email,
      subject: 'Confirm your NaturallyU email',
      name: customer.name,
      heading: 'Confirm your email address',
      body: 'thanks for creating a NaturallyU account. Confirm your email so we can show your past orders in your account.',
      ctaLabel: 'Confirm email',
      ctaUrl: `${siteUrl()}/account/verify-email?token=${token}`,
      footnote: 'This link expires in 24 hours. If you didn’t create an account, you can ignore this email.',
    });
  } catch (err) {
    // Sign-up still succeeds; the dashboard offers "resend".
    logger.error(`[customer] verification email to ${customer.email} failed - ${err.message}`);
  }
}

// Orders that belong to this customer: placed while signed in, plus - once
// the email is verified - guest orders placed with the same address. Only
// completed payments; abandoned/failed checkouts are noise here.
function ownOrdersFilter(customer) {
  const owner = customer.emailVerified
    ? { $or: [
      { customerAccount: customer._id },
      { 'customer.email': new RegExp(`^${escapeRegex(customer.email)}$`, 'i') },
    ] }
    : { customerAccount: customer._id };
  return { ...owner, paymentStatus: { $in: ['paid', 'refunded'] } };
}

// Fills an account's EMPTY phone/address from the newest of its past orders
// that has usable values. Only called once the email is verified (same
// reason as ownOrdersFilter: otherwise signing up with someone else's email
// would reveal their address). Never overwrites what the customer entered.
const looksLikePhone = (p) => (String(p || '').match(/\d/g) || []).length >= 6;

async function fillProfileFromPastOrders(customer) {
  if (!customer.emailVerified) return;
  const needPhone = !customer.phone;
  const needAddress = !customer.address?.line1;
  if (!needPhone && !needAddress) return;

  const orders = await Order.find(ownOrdersFilter(customer))
    .select('customer.phone shippingAddress')
    .sort('-createdAt')
    .limit(20);

  let changed = false;
  if (needPhone) {
    const phone = orders.map((o) => o.customer?.phone).find(looksLikePhone);
    if (phone) { customer.phone = clean(phone, 40); changed = true; }
  }
  if (needAddress) {
    const addr = orders.map((o) => o.shippingAddress).find((a) => a?.line1 && a?.city);
    if (addr) {
      customer.address = Object.fromEntries(ADDRESS_FIELDS.map((f) => [f, clean(addr[f])]));
      changed = true;
    }
  }
  if (changed) await customer.save();
}

// @route GET /api/customers/config  (public)
const getConfig = (req, res) => {
  res.json({ googleClientId: process.env.GOOGLE_CLIENT_ID || null });
};

// @route POST /api/customers/register
const register = asyncHandler(async (req, res) => {
  const name = clean(req.body.name, 100);
  const email = normalizeEmail(req.body.email);
  const { password } = req.body;

  if (!name) { res.status(400); throw new Error('Please enter your name.'); }
  if (!EMAIL_RE.test(email)) { res.status(400); throw new Error('Please enter a valid email address.'); }
  if (typeof password !== 'string' || password.length < 8) {
    res.status(400); throw new Error('Password must be at least 8 characters.');
  }

  const existing = await Customer.findOne({ email }).select('+password');
  if (existing) {
    res.status(409);
    throw new Error(existing.googleId && !existing.password
      ? 'This email is registered with Google. Use “Continue with Google” to sign in.'
      : 'An account with this email already exists. Sign in, or reset your password.');
  }

  const customer = await Customer.create({ name, email, password });
  await sendVerificationEmail(customer);
  const fresh = await Customer.findById(customer._id).select('+password');
  res.status(201).json(authResponse(fresh));
});

// @route POST /api/customers/login
const login = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const customer = await Customer.findOne({ email }).select('+password');
  if (!customer || !(await customer.matchPassword(String(req.body.password || '')))) {
    res.status(401);
    throw new Error('Incorrect email or password.');
  }
  res.json(authResponse(customer));
});

// @route POST /api/customers/google  { credential }  (Google Identity Services ID token)
const googleSignIn = asyncHandler(async (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) { res.status(503); throw new Error('Google sign-in is not set up yet.'); }

  let payload;
  try {
    const ticket = await new OAuth2Client(clientId).verifyIdToken({ idToken: req.body.credential, audience: clientId });
    payload = ticket.getPayload();
  } catch {
    res.status(401); throw new Error('Google sign-in failed. Please try again.');
  }
  if (!payload?.email || !payload.email_verified) {
    res.status(401); throw new Error('Your Google account email is not verified.');
  }

  const email = normalizeEmail(payload.email);
  let customer = await Customer.findOne({ googleId: payload.sub }).select('+password');
  if (!customer) {
    customer = await Customer.findOne({ email }).select('+password');
    if (customer) {
      // Google has verified ownership of this address, so linking an
      // existing email/password account to it is safe.
      customer.googleId = payload.sub;
      customer.emailVerified = true;
      await customer.save();
    } else {
      customer = await Customer.create({
        name: clean(payload.name || email.split('@')[0], 100),
        email,
        googleId: payload.sub,
        emailVerified: true,
      });
    }
  }
  await fillProfileFromPastOrders(customer);
  res.json(authResponse(customer));
});

// @route GET /api/customers/me
const getMe = (req, res) => res.json(req.customer.toProfile());

// @route PUT /api/customers/me  { name, phone, address }
const updateMe = asyncHandler(async (req, res) => {
  const { customer } = req;
  if (req.body.name !== undefined) {
    const name = clean(req.body.name, 100);
    if (!name) { res.status(400); throw new Error('Name can’t be empty.'); }
    customer.name = name;
  }
  if (req.body.phone !== undefined) customer.phone = clean(req.body.phone, 40);
  if (req.body.address && typeof req.body.address === 'object') {
    customer.address = Object.fromEntries(ADDRESS_FIELDS.map((f) => [f, clean(req.body.address[f])]));
  }
  await customer.save();
  res.json(customer.toProfile());
});

// @route PUT /api/customers/me/password  { currentPassword, newPassword }
const changePassword = asyncHandler(async (req, res) => {
  const { customer } = req;
  const { currentPassword, newPassword } = req.body;
  // Google-only accounts have no password yet and may set one directly.
  if (customer.password && !(await customer.matchPassword(String(currentPassword || '')))) {
    res.status(400); throw new Error('Your current password is incorrect.');
  }
  if (typeof newPassword !== 'string' || newPassword.length < 8) {
    res.status(400); throw new Error('New password must be at least 8 characters.');
  }
  customer.password = newPassword;
  customer.tokenVersion += 1; // signs out every other device
  await customer.save();
  res.json(authResponse(customer));
});

// @route POST /api/customers/verify-email  { token }
const verifyEmail = asyncHandler(async (req, res) => {
  const customer = await Customer.findOne({
    verifyTokenHash: Customer.hashToken(String(req.body.token || '')),
    verifyTokenExpires: { $gt: new Date() },
  });
  if (!customer) {
    res.status(400);
    throw new Error('This confirmation link is invalid or has expired. Request a new one from your account.');
  }
  customer.emailVerified = true;
  customer.verifyTokenHash = undefined;
  customer.verifyTokenExpires = undefined;
  await customer.save();
  await fillProfileFromPastOrders(customer);
  res.json({ verified: true, email: customer.email });
});

// @route POST /api/customers/me/resend-verification
const resendVerification = asyncHandler(async (req, res) => {
  if (req.customer.emailVerified) { res.status(400); throw new Error('Your email is already confirmed.'); }
  await sendVerificationEmail(req.customer);
  res.json({ message: 'Confirmation email sent.' });
});

// @route POST /api/customers/forgot-password  { email }
// Always the same answer, so it can't be used to probe which emails exist.
const forgotPassword = asyncHandler(async (req, res) => {
  const customer = await Customer.findOne({ email: normalizeEmail(req.body.email) });
  if (customer) {
    const token = customer.createEmailToken('reset', RESET_TTL_MS);
    await customer.save();
    try {
      await sendAccountEmail({
        to: customer.email,
        subject: 'Reset your NaturallyU password',
        name: customer.name,
        heading: 'Reset your password',
        body: 'we received a request to reset the password for your NaturallyU account. Click below to choose a new one.',
        ctaLabel: 'Choose a new password',
        ctaUrl: `${siteUrl()}/account/reset-password?token=${token}`,
        footnote: 'This link expires in 1 hour. If you didn’t ask for this, you can ignore this email - your password stays the same.',
      });
    } catch (err) {
      logger.error(`[customer] reset email to ${customer.email} failed - ${err.message}`);
    }
  }
  res.json({ message: 'If an account exists for that email, a reset link is on its way.' });
});

// @route POST /api/customers/reset-password  { token, password }
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  if (typeof password !== 'string' || password.length < 8) {
    res.status(400); throw new Error('Password must be at least 8 characters.');
  }
  const customer = await Customer.findOne({
    resetTokenHash: Customer.hashToken(String(req.body.token || '')),
    resetTokenExpires: { $gt: new Date() },
  }).select('+password');
  if (!customer) {
    res.status(400); throw new Error('This reset link is invalid or has expired. Please request a new one.');
  }
  customer.password = password;
  customer.resetTokenHash = undefined;
  customer.resetTokenExpires = undefined;
  customer.emailVerified = true; // they just proved they can read this inbox
  customer.tokenVersion += 1;
  await customer.save();
  await fillProfileFromPastOrders(customer);
  res.json(authResponse(customer));
});

const ORDER_LIST_FIELDS = 'orderNumber createdAt total subtotal shippingCost items orderStatus paymentStatus shippingAddress';

// @route GET /api/customers/me/orders
const listMyOrders = asyncHandler(async (req, res) => {
  res.json(await Order.find(ownOrdersFilter(req.customer)).select(ORDER_LIST_FIELDS).sort('-createdAt'));
});

async function findOwnOrder(req, res) {
  const order = await Order.findOne({ _id: req.params.id, ...ownOrdersFilter(req.customer) })
    .select(`${ORDER_LIST_FIELDS} customer`)
    .catch(() => null); // malformed id
  if (!order) { res.status(404); throw new Error('Order not found.'); }
  return order;
}

// @route GET /api/customers/me/orders/:id
const getMyOrder = asyncHandler(async (req, res) => {
  res.json(await findOwnOrder(req, res));
});

// @route GET /api/customers/me/orders/:id/reorder
// Current product data for each line, so "Buy again" uses today's price
// and stock rather than what was paid back then.
const getReorderItems = asyncHandler(async (req, res) => {
  const order = await findOwnOrder(req, res);
  const products = await Product.find({ _id: { $in: order.items.map((i) => i.product) }, isActive: true })
    .select('name slug price images stock');
  const byId = new Map(products.map((p) => [p._id.toString(), p]));
  res.json(order.items.map((item) => {
    const product = byId.get(item.product.toString());
    return {
      name: item.name,
      quantity: item.quantity,
      product: product || null,
      available: !!product && product.stock > 0,
    };
  }));
});

module.exports = {
  getConfig, register, login, googleSignIn, getMe, updateMe, changePassword,
  verifyEmail, resendVerification, forgotPassword, resetPassword,
  listMyOrders, getMyOrder, getReorderItems,
};
