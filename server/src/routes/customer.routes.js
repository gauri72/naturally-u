const express = require('express');
const rateLimit = require('express-rate-limit');
const { protectCustomer } = require('../middleware/customerAuth');
const {
  getConfig, register, login, googleSignIn, getMe, updateMe, changePassword,
  verifyEmail, resendVerification, forgotPassword, resetPassword,
  listMyOrders, getMyOrder, getReorderItems,
} = require('../controllers/customer.controller');

const router = express.Router();

// Slows password guessing and email spamming. Per IP (app trusts Render's
// proxy so req.ip is the real client).
const limiter = (limit, minutes) => rateLimit({
  windowMs: minutes * 60 * 1000,
  limit,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please wait a few minutes and try again.' },
});
const signInLimit = limiter(20, 15);
const emailLimit = limiter(5, 15);

router.get('/config', getConfig);
router.post('/register', signInLimit, register);
router.post('/login', signInLimit, login);
router.post('/google', signInLimit, googleSignIn);
router.post('/verify-email', signInLimit, verifyEmail);
router.post('/forgot-password', emailLimit, forgotPassword);
router.post('/reset-password', signInLimit, resetPassword);

router.get('/me', protectCustomer, getMe);
router.put('/me', protectCustomer, updateMe);
router.put('/me/password', protectCustomer, signInLimit, changePassword);
router.post('/me/resend-verification', protectCustomer, emailLimit, resendVerification);
router.get('/me/orders', protectCustomer, listMyOrders);
router.get('/me/orders/:id', protectCustomer, getMyOrder);
router.get('/me/orders/:id/reorder', protectCustomer, getReorderItems);

module.exports = router;
