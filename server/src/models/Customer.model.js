const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema(
  {
    line1: String,
    line2: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
  },
  { _id: false }
);

// Storefront shopper accounts. Deliberately a separate model (and JWT
// `type`) from Admin so a customer token can never pass the admin
// `protect` middleware.
const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Optional: accounts created via Google sign-in have no password until
    // the customer sets one from the dashboard.
    password: { type: String, minlength: 8, select: false },
    googleId: { type: String, index: { unique: true, sparse: true } },
    // Past guest orders placed with this email only show up in the
    // account once the customer has proven they own the address.
    emailVerified: { type: Boolean, default: false },
    phone: { type: String, trim: true },
    address: { type: addressSchema, default: () => ({}) },
    // Bumped on password change/reset; embedded in the JWT so every
    // previously issued token stops working.
    tokenVersion: { type: Number, default: 0 },
    verifyTokenHash: { type: String, select: false },
    verifyTokenExpires: { type: Date, select: false },
    resetTokenHash: { type: String, select: false },
    resetTokenExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

customerSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

customerSchema.methods.matchPassword = function matchPassword(enteredPassword) {
  if (!this.password) return Promise.resolve(false);
  return bcrypt.compare(enteredPassword, this.password);
};

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

// Single-use tokens for the email links. Only the SHA-256 hash is stored,
// so a database leak doesn't hand out working verify/reset links.
customerSchema.methods.createEmailToken = function createEmailToken(kind, ttlMs) {
  const token = crypto.randomBytes(32).toString('hex');
  this[`${kind}TokenHash`] = hashToken(token);
  this[`${kind}TokenExpires`] = new Date(Date.now() + ttlMs);
  return token;
};

customerSchema.statics.hashToken = hashToken;

// Shape returned to the browser - never the password or token hashes.
customerSchema.methods.toProfile = function toProfile() {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone || '',
    address: this.address || {},
    emailVerified: this.emailVerified,
    hasPassword: !!this.password,
    hasGoogle: !!this.googleId,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('Customer', customerSchema);
